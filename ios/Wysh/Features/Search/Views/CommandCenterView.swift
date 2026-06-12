import SwiftUI

struct CommandCenterView: View {
    @Environment(\.dismiss)
    private var dismiss
    @State private var store = CommandCenterStore()
    @FocusState private var isFocused: Bool

    var body: some View {
        NavigationStack {
            content
                .background(.ultraThinMaterial)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") { dismiss() }
                    }
                }
                .onAppear { isFocused = true }
        }
    }

    private var content: some View {
        VStack(spacing: 0) {
            header
            searchField
                .padding(.horizontal, DS.Space.lg)
                .padding(.bottom, DS.Space.md)

            Divider()
                .padding(.horizontal, DS.Space.lg)

            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.lg) {
                    if store.query.trimmingCharacters(in: .whitespaces).isEmpty {
                        recentAndContextualSection
                    }

                    actionCategoryList
                }
                .padding(.vertical, DS.Space.lg)
            }
        }
    }

    @ViewBuilder private var recentAndContextualSection: some View {
        if !store.recentActions.isEmpty {
            RecentActionsSection(
                actions: store.recentActions,
                onTap: { store.perform($0); dismiss() },
                onClear: { store.clearRecent() }
            )
        }

        ContextualActionsSection(actions: store.contextualActions) { tapped in
            store.perform(tapped)
            dismiss()
        }
    }

    private var header: some View {
        Text("What would you like to do?")
            .font(.title2.weight(.semibold))
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, DS.Space.lg)
            .padding(.top, DS.Space.lg)
            .padding(.bottom, DS.Space.sm)
    }

    private var searchField: some View {
        HStack(spacing: DS.Space.sm) {
            Image(systemName: "sparkle.magnifyingglass")
                .font(.subheadline)
                .foregroundStyle(DS.Color.secondaryLabel)

            TextField("Search actions...", text: $store.query)
                .font(.body)
                .focused($isFocused)

            if !store.query.isEmpty {
                Button {
                    store.query = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(DS.Color.secondaryLabel)
                }
            }
        }
        .padding(DS.Space.md)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.small))
    }

    @ViewBuilder private var actionCategoryList: some View {
        let categories = CommandCategory.allCases
        let grouped = store.filteredActions

        ForEach(categories, id: \.self) { category in
            if let actions = grouped[category], !actions.isEmpty {
                VStack(alignment: .leading, spacing: 0) {
                    CommandCategoryHeader(category: category)

                    ForEach(actions) { action in
                        CommandActionCard(action: action) { tapped in
                            store.perform(tapped)
                            dismiss()
                        }

                        if action.id != actions.last?.id {
                            Divider()
                                .padding(.leading, 60)
                        }
                    }
                }
            }
        }
    }
}
