import SwiftUI

enum WyshButtonStyle: CaseIterable {
    case danger
    case outline
    case primary
    case secondary

    var backgroundColor: Color {
        switch self {
        case .danger:
            Color.red

        case .outline:
            .clear

        case .primary:
            Color.accentColor

        case .secondary:
            Color(.systemGray5)
        }
    }

    var foregroundColor: Color {
        switch self {
        case .danger:
            .white

        case .outline:
            Color.accentColor

        case .primary:
            .white

        case .secondary:
            .primary
        }
    }

    var borderColor: Color {
        switch self {
        case .outline:
            Color.accentColor

        default:
            .clear
        }
    }

    var pressedOpacity: Double {
        switch self {
        case .outline:
            0.7

        default:
            0.8
        }
    }
}

struct WyshButton: View {
    let title: String
    let style: WyshButtonStyle
    let icon: Image?
    let isLoading: Bool
    let isDisabled: Bool
    let action: () -> Void

    init(
        _ title: String,
        style: WyshButtonStyle = .primary,
        icon: Image? = nil,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.style = style
        self.icon = icon
        self.isLoading = isLoading
        self.isDisabled = isDisabled
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(style.foregroundColor)
                        .scaleEffect(0.8)
                } else if let icon {
                    icon
                        .font(.body)
                }
                Text(title)
                    .font(.body)
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .padding(.horizontal, 24)
            .background(style.backgroundColor)
            .foregroundColor(style.foregroundColor)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(style.borderColor, lineWidth: 1.5)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .opacity(isDisabled ? 0.4 : 1)
        }
        .buttonStyle(WyshButtonPressableStyle(style: style))
        .disabled(isDisabled || isLoading)
    }
}

struct WyshButtonPressableStyle: ButtonStyle {
    let style: WyshButtonStyle

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? style.pressedOpacity : 1)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeInOut(duration: 0.12), value: configuration.isPressed)
    }
}

extension View {
    func wyshButtonStyle(_ style: WyshButtonStyle = .primary, isLoading: Bool = false, isDisabled: Bool = false) -> some View {
        self.buttonStyle(WyshButtonPressableStyle(style: style))
            .disabled(isDisabled || isLoading)
    }
}

#Preview {
    VStack(spacing: 16) {
        WyshButton("Primary", style: .primary) {}
        WyshButton("Secondary", style: .secondary) {}
        WyshButton("Outline", style: .outline) {}
        WyshButton("Danger", style: .danger) {}
        WyshButton("Loading", isLoading: true) {}
        WyshButton("Disabled", isDisabled: true) {}
    }
    .padding()
}
