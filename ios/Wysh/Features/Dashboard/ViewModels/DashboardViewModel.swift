import SwiftUI

// MARK: - Models

struct TaskItem: Identifiable, Equatable {
    let id = UUID()
    let title: String
    let subtitle: String?
    var isComplete: Bool

    static func == (lhs: Self, rhs: Self) -> Bool {
        lhs.id == rhs.id && lhs.isComplete == rhs.isComplete
    }
}

struct DashAppointment: Identifiable {
    let id = UUID()
    let doctorName: String
    let specialty: String
    let date: Date
    let status: BadgeStatus
}

struct DashboardPrescription: Identifiable {
    let id = UUID()
    let medicineName: String
    let dosage: String
    let frequency: String
    let refillDate: Date
}

struct RecentEvent: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let subtitle: String
    let timestamp: Date
}

@MainActor
@Observable
final class DashboardViewModel {
    var userName: String = "John"
    var healthScore: Int = 84
    var healthScoreLabel: String = "Excellent"
    var healthScoreTrend: String = "+4 this month"
    var tasks: [TaskItem] = []
    var appointments: [DashAppointment] = []
    var prescriptions: [DashboardPrescription] = []
    var recentEvents: [RecentEvent] = []
    var insuranceProvider: String = "Star Health Insurance"
    var insuranceCoverage: String = "₹5,00,000"
    var insuranceUsed: Double = 125_000
    var insuranceLimit: Double = 500_000
    var quickActions: [QuickActionItem] = []

    var contextSummary: String {
        var parts: [String] = []

        let pendingTasks = tasks.filter { !$0.isComplete }
        if pendingTasks.isEmpty {
            parts.append("Good progress this week.")
        } else {
            let medTasks = pendingTasks.filter { $0.subtitle != nil }
            if !medTasks.isEmpty {
                parts.append("You have \(medTasks.count) medication due today.")
            } else {
                parts.append("You have \(pendingTasks.count) task\(pendingTasks.count == 1 ? "" : "s") remaining today.")
            }
        }

        if healthScore >= 80 {
            parts.append("Your health score is \(healthScore) — excellent.")
        } else if healthScore >= 60 {
            parts.append("Your health score is \(healthScore) — room for improvement.")
        } else {
            parts.append("Your health score needs attention.")
        }

        parts.append("Your annual blood panel is due next month.")

        return parts.joined(separator: " ")
    }

    var contextActions: [ContextAction] {
        [
            ContextAction(title: "Order Medicine", icon: "pills") {},
            ContextAction(title: "Book Test", icon: "flask") {},
            ContextAction(title: "Talk to Doctor", icon: "stethoscope") {},
            ContextAction(title: "View Records", icon: "doc.text") {},
            ContextAction(title: "Check Insurance", icon: "shield") {}
        ]
    }

    init() {
        loadMockData()
    }

    deinit {}

    func refresh() async {
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        loadMockData()
    }

    func toggleTask(_ task: TaskItem) {
        guard let index = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        tasks[index].isComplete.toggle()
    }

    private func loadMockData() {
        userName = "John"

        tasks = [
            TaskItem(title: "Take morning medication", subtitle: "Amlodipine 5mg", isComplete: true),
            TaskItem(title: "Record blood pressure", subtitle: nil, isComplete: false),
            TaskItem(title: "Schedule follow-up", subtitle: "With Dr. Sharma", isComplete: false),
            TaskItem(title: "Order refill", subtitle: "Metformin 500mg", isComplete: false)
        ]

        appointments = [
            DashAppointment(
            doctorName: "Dr. Priya Patel",
            specialty: "Cardiologist",
            date: Date().addingTimeInterval(86_400 * 3),
            status: .confirmed
        ),
            DashAppointment(
                doctorName: "Dr. Sanjay Patel",
                specialty: "General Physician",
                date: Date().addingTimeInterval(86_400 * 7),
                status: .pending
            )
        ]

        prescriptions = [
            DashboardPrescription(
                medicineName: "Amlodipine",
                dosage: "5mg",
                frequency: "Once daily",
                refillDate: Date().addingTimeInterval(86_400 * 15)
            ),
            DashboardPrescription(
                medicineName: "Metformin",
                dosage: "500mg",
                frequency: "Twice daily",
                refillDate: Date().addingTimeInterval(86_400 * 30)
            )
        ]

        recentEvents = [
            RecentEvent(
                icon: "flask.fill",
                title: "Blood Report Reviewed",
                subtitle: "CBC, Lipid Profile - All normal",
                timestamp: Date().addingTimeInterval(-3_600 * 3)
            ),
            RecentEvent(
                icon: "stethoscope",
                title: "Consultation with Dr. Sharma",
                subtitle: "General Physician - Follow up completed",
                timestamp: Date().addingTimeInterval(-3_600 * 24)
            ),
            RecentEvent(
                icon: "pills.fill",
                title: "Prescription Refilled",
                subtitle: "Metformin 500mg - 30 tablets",
                timestamp: Date().addingTimeInterval(-3_600 * 48)
            )
        ]

        quickActions = [
            QuickActionItem(title: "Book Doctor", icon: "stethoscope", color: .blue) {},
            QuickActionItem(title: "Order Medicines", icon: "pills", color: .green) {},
            QuickActionItem(title: "Book Lab Test", icon: "flask", color: .orange) {},
            QuickActionItem(title: "Upload Record", icon: "doc.badge.plus", color: .purple) {},
            QuickActionItem(title: "Insurance Claim", icon: "shield", color: .red) {},
            QuickActionItem(title: "ABDM Records", icon: "heart.text.square", color: .teal) {}
        ]
    }
}
