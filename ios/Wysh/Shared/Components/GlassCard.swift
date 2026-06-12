import SwiftUI

struct GlassCard<Content: View>: View {
    @ViewBuilder let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(DS.Space.xl)
            .background(.ultraThinMaterial)
            .background(.white.opacity(0.3))
            .clipShape(RoundedRectangle(cornerRadius: DS.Radius.large))
            .dsShadow()
    }
}
