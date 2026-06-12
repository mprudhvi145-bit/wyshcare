import UIKit
@preconcurrency import UserNotifications

@MainActor
enum NotificationService {
    static func requestAuthorization() async -> Bool {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            return granted
        } catch {
            return false
        }
    }

    static func registerForRemoteNotifications() {
        UIApplication.shared.registerForRemoteNotifications()
    }

    static func getAuthorizationStatus() async -> UNAuthorizationStatus {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        return settings.authorizationStatus
    }

    static func handleRemoteNotification(userInfo: [AnyHashable: Any]) async {
        guard let type = userInfo["type"] as? String else { return }
        switch type {
        case "appointment":
            await DeepLinkService.shared.handle(.appointment)

        case "message":
            await DeepLinkService.shared.handle(.messages)

        case "lab_report":
            await DeepLinkService.shared.handle(.labReport)

        default:
            break
        }
    }

    static func didRegisterForRemoteNotifications(deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        UserDefaults.standard.set(token, forKey: "apns_device_token")
    }

    static func didFailToRegisterForRemoteNotifications(error: Error) {
        print("APNS registration failed: \(error.localizedDescription)")
    }
}
