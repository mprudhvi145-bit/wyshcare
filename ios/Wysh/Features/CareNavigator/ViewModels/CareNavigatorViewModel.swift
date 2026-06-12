import Foundation
import SwiftUI

struct ChatMessage: Identifiable {
    let id = UUID()
    let text: String
    let isUser: Bool
    let isInsight: Bool
    let insightItems: [InsightItem]
    let actionButtons: [ActionButton]

    init(
        text: String,
        isUser: Bool,
        isInsight: Bool = false,
        insightItems: [InsightItem] = [],
        actionButtons: [ActionButton] = []
    ) {
        self.text = text
        self.isUser = isUser
        self.isInsight = isInsight
        self.insightItems = insightItems
        self.actionButtons = actionButtons
    }
}

@MainActor
@Observable
final class CareNavigatorViewModel {
    var messages: [ChatMessage] = []
    var isTyping = false
    var showSuggestedQuestions = true

    let suggestedQuestions = [
        "How is my health this month?",
        "Do I need any screenings?",
        "What medications are due?",
        "Explain my insurance coverage"
    ]

    init() {
        messages = []
    }

    deinit {}

    func sendMessage(_ text: String) {
        let userMessage = ChatMessage(text: text, isUser: true)
        messages.append(userMessage)
        showSuggestedQuestions = false
        isTyping = true

        Task {
            try? await Task.sleep(nanoseconds: 1_500_000_000)
            let reply = generateReply(for: text)
            isTyping = false
            messages.append(reply)
        }
    }

    private func generateReply(for query: String) -> ChatMessage {
        let lowercased = query.lowercased()

        if lowercased.contains("health") || lowercased.contains("month") {
            return ChatMessage(
                text: "Here's your health summary for this month. Your overall health score is 78, which is a 3.2% improvement over last month. Your blood pressure is trending stable, but your fasting glucose has increased slightly.",
                isUser: false,
                isInsight: true,
                insightItems: [
                    InsightItem(title: "Health Score", subtitle: "78 — Up 3.2%", type: .recommendation),
                    InsightItem(title: "Blood Pressure", subtitle: "132/86 — Stable", type: .risk),
                    InsightItem(title: "Fasting Glucose", subtitle: "102 mg/dL — Slight increase", type: .risk)
                ],
                actionButtons: [
                    ActionButton(title: "View Full Report", icon: "doc.text") {},
                    ActionButton(title: "Share with Doctor", icon: "square.and.arrow.up") {}
                ]
            )
        } else if lowercased.contains("screening") || lowercased.contains("due") {
            return ChatMessage(
                text: "Based on your age, gender, and health history, here are the screenings you should consider:",
                isUser: false,
                isInsight: true,
                insightItems: [
                    InsightItem(title: "Mammogram", subtitle: "Overdue — Last done 14 months ago", type: .appointment),
                    InsightItem(title: "Lipid Panel", subtitle: "Due — Every 5 years recommended", type: .medication),
                    InsightItem(title: "Colonoscopy", subtitle: "Scheduled — Due in 8 months", type: .appointment)
                ],
                actionButtons: [
                    ActionButton(title: "Schedule Mammogram", icon: "calendar.badge.plus") {},
                    ActionButton(title: "View All Screenings", icon: "list.clipboard") {}
                ]
            )
        } else if lowercased.contains("medication") {
            return ChatMessage(
                text: "You have 3 active medications. Here's a quick overview:",
                isUser: false,
                isInsight: true,
                insightItems: [
                    InsightItem(title: "Lisinopril 10mg", subtitle: "Once daily — 15 refills remaining", type: .medication),
                    InsightItem(title: "Metformin 500mg", subtitle: "Twice daily — 30 refills remaining", type: .medication),
                    InsightItem(title: "Atorvastatin 20mg", subtitle: "Once daily — 90 refills remaining", type: .medication)
                ],
                actionButtons: [
                    ActionButton(title: "Request Refill", icon: "arrow.triangle.2.circlepath") {},
                    ActionButton(title: "Set Reminder", icon: "alarm") {}
                ]
            )
        } else if lowercased.contains("insurance") || lowercased.contains("coverage") {
            return ChatMessage(
                text: "You're covered under the Wysh Premier Plan with the following benefits:",
                isUser: false,
                isInsight: true,
                insightItems: [
                    InsightItem(title: "Plan Type", subtitle: "Wysh Premier — PPO", type: .recommendation),
                    InsightItem(title: "Annual Deductible", subtitle: "$1,500 — $500 used", type: .risk),
                    InsightItem(title: "Co-pay", subtitle: "$30 primary / $60 specialist", type: .appointment)
                ],
                actionButtons: [
                    ActionButton(title: "View Full Coverage", icon: "doc.text") {},
                    ActionButton(title: "Find In-Network Provider", icon: "magnifyingglass") {}
                ]
            )
        } else {
            return ChatMessage(
                text: "I understand you're asking about \"\(query)\". I'm here to help with your health questions. Could you provide a bit more detail so I can give you the most accurate information?",
                isUser: false
            )
        }
    }
}
