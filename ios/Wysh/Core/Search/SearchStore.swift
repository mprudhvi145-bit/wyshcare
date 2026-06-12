import Foundation
import Observation

@MainActor
@Observable
final class SearchStore {
    var query: String = ""
    var recentSearches: [String] = []
    var selectedCategory: SearchCategory?
    var isLoading: Bool = false

    private var allResults: [SearchResultItem] = []

    var results: [(SearchCategory, [SearchResultItem])] {
        let grouped = Dictionary(grouping: filteredResults) { $0.category }
        let sorted = grouped.keys.sorted { lhs, rhs in
            let order: [SearchCategory] = [
                .doctors, .prescriptions, .medications, .diagnostics,
                .records, .insurance, .claims, .appointments,
                .payments, .timeline, .family
            ]
            let li = order.firstIndex(of: lhs) ?? Int.max
            let ri = order.firstIndex(of: rhs) ?? Int.max
            return li < ri
        }
        return sorted.compactMap { cat in
            guard let items = grouped[cat], !items.isEmpty else { return nil }
            return (cat, items)
        }
    }

    var hasResults: Bool {
        !filteredResults.isEmpty
    }

    private var filteredResults: [SearchResultItem] {
        let trimmed = query.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return [] }
        return allResults.filter { item in
            item.searchableText.localizedCaseInsensitiveContains(trimmed) ||
            item.title.localizedCaseInsensitiveContains(trimmed) ||
            item.subtitle.localizedCaseInsensitiveContains(trimmed)
        }
    }

    func index(_ items: [SearchResultItem]) {
        allResults = items
    }

    func addRecent(_ text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }
        recentSearches.removeAll { $0 == trimmed }
        recentSearches.insert(trimmed, at: 0)
        if recentSearches.count > 10 {
            recentSearches = Array(recentSearches.prefix(10))
        }
    }

    func clearRecent() {
        recentSearches = []
    }

    func clearQuery() {
        query = ""
    }

    deinit {}
}
