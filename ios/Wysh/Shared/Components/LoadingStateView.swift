import SwiftUI

struct LoadingStateView: View {
    let message: String

    var body: some View {
        VStack(spacing: DS.Space.lg) {
            ProgressView()
                .scaleEffect(1.2)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(DS.Space.xxxxl)
    }
}
