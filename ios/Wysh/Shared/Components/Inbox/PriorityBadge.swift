import SwiftUI

struct PriorityBadge: View {
    let priority: Priority

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(priority.color)
                .frame(width: 6, height: 6)

            Text(priority.rawValue)
                .font(.caption2.weight(.medium))
                .foregroundStyle(priority.color)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 3)
        .background(priority.color.opacity(0.1))
        .clipShape(Capsule())
    }
}
