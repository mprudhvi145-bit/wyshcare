import SwiftUI

struct FamilyHealthView: View {
    @State private var viewModel = FamilyViewModel()

    var body: some View {
        NavigationStack {
            List {
                ForEach(viewModel.members) { member in
                    NavigationLink(destination: FamilyMemberDetailView(member: member)) {
                        FamilyMemberCard(member: member)
                    }
                }
                .onDelete { indexSet in
                    withAnimation { viewModel.members.remove(atOffsets: indexSet) }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Family Health")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink(destination: AddFamilyMemberView()) {
                        Image(systemName: "person.badge.plus")
                    }
                }
            }
            .overlay {
                if viewModel.members.isEmpty {
                    ContentUnavailableView(
                        "No Family Members",
                        systemImage: "person.2.slash",
                        description: Text("Add family members to track their health together.")
                    )
                }
            }
        }
    }
}

struct FamilyMemberCard: View {
    var member: FamilyMember

    var body: some View {
        HStack(spacing: DS.Space.md) {
            avatarView
            infoView
            Spacer()
            healthIndicator(member.healthStatus)
        }
        .padding(.vertical, 4)
    }

    private var avatarView: some View {
        ZStack {
            Circle()
                .fill(member.healthStatus.color.opacity(0.15))
                .frame(width: 48, height: 48)
            Text(member.name.prefix(1))
                .font(.title2.bold())
                .foregroundStyle(member.healthStatus.color)
        }
    }

    private var infoView: some View {
        VStack(alignment: .leading, spacing: 3) {
            nameRow
            Text(member.relationship.rawValue)
                .font(.caption)
                .foregroundStyle(.secondary)
            alertsRow
        }
    }

    private var nameRow: some View {
        HStack {
            Text(member.name)
                .font(.body)
            if !member.isInvited {
                Image(systemName: "clock")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
        }
    }

    private var alertsRow: some View {
        HStack {
            Text("Age \(member.age)")
                .font(.caption2)
                .foregroundStyle(.tertiary)
            if !member.alerts.isEmpty {
                Circle()
                    .fill(member.alerts.contains { $0.severity == .critical } ? Color.red : .orange)
                    .frame(width: 6, height: 6)
                Text("\(member.alerts.count) alert\(member.alerts.count > 1 ? "s" : "")")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
        }
    }

    private func healthIndicator(_ status: HealthStatus) -> some View {
        Circle()
            .fill(status.color)
            .frame(width: 10, height: 10)
            .overlay(
                Circle()
                    .stroke(status.color.opacity(0.3), lineWidth: 4)
            )
    }
}

#Preview {
    FamilyHealthView()
}
