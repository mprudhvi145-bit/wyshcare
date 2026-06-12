import SwiftUI

struct RecentSearchesView: View {
    let searches: [String]
    let onTap: (String) -> Void
    let onClear: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.sm) {
            headerRow

            if searches.isEmpty {
                emptyLabel
            } else {
                searchList
            }
        }
    }

    private var headerRow: some View {
        HStack {
            Text("Recent Searches")
                .font(.footnote)
                .fontWeight(.semibold)
                .foregroundStyle(DS.Color.secondaryLabel)

            Spacer()

            if !searches.isEmpty {
                Button("Clear", action: onClear)
                    .font(.caption)
                    .foregroundStyle(DS.Color.primary)
            }
        }
        .padding(.horizontal, DS.Space.md)
    }

    private var emptyLabel: some View {
        Text("No recent searches")
            .font(.subheadline)
            .foregroundStyle(DS.Color.secondaryLabel)
            .padding(.horizontal, DS.Space.md)
    }

    private var searchList: some View {
        ForEach(searches, id: \.self) { text in
            searchRow(text)
        }
    }

    private func searchRow(_ text: String) -> some View {
        Button { onTap(text) } label: {
            HStack(spacing: DS.Space.sm) {
                Image(systemName: "clock.arrow.circlepath")
                    .font(.caption)
                    .foregroundStyle(DS.Color.secondaryLabel)

                Text(text)
                    .font(.subheadline)
                    .foregroundStyle(.primary)

                Spacer()
            }
            .padding(.vertical, 8)
            .padding(.horizontal, DS.Space.md)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
