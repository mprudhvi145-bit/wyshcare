import SwiftUI

struct PolicyDetailView: View {
    @State private var viewModel = InsuranceViewModel()

    var body: some View {
        List {
            policyInfoSection
            coverageLimitsSection
            deductiblesSection
            networkProvidersSection
        }
        .navigationTitle("Policy Details")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var policyInfoSection: some View {
        Section("Policy Information") {
            if let policy = viewModel.activePolicy {
                labeledRow(label: "Provider", value: policy.provider)
                labeledRow(label: "Plan Name", value: policy.planName)
                labeledRow(label: "Policy Number", value: policy.policyNumber)
                labeledRow(label: "Network", value: policy.network)
                labeledRow(label: "Start Date", value: policy.startDate.formatted(date: .abbreviated, time: .omitted))
                labeledRow(label: "Expiry Date", value: policy.expiryDate.formatted(date: .abbreviated, time: .omitted))
                labeledRow(label: "Premium", value: "$\(policy.premium) / month")
            }
        }
    }

    private var coverageLimitsSection: some View {
        Section("Coverage Limits") {
            if let policy = viewModel.activePolicy {
                ForEach(policy.coverageLimits) { limit in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text(limit.category)
                                .font(.subheadline)
                            Spacer()
                            Text("$\(limit.coverage, format: .number)")
                                .font(.subheadline.bold())
                        }
                        ProgressView(value: Double(limit.coverage - limit.remaining), total: Double(limit.coverage))
                            .tint(progressColor(for: Double(limit.coverage - limit.remaining) / Double(limit.coverage)))
                        Text("$\(limit.remaining, format: .number) remaining")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
    }

    private var deductiblesSection: some View {
        Section("Deductibles") {
            if let policy = viewModel.activePolicy {
                ForEach(policy.deductibles) { deductible in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text(deductible.category)
                                .font(.subheadline)
                            Spacer()
                            Text("$\(deductible.met) / $\(deductible.amount)")
                                .font(.subheadline.bold())
                        }
                        ProgressView(value: Double(deductible.met), total: Double(deductible.amount))
                            .tint(deductible.met >= deductible.amount ? .green : .orange)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
    }

    private var networkProvidersSection: some View {
        Section("Network Providers") {
            if let policy = viewModel.activePolicy {
                ForEach(policy.networkProviders) { provider in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(provider.name)
                                .font(.subheadline)
                            Spacer()
                            badge(for: provider.tier)
                        }
                        Text(provider.type)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(provider.address)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                        Text(provider.phone)
                            .font(.caption2)
                            .foregroundStyle(.blue)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
    }

    private func labeledRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .multilineTextAlignment(.trailing)
        }
    }

    private func badge(for tier: String) -> some View {
        let color: Color = {
            switch tier {
            case "Preferred":
                return .green

            case "In-Network":
                return .blue

            case "Out-of-Network":
                return .orange

            default:
                return .gray
            }
        }()
        return Text(tier)
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }

    private func progressColor(for fraction: Double) -> Color {
        switch fraction {
        case 0.75...:
            return .red

        case 0.5..<0.75:
            return .orange

        default:
            return .green
        }
    }
}

#Preview {
    NavigationStack {
        PolicyDetailView()
    }
}
