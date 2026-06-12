import Foundation
import OSLog

enum AnalyticsEvent: String {
    case appLaunch = "app_launch"
    case appointmentBooked = "appointment_booked"
    case appointmentCancelled = "appointment_cancelled"
    case claimSubmitted = "claim_submitted"
    case claimViewed = "claim_viewed"
    case copilotChat = "copilot_chat"
    case deepLinkOpened = "deep_link_opened"
    case errorOccurred = "error_occurred"
    case featureUsed = "feature_used"
    case healthKitAuthorized = "healthkit_authorized"
    case healthKitDenied = "healthkit_denied"
    case healthScoreViewed = "health_score_viewed"
    case insuranceCardViewed = "insurance_card_viewed"
    case login = "login"
    case logout = "logout"
    case medicationSkipped = "medication_skipped"
    case medicationTaken = "medication_taken"
    case notificationReceived = "notification_received"
    case notificationTapped = "notification_tapped"
    case prescriptionRefilled = "prescription_refilled"
    case signup = "signup"
    case telemedicineEnded = "telemedicine_ended"
    case telemedicineStarted = "telemedicine_started"
}

struct AnalyticsEventPayload: @unchecked Sendable {
    let event: AnalyticsEvent
    let properties: [String: Any]
    let timestamp: Date

    init(event: AnalyticsEvent, properties: [String: Any] = [:]) {
        self.event = event
        self.properties = properties
        self.timestamp = Date()
    }
}

final class AnalyticsService: @unchecked Sendable {
    static let shared = AnalyticsService()
    private let logger = Logger(subsystem: "com.wysh.app", category: "Analytics")
    private var isEnabled = true
    private var eventQueue: [AnalyticsEventPayload] = []
    private let queue = DispatchQueue(label: "com.wysh.analytics", qos: .background)

    private init() {}

    deinit {}

    func enable() { isEnabled = true }
    func disable() { isEnabled = false }

    func track(_ event: AnalyticsEvent, properties: [String: Any] = [:]) {
        guard isEnabled else { return }
        let payload = AnalyticsEventPayload(event: event, properties: properties)
        queue.async { [weak self] in
            self?.eventQueue.append(payload)
            self?.logger.debug("Tracked: \(payload.event.rawValue) - \(payload.properties)")
            self?.flush()
        }
    }

    func track(_ event: AnalyticsEvent, value: String) {
        track(event, properties: ["value": value])
    }

    func track(_ event: AnalyticsEvent, error: Error) {
        track(event, properties: [
            "error": error.localizedDescription,
            "domain": (error as NSError).domain,
            "code": (error as NSError).code
        ])
    }

    func trackScreen(_ screenName: String) {
        track(.featureUsed, properties: ["screen": screenName])
    }

    func trackUserAction(_ action: String, context: [String: Any] = [:]) {
        var props = context
        props["action"] = action
        track(.featureUsed, properties: props)
    }

    func flush() {
        guard !eventQueue.isEmpty else { return }
        let batch = eventQueue
        eventQueue.removeAll()
        sendBatch(batch)
    }

    private func sendBatch(_ batch: [AnalyticsEventPayload]) {
        for payload in batch {
            logger.info("Analytics: \(payload.event.rawValue)")
        }
    }

    func getQueuedEventCount() -> Int {
        queue.sync { eventQueue.count }
    }

    func clearQueue() {
        queue.async { [weak self] in
            self?.eventQueue.removeAll()
        }
    }
}
