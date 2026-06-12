import SwiftUI

struct CaregiverPermissionsView: View {
    @Environment(FamilyStore.self)
    private var store

    var body: some View {
        NavigationStack {
            caregiverContent
                .listStyle(.insetGrouped)
                .navigationTitle("Caregivers")
                .navigationBarTitleDisplayMode(.large)
        }
    }

    private var caregiverContent: some View {
        List {
            if store.caregiverPermissions.isEmpty {
                Section {
                    Text("No caregivers added yet.")
                        .font(.subheadline)
                        .foregroundStyle(DS.Color.secondaryLabel)
                }
            } else {
                Section("Active Caregivers") {
                    let active = store.caregiverPermissions.filter { $0.isActive }
                    if active.isEmpty {
                        emptyRow("No active caregivers")
                    } else {
                        ForEach(active) { caregiver in
                            caregiverRow(caregiver)
                        }
                    }
                }

                Section("Pending Invitations") {
                    let pending = store.caregiverPermissions.filter { !$0.isActive }
                    if pending.isEmpty {
                        emptyRow("No pending invitations")
                    } else {
                        ForEach(pending) { caregiver in
                            caregiverRow(caregiver)
                        }
                    }
                }
            }
        }
    }

    private func emptyRow(_ text: String) -> some View {
        Text(text)
            .font(.subheadline)
            .foregroundStyle(DS.Color.secondaryLabel)
    }

    private func caregiverRow(_ caregiver: CaregiverPermission) -> some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            HStack {
                Circle()
                    .fill(DS.Color.primary.opacity(0.15))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Text(caregiver.name.prefix(1))
                            .font(.body.weight(.semibold))
                            .foregroundStyle(DS.Color.primary)
                    )

                VStack(alignment: .leading, spacing: 2) {
                    Text(caregiver.name)
                        .font(.subheadline.weight(.medium))
                    Text(caregiver.phone)
                        .font(.caption)
                        .foregroundStyle(DS.Color.secondaryLabel)
                }

                Spacer()

                statusBadge(caregiver.isActive)
            }

            Text("Permissions: \(caregiver.permissions.joined(separator: ", "))")
                .font(.caption)
                .foregroundStyle(DS.Color.secondaryLabel)
                .padding(.leading, 48)
        }
        .padding(.vertical, 4)
    }

    private func statusBadge(_ isActive: Bool) -> some View {
        Group {
            if isActive {
                Text("Active")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(DS.Color.success)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(DS.Color.success.opacity(0.1))
                    .clipShape(Capsule())
            } else {
                Text("Pending")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(DS.Color.warning)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(DS.Color.warning.opacity(0.1))
                    .clipShape(Capsule())
            }
        }
    }
}
