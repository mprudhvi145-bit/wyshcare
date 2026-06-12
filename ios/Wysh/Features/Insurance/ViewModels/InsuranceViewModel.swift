import Foundation
import Observation

@Observable
final class InsuranceViewModel {
    var activePolicy: Policy?
    var coverageSummary: CoverageSummary
    var isLoading = false
    var error: String?

    init() {
        self.coverageSummary = CoverageSummary(
            totalCoverage: 1_000_000,
            usedCoverage: 245_000,
            deductible: 2_500,
            deductibleMet: 1_800,
            outOfPocketMax: 5_000,
            outOfPocketMet: 3_200
        )
        self.activePolicy = Policy(
            id: "POL-2024-001",
            provider: "BlueCross Shield",
            planName: "Premium Plus PPO",
            policyNumber: "BCS-PPO-88472X",
            coverageAmount: 1_000_000,
            expiryDate: ISO8601DateFormatter().date(from: "2026-12-31T00:00:00Z") ?? Date(),
            startDate: ISO8601DateFormatter().date(from: "2024-01-01T00:00:00Z") ?? Date(),
            premium: 450,
            network: "PPO",
            coverageLimits: [
                CoverageLimit(category: "Hospitalization", coverage: 500_000, remaining: 420_000),
                CoverageLimit(category: "Outpatient", coverage: 150_000, remaining: 98_000),
                CoverageLimit(category: "Prescription", coverage: 50_000, remaining: 42_000),
                CoverageLimit(category: "Dental", coverage: 25_000, remaining: 18_500),
                CoverageLimit(category: "Vision", coverage: 10_000, remaining: 8_200)
            ],
            deductibles: [
                Deductible(category: "Individual", amount: 2_500, met: 1_800),
                Deductible(category: "Family", amount: 5_000, met: 3_200),
                Deductible(category: "Prescription", amount: 500, met: 500)
            ],
            networkProviders: [
                NetworkProvider(name: "City General Hospital", type: "Hospital", address: "123 Main St", phone: "(555) 123-4567", tier: "Preferred"),
                NetworkProvider(name: "Downtown Medical Center", type: "Hospital", address: "456 Oak Ave", phone: "(555) 987-6543", tier: "Preferred"),
                NetworkProvider(name: "Dr. Sarah Chen", type: "Primary Care", address: "789 Pine Rd", phone: "(555) 456-7890", tier: "In-Network"),
                NetworkProvider(name: "Dr. Michael Torres", type: "Cardiology", address: "321 Elm St", phone: "(555) 234-5678", tier: "In-Network"),
                NetworkProvider(name: "Dr. Emily Watson", type: "Dermatology", address: "654 Birch Ln", phone: "(555) 876-5432", tier: "Out-of-Network")
            ]
        )
    }

    deinit {}

    var coveragePercentage: Double {
        guard coverageSummary.totalCoverage > 0 else { return 0 }
        return Double(coverageSummary.usedCoverage) / Double(coverageSummary.totalCoverage)
    }

    var deductiblePercentage: Double {
        guard coverageSummary.deductible > 0 else { return 0 }
        return Double(coverageSummary.deductibleMet) / Double(coverageSummary.deductible)
    }

    var oopPercentage: Double {
        guard coverageSummary.outOfPocketMax > 0 else { return 0 }
        return Double(coverageSummary.outOfPocketMet) / Double(coverageSummary.outOfPocketMax)
    }
}

struct Policy: Identifiable, Hashable {
    let id: String
    var provider: String
    var planName: String
    var policyNumber: String
    var coverageAmount: Int
    var expiryDate: Date
    var startDate: Date
    var premium: Decimal
    var network: String
    var coverageLimits: [CoverageLimit]
    var deductibles: [Deductible]
    var networkProviders: [NetworkProvider]
}

struct CoverageLimit: Identifiable, Hashable {
    let id = UUID()
    var category: String
    var coverage: Int
    var remaining: Int
}

struct Deductible: Identifiable, Hashable {
    let id = UUID()
    var category: String
    var amount: Int
    var met: Int
}

struct NetworkProvider: Identifiable, Hashable {
    let id = UUID()
    var name: String
    var type: String
    var address: String
    var phone: String
    var tier: String
}

struct CoverageSummary {
    var totalCoverage: Int
    var usedCoverage: Int
    var deductible: Int
    var deductibleMet: Int
    var outOfPocketMax: Int
    var outOfPocketMet: Int
}

enum CoverageCategory: String, CaseIterable, Identifiable {
    case dental = "Dental"
    case hospitalization = "Hospitalization"
    case outpatient = "Outpatient"
    case prescription = "Prescription"
    case vision = "Vision"

    var id: String { rawValue }

    var color: String {
        switch self {
        case .dental:
            return "purple"

        case .hospitalization:
            return "blue"

        case .outpatient:
            return "green"

        case .prescription:
            return "orange"

        case .vision:
            return "teal"
        }
    }
}
