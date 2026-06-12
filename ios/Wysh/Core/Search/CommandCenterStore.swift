import Foundation
import Observation

@MainActor
@Observable
final class CommandCenterStore {
    var query: String = ""
    var recentActionIds: [UUID] = []

    let allActions: [CommandAction]

    deinit {}

    var filteredActions: [CommandCategory: [CommandAction]] {
        let trimmed = query.trimmingCharacters(in: .whitespaces)
        let filtered: [CommandAction]
        if trimmed.isEmpty {
            filtered = allActions
        } else {
            filtered = allActions.filter { action in
                action.title.localizedCaseInsensitiveContains(trimmed) ||
                action.subtitle.localizedCaseInsensitiveContains(trimmed) ||
                action.category.rawValue.localizedCaseInsensitiveContains(trimmed)
            }
        }
        return Dictionary(grouping: filtered) { $0.category }
    }

    var recentActions: [CommandAction] {
        allActions.filter { recentActionIds.contains($0.id) }
    }

    var contextualActions: [CommandAction] {
        [
            CommandAction(
                title: "Medication Due in 2 Hours",
                subtitle: "Metformin 500mg — Refill available",
                icon: "clock.badge.exclamationmark",
                category: .medication,
                iconColor: .orange
            ),
            CommandAction(
                title: "Claim Pending Review",
                subtitle: "CLAIM-2026-0041 — ₹2,300",
                icon: "doc.text.badge.clock",
                category: .insurance,
                iconColor: DS.Color.warning
            ),
            CommandAction(
                title: "Annual Blood Panel Overdue",
                subtitle: "Last checked 14 months ago",
                icon: "exclamationmark.circle.fill",
                category: .diagnostics,
                iconColor: .red
            ),
            CommandAction(
                title: "Coverage Expires in 15 Days",
                subtitle: "Star Health Family Floater",
                icon: "shield.badge.exclamationmark",
                category: .insurance,
                iconColor: DS.Color.warning
            )
        ]
    }

    init() {
        self.allActions = Self.defaultActions()
    }

    func perform(_ action: CommandAction) {
        recentActionIds.removeAll { $0 == action.id }
        recentActionIds.insert(action.id, at: 0)
        if recentActionIds.count > 8 {
            recentActionIds = Array(recentActionIds.prefix(8))
        }
        action.action()
    }

    func clearRecent() {
        recentActionIds = []
    }

    private static func defaultActions() -> [CommandAction] {
        careActions() + medicationActions() + diagnosticsActions()
        + insuranceActions() + recordsActions() + familyActions()
    }

    private static func careActions() -> [CommandAction] {
        [
            CommandAction(title: "Book Doctor", subtitle: "Find and book appointments", icon: "stethoscope", category: .care),
            CommandAction(title: "Talk to Care Team", subtitle: "Message your providers", icon: "message.fill", category: .care),
            CommandAction(title: "Start Consultation", subtitle: "Begin a telemedicine session", icon: "video.fill", category: .care),
            CommandAction(title: "Find Specialist", subtitle: "Search by specialty", icon: "magnifyingglass.circle.fill", category: .care)
        ]
    }

    private static func medicationActions() -> [CommandAction] {
        [
            CommandAction(title: "Order Medicine", subtitle: "Order from partnered pharmacies", icon: "cart.fill", category: .medication),
            CommandAction(title: "Refill Prescription", subtitle: "Request prescription refill", icon: "arrow.triangle.2.circlepath", category: .medication),
            CommandAction(title: "View Active Medicines", subtitle: "Current medications list", icon: "list.clipboard.fill", category: .medication),
            CommandAction(title: "Medication Schedule", subtitle: "Dosage timings and reminders", icon: "clock.fill", category: .medication)
        ]
    }

    private static func diagnosticsActions() -> [CommandAction] {
        [
            CommandAction(title: "Book Test", subtitle: "Schedule lab tests", icon: "flask.fill", category: .diagnostics),
            CommandAction(title: "Upload Report", subtitle: "Upload diagnostic reports", icon: "doc.badge.plus", category: .diagnostics),
            CommandAction(title: "View Results", subtitle: "See past test results", icon: "doc.text.magnifyingglass", category: .diagnostics)
        ]
    }

    private static func insuranceActions() -> [CommandAction] {
        [
            CommandAction(title: "Check Coverage", subtitle: "View insurance coverage details", icon: "shield.checkered", category: .insurance),
            CommandAction(title: "View Claims", subtitle: "Track insurance claims", icon: "doc.text.fill", category: .insurance),
            CommandAction(title: "Start Claim", subtitle: "File a new insurance claim", icon: "plus.circle.fill", category: .insurance),
            CommandAction(title: "View Policy", subtitle: "Policy documents and details", icon: "newspaper.fill", category: .insurance)
        ]
    }

    private static func recordsActions() -> [CommandAction] {
        [
            CommandAction(title: "View Records", subtitle: "Browse health records", icon: "folder.fill", category: .records),
            CommandAction(title: "Upload Record", subtitle: "Add a new health record", icon: "icloud.and.arrow.up.fill", category: .records),
            CommandAction(title: "Share Record", subtitle: "Share with healthcare provider", icon: "square.and.arrow.up.fill", category: .records),
            CommandAction(title: "ABHA Documents", subtitle: "Ayushman Bharat records", icon: "indianrupeesign.circle.fill", category: .records)
        ]
    }

    private static func familyActions() -> [CommandAction] {
        [
            CommandAction(title: "Switch Profile", subtitle: "Change active family member", icon: "person.circle.fill", category: .family),
            CommandAction(title: "Add Family Member", subtitle: "Link a family member", icon: "person.badge.plus", category: .family),
            CommandAction(title: "View Family Records", subtitle: "Browse linked family records", icon: "person.2.fill", category: .family)
        ]
    }
}
