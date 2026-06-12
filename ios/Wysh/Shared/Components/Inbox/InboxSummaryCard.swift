import SwiftUI

struct InboxSummaryCard: View {
    let summary: String
    let actionCount: Int
    let onReview: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.sm) {
            headerRow
            summaryContent
        }
        .padding(DS.Space.lg)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.large))
        .dsShadow()
    }

    private var headerRow: some View {
        HStack(spacing: DS.Space.sm) {
            Image(systemName: "sparkles.rectangle.stack")
                .font(.title3)
                .foregroundStyle(DS.Color.primary)

            Text("Today")
                .font(.headline.weight(.semibold))

            Spacer()

            if actionCount > 0 {
                Text("\(actionCount)")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(width: 22, height: 22)
                    .background(DS.Color.primary)
                    .clipShape(Circle())
            }
        }
    }

    private var summaryContent: some View {
        Group {
            if actionCount > 0 {
                summaryText
                reviewButton
            } else {
                Text("No actions needing attention today")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var summaryText: some View {
        Text(summary)
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .lineSpacing(4)
    }

    private var reviewButton: some View {
        Button(action: onReview) {
            Text("Review")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(DS.Color.primary.gradient)
                .clipShape(RoundedRectangle(cornerRadius: DS.Radius.small))
        }
    }
}
