import Foundation
import SwiftUI
import Observation

@Observable
final class FamilyViewModel {
    var members: [FamilyMember] = []
    var isLoading = false
    var error: String?

    init() {
        loadMockData()
    }

    deinit {}

    func addMember(name: String, phone: String, relationship: Relationship) {
        let newMember = FamilyMember(
            id: "FM-\(Int.random(in: 1_000...9_999))",
            name: name,
            phone: phone,
            relationship: relationship,
            age: 0,
            healthStatus: .pending,
            isInvited: true,
            healthSummary: nil,
            sharedPrescriptions: [],
            upcomingAppointments: [],
            alerts: []
        )
        withAnimation { members.append(newMember) }
    }

    func inviteMember(_ member: FamilyMember) {
        if let index = members.firstIndex(where: { $0.id == member.id }) {
            members[index].isInvited = true
        }
    }

    private func loadMockData() {
        members = [
            FamilyMember(
                id: "FM-1001",
                name: "Sarah Prudhvi",
                phone: "+1 (555) 111-2222",
                relationship: .spouse,
                age: 32,
                healthStatus: .healthy,
                isInvited: true,
                healthSummary: HealthSummary(
                    conditions: ["Seasonal allergies"],
                    medications: ["Cetirizine 10mg"],
                    lastCheckup: ISO8601DateFormatter().date(from: "2025-06-15T00:00:00Z"),
                    bloodType: "O+"
                ),
                sharedPrescriptions: [
                    SharedPrescription(name: "Cetirizine 10mg", dosage: "Once daily", pharmacy: "CVS", refillDate: ISO8601DateFormatter().date(from: "2026-07-01T00:00:00Z"))
                ],
                upcomingAppointments: [
                    FamilyAppointment(type: "Annual Physical", date: ISO8601DateFormatter().date(from: "2026-07-20T10:00:00Z"), provider: "Dr. Emily Watson"),
                    FamilyAppointment(type: "Allergy Follow-up", date: ISO8601DateFormatter().date(from: "2026-07-05T14:30:00Z"), provider: "Dr. James Miller")
                ],
                alerts: [
                    AlertItem(type: .refill, message: "Cetirizine refill due in 7 days", severity: .info)
                ]
            ),
            FamilyMember(
                id: "FM-1002",
                name: "Arjun Prudhvi",
                phone: "+1 (555) 333-4444",
                relationship: .child,
                age: 8,
                healthStatus: .healthy,
                isInvited: true,
                healthSummary: HealthSummary(
                    conditions: ["Asthma (mild)"],
                    medications: ["Albuterol inhaler PRN"],
                    lastCheckup: ISO8601DateFormatter().date(from: "2025-08-10T00:00:00Z"),
                    bloodType: "A+"
                ),
                sharedPrescriptions: [
                    SharedPrescription(name: "Albuterol HFA", dosage: "2 puffs as needed", pharmacy: "Walgreens", refillDate: nil)
                ],
                upcomingAppointments: [
                    FamilyAppointment(type: "School Sports Physical", date: ISO8601DateFormatter().date(from: "2026-08-15T09:00:00Z"), provider: "Dr. Michael Torres")
                ],
                alerts: [
                    AlertItem(type: .appointment, message: "Sports physical coming up", severity: .info),
                    AlertItem(type: .refill, message: "Albuterol inhaler expires in 30 days", severity: .warning)
                ]
            ),
            FamilyMember(
                id: "FM-1003",
                name: "Mei-Lin Prudhvi",
                phone: "+1 (555) 555-6666",
                relationship: .parent,
                age: 62,
                healthStatus: .attention,
                isInvited: true,
                healthSummary: HealthSummary(
                    conditions: ["Type 2 Diabetes", "Hypertension"],
                    medications: ["Metformin 500mg", "Lisinopril 10mg"],
                    lastCheckup: ISO8601DateFormatter().date(from: "2025-12-01T00:00:00Z"),
                    bloodType: "B+"
                ),
                sharedPrescriptions: [
                    SharedPrescription(name: "Metformin 500mg", dosage: "Twice daily", pharmacy: "CVS", refillDate: ISO8601DateFormatter().date(from: "2026-06-20T00:00:00Z")),
                    SharedPrescription(name: "Lisinopril 10mg", dosage: "Once daily", pharmacy: "CVS", refillDate: ISO8601DateFormatter().date(from: "2026-07-15T00:00:00Z"))
                ],
                upcomingAppointments: [
                    FamilyAppointment(type: "Diabetes Check", date: ISO8601DateFormatter().date(from: "2026-06-28T11:00:00Z"), provider: "Dr. Sarah Chen"),
                    FamilyAppointment(type: "Blood Pressure Follow-up", date: ISO8601DateFormatter().date(from: "2026-07-12T15:00:00Z"), provider: "Dr. Sarah Chen")
                ],
                alerts: [
                    AlertItem(type: .appointment, message: "Diabetes check in 3 days", severity: .warning),
                    AlertItem(type: .labResult, message: "HbA1c results available", severity: .critical)
                ]
            ),
            FamilyMember(
                id: "FM-1004",
                name: "David Prudhvi",
                phone: "+1 (555) 777-8888",
                relationship: .child,
                age: 5,
                healthStatus: .healthy,
                isInvited: false,
                healthSummary: nil,
                sharedPrescriptions: [],
                upcomingAppointments: [
                    FamilyAppointment(type: "Well-child Visit", date: ISO8601DateFormatter().date(from: "2026-07-01T13:00:00Z"), provider: "Dr. Emily Watson")
                ],
                alerts: []
            )
        ]
    }
}
