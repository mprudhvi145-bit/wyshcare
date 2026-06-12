import Foundation
import Observation

@MainActor
@Observable
final class FamilyStore {
    var members: [FamilyMember] = []
    var activeMemberId: String = ""
    var isLoading = false

    var activeMember: FamilyMember? {
        members.first { $0.id == activeMemberId }
    }

    var timeline: [String: [FamilyTimelineEvent]] = [:]
    var insurancePlans: [String: [FamilyInsurancePlan]] = [:]
    var claims: [String: [FamilyClaim]] = [:]
    var emergencyContacts: [String: EmergencyContact] = [:]
    var caregiverPermissions: [CaregiverPermission] = []

    init() {
        loadFamilyMembers()
        loadTimelineData()
        loadInsuranceAndClaims()
        loadEmergencyContacts()
        loadCaregivers()
    }

    func switchTo(_ member: FamilyMember) {
        activeMemberId = member.id
    }

    func switchToId(_ id: String) {
        activeMemberId = id
    }

    func timeline(for memberId: String) -> [FamilyTimelineEvent] {
        timeline[memberId] ?? []
    }

    func insurance(for memberId: String) -> [FamilyInsurancePlan] {
        insurancePlans[memberId] ?? []
    }

    func claims(for memberId: String) -> [FamilyClaim] {
        self.claims[memberId] ?? []
    }

    // swiftlint:disable:next function_body_length
    private func loadFamilyMembers() {
        let me = FamilyMember(
            id: "me",
            name: "Prudhvi",
            phone: "+1 (555) 000-0000",
            relationship: .other,
            age: 34,
            healthStatus: .healthy,
            isInvited: true,
            healthSummary: HealthSummary(conditions: [], medications: [], lastCheckup: monthsAgo(2), bloodType: "B+"),
            sharedPrescriptions: sharedPrescriptionItems(),
            upcomingAppointments: [FamilyAppointment(type: "Annual Physical", date: daysFromNow(14), provider: "Dr. Priya Sharma")],
            alerts: []
        )
        let father = FamilyMember(
            id: "father",
            name: "Ravi Sharma",
            phone: "+1 (555) 111-2222",
            relationship: .parent,
            age: 62,
            healthStatus: .attention,
            isInvited: true,
            healthSummary: HealthSummary(
                conditions: ["Type 2 Diabetes", "Hypertension"],
                medications: ["Metformin 500mg", "Amlodipine 5mg"],
                lastCheckup: monthsAgo(1),
                bloodType: "B+"
            ),
            sharedPrescriptions: [
                SharedPrescription(name: "Metformin 500mg", dosage: "Twice daily", pharmacy: "Apollo Pharmacy", refillDate: daysFromNow(7)),
                SharedPrescription(name: "Amlodipine 5mg", dosage: "Once daily", pharmacy: "Apollo Pharmacy", refillDate: daysFromNow(14))
            ],
            upcomingAppointments: [
                FamilyAppointment(type: "Diabetes Check", date: daysFromNow(5), provider: "Dr. Sarah Chen"),
                FamilyAppointment(type: "BP Follow-up", date: daysFromNow(12), provider: "Dr. Sarah Chen")
            ],
            alerts: [
                AlertItem(type: .appointment, message: "Diabetes check in 5 days", severity: .warning),
                AlertItem(type: .labResult, message: "HbA1c results available", severity: .critical)
            ]
        )
        let mother = FamilyMember(
            id: "mother",
            name: "Anita Sharma",
            phone: "+1 (555) 222-3333",
            relationship: .parent,
            age: 58,
            healthStatus: .healthy,
            isInvited: true,
            healthSummary: HealthSummary(
                conditions: ["Seasonal Allergies"],
                medications: ["Cetirizine 10mg"],
                lastCheckup: monthsAgo(3),
                bloodType: "A+"
            ),
            sharedPrescriptions: [
                SharedPrescription(name: "Cetirizine 10mg", dosage: "Once daily", pharmacy: "MedPlus", refillDate: daysFromNow(21))
            ],
            upcomingAppointments: [
                FamilyAppointment(type: "Allergy Follow-up", date: daysFromNow(10), provider: "Dr. James Miller")
            ],
            alerts: [
                AlertItem(type: .refill, message: "Cetirizine refill due in 21 days", severity: .info)
            ]
        )
        let spouse = FamilyMember(
            id: "spouse",
            name: "Neha Sharma",
            phone: "+1 (555) 333-4444",
            relationship: .spouse,
            age: 32,
            healthStatus: .healthy,
            isInvited: true,
            healthSummary: HealthSummary(conditions: [], medications: [], lastCheckup: monthsAgo(4), bloodType: "O+"),
            sharedPrescriptions: sharedPrescriptionItems(),
            upcomingAppointments: [
                FamilyAppointment(type: "Dental Checkup", date: daysFromNow(20), provider: "Dr. Meera Krishnan")
            ],
            alerts: []
        )
        let child1 = FamilyMember(
            id: "child1",
            name: "Aarav Sharma",
            phone: "+1 (555) 444-5555",
            relationship: .child,
            age: 6,
            healthStatus: .healthy,
            isInvited: true,
            healthSummary: HealthSummary(
                conditions: ["Mild Asthma"],
                medications: ["Albuterol inhaler PRN"],
                lastCheckup: monthsAgo(2),
                bloodType: "B+"
            ),
            sharedPrescriptions: [
                SharedPrescription(name: "Albuterol HFA", dosage: "2 puffs as needed", pharmacy: "Walgreens", refillDate: nil)
            ],
            upcomingAppointments: [
                FamilyAppointment(type: "School Physical", date: daysFromNow(30), provider: "Dr. Michael Torres")
            ],
            alerts: [
                AlertItem(type: .refill, message: "Albuterol expires in 30 days", severity: .warning)
            ]
        )
        members = [me, father, mother, spouse, child1]
        activeMemberId = me.id
    }

