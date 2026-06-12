import Foundation // swiftlint:disable:this file_name

struct DashboardAppointment: Codable, Identifiable, Sendable {
    let id: String
    let doctorName: String
    let specialty: String
    let hospitalName: String
    let appointmentDate: String
    let status: String
    let notes: String?
    let createdAt: String
}

struct DashboardHealthRecord: Codable, Identifiable, Sendable {
    let id: String
    let type: String
    let title: String
    let description: String?
    let fileUrl: String?
    let uploadedAt: String
    let sharedWith: [String]
}

struct DashboardResponse: Decodable, Sendable {
    let healthScore: HealthScore
    let upcomingAppointments: [DashboardAppointment]
    let aiInsights: [AIInsight]
    let todayTasks: [TodayTask]
    let quickActions: [QuickAction]
    let recentRecords: [DashboardHealthRecord]
}

struct HealthScore: Codable, Sendable {
    let score: Int
    let change: Int?
    let category: HealthCategory
    let lastUpdated: String

    enum HealthCategory: String, Codable, Sendable {
        case excellent, good, fair, poor, critical
    }
}

struct AIInsight: Codable, Identifiable, Sendable {
    let id: String
    let type: InsightType
    let title: String
    let description: String
    let severity: InsightSeverity
    let actionable: Bool
    let actionLabel: String?
    let actionUrl: String?

    enum InsightType: String, Codable, Sendable {
        case preventive, riskAlert, medicationReminder, appointmentReminder, lifestyle
    }

    enum InsightSeverity: String, Codable, Sendable {
        case info, warning, critical
    }
}

struct TodayTask: Codable, Identifiable, Sendable {
    let id: String
    let title: String
    let description: String?
    let type: TaskType
    let time: String?
    let completed: Bool
    let priority: TaskPriority

    enum TaskType: String, Codable, Sendable {
        case medication, appointment, exercise, hydration, checkup, other
    }

    enum TaskPriority: String, Codable, Sendable {
        case low, medium, high, urgent
    }
}

struct QuickAction: Codable, Identifiable, Sendable {
    let id: String
    let title: String
    let iconName: String
    let color: String
    let route: String
}
