import SwiftUI

struct HealthCard<Content: View>: View {
    let title: String?
    let subtitle: String?
    let icon: Image?
    @ViewBuilder let content: Content

    init(
        title: String? = nil,
        subtitle: String? = nil,
        icon: Image? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            if let title {
                HStack {
                    if let icon { icon.foregroundStyle(DS.Color.primary) }
                    Text(title).font(.title3.weight(.semibold))
                    if let subtitle {
                        Spacer()
                        Text(subtitle).font(.caption).foregroundStyle(.secondary)
                    }
                }
            }
            content
        }
        .padding(DS.Space.xl)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.large))
        .dsShadow()
    }
}
