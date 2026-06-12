import SwiftUI

struct InsuranceView: View {
    @State private var viewModel = InsuranceViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    activePolicyCard
                    coverageSummarySection
                    quickActionsSection
                    aiCopilotCard
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Insurance")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private func policyHeaderRow(_ policy: Policy) -> some View {
        HStack {
            Label(policy.provider, systemImage: "checkmark.shield.fill")
                .font(.headline)
                .foregroundStyle(.white)
            Spacer()
            Text("ACTIVE")
                .font(.caption2.bold())
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(.white.opacity(0.25))
                .clipShape(Capsule())
        }
    }

    private func policyDateRow(_ policy: Policy) -> some View {
        HStack {
            Label(
                policy.expiryDate.formatted(date: .abbreviated, time: .omitted),
                systemImage: "calendar"
            )
            Spacer()
            Label(policy.planName, systemImage: "doc.text")
        }
        .font(.subheadline)
        .foregroundStyle(.white.opacity(0.9))
    }

    private var policyViewDetailsLink: some View {
        NavigationLink(destination: PolicyDetailView()) {
            Text("View Details")
                .font(.subheadline.bold())
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(.white)
                .foregroundStyle(.blue)
                .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }

    private var activePolicyContent: some View {
        Group {
            if let policy = viewModel.activePolicy {
                VStack(alignment: .leading, spacing: 12) {
                    policyHeaderRow(policy)

                    Text("$\(policy.coverageAmount, format: .number) Coverage")
                        .font(.title.bold())
                        .foregroundStyle(.white)

                    policyDateRow(policy)

                    policyViewDetailsLink
                }
                .padding()
                .background(
                    LinearGradient(colors: [.blue, .blue.opacity(0.7)], startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
        }
    }

    private var activePolicyCard: some View {
        Group {
            activePolicyContent
        }
    }

    private var coverageSummarySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Coverage Summary")
                .font(.title3.bold())

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 2), spacing: 12) {
                metricCard(
                    title: "Total Coverage",
                    value: "$\(viewModel.coverageSummary.totalCoverage / 1_000_000)M",
                    subtitle: "\(viewModel.coverageSummary.usedCoverage / 1_000)K used",
                    color: .blue
                )
                metricCard(
                    title: "Deductible",
                    value: "$\(viewModel.coverageSummary.deductible)",
                    subtitle: "$\(viewModel.coverageSummary.deductibleMet) met",
                    color: .orange
                )
                metricCard(
                    title: "Out-of-Pocket Max",
                    value: "$\(viewModel.coverageSummary.outOfPocketMax)",
                    subtitle: "$\(viewModel.coverageSummary.outOfPocketMet) met",
                    color: .red
                )
                metricCard(
                    title: "Claims This Year",
                    value: "\(viewModel.coverageSummary.usedCoverage / 1_000)",
                    subtitle: "\(Int(viewModel.coveragePercentage * 100))% utilized",
                    color: .green
                )
            }
        }
    }

    private func metricCard(title: String, value: String, subtitle: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title2.bold())
                .foregroundStyle(color)
            Text(subtitle)
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.title3.bold())

            VStack(spacing: 0) {
                NavigationLink(destination: ClaimsView()) {
                    actionRow(icon: "doc.text.badge.clock", title: "Claims", subtitle: "View & manage claims", color: .blue)
                }
                Divider().padding(.leading, 52)
                NavigationLink(destination: EligibilityCheckView()) {
                    actionRow(icon: "checkmark.circle.badge.questionmark", title: "Pre-Authorization", subtitle: "Check coverage eligibility", color: .indigo)
                }
                Divider().padding(.leading, 52)
                NavigationLink(destination: CoverageAnalyticsView()) {
                    actionRow(icon: "chart.pie", title: "Eligibility", subtitle: "Analyze your coverage", color: .purple)
                }
            }
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private func actionRow(icon: String, title: String, subtitle: String, color: Color) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
                .frame(width: 28)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.body)
                    .foregroundStyle(.primary)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.horizontal)
        .padding(.vertical, 14)
    }

    private var aiCopilotContent: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(LinearGradient(colors: [.purple, .blue], startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 48, height: 48)
                Image(systemName: "wand.and.stars")
                    .font(.title3)
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text("AI Claims Copilot")
                    .font(.headline)
                    .foregroundStyle(.primary)
                Text("Analyze claims, check documents, predict risks")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.secondarySystemGroupedBackground))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(LinearGradient(colors: [.purple.opacity(0.3), .blue.opacity(0.3)], startPoint: .topLeading, endPoint: .bottomTrailing), lineWidth: 1)
                )
        )
    }

    private var aiCopilotCard: some View {
        NavigationLink(destination: CopilotView()) {
            aiCopilotContent
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    InsuranceView()
}
