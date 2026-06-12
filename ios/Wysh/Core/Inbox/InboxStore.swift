import Foundation
import Observation

@MainActor
@Observable
final class InboxStore {
    var items: [InboxItem] = []
    var selectedCategory: InboxCategory = .all
    var showUnreadOnly = false

    var unreadCount: Int {
        items.filter { !$0.isRead }.count
    }

    var todayActionCount: Int {
        items.filter { item in
            !item.isRead && Calendar.current.isDateInToday(item.createdAt)
        }.count
    }

    var todaySummary: String {
        let count = todayActionCount
        guard count > 0 else { return "No actions needing attention today" }
        let items = self.items.filter { !$0.isRead && Calendar.current.isDateInToday($0.createdAt) }
        let topTwo = items.prefix(2).map { "• \($0.title)" }.joined(separator: "\n")
        return "\(count) action\(count == 1 ? "" : "s") need\(count == 1 ? "s" : "") attention\n\(topTwo)"
    }

    var filteredItems: [InboxItem] {
        var result = items
        if selectedCategory != .all {
            result = result.filter { $0.category == selectedCategory }
        }
        if showUnreadOnly {
            result = result.filter { !$0.isRead }
        }
        return result.sorted { lhs, rhs in
            if lhs.priority != rhs.priority {
                return lhs.priority < rhs.priority
            }
            return lhs.createdAt > rhs.createdAt
        }
    }

    var groupedItems: [(String, [InboxItem])] {
        let grouped = Dictionary(grouping: filteredItems) { item -> String in
            if Calendar.current.isDateInToday(item.createdAt) {
                return "Today"
            }
            if Calendar.current.isDateInYesterday(item.createdAt) {
                return "Yesterday"
            }
            let formatter = DateFormatter()
            formatter.dateFormat = "EEEE, MMM d"
            return formatter.string(from: item.createdAt)
        }
        let order = ["Today", "Yesterday"]
        return grouped.keys
            .sorted { lhs, rhs in
                let li = order.firstIndex(of: lhs) ?? Int.max
                let ri = order.firstIndex(of: rhs) ?? Int.max
                if li != ri { return li < ri }
                return lhs > rhs
            }
            .compactMap { key in
                guard let values = grouped[key], !values.isEmpty else { return nil }
                return (key, values)
            }
    }

    init() {
        loadSampleData()
    }

    func markAsRead(_ item: InboxItem) {
        if let index = items.firstIndex(where: { $0.id == item.id }) {
            items[index].isRead = true
        }
    }

    func markAllAsRead() {
        for index in items.indices {
            items[index].isRead = true
        }
    }

    func performAction(_ item: InboxItem) {
        markAsRead(item)
        item.action()
    }

    private func loadSampleData() {
        items = [
            InboxItem(category: .medication, priority: .critical, title: "Medication Due in 30 Minutes", subtitle: "Metformin 500mg — Take with dinner", actionTitle: "Mark as Taken", createdAt: Date()),
            InboxItem(category: .care, priority: .important, title: "Follow-up Recommended", subtitle: "Dr. Priya Sharma suggests a follow-up in 2 weeks", actionTitle: "Book Appointment", createdAt: Date()),
            InboxItem(category: .diagnostics, priority: .important, title: "Lab Report Ready", subtitle: "Complete Blood Count results available", actionTitle: "View Report", createdAt: hoursAgo(3)),
            InboxItem(category: .insurance, priority: .critical, title: "Coverage Expires in 15 Days", subtitle: "Star Health Family Floater — Renew now to avoid lapse", actionTitle: "Renew Policy", createdAt: hoursAgo(5)),
            InboxItem(category: .wallet, priority: .informational, title: "Claim Approved", subtitle: "₹45,000 credited to your health wallet", actionTitle: "View Transaction", createdAt: daysAgo(1)),
            InboxItem(category: .diagnostics, priority: .critical, title: "Blood Sugar Trend Worsening", subtitle: "Fasting glucose averaged 142 mg/dL this week", actionTitle: "Book Consultation", createdAt: daysAgo(1)),
            InboxItem(category: .care, priority: .informational, title: "Upcoming Appointment", subtitle: "Dr. Sanjay Patel — Tomorrow, 10:00 AM", actionTitle: "View Details", createdAt: daysAgo(1)),
            InboxItem(category: .medication, priority: .important, title: "Refill Needed Soon", subtitle: "Amlodipine 5mg — 3 days remaining", actionTitle: "Order Refill", createdAt: daysAgo(2), isRead: true),
            InboxItem(category: .insurance, priority: .important, title: "Claim Submitted", subtitle: "CLAIM-2026-0042 — ₹2,300 under review", actionTitle: "Track Claim", createdAt: daysAgo(2)),
            InboxItem(category: .family, priority: .important, title: "Parent Medication Due", subtitle: "Father — Atorvastatin 10mg due at 9 PM", actionTitle: "Remind", createdAt: daysAgo(2)),
            InboxItem(category: .diagnostics, priority: .informational, title: "Health Score Improved", subtitle: "Your health score went from 72 to 78", actionTitle: "View Breakdown", createdAt: daysAgo(3), isRead: true),
            InboxItem(category: .family, priority: .critical, title: "Child Vaccination Due", subtitle: "Aarav — DPT Booster due this week", actionTitle: "Schedule", createdAt: daysAgo(3)),
            InboxItem(category: .medication, priority: .informational, title: "Adherence Dropped", subtitle: "Medication adherence dropped from 94% to 81%", actionTitle: "View Schedule", createdAt: daysAgo(4), isRead: true),
            InboxItem(category: .wallet, priority: .informational, title: "Subscription Renewed", subtitle: "Wysh Care Premium — Renewed for ₹499", actionTitle: "View Details", createdAt: daysAgo(5)),
            InboxItem(category: .wallet, priority: .informational, title: "Payment Received", subtitle: "Insurance claim payout of ₹45,000", actionTitle: "View Transaction", createdAt: daysAgo(6), isRead: true)
        ]
    }

    private func hoursAgo(_ hours: Int) -> Date {
        Calendar.current.date(byAdding: .hour, value: -hours, to: Date()) ?? Date()
    }

    private func daysAgo(_ days: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: -days, to: Date()) ?? Date()
    }

    deinit {}
}
