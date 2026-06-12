import SwiftUI

@main
struct WyshApp: App {
    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(appState)
                .environment(\.designSystem, DesignSystem())
        }
    }
}
