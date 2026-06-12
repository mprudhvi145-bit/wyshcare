import SwiftUI

struct InboxView: View {
    @Environment(\.dismiss)
    private var dismiss
    @State private var store = InboxStore()

    var body: some View {
        NavigationStack {
            inboxContent
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Close") { dismiss() }
                    }
                    ToolbarItem(placement: .automatic) {
                        if store.unreadCount > 0 {
                            Button("Mark All Read") {
                                store.markAllAsRead()
                            }
                            .font(.caption)
                        }
                    }
                }
        }
    }

    private var inboxContent: some View {
        VStack(spacing: 0) {
            summarySection
                .padding(.horizontal, DS.Space.lg)
                .padding(.top, DS.Space.lg)
                .padding(.bottom, DS.Space.md)

            Divider()
                .padding(.horizontal, DS.Space.lg)

            InboxFilterBar(
                categories: InboxCategory.allCases,
                selectedCategory: store.selectedCategory
            ) { store.selectedCategory = $0 }
            .padding(.vertical, DS.Space.sm)

            Divider()
                .padding(.horizontal, DS.Space.lg)

            if store.filteredItems.isEmpty {
                emptyState
            } else {
                inboxList
            }
        }
        .background(DS.Color.background)
    }

    private var summarySection: some View {
        InboxSummaryCard(
            summary: store.todaySummary,
            actionCount: store.todayActionCount
        ) { store.selectedCategory = .all }
    }

    private var emptyState: some View {
        VStack(spacing: DS.Space.md) {
            Spacer()
            Image(systemName: "tray")
                .font(.system(size: 48))
                .foregroundStyle(DS.Color.secondaryLabel)

            Text(store.selectedCategory == .all ? "Inbox is clear" : "No \(store.selectedCategory.rawValue.lowercased()) items")
                .font(.title3.weight(.semibold))

            Text("You're all caught up!")
                .font(.subheadline)
                .foregroundStyle(DS.Color.secondaryLabel)

            Spacer()
        }
    }

    private var inboxList: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                ForEach(store.groupedItems, id: \.0) { section, items in
                    sectionHeader(section)

                    ForEach(items) { item in
                        InboxItemRow(
                            item: item,
                            onTap: { tapped in
                                store.performAction(tapped)
                            },
                            onAction: { acted in
                                store.performAction(acted)
                            }
                        )

                        if item.id != items.last?.id {
                            Divider()
                                .padding(.leading, DS.Space.md)
                        }
                    }
                }
            }
            .padding(.vertical, DS.Space.sm)
        }
    }

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.footnote.weight(.semibold))
            .foregroundStyle(DS.Color.secondaryLabel)
            .padding(.horizontal, DS.Space.md)
            .padding(.top, DS.Space.md)
            .padding(.bottom, 4)
    }
}
