import SwiftUI
import WidgetKit

struct HealthScoreEntry: TimelineEntry {
    let date: Date
    let score: Int
    let level: String
    let steps: Int
    let heartRate: Int
    let sleepHours: Double
    let nextMedication: String?
    let nextMedicationTime: Date?
    let todayAppointments: [String]
    let medicationAdherence: Double
}

struct HealthScoreProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> HealthScoreEntry {
        HealthScoreEntry(
            date: Date(),
            score: 78,
            level: "Good",
            steps: 6_543,
            heartRate: 72,
            sleepHours: 7.2,
            nextMedication: "Lisinopril",
            nextMedicationTime: Date().addingTimeInterval(3_600),
            todayAppointments: ["Dr. Smith - 3:00 PM"],
            medicationAdherence: 0.85
        )
    }

    func snapshot(for configuration: HealthScoreWidgetIntent, in context: Context) async -> HealthScoreEntry {
        placeholder(in: context)
    }

    func timeline(for configuration: HealthScoreWidgetIntent, in context: Context) async -> Timeline<HealthScoreEntry> {
        let entry = HealthScoreEntry(
            date: Date(),
            score: 78,
            level: "Good",
            steps: 6_543,
            heartRate: 72,
            sleepHours: 7.2,
            nextMedication: "Lisinopril",
            nextMedicationTime: Date().addingTimeInterval(3_600),
            todayAppointments: ["Dr. Smith - 3:00 PM"],
            medicationAdherence: 0.85
        )
        return Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(900)))
    }
}

struct HealthScoreWidgetEntryView: View {
    var entry: HealthScoreEntry
    @Environment(\.widgetFamily)
    var family

    var body: some View {
        switch family {
        case .systemSmall:
            smallView

        case .systemMedium:
            mediumView

        case .systemLarge:
            largeView

        default:
            smallView
        }
    }

    private var smallView: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 6)
                Circle()
                    .trim(from: 0, to: CGFloat(entry.score) / 100)
                    .stroke(
                        AngularGradient(
                            colors: [.green, .yellow, .orange, .red],
                            center: .center,
                            startAngle: .degrees(-90),
                            endAngle: .degrees(270)
                        ),
                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 0) {
                    Text("\(entry.score)")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                    Text(entry.level)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .frame(width: 80, height: 80)
            Text("Health Score")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .containerBackground(.background, for: .widget)
    }

    private var mediumView: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 8)
                Circle()
                    .trim(from: 0, to: CGFloat(entry.score) / 100)
                    .stroke(
                        AngularGradient(
                            colors: [.green, .yellow, .orange, .red],
                            center: .center,
                            startAngle: .degrees(-90),
                            endAngle: .degrees(270)
                        ),
                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 0) {
                    Text("\(entry.score)")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                    Text(entry.level)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .frame(width: 90, height: 90)

            mediumStats
            Spacer()
        }
        .padding()
        .containerBackground(.background, for: .widget)
    }

    private var mediumStats: some View {
        VStack(alignment: .leading, spacing: 4) {
            mediumSimpleStats
            if let med = entry.nextMedication, let time = entry.nextMedicationTime {
                HStack {
                    Image(systemName: "pills.fill")
                        .font(.caption)
                        .foregroundColor(.blue)
                    Text("\(med) @ \(time, style: .time)")
                        .font(.caption)
                }
            }
            if let apt = entry.todayAppointments.first {
                HStack {
                    Image(systemName: "calendar")
                        .font(.caption)
                        .foregroundColor(.orange)
                    Text(apt)
                        .font(.caption)
                }
            }
        }
    }

    private var mediumSimpleStats: some View {
        Group {
            HStack {
                Image(systemName: "figure.walk")
                    .font(.caption)
                Text("\(entry.steps) steps")
                    .font(.caption)
            }
            HStack {
                Image(systemName: "heart.fill")
                    .font(.caption)
                    .foregroundColor(.red)
                Text("\(entry.heartRate) bpm")
                    .font(.caption)
            }
            HStack {
                Image(systemName: "moon.fill")
                    .font(.caption)
                    .foregroundColor(.indigo)
                Text(String(format: "%.1f hrs", entry.sleepHours))
                    .font(.caption)
            }
        }
    }

    private var largeView: some View {
        VStack(spacing: 12) {
            largeHeader
            Divider()
            metricsRow
            Divider()
            if let med = entry.nextMedication, let time = entry.nextMedicationTime {
                medicationRow(med: med, time: time)
            }
            if !entry.todayAppointments.isEmpty {
                appointmentsSection
            }
        }
        .padding()
        .containerBackground(.background, for: .widget)
    }

    private var largeHeader: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Health Dashboard")
                    .font(.headline)
                Text("Today")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
            largeScoreCircle
        }
    }

    private var largeScoreCircle: some View {
        ZStack {
            Circle()
                .stroke(Color.gray.opacity(0.2), lineWidth: 6)
            Circle()
                .trim(from: 0, to: CGFloat(entry.score) / 100)
                .stroke(
                    AngularGradient(
                        colors: [.green, .yellow, .orange, .red],
                        center: .center,
                        startAngle: .degrees(-90),
                        endAngle: .degrees(270)
                    ),
                    style: StrokeStyle(lineWidth: 6, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
            VStack(spacing: 0) {
                Text("\(entry.score)")
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                Text(entry.level)
                    .font(.system(size: 8))
                    .foregroundColor(.secondary)
            }
        }
        .frame(width: 60, height: 60)
    }

    private var metricsRow: some View {
        HStack {
            metricTile(icon: "figure.walk", label: "Steps", value: "\(entry.steps)")
            metricTile(icon: "heart.fill", label: "Heart Rate", value: "\(entry.heartRate) bpm", color: .red)
            metricTile(icon: "moon.fill", label: "Sleep", value: String(format: "%.1f hrs", entry.sleepHours), color: .indigo)
            metricTile(icon: "pills.fill", label: "Adherence", value: "\(Int(entry.medicationAdherence * 100))%", color: .blue)
        }
    }

    private func medicationRow(med: String, time: Date) -> some View {
        HStack {
            Image(systemName: "pills.fill")
                .foregroundColor(.blue)
            VStack(alignment: .leading, spacing: 1) {
                Text("Next Medication")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("\(med) at \(time, style: .time)")
                    .font(.subheadline)
            }
            Spacer()
        }
    }

    private var appointmentsSection: some View {
        HStack {
            Image(systemName: "calendar")
                .foregroundColor(.orange)
            VStack(alignment: .leading, spacing: 1) {
                Text("Today's Appointments")
                    .font(.caption)
                    .foregroundColor(.secondary)
                ForEach(entry.todayAppointments, id: \.self) { apt in
                    Text(apt)
                        .font(.subheadline)
                }
            }
            Spacer()
        }
    }

    private func metricTile(icon: String, label: String, value: String, color: Color = .green) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)
            Text(value)
                .font(.caption)
                .fontWeight(.semibold)
            Text(label)
                .font(.system(size: 8))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct HealthScoreWidget: Widget {
    let kind: String = "HealthScoreWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: HealthScoreWidgetIntent.self,
            provider: HealthScoreProvider()
        ) { entry in
            HealthScoreWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Health Score")
        .description("View your health score and key metrics.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
