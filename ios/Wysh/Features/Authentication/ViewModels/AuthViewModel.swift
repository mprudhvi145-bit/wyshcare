import AuthenticationServices
import SwiftUI

enum AuthFlowState: Equatable {
    case authenticated
    case error(String)
    case loading
    case otpSent(phone: String)
    case unauthenticated
}

@MainActor
@Observable
final class AuthViewModel: NSObject {
    var authState: AuthFlowState = .unauthenticated
    var currentAuthUser: AuthUser?

    deinit {}

    override init() {
        super.init()
        currentAuthUser = UserDefaults.standard.data(forKey: "current_user").flatMap {
            try? JSONDecoder().decode(AuthUser.self, from: $0)
        }
        if currentAuthUser != nil {
            authState = .authenticated
        }
    }

    // MARK: - Login

    func login(emailOrPhone: String) {
        guard !emailOrPhone.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        authState = .loading

        Task {
            do {
                let isPhone = emailOrPhone.allSatisfy { $0.isNumber || $0 == "+" || $0 == " " }
                if isPhone {
                    try await sendOTP(phone: emailOrPhone)
                    authState = .otpSent(phone: emailOrPhone)
                } else {
                    try await sendOTP(email: emailOrPhone)
                    authState = .otpSent(phone: emailOrPhone)
                }
            } catch {
                authState = .error(error.localizedDescription)
            }
        }
    }

    func loginWithApple() {
        let provider = ASAuthorizationAppleIDProvider()
        let request = provider.createRequest()
        request.requestedScopes = [.fullName, .email]

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.performRequests()
    }

    func loginWithGoogle() {
        authState = .loading
        Task {
            do {
                try await Task.sleep(nanoseconds: 1_500_000_000)
                authState = .authenticated
            } catch {
                authState = .error(error.localizedDescription)
            }
        }
    }

    // MARK: - OTP

    func verifyOTP(code: String) {
        guard code.count == 6 else { return }
        authState = .loading

        Task {
            do {
                try await verifyCode(code)
                authState = .authenticated
            } catch {
                authState = .error("Invalid code. Please try again.")
            }
        }
    }

    func resendOTP() {
        Task {
            do {
                try await Task.sleep(nanoseconds: 1_000_000_000)
            } catch {}
        }
    }

    // MARK: - Signup

    func signup(name: String, phone: String, email: String) {
        guard !name.isEmpty, !phone.isEmpty else { return }
        authState = .loading

        Task {
            do {
                try await registerAuthUser(name: name, phone: phone, email: email)
                authState = .otpSent(phone: phone)
            } catch {
                authState = .error(error.localizedDescription)
            }
        }
    }

    // MARK: - Forgot Password

    func forgotPassword(contact: String) {
        guard !contact.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        authState = .loading

        Task {
            do {
                try await sendResetLink(contact: contact)
            } catch {
                authState = .error(error.localizedDescription)
            }
        }
    }

    // MARK: - Logout

    func logout() {
        UserDefaults.standard.removeObject(forKey: "current_user")
        currentAuthUser = nil
        authState = .unauthenticated
    }

    // MARK: - Mock API Calls

    private func sendOTP(phone: String) async throws {
        try await Task.sleep(nanoseconds: 1_500_000_000)
    }

    private func sendOTP(email: String) async throws {
        try await Task.sleep(nanoseconds: 1_500_000_000)
    }

    private func verifyCode(_ code: String) async throws {
        try await Task.sleep(nanoseconds: 1_000_000_000)
        let user = AuthUser(id: "1", name: "John Doe", phone: "+919876543210", email: "john@example.com")
        currentAuthUser = user
        if let data = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(data, forKey: "current_user")
        }
    }

    private func registerAuthUser(name: String, phone: String, email: String) async throws {
        try await Task.sleep(nanoseconds: 1_500_000_000)
    }

    private func sendResetLink(contact: String) async throws {
        try await Task.sleep(nanoseconds: 1_500_000_000)
    }
}

// MARK: - AuthUser Model

struct AuthUser: Codable, Equatable {
    let id: String
    let name: String
    let phone: String?
    let email: String?
}
