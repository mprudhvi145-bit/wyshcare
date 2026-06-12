import Foundation

struct API {
    private let client = APIClient.shared

    // MARK: - Auth

    struct LoginRequest: Encodable, Sendable {
        let phoneNumber: String
        let otp: String?
    }

    struct LoginResponse: Decodable, Sendable {
        let token: String
        let user: User
        let isNewUser: Bool
    }

    func login(phoneNumber: String) async throws -> LoginResponse {
        try await client.request(
            "/auth/login",
            method: .post,
            body: LoginRequest(phoneNumber: phoneNumber, otp: nil)
        )
    }

    func verifyOTP(phoneNumber: String, otp: String) async throws -> LoginResponse {
        try await client.request(
            "/auth/verify-otp",
            method: .post,
            body: LoginRequest(phoneNumber: phoneNumber, otp: otp)
        )
    }

    struct RefreshTokenResponse: Decodable, Sendable {
        let token: String
    }

    func refreshToken(refreshToken: String) async throws -> RefreshTokenResponse {
        try await client.request(
            "/auth/refresh",
            method: .post,
            body: ["refreshToken": refreshToken]
        )
    }

    func forgotPassword(phoneNumber: String) async throws -> EmptyResponse {
        try await client.request(
            "/auth/forgot-password",
            method: .post,
            body: ["phoneNumber": phoneNumber]
        )
    }

    func resetPassword(phoneNumber: String, otp: String, newPassword: String) async throws -> EmptyResponse {
        try await client.request(
            "/auth/reset-password",
            method: .post,
            body: [
                "phoneNumber": phoneNumber,
                "otp": otp,
                "newPassword": newPassword
            ]
        )
    }

    struct EmptyResponse: Decodable, Sendable {}

    // MARK: - User

    func getProfile() async throws -> User {
        try await client.request("/user/profile")
    }

    func updateProfile(_ profile: UpdateProfileRequest) async throws -> User {
        try await client.request("/user/profile", method: .put, body: profile)
    }

    struct UpdateProfileRequest: Encodable, Sendable {
        let fullName: String?
        let email: String?
        let bloodGroup: String?
        let preferredLanguage: String?
    }

    // MARK: - Dashboard

    func getDashboard() async throws -> DashboardResponse {
        try await client.request("/dashboard")
    }

    // MARK: - Appointments

    func listAppointments() async throws -> [Appointment] {
        try await client.request("/appointments")
    }

    func createAppointment(_ appointment: CreateAppointmentRequest) async throws -> Appointment {
        try await client.request("/appointments", method: .post, body: appointment)
    }

    struct CreateAppointmentRequest: Encodable, Sendable {
        let doctorName: String
        let specialty: String
        let hospitalName: String
        let appointmentDate: String
        let notes: String?
    }

    func cancelAppointment(id: String) async throws -> Appointment {
        try await client.request("/appointments/\(id)/cancel", method: .patch)
    }

    // MARK: - Telemedicine

    func createTelemedicineSession() async throws -> TelemedicineSession {
        try await client.request("/telemedicine/session", method: .post)
    }

    func getTelemedicineSession(id: String) async throws -> TelemedicineSession {
        try await client.request("/telemedicine/session/\(id)")
    }

    // MARK: - Pharmacy

    func listPharmacyPartners() async throws -> [PharmacyPartner] {
        try await client.request("/pharmacy/partners")
    }

    func listPharmacyOrders() async throws -> [PharmacyOrder] {
        try await client.request("/pharmacy/orders")
    }

    func createPharmacyOrder(_ order: CreatePharmacyOrderRequest) async throws -> PharmacyOrder {
        try await client.request("/pharmacy/orders", method: .post, body: order)
    }

    struct CreatePharmacyOrderRequest: Encodable, Sendable {
        let partnerId: String
        let items: [PharmacyOrderItem]
        let deliveryAddress: String
        let prescriptionId: String?
    }

    // MARK: - Diagnostics

    func listDiagnosticPartners() async throws -> [DiagnosticPartner] {
        try await client.request("/diagnostics/partners")
    }

    func createDiagnosticOrder(_ order: CreateDiagnosticOrderRequest) async throws -> DiagnosticOrder {
        try await client.request("/diagnostics/orders", method: .post, body: order)
    }

