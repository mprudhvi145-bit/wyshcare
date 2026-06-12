import UIKit

final class HapticManager: Sendable {
    static let shared = HapticManager()

    private init() {}

    deinit {}

    func trigger() {
        Task { @MainActor in
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.prepare()
            generator.impactOccurred()
        }
    }
}
