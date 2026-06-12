import SwiftUI

enum DeepLinkDestination: Equatable {
    case appointment
    case appointmentDetail(String)
    case healthRecord(String)
    case home
    case labReport
    case messages
    case profile
    case records
    case timeline
}

@MainActor
final class DeepLinkService: Observable {
    static let shared = DeepLinkService()

    @Published var pendingDestination: DeepLinkDestination?
    @Published var showAlert = false
    @Published var alertMessage = ""

    private init() {}

    deinit {}

    func handle(_ destination: DeepLinkDestination) async {
        pendingDestination = destination
    }

    func consumePending() -> DeepLinkDestination? {
        guard let dest = pendingDestination else { return nil }
        pendingDestination = nil
        return dest
    }

    func processURL(_ url: URL) -> Bool {
        guard
            let components = URLComponents(
                url: url,
                resolvingAgainstBaseURL: false
            ),
            let host = components.host
        else { return false }

        let path = components.path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))

        switch host {
        case "appointment":
            if !path.isEmpty {
                pendingDestination = .appointmentDetail(path)
            } else {
                pendingDestination = .appointment
            }
            return true

        case "records":
            if !path.isEmpty {
                pendingDestination = .healthRecord(path)
            } else {
                pendingDestination = .records
            }
            return true

        case "messages":
            pendingDestination = .messages
            return true

        case "profile":
            pendingDestination = .profile
            return true

        default:
            return false
        }
    }
}
