import SwiftUI

struct RecentActionsSection: View {
    let actions: [CommandAction]
    let onTap: (CommandAction) -> Void
    let onClear: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            HStack {
                Text("Recent")
                    .font(.footnote)
                    .fontWeight(.semibold)
                    .foregroundStyle(DS.Color.secondaryLabel)

                Spacer()

                Button("Clear", action: onClear)
                    .font(.caption)
                    .foregroundStyle(DS.Color.primary)
            }
            .padding(.horizontal, DS.Space.md)

            ForEach(actions) { action in
                Button {
                    onTap(action)
                } label: {
                    HStack(spacing: DS.Space.sm) {
                        Image(systemName: "clock.arrow.circlepath")
                            .font(.caption)
                            .foregroundStyle(DS.Color.secondaryLabel)

                        Text(action.title)
                            .font(.subheadline)
                            .foregroundStyle(.primary)

                        Spacer()
                    }
                    .padding(.vertical, 6)
                    .padding(.horizontal, DS.Space.md)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
    }
}
