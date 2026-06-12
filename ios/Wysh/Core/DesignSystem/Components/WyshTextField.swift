import SwiftUI

enum WyshTextFieldValidationState: Equatable {
    case idle
    case invalid(String)
    case valid
    case warning(String)

    var isInvalid: Bool {
        if case .invalid = self { true } else { false }
    }

    var message: String? {
        switch self {
        case .invalid(let msg):
            msg

        case .warning(let msg):
            msg

        default:
            nil
        }
    }

    var borderColor: Color {
        switch self {
        case .idle:
            Color(.separator)

        case .valid:
            .green

        case .invalid:
            .red

        case .warning:
            .orange
        }
    }
}

struct WyshTextField: View {
    let title: String
    @Binding var text: String
    let icon: Image?
    let keyboardType: UIKeyboardType
    let textContentType: UITextContentType?
    let isSecure: Bool
    let validationState: WyshTextFieldValidationState
    let onSubmit: (() -> Void)?

    @FocusState private var isFocused: Bool

    init(
        _ title: String,
        text: Binding<String>,
        icon: Image? = nil,
        keyboardType: UIKeyboardType = .default,
        textContentType: UITextContentType? = nil,
        isSecure: Bool = false,
        validationState: WyshTextFieldValidationState = .idle,
        onSubmit: (() -> Void)? = nil
    ) {
        self.title = title
        self._text = text
        self.icon = icon
        self.keyboardType = keyboardType
        self.textContentType = textContentType
        self.isSecure = isSecure
        self.validationState = validationState
        self.onSubmit = onSubmit
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            ZStack(alignment: .leading) {
                if text.isEmpty && !isFocused {
                    placeholderView
                }

                textFieldInput
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(fieldBackground)
            .animation(.easeInOut(duration: 0.2), value: validationState)
            .animation(.easeInOut(duration: 0.2), value: isFocused)

            if let message = validationState.message {
                validationMessageView(message: message)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: validationState)
    }

    @ViewBuilder private var placeholderView: some View {
        HStack(spacing: 8) {
            if let icon {
                icon
                    .foregroundColor(.secondary)
                    .font(.body)
            }
            Text(title)
                .foregroundColor(.secondary)
        }
    }

    @ViewBuilder private var textFieldInput: some View {
        HStack(spacing: 8) {
            if let icon {
                icon
                    .foregroundColor(isFocused ? validationState.borderColor : .secondary)
                    .font(.body)
            }

            Group {
                if isSecure {
                    SecureField("", text: $text)
                } else {
                    TextField("", text: $text)
                }
            }
            .focused($isFocused)
            .keyboardType(keyboardType)
            .textContentType(textContentType)
            .submitLabel(.done)
            .onSubmit { onSubmit?() }
        }
    }

    private var fieldBackground: some View {
        RoundedRectangle(cornerRadius: 12)
            .stroke(validationState.borderColor, lineWidth: isFocused || validationState != .idle ? 1.5 : 1)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
            )
    }

    @ViewBuilder
    private func validationMessageView(message: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: validationState.isInvalid ? "exclamationmark.circle.fill" : "exclamationmark.triangle.fill")
                .font(.caption)
            Text(message)
                .font(.caption)
        }
        .foregroundColor(validationState.borderColor)
        .padding(.leading, 4)
        .transition(.opacity.combined(with: .move(edge: .top)))
    }
}

#Preview {
    VStack(spacing: 16) {
        WyshTextField("Email", text: .constant(""))
        WyshTextField("Email", text: .constant("user@example.com"), icon: Image(systemName: "envelope.fill"))
        WyshTextField("Password", text: .constant("password"), isSecure: true)
        WyshTextField("Invalid", text: .constant("bad"), validationState: .invalid("Please enter a valid value"))
        WyshTextField("Warning", text: .constant("value"), validationState: .warning("This value is recommended"))
        WyshTextField("Valid", text: .constant("good"), validationState: .valid)
    }
    .padding()
}
