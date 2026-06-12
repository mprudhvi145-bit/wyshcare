import Foundation
import SwiftUI

enum InboxCategory: String, CaseIterable, Identifiable {
    case all = "All"
    case care = "Care"
    case diagnostics = "Diagnostics"
    case family = "Family"
    case insurance = "Insurance"
    case medication = "Medication"
    case wallet = "Wallet"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .all:
            "tray.fill"

        case .care:
            "stethoscope"

        case .diagnostics:
            "flask.fill"

        case .family:
            "person.2.fill"

        case .insurance:
            "shield.fill"

        case .medication:
            "pills.fill"

        case .wallet:
            "creditcard.fill"
        }
    }

    var color: Color {
        switch self {
        case .all:
            .gray

        case .care:
            DS.Color.primary

        case .diagnostics:
            .orange

        case .family:
            .mint

        case .insurance:
            DS.Color.success

        case .medication:
            .purple

        case .wallet:
            .pink
        }
    }
}

enum Priority: String, Comparable {
    case critical = "Critical"
    case important = "Important"
    case informational = "Informational"

    var color: Color {
        switch self {
        case .critical:
            .red

        case .important:
            DS.Color.warning

        case .informational:
            DS.Color.secondaryLabel
        }
    }

    var sortOrder: Int {
        switch self {
        case .critical:
            0

        case .important:
            1

        case .informational:
            2
        }
    }

    static func < (lhs: Self, rhs: Self) -> Bool {
        lhs.sortOrder < rhs.sortOrder
    }
}

struct InboxItem: Identifiable {
    let id: String
    let category: InboxCategory
    let priority: Priority
    let title: String
    let subtitle: String
    let actionTitle: String?
    let createdAt: Date
    var isRead: Bool
    let action: () -> Void

    init(
        category: InboxCategory,
        priority: Priority,
        title: String,
        subtitle: String,
        id: String = UUID().uuidString,
        actionTitle: String? = nil,
        createdAt: Date = Date(),
        isRead: Bool = false,
        action: @escaping () -> Void = {}
    ) {
        self.id = id
        self.category = category
        self.priority = priority
        self.title = title
        self.subtitle = subtitle
        self.actionTitle = actionTitle
        self.createdAt = createdAt
        self.isRead = isRead
        self.action = action
    }
}
