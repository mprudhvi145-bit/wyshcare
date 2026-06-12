import SwiftUI

struct TimelineEventCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let accentColor: Color

    var body: some View {
        HStack(spacing: DS.Space.md) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(accentColor)
                .frame(width: DS.Space.xxxl)

            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text(title)
                    .font(.subheadline.weight(.medium))
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
        .padding(DS.Space.md)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        .dsShadow()
    }
}
