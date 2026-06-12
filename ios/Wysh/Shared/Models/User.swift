import Foundation

struct User: Codable, Identifiable, Sendable {
    let id: String
    let wyshId: String
    let fullName: String
    let phoneNumber: String
    let email: String?
    let roles: [String]
    let bloodGroup: String?
    let preferredLanguage: String?
}
