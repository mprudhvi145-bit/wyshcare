import Observation

enum AuthState {
    case authenticated, loading, unauthenticated
}

@MainActor
@Observable
final class AppState {
    var authState: AuthState = .loading
    var currentUser: User?
    var accessToken: String?

    init() {
        checkExistingSession()
    }

    deinit {}

    func checkExistingSession() {
        Task {
            if let token = KeychainService.shared.getToken() {
                accessToken = token
                authState = .authenticated
            } else {
                authState = .unauthenticated
            }
        }
    }
}
