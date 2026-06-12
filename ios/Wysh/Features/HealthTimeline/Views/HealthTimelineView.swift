import SwiftUI

enum TimelineFilter: String, CaseIterable {
    case all = "All"
    case appointments = "Appointments"
    case carePlans = "Care Plans"
    case diagnostics = "Diagnostics"
    case doctors = "Doctors"
    case healthRecords = "Records"
    case insurance = "Insurance"
    case labs = "Labs"
    case payments = "Payments"
    case pharmacy = "Pharmacy"
    case prescriptions = "Prescriptions"
    case abdm = "ABDM"
}

struct HealthTimelineEntry: Identifiable {
    let id = UUID()
    let icon: String
    let iconColor: Color
    let title: String
    let subtitle: String
    let timestamp: Date
    let status: String
    let statusColor: Color
    let category: TimelineFilter
}

struct HealthTimelineView: View {
    @State private var entries: [HealthTimelineEntry] = []
    @State private var isLoading = false
    @State private var selectedFilter: TimelineFilter = .all
    @Environment(SearchNavigationState.self)
    private var searchNav
    @Environment(InboxStore.self)
    private var inboxStore

    var filteredEntries: [HealthTimelineEntry] {
        if selectedFilter == .all { return entries }
        return entries.filter { $0.category == selectedFilter }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    filterChips
                    .padding(EdgeInsets(top: 0, leading: DS.Space.xl, bottom: 0, trailing: DS.Space.xl))
                        .padding(.vertical, DS.Space.sm)

                    if isLoading {
                        ProgressView()
                            .padding(.top, DS.Space.xxxxl)
                    } else if filteredEntries.isEmpty {
                        emptyStateView
                    } else {
                        entriesListView
                    }
                }
            }
            .background(DS.Color.background)
            .navigationTitle("Health Timeline")
            .toolbar {
                toolbarContent
            }
            .refreshable { await refreshTimeline() }
            .onAppear { loadSampleEntries() }
        }
    }

    @ToolbarContentBuilder private var toolbarContent: some ToolbarContent {
        ToolbarItemGroup(placement: .navigationBarTrailing) {
            notificationButton
            searchButton
        }
    }

    private var notificationButton: some View {
        Button {
            searchNav.showInbox = true
        } label: {
            Image(systemName: "bell")
                .overlay(
                    Group {
                        if inboxStore.unreadCount > 0 {
                            Text("\(inboxStore.unreadCount)")
                                .font(.caption2.weight(.bold))
                                .foregroundStyle(.white)
                                .frame(width: 16, height: 16)
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
        Button {
            searchNav.showSearch = true
        } label: {
            Image(systemName: "magnifyingglass")
        }
    }

    private var emptyStateView: some View {
        ContentUnavailableView(
            "No Events",
            systemImage: "clock.arrow.circlepath",
            description: Text("No timeline entries for this category.")
        )
        .padding(.top, DS.Space.xxxxl)
    }

    private var entriesListView: some View {
        LazyVStack(spacing: DS.Space.sm + 2) {
            ForEach(filteredEntries) { entry in
                HealthTimelineEntryView(entry: entry)
                    .padding(EdgeInsets(top: 0, leading: DS.Space.xl, bottom: 0, trailing: DS.Space.xl))
            }
        }
        .padding(.vertical, DS.Space.sm)
    }

    private var filterChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DS.Space.sm + 2) {
                ForEach(TimelineFilter.allCases, id: \.self) { filter in
                    Button {
                        withAnimation(.spring(response: 0.35)) { selectedFilter = filter }
                    } label: {
                        Text(filter.rawValue)
                            .font(.subheadline.weight(selectedFilter == filter ? .semibold : .regular))
                            .padding(EdgeInsets(top: 0, leading: DS.Space.lg, bottom: 0, trailing: DS.Space.lg))
                            .padding(.vertical, DS.Space.sm)
                            .background(selectedFilter == filter ? DS.Color.primary : Color(.systemGray6))
                            .foregroundColor(selectedFilter == filter ? .white : .primary)
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func refreshTimeline() async {
        isLoading = true
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        loadSampleEntries()
        isLoading = false
    }

    private func loadSampleEntries() {
        let calendar = Calendar.current
        let today = Date()
        entries = firstEntries(calendar: calendar, today: today) + lastEntries(calendar: calendar, today: today)
    }

    private func firstEntries(calendar: Calendar, today: Date) -> [HealthTimelineEntry] {
        [
            HealthTimelineEntry(
                icon: "stethoscope",
                iconColor: .blue,
                title: "Consultation with Dr. Sharma",
                subtitle: "General Physician - Follow up",
                timestamp: calendar.date(byAdding: .hour, value: -2, to: today) ?? today,
                status: "Completed",
                statusColor: .green,
                category: .doctors
            ),
            HealthTimelineEntry(
                icon: "flask.fill",
                iconColor: .orange,
                title: "Blood Report Uploaded",
                subtitle: "CBC, Lipid Profile, HbA1c",
                timestamp: calendar.date(byAdding: .hour, value: -5, to: today) ?? today,
                status: "Reviewed",
                statusColor: .blue,
                category: .labs
            ),
            HealthTimelineEntry(
                icon: "pills.fill",
                iconColor: .purple,
                title: "Prescription Refilled",
                subtitle: "Metformin 500mg - 30 tablets",
                timestamp: calendar.date(byAdding: .day, value: -1, to: today) ?? today,
                status: "Delivered",
                statusColor: .green,
                category: .pharmacy
            ),
            HealthTimelineEntry(
                icon: "doc.text.fill",
                iconColor: .red,
                title: "Health Insurance Claim #CLM-2024-089",
                subtitle: "Family Floater Plan - ₹45,000 approved",
                timestamp: calendar.date(byAdding: .day, value: -2, to: today) ?? today,
                status: "Approved",
                statusColor: .green,
                category: .insurance
            ),
            HealthTimelineEntry(
                icon: "calendar",
                iconColor: .mint,
                title: "Upcoming - Dr. Patel (Cardiology)",
                subtitle: "ECHO & Stress Test - Follow up",
                timestamp: calendar.date(byAdding: .day, value: 2, to: today) ?? today,
                status: "Scheduled",
                statusColor: .mint,
                category: .appointments
            )
        ]
    }

    private func lastEntries(calendar: Calendar, today: Date) -> [HealthTimelineEntry] {
        [
            HealthTimelineEntry(
                icon: "heart.text.square.fill",
                iconColor: .teal,
                title: "ABDM Health Records Synced",
                subtitle: "12 records updated from Apollo Clinic",
                timestamp: calendar.date(byAdding: .day, value: -3, to: today) ?? today,
                status: "Synced",
                statusColor: .teal,
                category: .healthRecords
            ),
            HealthTimelineEntry(
                icon: "bag.fill",
                iconColor: .brown,
                title: "Order Placed - Accu-Chek Test Strips",
                subtitle: "Qty: 2 packs - ₹1,240",
                timestamp: calendar.date(byAdding: .day, value: -4, to: today) ?? today,
                status: "Shipped",
                statusColor: .orange,
                category: .prescriptions
            ),
            HealthTimelineEntry(
                icon: "lungs.fill",
                iconColor: .cyan,
                title: "Pulmonary Function Test Results",
                subtitle: "FEV1: 82% - Within normal range",
                timestamp: calendar.date(byAdding: .day, value: -5, to: today) ?? today,
                status: "Normal",
                statusColor: .green,
                category: .diagnostics
            ),
            HealthTimelineEntry(
                icon: "creditcard.fill",
                iconColor: .indigo,
                title: "Clinic Payment Processed",
                subtitle: "Dr. Sharma Consultation - ₹1,200",
                timestamp: calendar.date(byAdding: .day, value: -6, to: today) ?? today,
                status: "Paid",
                statusColor: .green,
                category: .payments
            ),
            HealthTimelineEntry(
                icon: "checklist",
                iconColor: .green,
                title: "Diabetes Care Plan Updated",
                subtitle: "Next review in 3 months - HbA1c target < 7.0",
                timestamp: calendar.date(byAdding: .day, value: -7, to: today) ?? today,
                status: "Active",
                statusColor: .green,
                category: .carePlans
            )
        ]
    }
}

struct HealthTimelineEntryView: View {
    let entry: HealthTimelineEntry

    var body: some View {
        HStack(spacing: DS.Space.sm + 2) {
            ZStack {
                Circle()
                    .fill(entry.iconColor.opacity(0.15))
                    .frame(width: 44, height: 44)
                Image(systemName: entry.icon)
                    .font(.system(size: DS.Space.lg + 2, weight: .medium))
                    .foregroundColor(entry.iconColor)
            }

            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text(entry.title)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)
                Text(entry.subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                Text(entry.timestamp, style: .relative)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            Text(entry.status)
                .font(.caption2.weight(.medium))
                .foregroundColor(entry.statusColor)
                .padding(EdgeInsets(top: 0, leading: DS.Space.sm + 2, bottom: 0, trailing: DS.Space.sm + 2))
                .padding(.vertical, DS.Space.xs)
                .background(entry.statusColor.opacity(0.12))
                .clipShape(Capsule())
        }
        .padding(DS.Space.sm + 6)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.small + 2))
        .dsShadow()
    }
}

#Preview {
    HealthTimelineView()
}
