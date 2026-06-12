import SwiftUI

struct SecondaryButton: View {
    let title: String
    let icon: String?
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: DS.Space.sm) {
                if let icon {
                    Image(systemName: icon)
                }
                Text(title)
                    .font(.headline)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(.clear)
            .foregroundStyle(DS.Color.primary)
            .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
            .overlay(
                RoundedRectangle(cornerRadius: DS.Radius.medium)
                    .stroke(DS.Color.primary, lineWidth: 1.5)
            )
        }
    }
}
