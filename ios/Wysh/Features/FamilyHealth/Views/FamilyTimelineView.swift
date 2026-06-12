import SwiftUI

struct FamilyTimelineView: View {
    @Environment(FamilyStore.self)
    private var store

    var body: some View {
        NavigationStack {
            Group {
                if let member = store.activeMember {
                    let events = store.timeline(for: member.id)
                    if events.isEmpty {
                        emptyState
                    } else {
                        timelineList(events)
                    }
                } else {
                    selectMember
                }
            }
            .navigationTitle("Family Timeline")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private func timelineList(_ events: [FamilyTimelineEvent]) -> some View {
        List(events.sorted { $0.date > $1.date }) { event in
            HStack(spacing: DS.Space.md) {
                Image(systemName: event.icon)
                    .font(.title3)
                    .foregroundStyle(event.iconColor)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: 2) {
                    Text(event.title)
                        .font(.subheadline.weight(.medium))
                    Text(event.subtitle)
                        .font(.caption)
                        .foregroundStyle(DS.Color.secondaryLabel)
                }

                Spacer()

                Text(event.date, style: .date)
                    .font(.caption2)
                    .foregroundStyle(DS.Color.secondaryLabel)
            }
            .padding(.vertical, 4)
        }
        .listStyle(.insetGrouped)
    }

    private var emptyState: some View {
        EmptyStateView(
            icon: "clock",
            title: "No Timeline Events",
            message: "No events recorded for this family member yet."
        )
    }

    private var selectMember: some View {
        EmptyStateView(
            icon: "person.2",
            title: "Select a Member",
            message: "Choose a family member to view their timeline."
        )
    }
}
