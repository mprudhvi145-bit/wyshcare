import SwiftUI

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }

    func cardStyle(radius: CGFloat = 16) -> some View {
        self
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: radius))
            .dsShadow()
    }

    func glassStyle() -> some View {
        self
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    @ViewBuilder
    func `if`<T: View>(_ condition: Bool, transform: (Self) -> T) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }

    @ViewBuilder
    func ifLet<T: View, V>(_ value: V?, transform: (Self, V) -> T) -> some View {
        if let value {
            transform(self, value)
        } else {
            self
        }
    }

    func paddingCustom(_ edges: Edge.Set = .all, _ length: CGFloat = 16) -> some View {
        self.padding(edges, length)
    }

    func fillContainer() -> some View {
        self.frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    func readSize(_ onChange: @escaping (CGSize) -> Void) -> some View {
        background(
            GeometryReader { geo in
                Color.clear
                    .preference(key: SizePreferenceKey.self, value: geo.size)
            }
        )
        .onPreferenceChange(SizePreferenceKey.self, perform: onChange)
    }

    func hapticOnTap(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .light) -> some View {
        self.onTapGesture {
            UIImpactFeedbackGenerator(style: style).impactOccurred()
        }
    }

    func placeholder<T: View>(when shouldShow: Bool, alignment: Alignment = .leading, @ViewBuilder placeholder: () -> T) -> some View {
        overlay(alignment: alignment) {
            placeholder().opacity(shouldShow ? 1 : 0)
        }
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity

    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

struct SizePreferenceKey: PreferenceKey {
    static let defaultValue: CGSize = .zero

    static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
        value = nextValue()
    }
}