    struct CreateDiagnosticOrderRequest: Encodable, Sendable {
        let partnerId: String
        let tests: [String]
        let homeCollection: Bool
        let address: String?
    }

    func listDiagnosticReports() async throws -> [DiagnosticReport] {
        try await client.request("/diagnostics/reports")
    }

    // MARK: - Insurance

    func listInsurancePolicies() async throws -> [InsurancePolicy] {
        try await client.request("/insurance/policies")
    }

    func getInsurancePolicy(id: String) async throws -> InsurancePolicy {
        try await client.request("/insurance/policies/\(id)")
    }

    func listInsuranceClaims() async throws -> [InsuranceClaim] {
        try await client.request("/insurance/claims")
    }

    func createInsuranceClaim(_ claim: CreateClaimRequest) async throws -> InsuranceClaim {
        try await client.request("/insurance/claims", method: .post, body: claim)
    }

    struct CreateClaimRequest: Encodable, Sendable {
        let policyId: String
        let amount: Double
        let description: String
        let documents: [String]
    }

    func checkEligibility(policyId: String) async throws -> EligibilityResponse {
        try await client.request("/insurance/eligibility/\(policyId)")
    }

    struct EligibilityResponse: Decodable, Sendable {
        let eligible: Bool
        let coverage: Double
        let message: String?
    }

    // MARK: - Health Records

    func listHealthRecords() async throws -> [HealthRecord] {
        try await client.request("/health-records")
    }

    func uploadHealthRecord(data: Data, fileName: String) async throws -> HealthRecord {
        // Multipart upload would be handled separately; using base64 here for simplicity
        let body = UploadHealthRecordRequest(fileName: fileName, data: data.base64EncodedString())
        return try await client.request("/health-records/upload", method: .post, body: body)
    }

    struct UploadHealthRecordRequest: Encodable, Sendable {
        let fileName: String
        let data: String
    }

    func shareHealthRecord(id: String, with entityId: String) async throws -> HealthRecord {
        try await client.request(
            "/health-records/\(id)/share",
            method: .post,
            body: ["entityId": entityId]
        )
    }

    // MARK: - Family

    func listFamilyMembers() async throws -> [FamilyMember] {
        try await client.request("/family")
    }

    func createFamilyMember(_ member: CreateFamilyMemberRequest) async throws -> FamilyMember {
        try await client.request("/family", method: .post, body: member)
    }

    struct CreateFamilyMemberRequest: Encodable, Sendable {
        let fullName: String
        let relationship: String
        let phoneNumber: String?
        let age: Int?
        let bloodGroup: String?
    }

    func removeFamilyMember(id: String) async throws -> EmptyResponse {
        try await client.request("/family/\(id)", method: .delete)
    }

    // MARK: - Wallet

    func getWalletBalance() async throws -> WalletBalance {
        try await client.request("/wallet/balance")
    }

    func listWalletTransactions() async throws -> [WalletTransaction] {
        try await client.request("/wallet/transactions")
    }

    // MARK: - Health Graph

    func getRiskAssessment() async throws -> RiskAssessment {
        try await client.request("/health-graph/risk-assessment")
    }

    func getPreventions() async throws -> [Prevention] {
        try await client.request("/health-graph/preventions")
    }

    // MARK: - Digital Twin

    func getTwinSummary() async throws -> TwinSummary {
        try await client.request("/digital-twin/summary")
    }

    // MARK: - ABDM

    func getABHAProfile() async throws -> ABHAProfile {
        try await client.request("/abdm/profile")
    }

    func listConsents() async throws -> [Consent] {
        try await client.request("/abdm/consents")
    }

    func createConsent(_ consent: CreateConsentRequest) async throws -> Consent {
        try await client.request("/abdm/consents", method: .post, body: consent)
    }

    struct CreateConsentRequest: Encodable, Sendable {
        let purpose: String
        let hiTypes: [String]
        let fromDate: String
        let toDate: String
    }

    func importABDMRecords() async throws -> ImportResponse {
        try await client.request("/abdm/import", method: .post)
    }

    struct ImportResponse: Decodable, Sendable {
        let imported: Int
        let status: String
    }

    // MARK: - Care Navigator

    func sendMessage(_ message: CareMessage) async throws -> CareMessage {
        try await client.request("/care-navigator/message", method: .post, body: message)
    }
}
