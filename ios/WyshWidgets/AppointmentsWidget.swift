import SwiftUI
import WidgetKit

struct AppointmentInfo {
    let title: String
    let time: Date
    let location: String
    let type: String
}

struct AppointmentsEntry: TimelineEntry {
    let date: Date
    let appointments: [AppointmentInfo]
}

struct AppointmentsProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> AppointmentsEntry {
        AppointmentsEntry(
            date: Date(),
            appointments: [
                AppointmentInfo(title: "Dr. Smith Checkup", time: Date().addingTimeInterval(7_200), location: "Room 210", type: "In-Person"),
                AppointmentInfo(title: "Physical Therapy", time: Date().addingTimeInterval(14_400), location: "Wellness Center", type: "Virtual")
            ]
        )
    }

    func snapshot(for configuration: AppointmentsWidgetIntent, in context: Context) async -> AppointmentsEntry {
        placeholder(in: context)
    }

    func timeline(for configuration: AppointmentsWidgetIntent, in context: Context) async -> Timeline<AppointmentsEntry> {
        let entry = AppointmentsEntry(
            date: Date(),
            appointments: [
                AppointmentInfo(title: "Dr. Smith Checkup", time: Date().addingTimeInterval(7_200), location: "Room 210", type: "In-Person"),
                AppointmentInfo(title: "Physical Therapy", time: Date().addingTimeInterval(14_400), location: "Wellness Center", type: "Virtual")
            ]
        )
        return Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(1_800)))
    }
}

struct AppointmentsWidgetEntryView: View {
    var entry: AppointmentsEntry

    @ViewBuilder private var emptyAppointmentsView: some View {
        VStack(spacing: 4) {
            Image(systemName: "checkmark.circle.fill")
                .font(.title2)
                .foregroundColor(.green)
            Text("No appointments today")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
    }

    @ViewBuilder
    private func appointmentRow(for apt: AppointmentInfo) -> some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 6)
                .fill(apt.type == "Virtual" ? Color.blue : Color.orange)
                .frame(width: 4)
            VStack(alignment: .leading, spacing: 1) {
                Text(apt.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                HStack {
                    Text(apt.time, style: .time)
                        .font(.caption)
                    Text(apt.location)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            Spacer()
            Text(apt.type)
                .font(.system(size: 8))
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(apt.type == "Virtual" ? Color.blue.opacity(0.1) : Color.orange.opacity(0.1))
                .cornerRadius(4)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Today's Appointments", systemImage: "calendar")
                .font(.headline)
                .foregroundColor(.orange)

            if entry.appointments.isEmpty {
                emptyAppointmentsView
            } else {
                ForEach(entry.appointments.prefix(3), id: \.title) { apt in
                    appointmentRow(for: apt)
                }
            }
        }
        .padding()
        .containerBackground(.background, for: .widget)
    }
}

struct AppointmentsWidget: Widget {
    let kind: String = "AppointmentsWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: AppointmentsWidgetIntent.self,
            provider: AppointmentsProvider()
        ) { entry in
            AppointmentsWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Appointments")
        .description("View today's appointments.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
