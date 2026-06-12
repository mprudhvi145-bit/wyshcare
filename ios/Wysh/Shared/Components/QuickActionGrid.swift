import SwiftUI

struct QuickActionItem: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void

    static func == (lhs: Self, rhs: Self) -> Bool {
        lhs.id == rhs.id
    }
}

struct QuickActionGrid: View {
    let actions: [QuickActionItem]

    private let columns = Array(
        repeating: GridItem(.flexible(), spacing: DS.Space.lg),
        count: 2
    )

    var body: some View {
        LazyVGrid(columns: columns, spacing: DS.Space.lg) {
            ForEach(actions) { action in
                Button(action: action.action) {
                    VStack(spacing: DS.Space.md) {
                        Image(systemName: action.icon)
                            .font(.title)
                            .foregroundStyle(action.color)
                            .frame(width: DS.Space.xxxxl, height: DS.Space.xxxxl)
                            .background(action.color.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: DS.Radius.small + 2))
                        Text(action.title)
                            .font(.caption.weight(.medium))
                            .foregroundStyle(.primary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(DS.Space.lg)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
                }
            }
        }
    }
}
