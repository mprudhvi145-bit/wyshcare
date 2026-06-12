import SwiftUI

struct FamilyInsuranceView: View {
    @Environment(FamilyStore.self)
    private var store

    var body: some View {
        NavigationStack {
            Group {
                if let member = store.activeMember {
                    let plans = store.insurance(for: member.id)
                    if plans.isEmpty {
                        EmptyStateView(
                            icon: "shield.fill",
                            title: "No Insurance Plans",
                            message: "No insurance plans found for \(member.name)."
                        )
                    } else {
                        insuranceList(plans)
                    }
                } else {
                    EmptyStateView(
                        icon: "person.2",
                        title: "Select a Member",
                        message: "Choose a family member to view their insurance."
                    )
                }
            }
            .navigationTitle("Insurance")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private func insuranceList(_ plans: [FamilyInsurancePlan]) -> some View {
        List(plans) { plan in
            VStack(alignment: .leading, spacing: DS.Space.sm) {
                HStack {
                    Image(systemName: "shield.fill")
                        .foregroundStyle(DS.Color.success)

                    Text(plan.provider)
                        .font(.subheadline.weight(.semibold))

                    Spacer()

                    Text(plan.premium)
                        .font(.caption)
                        .foregroundStyle(DS.Color.secondaryLabel)
                }

                HStack {
                    Text("Policy: \(plan.policyNumber)")
                        .font(.caption)
                        .foregroundStyle(DS.Color.secondaryLabel)

                    Spacer()

                    Text(plan.coverage)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(DS.Color.primary)
                }

                HStack {
                    Text("Valid until:")
                        .font(.caption2)
                        .foregroundStyle(DS.Color.secondaryLabel)
                    Text(plan.validUntil, style: .date)
                        .font(.caption2)
                        .foregroundStyle(plan.validUntil < Date() ? .red : DS.Color.secondaryLabel)
                }
            }
            .padding(.vertical, 4)
        }
        .listStyle(.insetGrouped)
    }
}
