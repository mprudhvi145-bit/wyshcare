import SwiftUI

struct DesignSystem: Sendable {
    let colors = Colors()
    let typography = Typography()
    let spacing = Spacing()
    let radius = Radius()
}

struct Colors: Sendable {
    let primary = Color(hex: "#2563EB")
    let secondary = Color(hex: "#DBEAFE")
    let success = Color(hex: "#22C55E")
    let warning = Color(hex: "#F59E0B")
    let danger = Color(hex: "#EF4444")
    let background = Color(hex: "#F8FAFC")
    let card = Color(hex: "#FFFFFF")
    let text = Color(hex: "#0F172A")
    let subtext = Color(hex: "#64748B")
    let border = Color(hex: "#E2E8F0")
}

struct Typography: Sendable {
    let largeTitle: Font = .largeTitle.weight(.bold)
    let title: Font = .title.weight(.semibold)
    let title2: Font = .title2.weight(.semibold)
    let title3: Font = .title3.weight(.semibold)
    let headline: Font = .headline
    let body: Font = .body
    let callout: Font = .callout
    let caption: Font = .caption
    let caption2: Font = .caption2
}

struct Spacing: Sendable {
    let xs: CGFloat = 4
    let sm: CGFloat = 8
    let md: CGFloat = 12
    let lg: CGFloat = 16
    let xl: CGFloat = 20
    let xxl: CGFloat = 24
    let xxxl: CGFloat = 32
}

struct Radius: Sendable {
    let sm: CGFloat = 8
    let md: CGFloat = 12
    let lg: CGFloat = 16
    let xl: CGFloat = 20
    let xxl: CGFloat = 24
    let full: CGFloat = 9_999
}

extension EnvironmentValues {
    @Entry var designSystem = DesignSystem()
}
