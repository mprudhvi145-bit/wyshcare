import SwiftUI

struct FamilyClaimsView: View {
    @Environment(FamilyStore.self)
    private var store

    var body: some View {
        NavigationStack {
            Group {
                if let member = store.activeMember {
                    let memberClaims = store.claims(for: member.id)
                    if memberClaims.isEmpty {
                        EmptyStateView(
                            icon: "doc.text.fill",
                            title: "No Claims",
                            message: "No insurance claims for \(member.name)."
                        )
                    } else {
                        claimsList(memberClaims)
                    }
                } else {
                    EmptyStateView(
                        icon: "person.2",
                        title: "Select a Member",
                        message: "Choose a family member to view their claims."
                    )
                }
            }
            .navigationTitle("Claims")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private func claimsList(_ claims: [FamilyClaim]) -> some View {
        List(claims.sorted { $0.date > $1.date }) { claim in
            HStack(spacing: DS.Space.md) {
                Image(systemName: statusIcon(claim.status))
                    .font(.title3)
                    .foregroundStyle(statusColor(claim.status))
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: 2) {
                    Text(claim.description)
                        .font(.subheadline.weight(.medium))
                    Text(claim.claimNumber)
                        .font(.caption)
                        .foregroundStyle(DS.Color.secondaryLabel)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(claim.amount)
                        .font(.subheadline.weight(.semibold))
                    Text(claim.status)
                        .font(.caption2)
                        .foregroundStyle(statusColor(claim.status))
                }
            }
            .padding(.vertical, 4)
        }
        .listStyle(.insetGrouped)
    }

    private func statusIcon(_ status: String) -> String {
        switch status {
        case "Approved":
            "checkmark.circle.fill"

        case "Processing":
            "arrow.triangle.2.circlepath"

        case "Pending":
            "clock.fill"

        default:
            "doc.text.fill"
        }
    }

    private func statusColor(_ status: String) -> Color {
        switch status {
        case "Approved":
            DS.Color.success

        case "Processing":
            DS.Color.warning

        case "Pending":
            .orange

        default:
            DS.Color.secondaryLabel
        }
    }
}
