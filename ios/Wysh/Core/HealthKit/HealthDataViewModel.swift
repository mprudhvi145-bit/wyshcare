import Foundation
import Observation

@Observable
@MainActor
final class HealthDataViewModel {
    private let healthKitService = HealthKitService.shared

    var isLoading = false
    var errorMessage: String?

    var steps: Double { healthKitService.steps }
    var heartRate: Double { healthKitService.heartRate }
    var weight: Double { healthKitService.weight }
    var bloodPressureSystolic: Double { healthKitService.bloodPressureSystolic }
    var bloodPressureDiastolic: Double { healthKitService.bloodPressureDiastolic }
    var bloodOxygen: Double { healthKitService.bloodOxygen }
    var respiratoryRate: Double { healthKitService.respiratoryRate }
    var sleepHours: Double { healthKitService.sleepHours }
    var isAuthorized: Bool { healthKitService.isAuthorized }

    @MainActor
    func requestAuthorization() async {
        isLoading = true
        errorMessage = nil
        await healthKitService.requestAuthorization()
        isLoading = false
    }

    @MainActor
    func refresh() async {
        isLoading = true
        errorMessage = nil
        await healthKitService.fetchAllMetrics()
        isLoading = false
    }

    func formattedSteps() -> String {
        String(format: "%.0f", steps)
    }

    func formattedHeartRate() -> String {
        String(format: "%.0f bpm", heartRate)
    }

    func formattedWeight() -> String {
        String(format: "%.1f kg", weight)
    }

    func formattedBloodPressure() -> String {
        "\(String(format: "%.0f", bloodPressureSystolic))/\(String(format: "%.0f", bloodPressureDiastolic)) mmHg"
    }

    func formattedBloodOxygen() -> String {
        String(format: "%.1f%%", bloodOxygen * 100)
    }

    func formattedRespiratoryRate() -> String {
        String(format: "%.0f breaths/min", respiratoryRate)
    }

    func formattedSleepHours() -> String {
        String(format: "%.1f hrs", sleepHours)
    }

    deinit {}
}
