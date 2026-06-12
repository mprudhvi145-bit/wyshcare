import Foundation
import SwiftUI

enum Relationship: String, CaseIterable, Identifiable, Codable {
    case child = "Child"
    case other = "Other"
    case parent = "Parent"
    case sibling = "Sibling"
    case spouse = "Spouse"

    var id: String { rawValue }
}

enum HealthStatus: String, Codable {
    case attention = "Needs Attention"
    case critical = "Critical"
    case healthy = "Healthy"
    case pending = "Pending"

    var color: Color {
        switch self {
        case .attention:
            .orange

        case .critical:
            .red

        case .healthy:
            .green

        case .pending:
            .gray
        }
    }
}

enum AlertType: String, Codable {
    case appointment = "Appointment"
    case general = "General"
    case labResult = "Lab Result"
    case refill = "Refill"
}

enum AlertSeverity: String, Codable {
    case critical = "Critical"
    case info = "Info"
    case warning = "Warning"

    var color: Color {
        switch self {
        case .critical:
            .red

        case .info:
            .blue

        case .warning:
            .orange
        }
    }
}

struct HealthSummary: Hashable, Codable {
    var conditions: [String]
    var medications: [String]
    var lastCheckup: Date?
    var bloodType: String
}

struct SharedPrescription: Identifiable, Hashable, Codable {
    let id = UUID()
    var name: String
    var dosage: String
    var pharmacy: String
    var refillDate: Date?
}

struct FamilyAppointment: Identifiable, Hashable, Codable {
    let id = UUID()
    var type: String
    var date: Date?
    var provider: String
}

struct AlertItem: Identifiable, Hashable, Codable {
    let id = UUID()
    var type: AlertType
    var message: String
    var severity: AlertSeverity
}

struct FamilyMember: Identifiable, Hashable, Codable {
    let id: String
    var name: String
    var phone: String
    var relationship: Relationship
    var age: Int
    var healthStatus: HealthStatus
    var isInvited: Bool
    var healthSummary: HealthSummary?
    var sharedPrescriptions: [SharedPrescription]
    var upcomingAppointments: [FamilyAppointment]
    var alerts: [AlertItem]
}

struct FamilyTimelineEvent: Identifiable {
    let id = UUID()
    let date: Date
    let title: String
    let subtitle: String
    let icon: String
    let iconColor: Color
}

struct FamilyInsurancePlan: Identifiable {
    let id = UUID()
    let provider: String
    let policyNumber: String
    let coverage: String
    let validUntil: Date
    let premium: String
}

struct FamilyClaim: Identifiable {
    let id = UUID()
    let claimNumber: String
    let description: String
    let amount: String
    let status: String
    let date: Date
}

struct EmergencyContact: Identifiable {
    let id = UUID()
    let name: String
    let relationship: String
    let phone: String
    let bloodType: String
    let allergies: [String]
    let conditions: [String]
    let medications: [String]
}

struct CaregiverPermission: Identifiable {
    let id = UUID()
    let name: String
    let phone: String
    let permissions: [String]
    let isActive: Bool
}
