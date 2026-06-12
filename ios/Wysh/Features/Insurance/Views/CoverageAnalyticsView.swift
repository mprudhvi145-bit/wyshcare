import Charts
import SwiftUI

struct CoverageAnalyticsView: View {
    @State private var viewModel = InsuranceViewModel()
    @State private var selectedPeriod: Period = .year

    enum Period: String, CaseIterable {
        case month = "Month"
        case quarter = "Quarter"
        case year = "Year"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                pieChartSection
                categoryBreakdownSection
                usageSummarySection
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Coverage Analytics")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Picker("Period", selection: $selectedPeriod) {
                    ForEach(Period.allCases, id: \.self) { period in
                        Text(period.rawValue).tag(period)
                    }
                }
                .pickerStyle(.segmented)
            }
        }
    }

    private var pieChartSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Coverage Breakdown")
                .font(.title3.bold())

            Chart(pieData, id: \.label) { item in
                SectorMark(
                    angle: .value("Amount", item.value),
                    innerRadius: .ratio(0.6),
                    outerRadius: .ratio(1.0)
                )
                .foregroundStyle(item.color)
                .annotation(position: .overlay) {
                    if item.value > pieData.map(\.value).max() ?? 0 * 0.2 {
                        Text("\(Int(item.value / totalPieValue * 100))%")
                            .font(.caption2.bold())
                            .foregroundStyle(.white)
                    }
                }
            }
            .frame(height: 220)

            pieLegend
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var pieLegend: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
            ForEach(pieData, id: \.label) { item in
                HStack(spacing: 6) {
                    Circle()
                        .fill(item.color)
                        .frame(width: 8, height: 8)
                    Text(item.label)
                        .font(.caption)
                    Spacer()
                    Text("$\(Int(item.value), format: .number)")
                        .font(.caption.bold())
                }
            }
        }
    }

    private var categoryBreakdownSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Category Breakdown")
                .font(.title3.bold())

            if let policy = viewModel.activePolicy {
                ForEach(policy.coverageLimits, content: coverageLimitRow)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func coverageLimitRow(_ limit: CoverageLimit) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(limit.category)
                    .font(.subheadline)
                Spacer()
                Text("$\(limit.remaining, format: .number) left")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Chart {
                BarMark(
                    x: .value("Used", Double(limit.coverage - limit.remaining)),
                    y: .value("Category", limit.category)
                )
                .foregroundStyle(.blue.opacity(0.7))
                BarMark(
                    x: .value("Remaining", Double(limit.remaining)),
                    y: .value("Category", limit.category)
                )
                .foregroundStyle(.blue.opacity(0.2))
            }
            .chartXScale(domain: 0...Double(limit.coverage))
            .chartXAxis(.hidden)
            .frame(height: 20)
        }
    }

    private var usageSummarySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Usage Summary")
                .font(.title3.bold())

            summaryRow(title: "Total Coverage", value: "$\(viewModel.coverageSummary.totalCoverage / 1_000_000)M", detail: "\(viewModel.coverageSummary.usedCoverage / 1_000)K used")
            Divider()
            summaryRow(title: "Deductible Progress", value: "$\(viewModel.coverageSummary.deductibleMet)", detail: "of $\(viewModel.coverageSummary.deductible)")
            Divider()
            summaryRow(title: "Out-of-Pocket Progress", value: "$\(viewModel.coverageSummary.outOfPocketMet)", detail: "of $\(viewModel.coverageSummary.outOfPocketMax)")
            Divider()
            summaryRow(title: "Remaining Coverage", value: "$\((viewModel.coverageSummary.totalCoverage - viewModel.coverageSummary.usedCoverage) / 1_000)K", detail: "\(Int(viewModel.coveragePercentage * 100))% utilized")
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func summaryRow(title: String, value: String, detail: String) -> some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline.bold())
            Text(detail)
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
    }

    private var pieData: [PieSlice] {
        guard let policy = viewModel.activePolicy else { return [] }
        return policy.coverageLimits.map { limit in
            PieSlice(
                label: limit.category,
                value: Double(limit.coverage - limit.remaining),
                color: colorForCategory(limit.category)
            )
        }
    }

    private var totalPieValue: Double {
        pieData.map(\.value).reduce(0, +)
    }

    private func colorForCategory(_ category: String) -> Color {
        switch category {
        case "Dental":
            return .purple

        case "Hospitalization":
            return .blue

        case "Outpatient":
            return .green

        case "Prescription":
            return .orange

        case "Vision":
            return .teal

        default:
            return .gray
        }
    }
}

struct PieSlice {
    var label: String
    var value: Double
    var color: Color
}

#Preview {
    NavigationStack {
        CoverageAnalyticsView()
    }
}
