import SwiftUI

struct ContextAction: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let action: () -> Void

    static func == (lhs: Self, rhs: Self) -> Bool {
        lhs.id == rhs.id
    }
}

struct ContextCard: View {
    let summary: String
    let actions: [ContextAction]

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            Text(summary)
                .font(.body)
                .foregroundStyle(.primary)
                .lineSpacing(DS.Space.xs)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: DS.Space.sm) {
                ForEach(actions) { action in
                    Button(action: action.action) {
                        HStack(spacing: DS.Space.xs) {
                            Image(systemName: action.icon)
                                .font(.caption)
                            Text(action.title)
                                .font(.caption.weight(.medium))
                        }
                        .padding(.horizontal, DS.Space.md)
                        .padding(.vertical, DS.Space.sm)
                        .background(.ultraThinMaterial)
                        .clipShape(Capsule())
                    }
                }
            }
        }
        .padding(DS.Space.lg)
        .frame(minHeight: 120, maxHeight: 160, alignment: .leading)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.ultraThinMaterial)
        .background(.white.opacity(0.3))
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.large))
        .dsShadow()
    }
}
