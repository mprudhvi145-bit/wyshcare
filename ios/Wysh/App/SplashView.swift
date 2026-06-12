import SwiftUI

struct SplashView: View {
    var body: some View {
        VStack(spacing: DS.Space.lg) {
            Image(systemName: "heart.fill")
                .font(.system(size: 60))
                .foregroundStyle(DS.Color.primary)
            ProgressView()
                .tint(DS.Color.primary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(DS.Color.background)
    }
}
