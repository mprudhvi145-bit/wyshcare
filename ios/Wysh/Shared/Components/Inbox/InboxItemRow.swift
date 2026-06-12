import SwiftUI

struct InboxItemRow: View {
    let item: InboxItem
    let onTap: (InboxItem) -> Void
    let onAction: (InboxItem) -> Void

    var body: some View {
        Button(action: { onTap(item) }, label: rowContent)
            .buttonStyle(.plain)
    }

    private func rowContent() -> some View {
        HStack(alignment: .top, spacing: DS.Space.md) {
            VStack(alignment: .leading, spacing: 1) {
                headerRow
                titleText
                subtitleText
                actionButton
            }

            if !item.isRead {
                unreadDot
            }
        }
        .padding(.vertical, 10)
        .padding(.horizontal, DS.Space.md)
        .contentShape(Rectangle())
    }

    private var headerRow: some View {
        HStack(spacing: DS.Space.sm) {
            Image(systemName: item.category.icon)
                .font(.caption)
                .foregroundStyle(item.category.color)

            PriorityBadge(priority: item.priority)

            Spacer()

            Text(timeString(from: item.createdAt))
                .font(.caption2)
                .foregroundStyle(DS.Color.secondaryLabel)
        }
    }

    private var titleText: some View {
        Text(item.title)
            .font(.subheadline.weight(.medium))
            .foregroundStyle(item.isRead ? DS.Color.secondaryLabel : .primary)
            .lineLimit(2)
    }

    private var subtitleText: some View {
        Text(item.subtitle)
            .font(.caption)
            .foregroundStyle(DS.Color.secondaryLabel)
            .lineLimit(2)
    }

    private var actionButton: some View {
        Group {
            if let actionTitle = item.actionTitle {
                Button { onAction(item) } label: {
                    Text(actionTitle)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(DS.Color.primary)
                }
                .padding(.top, 4)
            }
        }
    }

    private var unreadDot: some View {
        Circle()
            .fill(DS.Color.primary)
            .frame(width: 8, height: 8)
            .padding(.top, 6)
    }

    private func timeString(from date: Date) -> String {
        let cal = Calendar.current
        if cal.isDateInToday(date) {
            let formatter = DateFormatter()
            formatter.dateFormat = "h:mm a"
            return formatter.string(from: date)
        }
        if cal.isDateInYesterday(date) {
            return "Yesterday"
        }
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: date)
    }
}