    private func sharedPrescriptionItems() -> [SharedPrescription] { [] }

    private func loadTimelineData() {
        timeline[member("me")] = [
            FamilyTimelineEvent(date: daysAgo(1), title: "Blood Test Completed", subtitle: "CBC — All values normal", icon: "flask.fill", iconColor: .green),
            FamilyTimelineEvent(date: daysAgo(3), title: "Metformin Refill Ordered", subtitle: "30-day supply", icon: "pills.fill", iconColor: .purple),
            FamilyTimelineEvent(date: daysAgo(7), title: "Teleconsultation", subtitle: "Dr. Priya Sharma — Seasonal allergies", icon: "video.fill", iconColor: .blue)
        ]

        timeline[member("father")] = [
            FamilyTimelineEvent(date: daysAgo(1), title: "HbA1c Result: 7.2%", subtitle: "Above target — needs consultation", icon: "flask.fill", iconColor: .red),
            FamilyTimelineEvent(date: daysAgo(5), title: "Metformin Refill", subtitle: "30-day supply dispatched", icon: "pills.fill", iconColor: .purple),
            FamilyTimelineEvent(date: daysAgo(14), title: "BP Reading: 138/88", subtitle: "Slightly elevated — monitoring", icon: "heart.fill", iconColor: .orange)
        ]

        timeline[member("mother")] = [
            FamilyTimelineEvent(date: daysAgo(2), title: "Allergy Symptoms Improved", subtitle: "Cetirizine working well", icon: "leaf.fill", iconColor: .green),
            FamilyTimelineEvent(date: daysAgo(10), title: "Cetirizine Refill", subtitle: "30-day supply", icon: "pills.fill", iconColor: .purple)
        ]

        timeline[member("spouse")] = [
            FamilyTimelineEvent(date: daysAgo(4), title: "Dental Checkup Scheduled", subtitle: "Dr. Meera Krishnan — Jun 26", icon: "calendar", iconColor: .blue)
        ]

        timeline[member("child1")] = [
            FamilyTimelineEvent(date: daysAgo(3), title: "School Physical Scheduled", subtitle: "Dr. Michael Torres — Jul 6", icon: "calendar", iconColor: .blue),
            FamilyTimelineEvent(date: daysAgo(20), title: "Albuterol Inhaler Used", subtitle: "2 puffs — symptoms relieved", icon: "lungs.fill", iconColor: .green)
        ]
    }

