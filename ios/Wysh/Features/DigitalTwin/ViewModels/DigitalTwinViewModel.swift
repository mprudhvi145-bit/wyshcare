import Foundation
import Observation
import SwiftUI

enum TwinRiskLevel: String, Decodable {
    case critical = "CRITICAL"
    case high = "HIGH"
    case low = "LOW"
    case moderate = "MODERATE"

    var displayName: String {
        switch self {
        case .critical:
            return "Critical"

        case .high:
            return "High"

        case .low:
            return "Low"

        case .moderate:
            return "Moderate"
        }
    }

    var color: Color {
        switch self {
        case .critical:
            return .purple

        case .high:
            return .red

        case .low:
            return .green

        case .moderate:
            return .orange
        }
    }
}

enum TrendDirection {
    case down, stable, up

    var icon: String {
        switch self {
        case .down:
            return "arrow.down.right"

        case .stable:
            return "arrow.right"

        case .up:
            return "arrow.up.right"
        }
    }
}

struct HealthScoreTrend {
    let percentage: Double
    let direction: TrendDirection
}

struct RiskAssessment: Identifiable, Decodable {
    let id: String
    let riskType: String
    let riskScore: Double
    let riskLevel: TwinRiskLevel
    let drivers: [String]
    let recommendedActions: [String]
}

struct CareGap: Identifiable, Decodable {
    let id: String
    let category: String
    let title: String
    let description: String
    let priority: String
    let dueDate: String?
    let status: String

    var dueSoon: Bool {
        guard let dueDateStr = dueDate,
              let dueDate = ISO8601DateFormatter().date(from: dueDateStr) else { return false }
        return dueDate.timeIntervalSinceNow < 30 * 86_400
    }
}

struct Prediction: Identifiable, Decodable {
    let type: String
    let title: String
    let description: String
    let probability: Double
    let timeframe: String
    let riskLevel: TwinRiskLevel
    let factors: [String]
    let recommendations: [String]

    var id: String { title }
    var icon: String {
        switch type {
        case "CARDIOVASCULAR_EVENT": return "heart"
        case "DIABETES_PROGRESSION": return "drop"
        case "HYPERTENSION_RISK": return "waveform.path.ecg"
        case "KIDNEY_DISEASE": return "kidney"
        case "LIVER_DISEASE": return "liver"
        case "RESPIRATORY_DECLINE": return "lungs"
        case "MENTAL_HEALTH": return "brain.head.profile"
        case "FALL_RISK": return "figure.fall"
        case "READMISSION_RISK": return "building.columns"
        case "MEDICATION_NON_ADHERENCE": return "pills"
        case "FRAILTY": return "figure.walk"
        case "MORTALITY": return "infinity"
        default: return "chart.line.uptrend.xyaxis"
        }
    }
}

struct Recommendation: Identifiable, Decodable {
    let id: String
    let recommendation: String
    let category: String
    let priority: String?
    let dueDate: String?
    let status: String

    var completed: Bool { status == "COMPLETED" }
    var frequency: String {
        switch category.uppercased() {
        case "VACCINATION": return "As recommended"
        case "SCREENING": return "Per guidelines"
        case "LAB": return "As ordered"
        case "CHECKUP": return "Yearly"
        case "LIFESTYLE": return "Ongoing"
        default: return "As needed"
        }
    }
}

struct TwinScores: Decodable {
    let health: Int
    let risk: Int
    let adherence: Int
    let readiness: Int
}

struct AdherenceData: Decodable {
    let overallRate: Double
    let status: String
    let byMedication: [MedicationAdherence]
    let totalExpected: Int
    let totalTaken: Int
    let totalMissed: Int

    struct MedicationAdherence: Decodable {
        let name: String
        let rate: Double
        let status: String
    }
}

struct FamilyRisk: Identifiable, Decodable {
    let condition: String
    let relationship: String
    let relativeRisk: Double
    let inheritedProbability: Double
    let recommendation: String

