import Foundation
import Observation

@Observable
final class WalletViewModel {
    var balance: Decimal = 2_450.00
    var pendingBalance: Decimal = 850.00
    var rewardsPoints: Int = 3_200
    var currencyName = "Health Credits"
    var transactions: [WalletTransactionItem] = []
    var subscriptions: [Subscription] = []
    var paymentMethods: [PaymentMethod] = []

    init() {
        loadMockData()
    }

    deinit {}

    var activeSubscriptions: [Subscription] {
        subscriptions.filter { $0.isActive }
    }

    private func loadMockData() {
        transactions = mockTransactions()
        subscriptions = mockSubscriptions()
        paymentMethods = mockPaymentMethods()
    }

    private func mockTransactions() -> [WalletTransactionItem] {
        let calendar = Calendar.current
        return [
            WalletTransactionItem(
                id: "TXN-001",
                title: "Claim Reimbursement",
                subtitle: "City General Hospital — ER Visit",
                amount: 1_000,
                type: .credit,
                date: calendar.date(byAdding: .day, value: -1, to: Date()) ?? Date(),
                category: .reimbursement,
                icon: "dollarsign.circle.fill"
            ),
            WalletTransactionItem(
                id: "TXN-002",
                title: "Monthly Premium",
                subtitle: "BlueCross Shield — PPO Plan",
                amount: 450,
                type: .debit,
                date: calendar.date(byAdding: .day, value: -3, to: Date()) ?? Date(),
                category: .premium,
                icon: "shield.fill"
            ),
            WalletTransactionItem(
                id: "TXN-003",
                title: "Wellness Reward",
                subtitle: "Annual physical completion bonus",
                amount: 75,
                type: .credit,
                date: calendar.date(byAdding: .day, value: -5, to: Date()) ?? Date(),
                category: .reward,
                icon: "star.fill"
            ),
            WalletTransactionItem(
                id: "TXN-004",
                title: "Copay — Dr. Chen",
                subtitle: "Primary Care Visit",
                amount: 50,
                type: .debit,
                date: calendar.date(byAdding: .day, value: -7, to: Date()) ?? Date(),
                category: .copay,
                icon: "stethoscope"
            ),
            WalletTransactionItem(
                id: "TXN-005",
                title: "Prescription Refund",
                subtitle: "Cetirizine 10mg — overpayment adjustment",
                amount: 12.50,
                type: .credit,
                date: calendar.date(byAdding: .day, value: -10, to: Date()) ?? Date(),
                category: .refund,
                icon: "arrow.uturn.left.circle.fill"
            ),
            WalletTransactionItem(
                id: "TXN-006",
                title: "Health Credit Earned",
                subtitle: "Steps challenge — monthly goal met",
                amount: 200,
                type: .credit,
                date: calendar.date(byAdding: .day, value: -14, to: Date()) ?? Date(),
                category: .credit,
                icon: "figure.walk.circle.fill"
            ),
            WalletTransactionItem(
                id: "TXN-007",
                title: "Claim Settlement",
                subtitle: "Appendectomy — final payment",
                amount: 4_160,
                type: .credit,
                date: calendar.date(byAdding: .day, value: -60, to: Date()) ?? Date(),
                category: .reimbursement,
                icon: "building.columns.fill"
            )
        ]
    }

    private func mockSubscriptions() -> [Subscription] {
        let calendar = Calendar.current
        return [
            Subscription(
                id: "SUB-001",
                name: "Premium Plus PPO",
                provider: "BlueCross Shield",
                amount: 450,
                billingCycle: .monthly,
                nextBilling: calendar.date(byAdding: .month, value: 1, to: Date()) ?? Date(),
                isActive: true
            ),
            Subscription(
                id: "SUB-002",
                name: "Dental Plus",
                provider: "Delta Dental",
                amount: 35,
                billingCycle: .monthly,
                nextBilling: calendar.date(byAdding: .month, value: 1, to: Date()) ?? Date(),
                isActive: true
            ),
            Subscription(
                id: "SUB-003",
                name: "Vision Care",
                provider: "VSP",
                amount: 22,
                billingCycle: .monthly,
                nextBilling: calendar.date(byAdding: .month, value: 1, to: Date()) ?? Date(),
                isActive: true
            ),
            Subscription(
                id: "SUB-004",
                name: "Wellness+ Gym Membership",
                provider: "FitLife",
                amount: 49,
                billingCycle: .monthly,
                nextBilling: calendar.date(byAdding: .month, value: 1, to: Date()) ?? Date(),
                isActive: true
            )
        ]
    }

    private func mockPaymentMethods() -> [PaymentMethod] {
        [
            PaymentMethod(id: "PM-001", type: .visa, lastFour: "4242", isDefault: true, expiryDate: "06/28"),
            PaymentMethod(id: "PM-002", type: .mastercard, lastFour: "8888", isDefault: false, expiryDate: "09/27"),
            PaymentMethod(id: "PM-003", type: .bankAccount, lastFour: "3210", isDefault: false, expiryDate: nil)
        ]
    }

    var recentTransactions: [WalletTransactionItem] {
        Array(transactions.prefix(5))
    }

    var totalSpentThisMonth: Decimal {
        transactions
            .filter { $0.type == .debit && Calendar.current.isDate($0.date, equalTo: Date(), toGranularity: .month) }
            .map(\.amount)
            .reduce(0, +)
    }

    var totalCreditsThisMonth: Decimal {
        transactions
            .filter { $0.type == .credit && Calendar.current.isDate($0.date, equalTo: Date(), toGranularity: .month) }
            .map(\.amount)
            .reduce(0, +)
    }
}

struct WalletTransactionItem: Identifiable, Hashable {
    let id: String
    var title: String
    var subtitle: String
    var amount: Decimal
    var type: TransactionType
    var date: Date
    var category: TransactionCategory
    var icon: String
}

enum TransactionType {
    case credit
    case debit
}

enum TransactionCategory: String {
    case copay = "Copay"
    case credit = "Health Credit"
    case premium = "Premium"
    case refund = "Refund"
    case reimbursement = "Reimbursement"
    case reward = "Reward"
}

struct Subscription: Identifiable, Hashable {
    let id: String
    var name: String
    var provider: String
    var amount: Decimal
    var billingCycle: BillingCycle
    var nextBilling: Date
    var isActive: Bool
}

enum BillingCycle: String {
    case monthly = "Monthly"
    case quarterly = "Quarterly"
    case yearly = "Yearly"
}

struct PaymentMethod: Identifiable, Hashable {
    let id: String
    var type: PaymentType
    var lastFour: String
    var isDefault: Bool
    var expiryDate: String?
}

enum PaymentType: String {
    case amex = "Amex"
    case bankAccount = "Bank Account"
    case mastercard = "Mastercard"
    case visa = "Visa"

    var icon: String {
        switch self {
        case .amex:
            return "Amex"

        case .bankAccount:
            return "banknote"

        case .mastercard:
            return "Mastercard"

        case .visa:
            return "Visa"
        }
    }
}
