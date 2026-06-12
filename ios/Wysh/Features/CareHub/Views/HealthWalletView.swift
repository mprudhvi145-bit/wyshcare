import SwiftUI

struct HealthWalletView: View {
    @State private var viewModel = CareHubViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DS.Space.xxl) {
                balanceSection
                paymentMethodsSection
                subscriptionsSection
                transactionHistorySection
            }
            .padding(.horizontal, DS.Space.xl)
            .padding(.vertical, DS.Space.lg)
        }
        .background(DS.Color.background)
        .navigationTitle("Health Wallet")
        .navigationBarTitleDisplayMode(.large)
    }

    private var balanceSection: some View {
        PrimaryCard(title: "Available Balance", icon: "indianrupeesign.circle") {
            Text(viewModel.walletBalance)
                .font(.system(size: 40, weight: .bold, design: .rounded))
                .foregroundStyle(DS.Color.success)

            Text("Last updated today")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private var paymentMethodsSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Payment Methods", buttonTitle: "Manage") {}

            PrimaryCard {
                HStack(spacing: DS.Space.md) {
                    Image(systemName: "creditcard.fill")
                        .font(.title2)
                        .foregroundStyle(DS.Color.primary)
                    VStack(alignment: .leading, spacing: DS.Space.xs) {
                        Text(viewModel.paymentMethod)
                            .font(.subheadline.weight(.medium))
                        Text("Expires 12/28")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(DS.Color.success)
                }
            }

            Button(action: {}, label: {
                Label("Add Card", systemImage: "plus.circle")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, DS.Space.md)
                    .background(DS.Color.primary.opacity(0.1))
                    .foregroundStyle(DS.Color.primary)
                    .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
            })
        }
    }

    private var subscriptionsSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Subscriptions")

            ForEach(viewModel.subscriptions) { sub in
                PrimaryCard {
                    HStack(spacing: DS.Space.md) {
                        Image(systemName: sub.icon)
                            .font(.title2)
                            .foregroundStyle(DS.Color.warning)
                        VStack(alignment: .leading, spacing: DS.Space.xs) {
                            Text(sub.name)
                                .font(.subheadline.weight(.medium))
                            Text("\(sub.price) · Renews \(sub.renewsOn)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text(sub.status)
                            .font(.caption.weight(.medium))
                            .foregroundStyle(DS.Color.success)
                    }
                }
            }
        }
    }

    private var transactionHistorySection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Recent Transactions")

            ForEach(viewModel.recentTransactions) { tx in
                HStack(spacing: DS.Space.md) {
                    ZStack {
                        Circle()
                            .fill(tx.color.opacity(0.15))
                            .frame(width: 36, height: 36)
                        Image(systemName: tx.icon)
                            .font(.system(size: DS.Space.lg - 2, weight: .medium))
                            .foregroundStyle(tx.color)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(tx.title)
                            .font(.subheadline.weight(.medium))
                        Text(tx.date, style: .date)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Text(tx.amount)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(tx.isCredit ? DS.Color.success : .primary)
                }
                .padding(DS.Space.md)
                .background(DS.Color.card)
                .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
                .dsShadow()
            }
        }
    }
}

#Preview {
    NavigationStack {
        HealthWalletView()
    }
}
