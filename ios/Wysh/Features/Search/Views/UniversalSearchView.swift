import SwiftUI

struct UniversalSearchView: View {
    @Environment(\.dismiss)
    private var dismiss
    @State private var store = SearchStore()
    @FocusState private var isFocused: Bool

    private let suggestedActions: [SuggestedAction] = [
        SuggestedAction(title: "Book Doctor", icon: "stethoscope", color: DS.Color.primary) {},
        SuggestedAction(title: "Order Medicine", icon: "pills.fill", color: .purple) {},
        SuggestedAction(title: "Book Test", icon: "flask.fill", color: .orange) {},
        SuggestedAction(title: "Upload Report", icon: "doc.badge.plus", color: .indigo) {},
        SuggestedAction(title: "Check Insurance", icon: "shield.fill", color: DS.Color.success) {},
        SuggestedAction(title: "View Claim", icon: "doc.text.fill", color: DS.Color.warning) {}
    ]

    var body: some View {
        NavigationStack {
            searchContent
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") { dismiss() }
                    }
                }
                .onAppear {
                    store.index(SearchDataProvider.allItems())
                    isFocused = true
                }
        }
    }

    private var searchContent: some View {
        VStack(spacing: 0) {
            searchField
                .padding(.horizontal, DS.Space.lg)
                .padding(.top, DS.Space.lg)
                .padding(.bottom, DS.Space.md)

            Divider()
                .padding(.horizontal, DS.Space.lg)

            if store.query.trimmingCharacters(in: .whitespaces).isEmpty {
                emptyState
            } else if store.isLoading {
                LoadingStateView(message: "Searching...")
            } else if !store.hasResults {
                noResults
            } else {
                resultsList
            }
        }
        .background(DS.Color.background)
    }

    private var searchField: some View {
        HStack(spacing: DS.Space.sm) {
            Image(systemName: "magnifyingglass")
                .font(.title3)
                .foregroundStyle(DS.Color.secondaryLabel)

            TextField("Doctors, medicines, reports...", text: $store.query)
                .font(.title3)
                .focused($isFocused)
                .submitLabel(.search)
                .onSubmit { store.addRecent(store.query) }

            if !store.query.isEmpty {
                Button(action: store.clearQuery) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(DS.Color.secondaryLabel)
                }
            }
        }
        .padding(DS.Space.md)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        .dsShadow()
    }

    private var emptyState: some View {
        ScrollView {
            VStack(spacing: DS.Space.xxl) {
                if !store.recentSearches.isEmpty {
                    RecentSearchesView(
                        searches: store.recentSearches,
                        onTap: { text in
                            store.query = text
                            store.addRecent(text)
                        },
                        onClear: { store.clearRecent() }
                    )
                }

                SuggestedActionsView(actions: suggestedActions)
            }
            .padding(.vertical, DS.Space.lg)
        }
    }

    private var noResults: some View {
        EmptyStateView(
            icon: "magnifyingglass",
            title: "No Results",
            message: "No results found for \"\(store.query)\". Try a different search term."
        )
    }

    private var resultsList: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DS.Space.xs) {
                ForEach(store.results, id: \.0.id) { category, items in
                    VStack(alignment: .leading, spacing: 0) {
                        SearchSectionHeader(category: category, count: items.count)

                        ForEach(items) { item in
                            SearchResultRow(item: item)

                            if item.id != items.last?.id {
                                Divider()
                                    .padding(.leading, 52)
                            }
                        }
                    }
                    .padding(.bottom, DS.Space.sm)
                }
            }
            .padding(.vertical, DS.Space.sm)
        }
    }
}
