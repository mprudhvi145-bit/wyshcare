import Foundation
import SwiftUI

struct ConnectedAccount: Identifiable {
    let id = UUID()
    let provider: String
    let email: String
    let icon: String
    let status: String
}

@Observable
final class ProfileViewModel {
    let name = "Vimarshak Prudhvi"
    let wyshId = "WYSH-UID-001234"
    let phone = "+91 98765 43210"
    let email = "vimarshak@example.com"
    let bloodGroup = "O+"
    let language = "English"

    var avatarInitials: String {
        name.split(separator: " ").compactMap { $0.first }.map { String($0) }.joined().prefix(2).uppercased()
    }

    let connectedAccounts = [
        ConnectedAccount(provider: "Apple", email: "vimarshak@icloud.com", icon: "applelogo", status: "Connected"),
        ConnectedAccount(provider: "Google", email: "vimarshak@gmail.com", icon: "g.circle.fill", status: "Connected")
    ]

    deinit {}

    func logout() {
        print("User logged out")
    }
}
