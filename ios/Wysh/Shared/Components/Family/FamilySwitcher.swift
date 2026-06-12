import SwiftUI

struct FamilySwitcher: View {
    let members: [FamilyMember]
    let activeMember: FamilyMember?
    let onSwitch: (FamilyMember) -> Void

    @State private var isExpanded = false

    var body: some View {
        VStack(spacing: 0) {
            triggerButton

            if isExpanded {
                memberList
            }
        }
    }

    private var triggerButton: some View {
        Button { withAnimation(.spring(response: 0.3)) { isExpanded.toggle() } } label: {
            HStack(spacing: DS.Space.sm) {
                if let member = activeMember {
                    Text(member.name.prefix(1))
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .frame(width: 28, height: 28)
                        .background(member.healthStatus.color.gradient, in: Circle())

                    Text(member.name)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)

                    Image(systemName: "chevron.down")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(DS.Color.secondaryLabel)
                        .rotationEffect(.degrees(isExpanded ? 180 : 0))
                }
            }
            .padding(.horizontal, DS.Space.md)
            .padding(.vertical, 8)
            .background(DS.Color.card)
            .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        }
        .buttonStyle(.plain)
    }

    private var memberList: some View {
        VStack(spacing: 0) {
            ForEach(members) { member in
                memberRow(member)

                if member.id != members.last?.id {
                    Divider().padding(.leading, DS.Space.md)
                }
            }
        }
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        .dsShadow()
        .transition(.move(edge: .top).combined(with: .opacity))
    }

    private func memberRow(_ member: FamilyMember) -> some View {
        Button {
            onSwitch(member)
            withAnimation(.spring(response: 0.3)) { isExpanded = false }
        } label: {
            HStack(spacing: DS.Space.sm) {
                Text(member.name.prefix(1))
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white)
                    .frame(width: 24, height: 24)
                    .background(member.healthStatus.color.gradient, in: Circle())

                Text(member.name)
                    .font(.subheadline)
                    .foregroundStyle(activeMember?.id == member.id ? DS.Color.primary : .primary)

                Spacer()

                Text(member.relationship.rawValue)
                    .font(.caption)
                    .foregroundStyle(DS.Color.secondaryLabel)
            }
            .padding(.horizontal, DS.Space.md)
            .padding(.vertical, 10)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
