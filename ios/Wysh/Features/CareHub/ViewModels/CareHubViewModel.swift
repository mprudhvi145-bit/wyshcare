import Foundation
import SwiftUI

// MARK: - Care Team

struct CareProvider: Identifiable {
    let id = UUID()
    let name: String
    let specialty: String
    let icon: String
    let color: Color
    let isPrimary: Bool
    let nextAvailable: String
}

// MARK: - Health Record

struct CareHealthRecordItem: Identifiable {
    let id = UUID()
    let title: String
    let date: Date
    let type: String
    let icon: String
    let color: Color
}

// MARK: - Transaction

struct CareWalletTransaction: Identifiable {
    let id = UUID()
    let title: String
    let amount: String
    let date: Date
    let icon: String
    let color: Color
    let isCredit: Bool
}

// MARK: - Subscription

struct WalletSubscription: Identifiable {
    let id = UUID()
    let name: String
    let price: String
    let status: String
    let renewsOn: String
    let icon: String
}

@MainActor
@Observable
final class CareHubViewModel {
    var careProviders: [CareProvider] = []
    var healthRecords: [CareHealthRecordItem] = []
    var recentTransactions: [CareWalletTransaction] = []
    var subscriptions: [WalletSubscription] = []

    var insuranceProvider = "Star Health Insurance"
    var insuranceCoverage = "₹5,00,000"
    var insuranceUsed: Double = 125_000
    var insuranceLimit: Double = 500_000
    var activeClaims = 2
    var pendingApprovals = 1

    var walletBalance = "₹12,450"
    var paymentMethod = "Visa ending in 4242"

    deinit {}

    init() {
        loadSampleData()
    }

    func refresh() async {
        try? await Task.sleep(nanoseconds: 800_000_000)
        loadSampleData()
    }

    private func loadSampleData() {
        careProviders = [
            CareProvider(name: "Dr. Priya Sharma", specialty: "Primary Care", icon: "stethoscope", color: .blue, isPrimary: true, nextAvailable: "Today, 3:30 PM"),
            CareProvider(name: "Dr. Sanjay Patel", specialty: "Cardiology", icon: "heart.fill", color: .red, isPrimary: false, nextAvailable: "Thu, 10:00 AM"),
            CareProvider(name: "Anita Rao", specialty: "Care Coordinator", icon: "person.text.rectangle", color: .green, isPrimary: false, nextAvailable: "Available now")
        ]

        let calendar = Calendar.current
        let today = Date()

        healthRecords = [
            CareHealthRecordItem(title: "Blood Report - CBC", date: calendar.date(byAdding: .day, value: -5, to: today) ?? today, type: "Lab Report", icon: "flask.fill", color: .purple),
            CareHealthRecordItem(title: "Chest X-Ray", date: calendar.date(byAdding: .day, value: -12, to: today) ?? today, type: "Imaging", icon: "radiograph", color: .orange),
            CareHealthRecordItem(title: "Lipid Profile", date: calendar.date(byAdding: .day, value: -30, to: today) ?? today, type: "Lab Report", icon: "drop.fill", color: .blue),
            CareHealthRecordItem(title: "ECG Report", date: calendar.date(byAdding: .day, value: -45, to: today) ?? today, type: "Cardiology", icon: "waveform.path.ecg", color: .red)
        ]

        recentTransactions = [
            CareWalletTransaction(title: "Clinic Visit - Dr. Sharma", amount: "₹1,200", date: calendar.date(byAdding: .day, value: -2, to: today) ?? today, icon: "stethoscope", color: .blue, isCredit: false),
            CareWalletTransaction(title: "Insurance Claim Approved", amount: "₹45,000", date: calendar.date(byAdding: .day, value: -5, to: today) ?? today, icon: "shield.fill", color: .green, isCredit: true),
            CareWalletTransaction(title: "Pharmacy - Metformin", amount: "₹340", date: calendar.date(byAdding: .day, value: -7, to: today) ?? today, icon: "pills.fill", color: .purple, isCredit: false),
            CareWalletTransaction(title: "Subscription Renewal", amount: "₹499", date: calendar.date(byAdding: .month, value: -1, to: today) ?? today, icon: "crown.fill", color: .orange, isCredit: false)
        ]

        subscriptions = [
            WalletSubscription(name: "Wysh Care Premium", price: "₹499/mo", status: "Active", renewsOn: "July 15, 2026", icon: "crown.fill"),
            WalletSubscription(name: "Family Shield", price: "₹199/mo", status: "Active", renewsOn: "Aug 1, 2026", icon: "person.2.fill")
        ]
    }
}
