import SwiftUI

struct PrimaryButton: View {
    let title: String
    let icon: String?
    let isLoading: Bool
    let action: () -> Void

    init(
        title: String,
        icon: String? = nil,
        isLoading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.isLoading = isLoading
        self.action = action
    }

    var body: some View {
        Button(action: {
            HapticManager.shared.trigger()
            action()
        }, label: {
            HStack(spacing: DS.Space.sm) {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                }
                if let icon, !isLoading {
                    Image(systemName: icon)
                }
                Text(title)
                    .font(.headline)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(DS.Color.primary)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        })
        .disabled(isLoading)
    }
}
