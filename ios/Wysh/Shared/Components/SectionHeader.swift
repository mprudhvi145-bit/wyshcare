import SwiftUI

struct SectionHeader: View {
    let title: String
    let buttonTitle: String?
    let action: (() -> Void)?

    init(
        title: String,
        buttonTitle: String? = nil,
        action: (() -> Void)? = nil
    ) {
        self.title = title
        self.buttonTitle = buttonTitle
        self.action = action
    }

    var body: some View {
        HStack {
            Text(title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(.primary)
            Spacer()
            if let buttonTitle, let action {
                Button(buttonTitle, action: action)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.blue)
            }
        }
    }
}
