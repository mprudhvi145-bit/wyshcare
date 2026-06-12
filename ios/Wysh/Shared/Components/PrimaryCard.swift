import SwiftUI

struct PrimaryCard<Content: View>: View {
    let title: String?
    let icon: String?
    @ViewBuilder let content: Content

    init(
        title: String? = nil,
        icon: String? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.icon = icon
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.lg) {
            if let title {
                HStack(spacing: DS.Space.sm) {
                    if let icon {
                        Image(systemName: icon)
                            .font(.headline)
                            .foregroundStyle(DS.Color.primary)
                    }
                    Text(title)
                        .font(.headline.weight(.semibold))
                }
            }
            content
        }
        .padding(DS.Space.xl)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.large))
        .dsShadow()
    }
}
