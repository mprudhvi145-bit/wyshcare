import SwiftUI
import WidgetKit

struct MedicationInfo {
    let name: String
    let time: Date
    let dosage: String
}

struct MedicationEntry: TimelineEntry {
    let date: Date
    let medications: [MedicationInfo]
}

struct MedicationProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> MedicationEntry {
        MedicationEntry(
            date: Date(),
            medications: [
                MedicationInfo(name: "Lisinopril", time: Date().addingTimeInterval(3_600), dosage: "10mg"),
                MedicationInfo(name: "Metformin", time: Date().addingTimeInterval(7_200), dosage: "500mg")
            ]
        )
    }

    func snapshot(for configuration: MedicationWidgetIntent, in context: Context) async -> MedicationEntry {
        placeholder(in: context)
    }

    func timeline(for configuration: MedicationWidgetIntent, in context: Context) async -> Timeline<MedicationEntry> {
        let entry = MedicationEntry(
            date: Date(),
            medications: [
                MedicationInfo(name: "Lisinopril", time: Date().addingTimeInterval(3_600), dosage: "10mg"),
                MedicationInfo(name: "Metformin", time: Date().addingTimeInterval(7_200), dosage: "500mg")
            ]
        )
        return Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(1_800)))
    }
}

struct MedicationReminderWidgetEntryView: View {
    var entry: MedicationEntry

    @ViewBuilder private var emptyMedicationsView: some View {
        VStack(spacing: 4) {
            Image(systemName: "checkmark.circle.fill")
                .font(.title2)
                .foregroundColor(.green)
            Text("All caught up!")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
    }

    @ViewBuilder
    private func medicationRow(for med: MedicationInfo) -> some View {
        HStack {
            Circle()
                .fill(Color.blue)
                .frame(width: 8, height: 8)
            VStack(alignment: .leading, spacing: 1) {
                Text(med.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text("\(med.dosage) - \(med.time, style: .time)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Medications", systemImage: "pills.fill")
                .font(.headline)
                .foregroundColor(.blue)

            if entry.medications.isEmpty {
                emptyMedicationsView
            } else {
                ForEach(entry.medications.prefix(3), id: \.name) { med in
                    medicationRow(for: med)
                }
            }
        }
        .padding()
        .containerBackground(.background, for: .widget)
    }
}

struct MedicationReminderWidget: Widget {
    let kind: String = "MedicationReminderWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: MedicationWidgetIntent.self,
            provider: MedicationProvider()
        ) { entry in
            MedicationReminderWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Medication Reminder")
        .description("View upcoming medications.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
