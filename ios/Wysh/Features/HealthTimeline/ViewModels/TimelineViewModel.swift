import Observation
import SwiftUI

struct TimelineEntry: Identifiable {
    let id = UUID()
    let icon: String
    let iconColor: Color
    let title: String
    let subtitle: String
    let timestamp: Date
    let status: String
    let statusColor: Color
    let category: TimelineFilter
}

@MainActor
@Observable
final class TimelineViewModel {
    var entries: [TimelineEntry] = []
    var selectedFilter: TimelineFilter = .all
    var isLoading = false
    var error: Error?

    deinit {}

    var filteredEntries: [TimelineEntry] {
        if selectedFilter == .all { return entries }
        return entries.filter { $0.category == selectedFilter }
    }

    func loadEntries() async {
        isLoading = true
        error = nil
        do {
            let fetched = try await fetchTimelineEntries()
            await MainActor.run {
                entries = fetched
                isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error
                isLoading = false
            }
        }
    }

    func refresh() async {
        await loadEntries()
    }

    func applyFilter(_ filter: TimelineFilter) {
        withAnimation(.spring(response: 0.35)) {
            selectedFilter = filter
        }
    }

    private func fetchTimelineEntries() async throws -> [TimelineEntry] {
        try await Task.sleep(nanoseconds: 800_000_000)
        let calendar = Calendar.current
        let today = Date()
        return [
            TimelineEntry(
                icon: "stethoscope",
                iconColor: .blue,
                title: "Consultation with Dr. Sharma",
                subtitle: "General Physician - Follow up",
                timestamp: calendar.date(byAdding: .hour, value: -2, to: today) ?? today,
                status: "Completed",
                statusColor: .green,
                category: .doctors
            ),
            TimelineEntry(
                icon: "flask.fill",
                iconColor: .orange,
                title: "Blood Report Uploaded",
                subtitle: "CBC, Lipid Profile, HbA1c",
                timestamp: calendar.date(byAdding: .hour, value: -5, to: today) ?? today,
                status: "Reviewed",
                statusColor: .blue,
                category: .labs
            ),
            TimelineEntry(
                icon: "pills.fill",
                iconColor: .purple,
                title: "Prescription Refilled",
                subtitle: "Metformin 500mg - 30 tablets",
                timestamp: calendar.date(byAdding: .day, value: -1, to: today) ?? today,
                status: "Delivered",
                statusColor: .green,
                category: .pharmacy
            ),
            TimelineEntry(
                icon: "doc.text.fill",
                iconColor: .red,
                title: "Health Insurance Claim #CLM-2024-089",
                subtitle: "Family Floater Plan - ₹45,000 approved",
                timestamp: calendar.date(byAdding: .day, value: -2, to: today) ?? today,
                status: "Approved",
                statusColor: .green,
                category: .insurance
            ),
            TimelineEntry(
                icon: "heart.text.square.fill",
                iconColor: .teal,
                title: "ABDM Health Records Synced",
                subtitle: "12 records updated from Apollo Clinic",
                timestamp: calendar.date(byAdding: .day, value: -3, to: today) ?? today,
                status: "Synced",
                statusColor: .teal,
                category: .abdm
            ),
            TimelineEntry(
                icon: "calendar.badge.clock",
                iconColor: .mint,
                title: "Upcoming - Dr. Patel (Cardiology)",
                subtitle: "ECHO & Stress Test - Follow up",
                timestamp: calendar.date(byAdding: .day, value: 2, to: today) ?? today,
                status: "Scheduled",
                statusColor: .mint,
                category: .doctors
            ),
            TimelineEntry(
                icon: "bag.fill",
                iconColor: .brown,
                title: "Order Placed - Accu-Chek Test Strips",
                subtitle: "Qty: 2 packs - ₹1,240",
                timestamp: calendar.date(byAdding: .day, value: -4, to: today) ?? today,
                status: "Shipped",
                statusColor: .orange,
                category: .pharmacy
            )
        ]
    }
}
