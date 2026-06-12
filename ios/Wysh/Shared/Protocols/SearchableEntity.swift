import Foundation
import SwiftUI

enum SearchCategory: String, CaseIterable, Identifiable {
    case appointments = "Appointments"
    case claims = "Claims"
    case diagnostics = "Diagnostics"
    case doctors = "Doctors"
    case family = "Family"
    case insurance = "Insurance"
    case medications = "Medications"
    case payments = "Payments"
    case prescriptions = "Prescriptions"
    case records = "Records"
    case timeline = "Timeline"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .appointments:
            "calendar"

        case .claims:
            "doc.text.fill"

        case .diagnostics:
            "flask.fill"

        case .doctors:
            "stethoscope"

        case .family:
            "person.2.fill"

        case .insurance:
            "shield.fill"

        case .medications:
            "cross.case.fill"

        case .payments:
            "creditcard.fill"

        case .prescriptions:
            "pills.fill"

        case .records:
            "folder.fill"

        case .timeline:
            "clock.fill"
        }
    }

    var color: Color {
        switch self {
        case .appointments:
            .blue

        case .claims:
            DS.Color.warning

        case .diagnostics:
            .orange

        case .doctors:
            DS.Color.primary

        case .family:
            .mint

        case .insurance:
            DS.Color.success

        case .medications:
            .teal

        case .payments:
            .pink

        case .prescriptions:
            .purple

        case .records:
            .indigo

        case .timeline:
            .gray
        }
    }
}

protocol SearchableEntity: Identifiable {
    var id: String { get }
    var title: String { get }
    var subtitle: String { get }
    var category: SearchCategory { get }
    var searchableText: String { get }
    var icon: String { get }
    var iconColor: Color { get }
}

struct SearchResultItem: SearchableEntity {
    let id: String
    let title: String
    let subtitle: String
    let category: SearchCategory
    let searchableText: String
    let icon: String
    let iconColor: Color
    let navigate: () -> Void

    init(
        title: String,
        subtitle: String,
        category: SearchCategory,
        id: String = UUID().uuidString,
        searchableText: String? = nil,
        icon: String? = nil,
        iconColor: Color? = nil,
        navigate: @escaping () -> Void = {}
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.category = category
        self.searchableText = searchableText ?? "\(title) \(subtitle)"
        self.icon = icon ?? category.icon
        self.iconColor = iconColor ?? category.color
        self.navigate = navigate
    }
}
