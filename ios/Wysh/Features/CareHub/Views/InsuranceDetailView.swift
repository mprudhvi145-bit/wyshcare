import SwiftUI

struct InsuranceDetailView: View {
    @State private var viewModel = CareHubViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DS.Space.xxl) {
                coverageSection
                claimsSection
                networkSection
            }
            .padding(.horizontal, DS.Space.xl)
            .padding(.vertical, DS.Space.lg)
        }
        .background(DS.Color.background)
        .navigationTitle("Insurance")
        .navigationBarTitleDisplayMode(.large)
    }

    private var coverageSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Coverage Summary")

            HealthCard(title: viewModel.insuranceProvider) {
                coverageCardContent
            }

            coverageCardsRow
        }
    }

    private var coverageCardContent: some View {
        VStack(alignment: .leading, spacing: DS.Space.sm) {
            HStack {
                Text("Total Coverage")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Spacer()
                Text(viewModel.insuranceCoverage)
                    .font(.title3.weight(.bold))
            }

            ProgressView(value: viewModel.insuranceUsed, total: viewModel.insuranceLimit)
                .tint(DS.Color.primary)

            HStack {
                Text("Used: ₹\(Int(viewModel.insuranceUsed))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("Remaining: ₹\(Int(viewModel.insuranceLimit - viewModel.insuranceUsed))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var coverageCardsRow: some View {
        HStack(spacing: DS.Space.md) {
            PrimaryCard(title: "In-Patient", icon: "building") {
                Text("₹3,00,000")
                    .font(.title3.weight(.bold))
            }

            PrimaryCard(title: "Out-Patient", icon: "person") {
                Text("₹1,00,000")
                    .font(.title3.weight(.bold))
            }

            PrimaryCard(title: "Maternity", icon: "figure.and.child.holdinghands") {
                Text("₹50,000")
                    .font(.title3.weight(.bold))
            }
        }
    }

    private var claimsSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Claims", buttonTitle: "File Claim") {}

            claimsCardsRow

            claimsList
        }
    }

    private var claimsCardsRow: some View {
        HStack(spacing: DS.Space.md) {
            PrimaryCard(title: "Active", icon: "doc.text") {
                Text("\(viewModel.activeClaims)")
                    .font(.title.weight(.bold))
                    .foregroundStyle(DS.Color.primary)
            }

            PrimaryCard(title: "Pending", icon: "clock") {
                Text("\(viewModel.pendingApprovals)")
                    .font(.title.weight(.bold))
                    .foregroundStyle(DS.Color.warning)
            }

            PrimaryCard(title: "Approved", icon: "checkmark") {
                Text("3")
                    .font(.title.weight(.bold))
                    .foregroundStyle(DS.Color.success)
            }
        }
    }

    private var claimsList: some View {
        ForEach(0..<2, id: \.self) { i in
            PrimaryCard {
                HStack(spacing: DS.Space.md) {
                    Image(systemName: i == 0 ? "clock" : "doc.text.fill")
                        .font(.title2)
                        .foregroundStyle(i == 0 ? DS.Color.warning : DS.Color.primary)

                    VStack(alignment: .leading, spacing: DS.Space.xs) {
                        Text(i == 0 ? "Claim #CLM-2026-045" : "Claim #CLM-2026-032")
                            .font(.subheadline.weight(.medium))
                        Text(i == 0 ? "Under review" : "Approved - ₹12,500")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Text(i == 0 ? "Pending" : "Approved")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(i == 0 ? DS.Color.warning : DS.Color.success)
                }
            }
        }
    }

    private var networkSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Network Providers", buttonTitle: "Find") {}

            ForEach(0..<3, id: \.self) { i in
                let hospitals = ["Apollo Hospitals", "Fortis Healthcare", "Manipal Hospitals"]
                let locations = ["Bengaluru · 2.3 km", "Bengaluru · 4.1 km", "Bengaluru · 6.8 km"]

                PrimaryCard {
                    HStack(spacing: DS.Space.md) {
                        ZStack {
                            Circle()
                                .fill(DS.Color.primary.opacity(0.12))
                                .frame(width: 40, height: 40)
                            Image(systemName: "building.2.fill")
                                .font(.system(size: DS.Space.lg - 2))
                                .foregroundStyle(DS.Color.primary)
                        }

                        VStack(alignment: .leading, spacing: DS.Space.xs) {
                            Text(hospitals[i])
                                .font(.subheadline.weight(.medium))
                            Text(locations[i])
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        InsuranceDetailView()
    }
}
