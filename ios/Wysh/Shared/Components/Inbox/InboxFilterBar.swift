import SwiftUI

struct InboxFilterBar: View {
    let categories: [InboxCategory]
    let selectedCategory: InboxCategory
    let onSelect: (InboxCategory) -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DS.Space.sm) {
                ForEach(categories) { category in
                    Button(action: { onSelect(category) }, label: { filterLabel(category) })
                        .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, DS.Space.md)
        }
    }

    private func filterLabel(_ category: InboxCategory) -> some View {
        HStack(spacing: 6) {
            Image(systemName: category.icon)
                .font(.caption)

            Text(category.rawValue)
                .font(.caption.weight(.medium))
        }
        .padding(.horizontal, DS.Space.md)
        .padding(.vertical, 8)
        .background(
            selectedCategory == category
            ? category.color.opacity(0.12)
            : DS.Color.card
        )
        .foregroundStyle(
            selectedCategory == category
            ? category.color
            : DS.Color.secondaryLabel
        )
        .clipShape(Capsule())
        .overlay(capsuleBorder(category))
    }

    private func capsuleBorder(_ category: InboxCategory) -> some View {
        Capsule()
            .stroke(
                selectedCategory == category
                ? category.color.opacity(0.3)
                : Color.secondary.opacity(0.15),
                lineWidth: 1
            )
    }
}
