import Foundation
import UIKit

enum AuthError: LocalizedError {
    case invalidCredentials
    case networkError(Error)
    case sessionExpired

    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid phone number or OTP"

        case .networkError(let err):
            return err.localizedDescription

        case .sessionExpired:
            return "Session expired. Please login again."
        }
    }
}

@Observable
@MainActor
final class AuthService: Sendable {
    private let api = API()
    private let keychain = KeychainService.shared

    deinit {}

    func login(phoneNumber: String) async throws {
        let response = try await api.login(phoneNumber: phoneNumber)
        await keychain.saveToken(response.token)
        await MainActor.run {
            if let appState = findAppState() {
                appState.accessToken = response.token
                appState.currentUser = response.user
                appState.authState = .authenticated
            }
        }
    }

    func verifyOTP(phoneNumber: String, otp: String) async throws {
        let response = try await api.verifyOTP(phoneNumber: phoneNumber, otp: otp)
        await keychain.saveToken(response.token)
        await MainActor.run {
            if let appState = findAppState() {
                appState.accessToken = response.token
                appState.currentUser = response.user
                appState.authState = .authenticated
            }
        }
    }

    func forgotPassword(phoneNumber: String) async throws {
        try await api.forgotPassword(phoneNumber: phoneNumber)
    }

    func resetPassword(phoneNumber: String, otp: String, newPassword: String) async throws {
        try await api.resetPassword(phoneNumber: phoneNumber, otp: otp, newPassword: newPassword)
    }

    func logout() async {
        await keychain.deleteToken()
        await MainActor.run {
            if let appState = findAppState() {
                appState.accessToken = nil
                appState.currentUser = nil
                appState.authState = .unauthenticated
            }
        }
    }

    private func findAppState() -> AppState? {
        let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene
        return scene?.windows.first?.rootViewController?.view?.window?
            .rootViewController?.view?.window?.rootViewController?
            .view?.window?.rootViewController?
            .view?.window?.rootViewController?
            .view?.window?
            .windowScene?
            .windows
            .first?
            .rootViewController as? AppState
    }
}
