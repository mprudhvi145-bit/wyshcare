import SwiftUI

struct FamilyPrescriptionsView: View {
    @Environment(FamilyStore.self)
    private var store

    var body: some View {
        NavigationStack {
            Group {
                if let member = store.activeMember {
                    if member.sharedPrescriptions.isEmpty {
                        EmptyStateView(
                            icon: "pills.fill",
                            title: "No Prescriptions",
                            message: "No active prescriptions for \(member.name)."
                        )
                    } else {
                        prescriptionList(member)
                    }
                } else {
                    EmptyStateView(
                        icon: "person.2",
                        title: "Select a Member",
                        message: "Choose a family member to view their prescriptions."
                    )
                }
            }
            .navigationTitle("Prescriptions")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private func prescriptionList(_ member: FamilyMember) -> some View {
        List(member.sharedPrescriptions) { rx in
            HStack(spacing: DS.Space.md) {
                Image(systemName: "pills.fill")
                    .font(.title3)
                    .foregroundStyle(.purple)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: 2) {
                    Text(rx.name)
                        .font(.subheadline.weight(.medium))
                    Text(rx.dosage)
                        .font(.caption)
                        .foregroundStyle(DS.Color.secondaryLabel)
                    Text(rx.pharmacy)
                        .font(.caption2)
                        .foregroundStyle(DS.Color.secondaryLabel)
                }

                Spacer()

                if let refill = rx.refillDate {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Refill")
                            .font(.caption2)
                            .foregroundStyle(DS.Color.secondaryLabel)
                        Text(refill, style: .date)
                            .font(.caption)
                            .foregroundStyle(refill < Date() ? .red : DS.Color.primary)
                    }
                }
            }
            .padding(.vertical, 4)
        }
        .listStyle(.insetGrouped)
    }
}
