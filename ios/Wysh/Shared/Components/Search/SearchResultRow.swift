import SwiftUI

struct SearchResultRow: View {
    let item: SearchResultItem

    var body: some View {
        Button {
            item.navigate()
        } label: {
            HStack(spacing: DS.Space.md) {
                Image(systemName: item.icon)
                    .font(.body)
                    .foregroundStyle(item.iconColor)
                    .frame(width: 28, alignment: .center)

                VStack(alignment: .leading, spacing: 2) {
                    Text(item.title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(.primary)
                        .lineLimit(1)

                    Text(item.subtitle)
                        .font(.caption)
                        .foregroundStyle(DS.Color.secondaryLabel)
                        .lineLimit(1)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(DS.Color.secondaryLabel)
            }
            .padding(.vertical, 10)
            .padding(.horizontal, DS.Space.md)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
