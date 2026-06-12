import SwiftUI

enum BadgeStatus: String, CaseIterable {
    case cancelled, completed, confirmed, failed, inProgress = "in_progress", pending

    var color: Color {
        switch self {
        case .completed, .confirmed:
            .green

        case .pending, .inProgress:
            .orange

        case .cancelled, .failed:
            .red
        }
    }

    var displayName: String {
        switch self {
        case .inProgress:
            "In Progress"

        default:
            rawValue.capitalized
        }
    }
}

struct StatusBadge: View {
    let status: BadgeStatus

    var body: some View {
        Text(status.displayName)
            .font(.caption.weight(.medium))
            .foregroundStyle(status.color)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(status.color.opacity(0.12))
            .clipShape(Capsule())
    }
}
