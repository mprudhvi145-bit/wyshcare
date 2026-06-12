import SwiftUI

struct CommandActionCard: View {
    let action: CommandAction
    let onTap: (CommandAction) -> Void

    var body: some View {
        Button {
            onTap(action)
        } label: {
            HStack(spacing: DS.Space.md) {
                ZStack {
                    RoundedRectangle(cornerRadius: DS.Radius.small - 2)
                        .fill(action.iconColor.opacity(0.12))
                        .frame(width: 36, height: 36)

                    Image(systemName: action.icon)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(action.iconColor)
                }

                VStack(alignment: .leading, spacing: 1) {
                    Text(action.title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(.primary)

                    if !action.subtitle.isEmpty {
                        Text(action.subtitle)
                            .font(.caption)
                            .foregroundStyle(DS.Color.secondaryLabel)
                    }
                }

                Spacer()

                Image(systemName: "chevron.forward")
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(DS.Color.secondaryLabel)
            }
            .padding(.vertical, 10)
            .padding(.horizontal, DS.Space.md)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
