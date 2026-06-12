import SwiftUI

struct AIMessageCard: View {
    let message: String

    var body: some View {
        GlassCard {
            HStack(alignment: .top, spacing: DS.Space.md) {
                Image(systemName: "sparkles.rectangle.stack")
                    .font(.title2)
                    .foregroundStyle(DS.Color.primary)
                Text(message)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineSpacing(DS.Space.xs)
            }
        }
    }
}
