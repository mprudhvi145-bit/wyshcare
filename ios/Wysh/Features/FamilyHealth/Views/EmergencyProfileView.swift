import SwiftUI

struct EmergencyProfileView: View {
    @Environment(FamilyStore.self)
    private var store

    var body: some View {
        NavigationStack {
            Group {
                if let member = store.activeMember {
                    if let contact = store.emergencyContacts[member.id] {
                        emergencyCard(contact)
                    } else {
                        EmptyStateView(
                            icon: "cross.case.fill",
                            title: "No Emergency Profile",
                            message: "No emergency contact info for \(member.name)."
                        )
                    }
                } else {
                    selectMember
                }
            }
            .navigationTitle("Emergency Profile")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private func emergencyCard(_ contact: EmergencyContact) -> some View {
        List {
            Section {
                VStack(spacing: DS.Space.md) {
                    Image(systemName: "cross.case.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(.red)

                    VStack(spacing: 4) {
                        Text(contact.name)
                            .font(.title2.weight(.bold))
                        Text(contact.relationship)
                            .font(.subheadline)
                            .foregroundStyle(DS.Color.secondaryLabel)
                    }

                    Label(contact.phone, systemImage: "phone.fill")
                        .font(.body)
                        .padding(.horizontal, DS.Space.lg)
                        .padding(.vertical, DS.Space.sm)
                        .background(DS.Color.primary.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, DS.Space.md)
            }

            Section("Medical Info") {
                detailRow("Blood Type", contact.bloodType)
                detailRow("Allergies", contact.allergies.isEmpty ? "None" : contact.allergies.joined(separator: ", "))
                detailRow("Conditions", contact.conditions.isEmpty ? "None" : contact.conditions.joined(separator: ", "))
                detailRow("Medications", contact.medications.isEmpty ? "None" : contact.medications.joined(separator: ", "))
            }
        }
        .listStyle(.insetGrouped)
    }

    private func detailRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(DS.Color.secondaryLabel)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.medium))
                .multilineTextAlignment(.trailing)
        }
        .padding(.vertical, 2)
    }

    private var selectMember: some View {
        EmptyStateView(
            icon: "person.2",
            title: "Select a Member",
            message: "Choose a family member to view their emergency profile."
        )
    }
}