    var id: String { "\(condition)-\(relationship)" }
    var riskLevel: String {
        if relativeRisk >= 2.5 { return "High risk" }
        if relativeRisk >= 1.8 { return "Moderate risk" }
        return "Low risk"
    }
}

struct FamilyRiskResponse: Decodable {
    let totalRisks: Int
    let overallScore: Double
    let risks: [FamilyRisk]
}

struct ScoreHistoryEntry: Decodable {
    let healthScore: Int
    let riskScore: Int
    let adherenceScore: Int
    let readinessScore: Int
    let recordedAt: String
}

struct MetricHistoryEntry: Decodable {
    let metric: String
    let value: Double
    let unit: String?
    let recordedAt: String
}

struct TwinResponse: Decodable {
    let id: String
    let userId: String
    let scores: TwinScores
    let lastComputedAt: String?
    let risks: [RiskAssessment]
    let careGaps: [CareGap]
    let predictions: [Prediction]
    let recommendations: [Recommendation]
    let adherence: AdherenceData
    let familyRisk: FamilyRiskResponse
    let scoreHistory: [ScoreHistoryEntry]
    let metricHistory: [MetricHistoryEntry]
}

struct ScoreResponse: Decodable {
    let healthScore: Int
    let riskScore: Int
    let adherenceScore: Int
    let readinessScore: Int
}

@MainActor
@Observable
final class DigitalTwinViewModel {
    private let api = APIClient.shared

    var isLoading = false
    var errorMessage: String?

    // Scores
    var healthScore: Double = 0
    var riskScore: Double = 0
    var adherenceScore: Double = 0
    var readinessScore: Double = 0
    var healthScoreTrend = HealthScoreTrend(percentage: 0, direction: .stable)

    // Data arrays
    var risks: [RiskAssessment] = []
    var careGaps: [CareGap] = []
    var predictions: [Prediction] = []
    var recommendations: [Recommendation] = []
    var keyRisks: [String] = []
    var familyRisks: [FamilyRisk] = []
    var diseaseProgressions: [DiseaseProgression] = []
    var preventiveCares: [PreventiveCare] = []

    // AI Summary
    var aiSummary = ""

    // Risk level
    var riskLevel: TwinRiskLevel = .low

    // Loading states
    var scoresLoaded = false
    var dataLoaded = false

    init() {
        Task { await load() }
    }

    deinit {}

    @MainActor
    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            async let scoresTask: ScoreResponse = api.request("/digital-twin/score")
            async let twinTask: TwinResponse = api.request("/digital-twin")

            let (scores, twin) = await (try scoresTask, try twinTask)

            healthScore = Double(scores.healthScore)
            riskScore = Double(scores.riskScore)
            adherenceScore = Double(scores.adherenceScore)
            readinessScore = Double(scores.readinessScore)
            riskLevel = TwinRiskLevel(rawValue: twin.risks.first?.riskLevel.rawValue ?? "LOW") ?? .low

            // Calculate trend from history
            healthScoreTrend = calculateTrend(from: twin.scoreHistory)

            // Key risks from risk assessments
            keyRisks = twin.risks.flatMap { $0.drivers }

            // Assign all data
            risks = twin.risks
            careGaps = twin.careGaps
            predictions = twin.predictions
            recommendations = twin.recommendations
            familyRisks = twin.familyRisk.risks

            // Build disease progressions from conditions in risks/recommendations
            diseaseProgressions = buildDiseaseProgressions(from: twin)

            // Build preventive cares from recommendations
            preventiveCares = recommendations.map { rec in
                PreventiveCare(
                    title: rec.recommendation,
                    frequency: rec.frequency,
                    completed: rec.completed
                )
            }

            // AI Summary
            aiSummary = buildAISummary(from: twin)