    private func loadInsuranceAndClaims() {
        insurancePlans[member("me")] = [
            FamilyInsurancePlan(provider: "Star Health", policyNumber: "SH-2026-001", coverage: "₹5,00,000", validUntil: yearsFromNow(1), premium: "₹499/mo"),
            FamilyInsurancePlan(provider: "Wysh Care Premium", policyNumber: "WC-2026-001", coverage: "₹2,00,000", validUntil: yearsFromNow(1), premium: "₹199/mo")
        ]

        insurancePlans[member("father")] = [
            FamilyInsurancePlan(provider: "Star Health Family", policyNumber: "SH-FAM-001", coverage: "₹10,00,000", validUntil: monthsFromNow(6), premium: "₹799/mo"),
            FamilyInsurancePlan(provider: "Senior Care Plus", policyNumber: "SC-2026-001", coverage: "₹5,00,000", validUntil: yearsFromNow(1), premium: "₹599/mo")
        ]

        claims[member("me")] = [
            FamilyClaim(claimNumber: "CL-2026-0042", description: "Hospitalization — Apollo", amount: "₹45,000", status: "Approved", date: daysAgo(10)),
            FamilyClaim(claimNumber: "CL-2026-0035", description: "Diagnostics — CBC Panel", amount: "₹2,300", status: "Processing", date: daysAgo(2))
        ]

        claims[member("father")] = [
            FamilyClaim(claimNumber: "CL-2026-0050", description: "Hospitalization — Fortis", amount: "₹1,20,000", status: "Approved", date: daysAgo(20)),
            FamilyClaim(claimNumber: "CL-2026-0048", description: "Lab Tests — HbA1c, Lipid", amount: "₹4,500", status: "Approved", date: daysAgo(15)),
            FamilyClaim(claimNumber: "CL-2026-0055", description: "Pharmacy — Metformin", amount: "₹850", status: "Pending", date: daysAgo(1))
        ]
    }

    private func loadEmergencyContacts() {
        emergencyContacts[member("me")] = EmergencyContact(name: "Neha Sharma", relationship: "Spouse", phone: "+1 (555) 333-4444", bloodType: "B+", allergies: ["Penicillin"], conditions: [], medications: [])

        emergencyContacts[member("father")] = EmergencyContact(name: "Anita Sharma", relationship: "Spouse", phone: "+1 (555) 222-3333", bloodType: "B+", allergies: ["Sulfa drugs"], conditions: ["Diabetes", "Hypertension"], medications: ["Metformin", "Amlodipine"])

        emergencyContacts[member("mother")] = EmergencyContact(name: "Ravi Sharma", relationship: "Spouse", phone: "+1 (555) 111-2222", bloodType: "A+", allergies: ["Pollen"], conditions: ["Seasonal Allergies"], medications: ["Cetirizine"])

        emergencyContacts[member("spouse")] = EmergencyContact(name: "Prudhvi Sharma", relationship: "Spouse", phone: "+1 (555) 000-0000", bloodType: "O+", allergies: [], conditions: [], medications: [])

        emergencyContacts[member("child1")] = EmergencyContact(name: "Neha Sharma", relationship: "Mother", phone: "+1 (555) 333-4444", bloodType: "B+", allergies: ["Dust mites"], conditions: ["Mild Asthma"], medications: ["Albuterol"])
    }

    private func loadCaregivers() {
        caregiverPermissions = [
            CaregiverPermission(name: "Dr. Priya Sharma", phone: "+1 (555) 999-8888", permissions: ["View Records", "Schedule Appointments", "Order Tests"], isActive: true),
            CaregiverPermission(name: "Nurse Anita Rao", phone: "+1 (555) 777-6666", permissions: ["View Vitals", "Medication Reminders"], isActive: true),
            CaregiverPermission(name: "Ravi Sharma Jr.", phone: "+1 (555) 555-4444", permissions: ["Emergency Contact"], isActive: false)
        ]
    }

    private func member(_ id: String) -> String { id }

    private func daysAgo(_ n: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: -n, to: Date()) ?? Date()
    }

    private func daysFromNow(_ n: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: n, to: Date()) ?? Date()
    }

    private func monthsAgo(_ n: Int) -> Date {
        Calendar.current.date(byAdding: .month, value: -n, to: Date()) ?? Date()
    }

    private func monthsFromNow(_ n: Int) -> Date {
        Calendar.current.date(byAdding: .month, value: n, to: Date()) ?? Date()
    }

    private func yearsFromNow(_ n: Int) -> Date {
        Calendar.current.date(byAdding: .year, value: n, to: Date()) ?? Date()
    }

    deinit {}
}
