import SwiftUI
import WidgetKit

struct InsuranceEntry: TimelineEntry {
    let date: Date
    let provider: String
    let policyNumber: String
    let coveragePercentage: Double
    let deductibleRemaining: Double
    let isActive: Bool
}

struct InsuranceProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> InsuranceEntry {
        InsuranceEntry(
            date: Date(),
            provider: "United Health",
            policyNumber: "POL-12345",
            coveragePercentage: 0.80,
            deductibleRemaining: 1_500,
            isActive: true
        )
    }

    func snapshot(for configuration: InsuranceWidgetIntent, in context: Context) async -> InsuranceEntry {
        placeholder(in: context)
    }

    func timeline(for configuration: InsuranceWidgetIntent, in context: Context) async -> Timeline<InsuranceEntry> {
        let entry = InsuranceEntry(
            date: Date(),
            provider: "United Health",
            policyNumber: "POL-12345",
            coveragePercentage: 0.80,
            deductibleRemaining: 1_500,
            isActive: true
        )
        return Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3_600)))
    }
}

struct InsuranceStatusWidgetEntryView: View {
    var entry: InsuranceEntry

    @ViewBuilder private var activePolicySection: some View {
        HStack {
            Circle()
                .fill(Color.green)
                .frame(width: 8, height: 8)
            Text("Active")
                .font(.caption)
                .foregroundColor(.green)
        }

        VStack(alignment: .leading, spacing: 4) {
            Text(entry.provider)
                .font(.subheadline)
                .fontWeight(.semibold)
            Text(entry.policyNumber)
                .font(.caption)
                .foregroundColor(.secondary)
        }

        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Coverage")
                    .font(.system(size: 9))
                    .foregroundColor(.secondary)
                Text("\(Int(entry.coveragePercentage * 100))%")
                    .font(.subheadline)
                    .fontWeight(.bold)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("Deductible Left")
                    .font(.system(size: 9))
                    .foregroundColor(.secondary)
                Text("$\(Int(entry.deductibleRemaining))")
                    .font(.subheadline)
                    .fontWeight(.bold)
            }
        }

        coverageProgressBar
    }

    @ViewBuilder private var coverageProgressBar: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.gray.opacity(0.2))
                    .frame(height: 6)
                Capsule()
                    .fill(Color.green)
                    .frame(width: geo.size.width * entry.coveragePercentage, height: 6)
            }
        }
        .frame(height: 6)
    }

    @ViewBuilder private var inactivePolicySection: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.red)
            Text("No active policy")
                .font(.subheadline)
                .foregroundColor(.red)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Insurance", systemImage: "shield.fill")
                .font(.headline)
                .foregroundColor(.green)

            if entry.isActive {
                activePolicySection
            } else {
                inactivePolicySection
            }
        }
        .padding()
        .containerBackground(.background, for: .widget)
    }
}

struct InsuranceStatusWidget: Widget {
    let kind: String = "InsuranceStatusWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: InsuranceWidgetIntent.self,
            provider: InsuranceProvider()
        ) { entry in
            InsuranceStatusWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Insurance Status")
        .description("View your insurance coverage info.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
