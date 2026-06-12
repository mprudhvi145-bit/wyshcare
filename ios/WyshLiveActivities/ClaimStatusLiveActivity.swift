import ActivityKit
import SwiftUI
import WidgetKit

struct ClaimStatusAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: ClaimStage
        var lastUpdated: Date
        var estimatedCompletion: Date
    }

    var claimId: String
    var claimType: String
    var amount: Decimal
}

enum ClaimStage: String, Codable, Hashable, CaseIterable {
    case approved = "Approved"
    case denied = "Denied"
    case paid = "Paid"
    case submitted = "Submitted"
    case underReview = "Under Review"

    var iconName: String {
        switch self {
        case .approved:
            "checkmark.seal.fill"

        case .denied:
            "xmark.seal.fill"

        case .paid:
            "dollarsign.circle.fill"

        case .submitted:
            "doc.text.fill"

        case .underReview:
            "magnifyingglass"
        }
    }

    var color: Color {
        switch self {
        case .approved:
            .green

        case .denied:
            .red

        case .paid:
            .green

        case .submitted:
            .blue

        case .underReview:
            .orange
        }
    }
}

private struct LeadingRegionContent: View {
    let context: ActivityViewContext<ClaimStatusAttributes>

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(context.attributes.claimType)
                .font(.headline)
            Text("Claim #\(context.attributes.claimId)")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

private struct TrailingRegionContent: View {
    let context: ActivityViewContext<ClaimStatusAttributes>

    var body: some View {
        VStack(spacing: 2) {
            Image(systemName: context.state.status.iconName)
                .foregroundColor(context.state.status.color)
                .font(.title2)
            Text(context.state.status.rawValue)
                .font(.caption)
        }
    }
}

private struct CenterRegionContent: View {
    let context: ActivityViewContext<ClaimStatusAttributes>

    var body: some View {
        HStack(spacing: 4) {
            Text("$")
                .font(.caption)
                .foregroundColor(.secondary)
            Text(context.attributes.amount, format: .currency(code: "USD"))
                .font(.subheadline)
                .fontWeight(.semibold)
        }
    }
}

private struct BottomRegionContent: View {
    let context: ActivityViewContext<ClaimStatusAttributes>

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Last Updated")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                Text(context.state.lastUpdated, style: .relative)
                    .font(.caption)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("Est. Completion")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                Text(context.state.estimatedCompletion, style: .date)
                    .font(.caption)
            }
        }
    }
}

struct ClaimStatusLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ClaimStatusAttributes.self) { context in
            ClaimStatusActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    LeadingRegionContent(context: context)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    TrailingRegionContent(context: context)
                }
                DynamicIslandExpandedRegion(.center) {
                    CenterRegionContent(context: context)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    BottomRegionContent(context: context)
                }
            } compactLeading: {
                Image(systemName: "doc.text.fill")
                    .foregroundColor(.blue)
            } compactTrailing: {
                Text(context.state.status.rawValue.prefix(4))
                    .font(.caption2)
            } minimal: {
                Image(systemName: context.state.status.iconName)
                    .foregroundColor(context.state.status.color)
            }
        }
    }
}

struct ClaimStatusActivityView: View {
    let context: ActivityViewContext<ClaimStatusAttributes>

    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text(context.attributes.claimType)
                    .font(.headline)
                    .fontWeight(.bold)
                Text(context.attributes.amount, format: .currency(code: "USD"))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                HStack {
                    Circle()
                        .fill(context.state.status.color)
                        .frame(width: 8, height: 8)
                    Text(context.state.status.rawValue)
                        .font(.caption)
                        .foregroundColor(context.state.status.color)
                }
                Text("Updated \(context.state.lastUpdated, style: .relative)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .activityBackgroundTint(.clear)
    }
}
