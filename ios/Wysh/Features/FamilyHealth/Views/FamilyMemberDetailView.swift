import SwiftUI

struct FamilyMemberDetailView: View {
    var member: FamilyMember

    var body: some View {
        List {
            profileHeader
            if let summary = member.healthSummary {
                healthSummarySection(summary)
            }
            if !member.sharedPrescriptions.isEmpty {
                prescriptionsSection
            }
            if !member.upcomingAppointments.isEmpty {
                appointmentsSection
            }
            if !member.alerts.isEmpty {
                alertsSection
            }
        }
        .navigationTitle(member.name)
        .navigationBarTitleDisplayMode(.inline)
    }

    private var profileHeader: some View {
        Section {
            HStack(spacing: DS.Space.md) {
                ZStack {
                    Circle()
                        .fill(member.healthStatus.color.opacity(0.15))
                        .frame(width: 64, height: 64)
                    Text(member.name.prefix(1))
                        .font(.title.bold())
                        .foregroundStyle(member.healthStatus.color)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(member.name)
                        .font(.title3.bold())
                    Text("\(member.relationship.rawValue) • Age \(member.age)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(member.phone)
                        .font(.caption)
                        .foregroundStyle(.blue)

                    HStack(spacing: 4) {
                        Circle()
                            .fill(member.healthStatus.color)
                            .frame(width: 8, height: 8)
                        Text(member.healthStatus.rawValue)
                            .font(.caption.bold())
                            .foregroundStyle(member.healthStatus.color)
                    }
                }

                Spacer()
            }
            .padding(.vertical, 8)
        }
    }

    private func conditionsList(_ conditions: [String]) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Conditions")
                .font(.caption)
                .foregroundStyle(.secondary)
            ForEach(conditions, id: \.self) { condition in
                Label(condition, systemImage: "stethoscope")
                    .font(.subheadline)
            }
        }
    }

    private func medicationsList(_ medications: [String]) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Medications")
                .font(.caption)
                .foregroundStyle(.secondary)
            ForEach(medications, id: \.self) { med in
                Label(med, systemImage: "pill.fill")
                    .font(.subheadline)
            }
        }
    }

    private func healthSummaryContent(_ summary: HealthSummary) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Blood Type: \(summary.bloodType)")
                .font(.subheadline)

            if !summary.conditions.isEmpty {
                conditionsList(summary.conditions)
            }

            if !summary.medications.isEmpty {
                medicationsList(summary.medications)
            }

            if let checkup = summary.lastCheckup {
                Label(
                    "Last Checkup: \(checkup.formatted(date: .abbreviated, time: .omitted))",
                    systemImage: "calendar"
                )
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func healthSummarySection(_ summary: HealthSummary) -> some View {
        Section("Health Summary") {
            healthSummaryContent(summary)
        }
    }

    private var prescriptionsSection: some View {
        Section("Shared Prescriptions") {
            ForEach(member.sharedPrescriptions) { rx in
                VStack(alignment: .leading, spacing: 3) {
                    Text(rx.name)
                        .font(.subheadline.bold())
                    Text("\(rx.dosage) • \(rx.pharmacy)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if let refill = rx.refillDate {
                        Text("Refill: \(refill.formatted(date: .abbreviated, time: .omitted))")
                            .font(.caption2)
                            .foregroundStyle(.orange)
                    }
                }
                .padding(.vertical, 4)
            }
        }
    }

    private var appointmentsSection: some View {
        Section("Upcoming Appointments") {
            ForEach(member.upcomingAppointments) { appointment in
                VStack(alignment: .leading, spacing: 3) {
                    Text(appointment.type)
                        .font(.subheadline.bold())
                    Text(appointment.provider)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if let date = appointment.date {
                        Text(date.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption2)
                            .foregroundStyle(.blue)
                    }
                }
                .padding(.vertical, 4)
            }
        }
    }

    private var alertsSection: some View {
        Section("Alerts") {
            ForEach(member.alerts) { alert in
                HStack(spacing: DS.Space.sm) {
                    Image(systemName: alertIcon(for: alert.severity))
                        .foregroundStyle(alert.severity.color)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(alert.message)
                            .font(.subheadline)
                        Text(alert.type.rawValue)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }
        }
    }

    private func alertIcon(for severity: AlertSeverity) -> String {
        switch severity {
        case .critical:
            "exclamationmark.octagon.fill"

        case .info:
            "info.circle.fill"

        case .warning:
            "exclamationmark.triangle.fill"
        }
    }
}

#Preview {
    NavigationStack {
        FamilyMemberDetailView(member: FamilyMember(
            id: "FM-1001",
            name: "Sarah Prudhvi",
            phone: "+1 (555) 111-2222",
            relationship: .spouse,
            age: 32,
            healthStatus: .healthy,
            isInvited: true,
            healthSummary: HealthSummary(
                conditions: ["Seasonal allergies"],
                medications: ["Cetirizine 10mg"],
                lastCheckup: Date(),
                bloodType: "O+"
            ),
            sharedPrescriptions: [],
            upcomingAppointments: [],
            alerts: []
        ))
    }
}
