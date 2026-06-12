import SwiftUI

struct ContentView: View {
    @Environment(AppState.self)
    private var appState

    var body: some View {
        Group {
            switch appState.authState {
            case .unauthenticated:
                LoginView()

            case .authenticated:
                MainTabView()

            case .loading:
                SplashView()
            }
        }
        .animation(.smooth, value: appState.authState)
    }
}
