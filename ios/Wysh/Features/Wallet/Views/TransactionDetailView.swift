import SwiftUI

struct TransactionDetailView: View {
    @State private var viewModel = WalletViewModel()

    var body: some View {
        List {
            summarySection
            Section("This Month") {
                ForEach(viewModel.transactions) { transaction in
                    TransactionRow(transaction: transaction)
                }
            }
        }
        .navigationTitle("Transactions")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var summarySection: some View {
        Section {
            HStack {
                Spacer()
                VStack(spacing: 16) {
                    Text("All Transactions")
                        .font(.title3.bold())

                    HStack(spacing: 32) {
                        VStack(spacing: 4) {
                            Text("Total Spent")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text("$\(viewModel.totalSpentThisMonth, format: .number)")
                                .font(.title2.bold())
                                .foregroundStyle(.red)
                        }
                        VStack(spacing: 4) {
                            Text("Total Credits")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text("+$\(viewModel.totalCreditsThisMonth, format: .number)")
                                .font(.title2.bold())
                                .foregroundStyle(.green)
                        }
                    }
                }
                Spacer()
            }
            .listRowBackground(Color.clear)
        }
    }
}

#Preview {
    NavigationStack {
        TransactionDetailView()
    }
}
