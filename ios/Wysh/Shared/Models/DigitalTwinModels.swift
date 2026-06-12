import Foundation // swiftlint:disable:this file_name

struct TwinSummary: Codable, Sendable {
    let lastSyncedAt: String
    let dataCompleteness: Double
    let activeCarePlans: Int
    let pendingActions: Int
    let riskScore: Double
    let overallHealthStatus: String
}
