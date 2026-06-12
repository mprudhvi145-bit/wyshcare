import SwiftUI

struct CommandCategoryHeader: View {
    let category: CommandCategory

    var body: some View {
        HStack(spacing: DS.Space.sm) {
            Image(systemName: category.icon)
                .font(.caption)
                .foregroundStyle(category.color)

            Text(category.rawValue)
                .font(.footnote)
                .fontWeight(.semibold)
                .foregroundStyle(category.color)

            Spacer()
        }
        .padding(.horizontal, DS.Space.md)
        .padding(.vertical, 6)
    }
}
