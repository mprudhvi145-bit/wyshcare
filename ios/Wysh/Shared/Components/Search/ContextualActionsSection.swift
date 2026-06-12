import SwiftUI

struct ContextualActionsSection: View {
    let actions: [CommandAction]
    let onTap: (CommandAction) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            sectionHeader
            actionList
        }
        .padding(.vertical, DS.Space.sm)
        .background(DS.Color.primary.opacity(0.04))
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.small))
        .padding(.horizontal, DS.Space.md)
    }

    private var sectionHeader: some View {
        HStack(spacing: DS.Space.sm) {
            Image(systemName: "sparkles")
                .font(.caption)
                .foregroundStyle(DS.Color.primary)

            Text("Smart Suggestions")
                .font(.footnote)
                .fontWeight(.semibold)
                .foregroundStyle(DS.Color.primary)

            Spacer()
        }
        .padding(.horizontal, DS.Space.md)
        .padding(.vertical, 4)
    }

    private var actionList: some View {
        ForEach(actions) { action in
            actionRow(action: action)
                .buttonStyle(.plain)
        }
    }

    private func actionRow(action: CommandAction) -> some View {
        Button {
            onTap(action)
        } label: {
            HStack(spacing: DS.Space.md) {
                Image(systemName: action.icon)
                    .font(.subheadline)
                    .foregroundStyle(action.iconColor)
                    .frame(width: 24, alignment: .center)

                VStack(alignment: .leading, spacing: 1) {
                    Text(action.title)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.primary)

                    Text(action.subtitle)
                        .font(.caption)
                        .foregroundStyle(DS.Color.secondaryLabel)
                }

                Spacer()
            }
            .padding(.vertical, 8)
            .padding(.horizontal, DS.Space.md)
            .contentShape(Rectangle())
        }
    }
}
