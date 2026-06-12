import SwiftUI

struct InsightCardView: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            Spacer(minLength: 60)
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 6) {
                    Image(systemName: "lightbulb.fill")
                        .font(.caption)
                        .foregroundStyle(.yellow)
                    Text("Health Insight")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(.secondary)
                }

                Text(message.text)
                    .font(.subheadline)

                if !message.insightItems.isEmpty {
                    Divider()
                    ForEach(message.insightItems, id: \.id) { item in
                        insightRow(item)
                    }
                }

                actionButtonsSection
            }
            .padding()
            .background {
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color(.systemGray5))
            }
        }
    }

    @ViewBuilder private var actionButtonsSection: some View {
        if !message.actionButtons.isEmpty {
            Divider()
            VStack(spacing: 6) {
                ForEach(message.actionButtons, id: \.id) { button in
                    Button {
                        button.action()
                    } label: {
                        Label(button.title, systemImage: button.icon)
                            .font(.subheadline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))
                    }
                }
            }
        }
    }

    private func insightRow(_ item: InsightItem) -> some View {
        HStack(spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(item.type.color.opacity(0.15))
                    .frame(width: 32, height: 32)
                Image(systemName: item.type.icon)
                    .font(.caption)
                    .foregroundStyle(item.type.color)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(item.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(item.subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

enum InsightItemType {
    case appointment, medication, recommendation, risk

    var icon: String {
        switch self {
        case .appointment:
            return "calendar"

        case .medication:
            return "pill"

        case .recommendation:
            return "checkmark.shield"

        case .risk:
            return "exclamationmark.triangle"
        }
    }

    var color: Color {
        switch self {
        case .appointment:
            return .blue

        case .medication:
            return .purple

        case .recommendation:
            return .green

        case .risk:
            return .orange
        }
    }
}

struct InsightItem: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let type: InsightItemType
}

struct ActionButton: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let action: () -> Void
}

#Preview {
    InsightCardView(
        message: ChatMessage(
            text: "Based on your recent vitals, here's a summary of your health status.",
            isUser: false,
            isInsight: true,
            insightItems: [
                InsightItem(title: "Blood Pressure", subtitle: "132/86 — Elevated", type: .risk),
                InsightItem(title: "Follow-up", subtitle: "Recommended in 30 days", type: .appointment)
            ]
        )
    )
}