            scoresLoaded = true
            dataLoaded = true
        } catch {
            errorMessage = "Failed to load digital twin: \(error.localizedDescription)"
        }
    }

    func formattedTrend() -> String {
        let pct = String(format: "%.0f", healthScoreTrend.percentage)
        let direction: String
        switch healthScoreTrend.direction {
        case .up: direction = "improvement"
        case .down: direction = "decline"
        case .stable: direction = "stable"
        }
        return "\(pct)% \(direction)"
    }

    @MainActor
    func recompute() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let _: API.EmptyResponse = try await api.request("/digital-twin/recompute", method: .post)
            await load()
        } catch {
            errorMessage = "Failed to recompute: \(error.localizedDescription)"
        }
    }

    private func calculateTrend(from history: [ScoreHistoryEntry]) -> HealthScoreTrend {
        guard history.count >= 2, let latestEntry = history.sorted(by: { $0.recordedAt < $1.recordedAt }).last else {
            return HealthScoreTrend(percentage: 0, direction: .stable)
        }

        let sorted = history.sorted { $0.recordedAt < $1.recordedAt }
        let latest = latestEntry.healthScore
        let previous = sorted[sorted.count - 2].healthScore

        let change = Double(latest - previous)
        let percentage = abs(change)

        if change > 1 { return HealthScoreTrend(percentage: percentage, direction: .up) } else if change < -1 { return HealthScoreTrend(percentage: percentage, direction: .down) } else { return HealthScoreTrend(percentage: percentage, direction: .stable) }
    }

    private func buildDiseaseProgressions(from twin: TwinResponse) -> [DiseaseProgression] {
        var progressions: [DiseaseProgression] = []

        // Extract unique conditions from risk assessments
        let conditionSet = Set(twin.risks.flatMap { $0.drivers }.compactMap { extractCondition(from: $0) })

        for condition in conditionSet.prefix(5) {
            let status = twin.risks.first { $0.drivers.contains { $0.contains(condition) } }?.riskLevel ?? .low
            let statusColor: Color
            switch status {
            case .low:
                statusColor = .green

            case .moderate:
                statusColor = .orange

            case .high:
                statusColor = .red

            case .critical:
                statusColor = .purple
            }

            progressions.append(DiseaseProgression(
                name: condition,
                status: status.displayName,
                statusColor: statusColor,
                timelineEvents: twin.risks
                    .filter { $0.drivers.contains { $0.contains(condition) } }
                    .flatMap { $0.drivers }
            ))
        }

        return progressions
    }

    private func extractCondition(from driver: String) -> String? {
        let patterns = [
            "diabetes", "hypertension", "blood pressure", "cardiovascular",
            "kidney", "liver", "respiratory", "mental", "fall", "frailty"
        ]
        let lower = driver.lowercased()
        return patterns.first { lower.contains($0) }?.capitalized
    }

    private func buildAISummary(from twin: TwinResponse) -> String {
        var parts: [String] = []

        parts.append("Your Digital Twin shows a health score of \(twin.scores.health) and risk score of \(twin.scores.risk).")

        if !twin.risks.isEmpty {
            let topRisk = twin.risks.max { $0.riskScore < $1.riskScore }
            if let risk = topRisk {
                parts.append("Primary risk factor: \(risk.riskType.replacingOccurrences(of: "_", with: " ").capitalized) at \(Int(risk.riskScore))%.")
            }
        }

        if !twin.careGaps.isEmpty {
            let overdue = twin.careGaps.filter { $0.dueSoon }.count
            parts.append("You have \(overdue) overdue care gap\(overdue == 1 ? "" : "s").")
        }

        if twin.adherence.overallRate < 80 {
            parts.append("Medication adherence is \(Int(twin.adherence.overallRate))% — consider setting up reminders.")
        } else {
            parts.append("Excellent medication adherence at \(Int(twin.adherence.overallRate))%.")
        }

        if twin.familyRisk.totalRisks > 0 {
            parts.append("Family history indicates \(twin.familyRisk.totalRisks) hereditary risk factor\(twin.familyRisk.totalRisks == 1 ? "" : "s").")
        }

        return parts.joined(separator: " ")
    }
}

// Helper structs for UI
struct DiseaseProgression: Identifiable {
    let id = UUID()
    let name: String
    let status: String
    let statusColor: Color
    let timelineEvents: [String]
}

struct PreventiveCare: Identifiable {
    let id = UUID()
    let title: String
    let frequency: String
    let completed: Bool
}
