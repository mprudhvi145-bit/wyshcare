import SwiftUI

struct HomeView: View {
    @State private var dashboardVM = DashboardViewModel()
    @Environment(SearchNavigationState.self)
    private var searchNav
    @Environment(InboxStore.self)
    private var inboxStore
    @Environment(FamilyStore.self)
    private var familyStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.xxl) {
                    greetingSection
                    familySwitcherSection
                    contextCardSection
                    healthScoreSection
                    recentEventsSection
                    quickActionsSection
                }
                .padding(.horizontal, DS.Space.xl)
                .padding(.top, DS.Space.lg)
                .padding(.bottom, DS.Space.xxxl)
            }
            .background(Color(.systemGray6))
            .navigationBarHidden(true)
            .refreshable {
                await dashboardVM.refresh()
            }
        }
    }

    private var greetingSection: some View {
        let name = dashboardVM.userName
        let hour = Calendar.current.component(.hour, from: Date())
        let greeting: String
        switch hour {
        case 5..<12:
            greeting = "Good Morning"

        case 12..<17:
            greeting = "Good Afternoon"

        default:
            greeting = "Good Evening"
        }
        return HStack {
            Text("\(greeting), \(name)")
                .font(.largeTitle.weight(.bold))

            Spacer()

            bellButton
            searchButton
        }
    }

    private var bellButton: some View {
        Button { searchNav.showInbox = true } label: {
            Image(systemName: "bell")
                .font(.title3.weight(.semibold))
                .foregroundStyle(DS.Color.primary)
                .padding(10)
                .background(DS.Color.card)
                .clipShape(Circle())
                .dsShadow()
                .overlay(
                    Group {
                        if inboxStore.unreadCount > 0 {
                            Text("\(inboxStore.unreadCount)")
                                .font(.caption2.weight(.bold))
                                .foregroundStyle(.white)
                                .frame(width: 18, height: 18)
                                .background(.red)
                                .clipShape(Circle())
                                .offset(x: 6, y: -6)
                        }
                    },
                    alignment: .topTrailing
                )
        }
    }

    private var searchButton: some View {
        Button { searchNav.showSearch = true } label: {
            Image(systemName: "magnifyingglass")
                .font(.title3.weight(.semibold))
                .foregroundStyle(DS.Color.primary)
                .padding(10)
                .background(DS.Color.card)
                .clipShape(Circle())
                .dsShadow()
        }
    }

    private var familySwitcherSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            Text("Viewing")
                .font(.caption)
                .foregroundStyle(DS.Color.secondaryLabel)

            FamilySwitcher(
                members: familyStore.members,
                activeMember: familyStore.activeMember
            ) { familyStore.switchTo($0) }
        }
    }

    private var contextCardSection: some View {
        ContextCard(
            summary: dashboardVM.contextSummary,
            actions: dashboardVM.contextActions
        )
    }

    private var healthScoreSection: some View {
        let score = familyStore.activeMember?.healthStatus == .attention ? 72
            : familyStore.activeMember?.healthStatus == .critical ? 45
            : familyStore.activeMember?.healthStatus == .pending ? 0
            : dashboardVM.healthScore
        let label = familyStore.activeMember?.healthStatus == .attention ? "Needs Attention"
            : familyStore.activeMember?.healthStatus == .critical ? "Critical"
            : familyStore.activeMember?.healthStatus == .pending ? "Pending"
            : dashboardVM.healthScoreLabel
        let trend = familyStore.activeMember?.id != "me" ? "Based on health status"
            : dashboardVM.healthScoreTrend

        return HealthCard(title: "Health Score", subtitle: trend) {
            HStack {
                HealthScoreRing(score: score, label: label, trend: nil)
                Spacer()
            }
        }
    }

    private var recentEventsSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Recent Events", buttonTitle: "See All") {
                // Navigate to Timeline
            }

            if familyStore.activeMember?.id != "me", let member = familyStore.activeMember {
                let events = familyStore.timeline(for: member.id)
                if events.isEmpty {
                    EmptyStateView(icon: "clock", title: "No Events", message: "No recent activity.")
                } else {
                    ForEach(events.prefix(3)) { event in
                        familyEventRow(event)
                    }
                }
            } else if dashboardVM.recentEvents.isEmpty {
                EmptyStateView(icon: "clock", title: "No Events", message: "Your recent activity will appear here.")
            } else {
                ForEach(dashboardVM.recentEvents) { event in
                    recentEventRow(event)
                }
            }
        }
    }

    private func familyEventRow(_ event: FamilyTimelineEvent) -> some View {
        HStack(spacing: DS.Space.md) {
            ZStack {
                Circle()
                    .fill(event.iconColor.opacity(0.12))
                    .frame(width: 40, height: 40)
                Image(systemName: event.icon)
                    .font(.system(size: DS.Space.lg, weight: .medium))
                    .foregroundStyle(event.iconColor)
            }

            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text(event.title)
                    .font(.subheadline.weight(.semibold))
                Text(event.subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(event.date, style: .relative)
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(DS.Space.md)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        .dsShadow()
    }

    private func recentEventRow(_ event: RecentEvent) -> some View {
        HStack(spacing: DS.Space.md) {
            ZStack {
                Circle()
                    .fill(DS.Color.primary.opacity(0.12))
                    .frame(width: 40, height: 40)
                Image(systemName: event.icon)
                    .font(.system(size: DS.Space.lg, weight: .medium))
                    .foregroundStyle(DS.Color.primary)
            }

            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text(event.title)
                    .font(.subheadline.weight(.semibold))
                Text(event.subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(event.timestamp, style: .relative)
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding(DS.Space.md)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        .dsShadow()
    }

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Quick Actions")
            QuickActionGrid(actions: dashboardVM.quickActions)
        }
    }
}

#Preview {
    HomeView()
}
