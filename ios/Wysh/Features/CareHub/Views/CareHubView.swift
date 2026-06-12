import SwiftUI

struct CareHubView: View {
    @State private var viewModel = CareHubViewModel()
    @Environment(SearchNavigationState.self)
    private var searchNav
    @Environment(InboxStore.self)
    private var inboxStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.xxl) {
                    careTeamSection
                    healthRecordsSection
                    insuranceSection
                    healthWalletSection
                }
                .padding(.horizontal, DS.Space.xl)
                .padding(.top, DS.Space.lg)
                .padding(.bottom, DS.Space.xxxl)
            }
            .background(DS.Color.background)
            .navigationTitle("Care Hub")
            .toolbar { toolbarItems }
            .refreshable { await viewModel.refresh() }
        }
    }

    private var toolbarItems: some ToolbarContent {
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

    // MARK: - Care Team

    private var careTeamSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Care Team", buttonTitle: "Manage") {
                // Navigate to full care team
            }

            ForEach(viewModel.careProviders) { provider in
                CareProviderRow(provider: provider)
            }
        }
    }

    // MARK: - Health Records

    private var healthRecordsSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Health Records", buttonTitle: "See All") {
                // Navigate to full records
            }

            ForEach(viewModel.healthRecords.prefix(3)) { record in
                HealthRecordRow(record: record)
            }

            uploadRecordButton
        }
    }

    private var uploadRecordButton: some View {
        Button(action: {}, label: {
            Label("Upload New Record", systemImage: "doc.badge.plus")
                .font(.subheadline.weight(.medium))
                .frame(maxWidth: .infinity)
                .padding(.vertical, DS.Space.md)
                .background(DS.Color.primary.opacity(0.1))
                .foregroundStyle(DS.Color.primary)
                .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        })
    }

    // MARK: - Insurance

    private var insuranceSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Insurance", buttonTitle: "Details") {
                // Navigate to insurance detail
            }

            HealthCard(title: "Coverage", subtitle: viewModel.insuranceCoverage) {
                insuranceProgressContent
            }

            insuranceCards
        }
    }

    private var insuranceProgressContent: some View {
        VStack(alignment: .leading, spacing: DS.Space.sm) {
            Text(viewModel.insuranceProvider)
                .font(.subheadline.weight(.medium))

            ProgressView(value: viewModel.insuranceUsed, total: viewModel.insuranceLimit)
                .tint(DS.Color.primary)

            HStack {
                Text("Used: ₹\(Int(viewModel.insuranceUsed))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("₹\(Int(viewModel.insuranceLimit))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var insuranceCards: some View {
        HStack(spacing: DS.Space.md) {
            PrimaryCard(title: "Active Claims", icon: "doc.text") {
                Text("\(viewModel.activeClaims)")
                    .font(.title.weight(.bold))
                    .foregroundStyle(DS.Color.primary)
            }

            PrimaryCard(title: "Pending", icon: "clock") {
                Text("\(viewModel.pendingApprovals)")
                    .font(.title.weight(.bold))
                    .foregroundStyle(DS.Color.warning)
            }
        }
    }

    // MARK: - Health Wallet

    private var healthWalletSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Health Wallet", buttonTitle: "History") {
                // Navigate to full wallet
            }

            HealthCard(title: nil, subtitle: nil) {
                walletBalanceContent
            }

            ForEach(viewModel.recentTransactions.prefix(3)) { tx in
                HubTransactionRow(transaction: tx)
            }

            addPaymentButton
        }
    }

    private var walletBalanceContent: some View {
        HStack {
            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text("Available Balance")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(viewModel.walletBalance)
                    .font(.title.weight(.bold))
                    .foregroundStyle(DS.Color.success)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: DS.Space.xs) {
                Text("Payment Method")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(viewModel.paymentMethod)
                    .font(.subheadline)
            }
        }
    }

    private var addPaymentButton: some View {
        Button(action: {}, label: {
            Label("Add Payment Method", systemImage: "plus.circle")
                .font(.subheadline.weight(.medium))
                .frame(maxWidth: .infinity)
                .padding(.vertical, DS.Space.md)
                .background(DS.Color.primary.opacity(0.1))
                .foregroundStyle(DS.Color.primary)
                .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        })
    }
}

// MARK: - Subviews

private struct CareProviderRow: View {
    let provider: CareProvider

    var body: some View {
        HStack(spacing: DS.Space.md) {
            ZStack {
                Circle()
                    .fill(provider.color.opacity(0.15))
                    .frame(width: 44, height: 44)
                Image(systemName: provider.icon)
                    .font(.system(size: DS.Space.lg + 2, weight: .medium))
                    .foregroundStyle(provider.color)
            }

            providerInfo

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(DS.Space.md)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        .dsShadow()
    }

    private var providerInfo: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            HStack(spacing: DS.Space.xs) {
                Text(provider.name)
                    .font(.subheadline.weight(.semibold))
                if provider.isPrimary {
                    Text("Primary")
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(DS.Color.primary)
                        .padding(.horizontal, DS.Space.sm - 2)
                        .padding(.vertical, 2)
                        .background(DS.Color.primary.opacity(0.12))
                        .clipShape(Capsule())
                }
            }
            Text(provider.specialty)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}

private struct HealthRecordRow: View {
    let record: CareHealthRecordItem

    var body: some View {
        HStack(spacing: DS.Space.md) {
            ZStack {
                Circle()
                    .fill(record.color.opacity(0.15))
                    .frame(width: 40, height: 40)
                Image(systemName: record.icon)
                    .font(.system(size: DS.Space.lg, weight: .medium))
                    .foregroundStyle(record.color)
            }

            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text(record.title)
                    .font(.subheadline.weight(.semibold))
                Text("\(record.type) · \(record.date, style: .date)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
        .padding(DS.Space.md)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        .dsShadow()
    }
}

private struct HubTransactionRow: View {
    let transaction: CareWalletTransaction

    var body: some View {
        HStack(spacing: DS.Space.md) {
            ZStack {
                Circle()
                    .fill(transaction.color.opacity(0.15))
                    .frame(width: 36, height: 36)
                Image(systemName: transaction.icon)
                    .font(.system(size: DS.Space.lg - 2, weight: .medium))
                    .foregroundStyle(transaction.color)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(transaction.title)
                    .font(.subheadline.weight(.medium))
                Text(transaction.date, style: .relative)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(transaction.amount)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(transaction.isCredit ? DS.Color.success : .primary)
        }
        .padding(DS.Space.md)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        .dsShadow()
    }
}

#Preview {
    CareHubView()
}
