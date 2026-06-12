import Foundation // swiftlint:disable:this file_name

// MARK: - Appointments

struct Appointment: Codable, Identifiable, Sendable {
    let id: String
    let doctorName: String
    let specialty: String
    let hospitalName: String?
    let appointmentDate: String
    let status: String
    let notes: String?
}

// MARK: - Health Records

struct HealthRecord: Codable, Identifiable, Sendable {
    let id: String
    let title: String
    let type: String
    let date: String
    let fileUrl: String?
    let summary: String?
}

// MARK: - Diagnostics

struct DiagnosticPartner: Codable, Identifiable, Sendable {
    let id: String
    let name: String
    let logoUrl: String?
    let rating: Double
    let homeCollectionAvailable: Bool
    let testCount: Int
}

struct DiagnosticOrder: Codable, Identifiable, Sendable {
    let id: String
    let partnerId: String
    let tests: [String]
    let totalAmount: Double
    let status: String
    let homeCollection: Bool
    let orderedAt: String
    let address: String?
}

struct DiagnosticReport: Codable, Identifiable, Sendable {
    let id: String
    let testName: String
    let labName: String
    let date: String
    let status: String
    let fileUrl: String?
}

// MARK: - Telemedicine

struct TelemedicineSession: Codable, Identifiable, Sendable {
    let id: String
    let doctorName: String
    let scheduledAt: String
    let status: SessionStatus
    let joinUrl: String?

    enum SessionStatus: String, Codable, Sendable {
        case scheduled, active, completed, cancelled
    }
}

// MARK: - Lab Report

struct LabReport: Codable, Identifiable, Sendable {
    let id: String
    let testName: String
    let labName: String
    let date: String
    let status: ReportStatus
    let fileUrl: String?
    let summary: String?

    enum ReportStatus: String, Codable, Sendable {
        case pending, completed, reviewed
    }
}

// MARK: - Insurance Policy

struct InsurancePolicy: Codable, Identifiable, Sendable {
    let id: String
    let provider: String
    let policyNumber: String
    let policyType: String
    let coverageAmount: Double
    let premium: Double
    let startDate: String
    let endDate: String
    let status: PolicyStatus

    enum PolicyStatus: String, Codable, Sendable {
        case active, expired, cancelled, pending
    }
}

// MARK: - Insurance Claim

struct InsuranceClaim: Codable, Identifiable, Sendable {
    let id: String
    let policyId: String
    let amount: Double
    let approvedAmount: Double?
    let description: String
    let status: ClaimStatus
    let filedDate: String
    let resolvedDate: String?
    let documents: [String]

    enum ClaimStatus: String, Codable, Sendable {
        case filed, underReview, approved, rejected, disbursed
    }
}

// MARK: - Pharmacy

struct PharmacyPartner: Codable, Identifiable, Sendable {
    let id: String
    let name: String
    let logoUrl: String?
    let rating: Double
    let deliveryTime: String
    let deliveryFee: Double
}

struct PharmacyOrder: Codable, Identifiable, Sendable {
    let id: String
    let partnerId: String
    let items: [PharmacyOrderItem]
    let totalAmount: Double
    let deliveryAddress: String
    let status: OrderStatus
    let orderedAt: String
    let prescriptionId: String?

    enum OrderStatus: String, Codable, Sendable {
        case placed, confirmed, processing, shipped, delivered, cancelled
    }
}

struct PharmacyOrderItem: Codable, Sendable {
    let medicineName: String
    let quantity: Int
    let unitPrice: Double
}

// MARK: - Health Graph

struct WalletBalance: Codable, Sendable {
    let balance: Double
    let currency: String
}

struct WalletTransaction: Codable, Identifiable, Sendable {
    let id: String
    let type: TransactionType

    enum TransactionType: String, Codable, Sendable {
        case credit, debit, refund
    }
}

struct Prevention: Codable, Identifiable, Sendable {
    let id: String
    let title: String
    let description: String
    let category: PreventionCategory
    let dueDate: String?
    let completed: Bool

    enum PreventionCategory: String, Codable, Sendable {
        case screening, vaccination, checkup, lifestyle
    }
}

// MARK: - ABDM

struct ABHAProfile: Codable, Sendable {
    let healthId: String
    let healthIdNumber: String
    let fullName: String
    let gender: String
    let dateOfBirth: String
    let district: String?
    let state: String?
    let isLinked: Bool
}

struct Consent: Codable, Identifiable, Sendable {
    let id: String
    let consentId: String
    let status: String
    let grantedAt: String?
    let expiresAt: String?
    let purpose: String
}

// MARK: - Care Navigator

struct CareMessage: Codable, Identifiable, Sendable {
    let id: String
    let role: MessageRole
    let content: String
    let timestamp: String
    let attachments: [String]?

    enum MessageRole: String, Codable, Sendable {
        case user, assistant, system
    }
}
