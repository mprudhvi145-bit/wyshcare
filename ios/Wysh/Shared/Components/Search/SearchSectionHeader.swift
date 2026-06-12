import SwiftUI

struct SearchSectionHeader: View {
    let category: SearchCategory
    var count: Int?

    var body: some View {
        HStack(spacing: DS.Space.sm) {
            Image(systemName: category.icon)
                .font(.caption)
                .foregroundStyle(category.color)

            Text(category.rawValue)
                .font(.footnote)
                .fontWeight(.semibold)
                .foregroundStyle(category.color)

            if let count {
                Text("(\(count))")
                    .font(.caption2)
                    .foregroundStyle(DS.Color.secondaryLabel)
            }

            Spacer()
        }
        .padding(.horizontal, DS.Space.md)
        .padding(.vertical, 6)
    }
}
