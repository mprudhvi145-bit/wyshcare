import SwiftUI

struct ClaimsView: View {
    @State private var viewModel = ClaimsViewModel()

    var body: some View {
        VStack(spacing: 0) {
            filterBar
            claimList
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Claims")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                NavigationLink(destination: NewClaimView()) {
                    Image(systemName: "plus")
                }
            }
        }
    }

    private var filterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(ClaimFilter.allCases, id: \.self) { filter in
                    Button {
                        withAnimation { viewModel.selectedFilter = filter }
                    } label: {
                        Text(filter.rawValue)
                            .font(.subheadline.bold())
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(viewModel.selectedFilter == filter ? Color.blue : Color(.systemGray5))
                            .foregroundStyle(viewModel.selectedFilter == filter ? .white : .primary)
                            .clipShape(Capsule())
                    }
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
        .background(Color(.secondarySystemGroupedBackground))
    }

    @ViewBuilder private var claimList: some View {
        if viewModel.filteredClaims.isEmpty {
            ContentUnavailableView(
                "No Claims Found",
                systemImage: "doc.text.magnifyingglass",
                description: Text("No \(viewModel.selectedFilter.rawValue.lowercased()) claims at this time.")
            )
        } else {
            List {
                ForEach(viewModel.filteredClaims) { claim in
                    NavigationLink(destination: ClaimDetailView(claim: claim)) {
                        ClaimRow(claim: claim)
                    }
                }
            }
            .listStyle(.insetGrouped)
        }
    }
}

struct ClaimRow: View {
    var claim: Claim

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(claim.id)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(claim.description)
                    .font(.subheadline)
                    .lineLimit(1)
                Text(claim.provider)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("$\(claim.amount, format: .number)")
                    .font(.subheadline.bold())
                Text(claim.date.formatted(date: .abbreviated, time: .omitted))
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                statusBadge(claim.status)
            }
        }
        .padding(.vertical, 4)
    }

    private func statusBadge(_ status: ClaimStatus) -> some View {
        let color: Color = {
            switch status {
            case .approved:
                return .green

            case .pending:
                return .orange

            case .rejected:
                return .red

            case .settled:
                return .purple

            case .underReview:
                return .blue
            }
        }()
        return Text(status.rawValue)
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }
}

#Preview {
    NavigationStack {
        ClaimsView()
    }
}
