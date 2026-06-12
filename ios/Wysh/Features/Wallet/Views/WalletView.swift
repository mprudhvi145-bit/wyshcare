import SwiftUI

struct WalletView: View {
    @State private var viewModel = WalletViewModel()
    @Environment(SearchNavigationState.self)
    private var searchNav
    @Environment(InboxStore.self)
    private var inboxStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    balanceHeader
                    rewardsCard
                    recentTransactionsSection
                    subscriptionsSection
                    paymentMethodsSection
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Wallet")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                toolbarContent
            }
        }
    }

    private var toolbarContent: some ToolbarContent {
        ToolbarItemGroup(placement: .navigationBarTrailing) {
            Button {
                searchNav.showInbox = true
            } label: {
                Image(systemName: "bell")
                    .overlay(
                        Group {
                            if inboxStore.unreadCount > 0 {
                                Text("\(inboxStore.unreadCount)")
                                    .font(.caption2.weight(.bold))
                                    .foregroundStyle(.white)
                                    .frame(width: 16, height: 16)
                                    .background(.red)
                                    .clipShape(Circle())
                                    .offset(x: 6, y: -6)
                            }
                        },
                        alignment: .topTrailing
                    )
            }

            Button {
                searchNav.showSearch = true
            } label: {
                Image(systemName: "magnifyingglass")
            }
        }
    }

    private var balanceHeader: some View {
        VStack(spacing: 4) {
            Text("$\(viewModel.balance, format: .number)")
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .foregroundStyle(.primary)

            Text("Available \(viewModel.currencyName)")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack(spacing: 16) {
                Label("$\(viewModel.pendingBalance, format: .number) pending", systemImage: "clock")
                    .font(.caption)
                    .foregroundStyle(.orange)

                Label("+$\(viewModel.totalCreditsThisMonth, format: .number) this month", systemImage: "arrow.up")
                    .font(.caption)
                    .foregroundStyle(.green)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(.secondarySystemGroupedBackground))
        )
    }

    private var rewardsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "star.fill")
                    .foregroundStyle(.yellow)
                Text("Rewards")
                    .font(.headline)
                Spacer()
                Text("\(viewModel.rewardsPoints) pts")
                    .font(.title3.bold())
                    .foregroundStyle(.yellow)
            }

            ProgressView(value: Double(viewModel.rewardsPoints), total: 5_000)
                .tint(.yellow)

            HStack {
                Text("\(viewModel.rewardsPoints) / 5,000 points to next tier")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("Gold Status")
                    .font(.caption.bold())
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(.yellow.opacity(0.15))
                    .foregroundStyle(.yellow)
                    .clipShape(Capsule())
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var recentTransactionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recent Transactions")
                    .font(.title3.bold())
                Spacer()
                NavigationLink(destination: TransactionDetailView()) {
                    Text("See All")
                        .font(.subheadline)
                }
            }

            LazyVStack(spacing: 0) {
                ForEach(viewModel.recentTransactions) { transaction in
                    TransactionRow(transaction: transaction)
                    if transaction.id != viewModel.recentTransactions.last?.id {
                        Divider().padding(.leading, 52)
                    }
                }
            }
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var subscriptionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Subscriptions")
                .font(.title3.bold())

            LazyVStack(spacing: 0) {
                ForEach(viewModel.activeSubscriptions) { sub in
                    SubscriptionRow(subscription: sub)
                    if sub.id != viewModel.activeSubscriptions.last?.id {
                        Divider().padding(.leading, 52)
                    }
                }
            }
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var paymentMethodsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Payment Methods")
                .font(.title3.bold())

            LazyVStack(spacing: 0) {
                ForEach(viewModel.paymentMethods) { method in
                    PaymentMethodRow(method: method)
                    if method.id != viewModel.paymentMethods.last?.id {
                        Divider().padding(.leading, 52)
                    }
                }
            }
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}

struct TransactionRow: View {
    var transaction: WalletTransactionItem

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: transaction.icon)
                .font(.title3)
                .foregroundStyle(transaction.type == .credit ? .green : .red)
                .frame(width: 32, height: 32)
                .background((transaction.type == .credit ? Color.green : Color.red).opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                Text(transaction.title)
                    .font(.subheadline)
                Text(transaction.subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(transaction.date.formatted(date: .abbreviated, time: .omitted))
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            Text("\(transaction.type == .credit ? "+" : "-")$\(transaction.amount, format: .number)")
                .font(.subheadline.bold())
                .foregroundStyle(transaction.type == .credit ? .green : .primary)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
    }
}

struct SubscriptionRow: View {
    var subscription: Subscription

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "repeat.circle.fill")
                .font(.title3)
                .foregroundStyle(.blue)
                .frame(width: 32, height: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(subscription.name)
                    .font(.subheadline)
                Text(subscription.provider)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("\(subscription.billingCycle.rawValue) • Next: \(subscription.nextBilling.formatted(date: .abbreviated, time: .omitted))")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            Text("$\(subscription.amount, format: .number)")
                .font(.subheadline.bold())
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
    }
}

struct PaymentMethodRow: View {
    var method: PaymentMethod

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: method.type == .bankAccount ? "building.columns.fill" : "creditcard.fill")
                .font(.title3)
                .foregroundStyle(.blue)
                .frame(width: 32, height: 32)

            methodInfo

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
    }

    private var methodInfo: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(method.type.rawValue)
                    .font(.subheadline)
                if method.isDefault {
                    Text("Default")
                        .font(.caption2.bold())
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(.blue.opacity(0.1))
                        .foregroundStyle(.blue)
                        .clipShape(Capsule())
                }
            }
            Text("•••• \(method.lastFour)")
                .font(.caption)
                .foregroundStyle(.secondary)
            if let expiry = method.expiryDate {
                Text("Expires \(expiry)")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
    }
}

#Preview {
    WalletView()
}
