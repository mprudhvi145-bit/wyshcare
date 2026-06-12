import SwiftUI // swiftlint:disable:this file_name

extension View {
    func dsShadow() -> some View {
        shadow(
            color: .black.opacity(DS.Shadow.opacity),
            radius: DS.Shadow.radius,
            y: DS.Shadow.y
        )
    }
}

// swiftlint:disable:next type_name
enum DS {
    enum Color {
        static let primary = SwiftUI.Color.blue
        static let success = SwiftUI.Color.green
        static let warning = SwiftUI.Color.orange
        static let critical = SwiftUI.Color.red
        static let background = SwiftUI.Color(.systemGroupedBackground)
        static let card = SwiftUI.Color.white
        static let secondaryLabel = SwiftUI.Color.secondary
    }

    enum Radius {
        static let small: CGFloat = 12
        static let medium: CGFloat = 20
        static let large: CGFloat = 28
        static let hero: CGFloat = 32
    }

    enum Space {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
        static let xxxl: CGFloat = 32
        static let xxxxl: CGFloat = 40
        static let xxxxxl: CGFloat = 48
    }

    enum Shadow {
        static let radius: CGFloat = 12
        static let y: CGFloat = 4
        static let opacity: Double = 0.06
    }
}
