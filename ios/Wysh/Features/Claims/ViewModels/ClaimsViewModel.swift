import Foundation
import Observation
import SwiftUI

@Observable
final class ClaimsViewModel {
    var claims: [Claim] = []
    var selectedFilter: ClaimFilter = .all
    var isLoading = false
    var error: String?

    init() {
        loadMockData()
    }

    deinit {}

    var filteredClaims: [Claim] {
        switch selectedFilter {
        case .all:
            return claims

        case .approved:
            return claims.filter { $0.status == .approved }

        case .pending:
            return claims.filter { $0.status == .pending || $0.status == .underReview }

        case .rejected:
            return claims.filter { $0.status == .rejected }
        }
    }

    func submitClaim(policyId: String, amount: Decimal, description: String, documents: [ClaimDocument]) {
        let newClaim = Claim(
            id: "CLM-\(Int.random(in: 1_000...9_999))",
            policyId: policyId,
            amount: amount,
            status: .pending,
            date: Date(),
            provider: "Self-submitted",
            description: description,
            documents: documents,
            timeline: [
                ClaimTimelineEntry(status: .submitted, date: Date(), note: "Claim submitted")
            ]
        )
        withAnimation { claims.insert(newClaim, at: 0) }
    }

    private func loadMockData() {
        let calendar = Calendar.current
        claims = [
            Claim(
                id: "CLM-8847",
                policyId: "POL-2024-001",
                amount: 1_250,
                status: .approved,
                date: calendar.date(byAdding: .day, value: -5, to: Date()) ?? Date(),
                provider: "City General Hospital",
                description: "ER visit — chest pain evaluation",
                documents: [
                    ClaimDocument(name: "ER Summary Report", type: "PDF", isUploaded: true),
                    ClaimDocument(name: "Itemized Bill", type: "PDF", isUploaded: true)
                ],
                timeline: [
                    ClaimTimelineEntry(status: .submitted, date: calendar.date(byAdding: .day, value: -14, to: Date()) ?? Date(), note: "Claim submitted via portal"),
                    ClaimTimelineEntry(status: .underReview, date: calendar.date(byAdding: .day, value: -10, to: Date()) ?? Date(), note: "Under review by adjuster"),
                    ClaimTimelineEntry(status: .approved, date: calendar.date(byAdding: .day, value: -5, to: Date()) ?? Date(), note: "Approved — payment of $1,000 issued")
                ]
            ),
            Claim(
                id: "CLM-8848",
                policyId: "POL-2024-001",
                amount: 3_400,
                status: .underReview,
                date: calendar.date(byAdding: .day, value: -2, to: Date()) ?? Date(),
                provider: "Downtown Medical Center",
                description: "Knee MRI and consultation",
                documents: [
                    ClaimDocument(name: "MRI Results", type: "PDF", isUploaded: true),
                    ClaimDocument(name: "Physician Referral", type: "PDF", isUploaded: true),
                    ClaimDocument(name: "Pre-Auth Form", type: "PDF", isUploaded: false)
                ],
                timeline: [
                    ClaimTimelineEntry(status: .submitted, date: calendar.date(byAdding: .day, value: -2, to: Date()) ?? Date(), note: "Claim submitted")
                ]
            ),
            Claim(
                id: "CLM-8849",
                policyId: "POL-2024-001",
                amount: 750,
                status: .rejected,
                date: calendar.date(byAdding: .day, value: -20, to: Date()) ?? Date(),
                provider: "Dr. Sarah Chen",
                description: "Annual physical — lab work",
                documents: [
                    ClaimDocument(name: "Lab Results", type: "PDF", isUploaded: true)
                ],
                timeline: [
                    ClaimTimelineEntry(status: .submitted, date: calendar.date(byAdding: .day, value: -30, to: Date()) ?? Date(), note: "Claim submitted"),
                    ClaimTimelineEntry(status: .underReview, date: calendar.date(byAdding: .day, value: -25, to: Date()) ?? Date(), note: "Under review"),
                    ClaimTimelineEntry(status: .rejected, date: calendar.date(byAdding: .day, value: -20, to: Date()) ?? Date(), note: "Rejected — services not covered under wellness benefit. Appeal available.")
                ]
            ),
            Claim(
                id: "CLM-8850",
                policyId: "POL-2024-001",
                amount: 5_200,
                status: .settled,
                date: calendar.date(byAdding: .day, value: -60, to: Date()) ?? Date(),
                provider: "City General Hospital",
                description: "Inpatient surgery — appendectomy",
                documents: [
                    ClaimDocument(name: "Surgery Report", type: "PDF", isUploaded: true),
                    ClaimDocument(name: "Itemized Bill", type: "PDF", isUploaded: true),
                    ClaimDocument(name: "Discharge Summary", type: "PDF", isUploaded: true),
                    ClaimDocument(name: "Pathology Report", type: "PDF", isUploaded: true)
                ],
                timeline: [
                    ClaimTimelineEntry(status: .submitted, date: calendar.date(byAdding: .day, value: -80, to: Date()) ?? Date(), note: "Claim submitted"),
                    ClaimTimelineEntry(status: .underReview, date: calendar.date(byAdding: .day, value: -75, to: Date()) ?? Date(), note: "Under review"),
                    ClaimTimelineEntry(status: .approved, date: calendar.date(byAdding: .day, value: -65, to: Date()) ?? Date(), note: "Approved — $4,160 coverage"),
                    ClaimTimelineEntry(status: .settled, date: calendar.date(byAdding: .day, value: -60, to: Date()) ?? Date(), note: "Payment of $4,160 deposited")
                ]
            )
        ]
    }
}

enum ClaimFilter: String, CaseIterable {
    case all = "All"
    case approved = "Approved"
    case pending = "Pending"
    case rejected = "Rejected"
}

struct Claim: Identifiable, Hashable {
    let id: String
    var policyId: String
    var amount: Decimal
    var status: ClaimStatus
    var date: Date
    var provider: String
    var description: String
    var documents: [ClaimDocument]
    var timeline: [ClaimTimelineEntry]
}

enum ClaimStatus: String {
    case approved = "Approved"
    case pending = "Pending"
    case rejected = "Rejected"
    case settled = "Settled"
    case underReview = "Under Review"

    var color: String {
        switch self {
        case .approved:
            return "green"

        case .pending:
            return "orange"

        case .rejected:
            return "red"

        case .settled:
            return "purple"

        case .underReview:
            return "blue"
        }
    }
}

struct ClaimDocument: Identifiable, Hashable {
    let id = UUID()
    var name: String
    var type: String
    var isUploaded: Bool
}

struct ClaimTimelineEntry: Identifiable, Hashable {
    let id = UUID()
    var status: TimelineStatus
    var date: Date
    var note: String
}

enum TimelineStatus: String {
    case approved = "Approved"
    case rejected = "Rejected"
    case settled = "Settlement"
    case submitted = "Submitted"
    case underReview = "Under Review"

    var icon: String {
        switch self {
        case .approved:
            return "checkmark.circle"

        case .rejected:
            return "xmark.circle"

        case .settled:
            return "dollarsign.circle"

        case .submitted:
            return "doc.text"

        case .underReview:
            return "magnifyingglass"
        }
    }
}
