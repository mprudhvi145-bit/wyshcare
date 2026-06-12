import SwiftUI

struct FamilyHubView: View {
    @Environment(FamilyStore.self)
    private var store

    var body: some View {
        NavigationStack {
            hubContent
                .navigationTitle("Family Hub")
                .navigationBarTitleDisplayMode(.large)
        }
    }

    private var hubContent: some View {
        List {
            if let member = store.activeMember {
                summarySection(member)
                alertsSection(member)
                appointmentsSection(member)
                prescriptionsSection(member)
            } else {
                ContentUnavailableView(
                    "Select a Family Member",
                    systemImage: "person.2",
                    description: Text("Choose a family member from the switcher above.")
                )
            }
        }
        .listStyle(.insetGrouped)
    }

    private func summarySection(_ member: FamilyMember) -> some View {
        Section("Summary") {
            FamilyMemberSummaryCard(member: member)
        }
    }

    private func alertsSection(_ member: FamilyMember) -> some View {
        Section("Alerts") {
            if member.alerts.isEmpty {
                emptyRow("No alerts")
            } else {
                ForEach(member.alerts) { alert in
                    alertRow(alert)
                }
            }
        }
    }

    private func appointmentsSection(_ member: FamilyMember) -> some View {
        Section("Upcoming Appointments") {
            if member.upcomingAppointments.isEmpty {
                emptyRow("No upcoming appointments")
            } else {
                ForEach(member.upcomingAppointments) { appointment in
                    appointmentRow(appointment)
                }
            }
        }
    }

    private func prescriptionsSection(_ member: FamilyMember) -> some View {
        Section("Prescriptions") {
            if member.sharedPrescriptions.isEmpty {
                emptyRow("No active prescriptions")
            } else {
                ForEach(member.sharedPrescriptions) { rx in
                    prescriptionRow(rx)
                }
            }
        }
    }

    private func alertRow(_ alert: AlertItem) -> some View {
        HStack(spacing: DS.Space.sm) {
            Circle()
                .fill(alert.severity.color)
                .frame(width: 8, height: 8)

            VStack(alignment: .leading, spacing: 2) {
                Text(alert.message)
                    .font(.subheadline)
                Text(alert.type.rawValue)
                    .font(.caption)
                    .foregroundStyle(DS.Color.secondaryLabel)
            }
        }
        .padding(.vertical, 4)
    }

    private func appointmentRow(_ appointment: FamilyAppointment) -> some View {
        HStack(spacing: DS.Space.sm) {
            Image(systemName: "calendar")
                .foregroundStyle(DS.Color.primary)

            VStack(alignment: .leading, spacing: 2) {
                Text(appointment.type)
                    .font(.subheadline.weight(.medium))
                Text(appointment.provider)
                    .font(.caption)
                    .foregroundStyle(DS.Color.secondaryLabel)
            }

            Spacer()

            if let date = appointment.date {
                Text(date, style: .date)
                    .font(.caption)
                    .foregroundStyle(DS.Color.secondaryLabel)
            }
        }
        .padding(.vertical, 4)
    }

    private func prescriptionRow(_ rx: SharedPrescription) -> some View {
        HStack(spacing: DS.Space.sm) {
            Image(systemName: "pills.fill")
                .foregroundStyle(.purple)

            VStack(alignment: .leading, spacing: 2) {
                Text(rx.name)
                    .font(.subheadline.weight(.medium))
                Text("\(rx.dosage) · \(rx.pharmacy)")
                    .font(.caption)
                    .foregroundStyle(DS.Color.secondaryLabel)
            }

            Spacer()

            if let refill = rx.refillDate {
                Text("Refill: \(refill, style: .date)")
                    .font(.caption2)
                    .foregroundStyle(refill < Date() ? .red : DS.Color.secondaryLabel)
            }
        }
        .padding(.vertical, 4)
    }

    private func emptyRow(_ text: String) -> some View {
        Text(text)
            .font(.subheadline)
            .foregroundStyle(DS.Color.secondaryLabel)
    }
}

struct FamilyMemberSummaryCard: View {
    let member: FamilyMember

    var body: some View {
        HStack(spacing: DS.Space.md) {
            memberAvatar
            memberDetails
            Spacer()
            statusDot
        }
        .padding(.vertical, 4)
    }

    private var memberAvatar: some View {
        ZStack {
            Circle()
                .fill(member.healthStatus.color.opacity(0.15))
                .frame(width: 56, height: 56)

            Text(member.name.prefix(1))
                .font(.title.weight(.semibold))
                .foregroundStyle(member.healthStatus.color)
        }
    }

    private var memberDetails: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(member.name)
                .font(.title3.weight(.semibold))

            Text("\(member.relationship.rawValue) · Age \(member.age)")
                .font(.subheadline)
                .foregroundStyle(DS.Color.secondaryLabel)

            if let summary = member.healthSummary {
                HStack(spacing: 4) {
                    Text("Blood: \(summary.bloodType)")
                        .font(.caption)
                        .foregroundStyle(DS.Color.secondaryLabel)

                    if !summary.conditions.isEmpty {
                        Text("·")
                        Text("\(summary.conditions.count) conditions")
                            .font(.caption)
                            .foregroundStyle(DS.Color.secondaryLabel)
                    }
                }
            }
        }
    }

    private var statusDot: some View {
        Circle()
            .fill(member.healthStatus.color)
            .frame(width: 12, height: 12)
            .overlay(
                Circle()
                    .stroke(member.healthStatus.color.opacity(0.3), lineWidth: 4)
            )
    }
}
