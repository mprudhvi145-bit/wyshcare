import Foundation
import SwiftUI

enum CommandCategory: String, CaseIterable, Identifiable {
    case care = "Care"
    case diagnostics = "Diagnostics"
    case family = "Family"
    case insurance = "Insurance"
    case medication = "Medication"
    case records = "Records"

    var id: String { rawValue }

    var icon: String {
        switch self {
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

        case .records:
            "folder.fill"
        }
    }

    var color: Color {
        switch self {
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

        case .records:
            .indigo
        }
    }
}

struct CommandAction: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let icon: String
    let iconColor: Color
    let category: CommandCategory
    let action: () -> Void

    init(
        title: String,
        subtitle: String,
        icon: String,
        category: CommandCategory,
        iconColor: Color? = nil,
        action: @escaping () -> Void = {}
    ) {
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
        self.category = category
        self.iconColor = iconColor ?? category.color
        self.action = action
    }
}
