import ActivityKit
import SwiftUI
import WidgetKit

struct LabCollectionAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: LabStatus
        var estimatedReadyTime: Date
    }

    var labId: String
    var labName: String
    var testType: String
}

enum LabStatus: String, Codable, Hashable, CaseIterable {
    case delivered = "Delivered"
    case processing = "Processing"
    case ready = "Ready"
    case sampleCollected = "Sample Collected"

    var iconName: String {
        switch self {
        case .delivered:
            "tray.full.fill"

        case .processing:
            "gearshape.2"

        case .ready:
            "checkmark.circle.fill"

        case .sampleCollected:
            "vial.viewfinder"
        }
    }

    var color: Color {
        switch self {
        case .delivered:
            .gray

        case .processing:
            .orange

        case .ready:
            .green

        case .sampleCollected:
            .blue
        }
    }
}

struct LabCollectionLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: LabCollectionAttributes.self) { context in
            LabCollectionActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                expandedLeading(context)
                expandedTrailing(context)
                expandedCenter(context)
                expandedBottom(context)
            } compactLeading: {
                compactLeadingView()
            } compactTrailing: {
                compactTrailingView(context)
            } minimal: {
                minimalView(context)
            }
        }
    }

    @ViewBuilder
    private func expandedLeading(_ context: ActivityViewContext<LabCollectionAttributes>) -> some View {
        DynamicIslandExpandedRegion(.leading) {
            VStack(alignment: .leading, spacing: 2) {
                Text(context.attributes.labName)
                    .font(.headline)
                Text(context.attributes.testType)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }

    @ViewBuilder
    private func expandedTrailing(_ context: ActivityViewContext<LabCollectionAttributes>) -> some View {
        DynamicIslandExpandedRegion(.trailing) {
            VStack(spacing: 2) {
                Image(systemName: context.state.status.iconName)
                    .foregroundColor(context.state.status.color)
                Text(context.state.status.rawValue)
                    .font(.caption2)
            }
        }
    }

    @ViewBuilder
    private func expandedCenter(_ context: ActivityViewContext<LabCollectionAttributes>) -> some View {
        DynamicIslandExpandedRegion(.center) {
            VStack(spacing: 2) {
                Text("Estimated Ready")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                Text(context.state.estimatedReadyTime, style: .time)
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }
        }
    }

    @ViewBuilder
    private func expandedBottom(_ context: ActivityViewContext<LabCollectionAttributes>) -> some View {
        DynamicIslandExpandedRegion(.bottom) {
            ProgressView(value: progressValue(for: context.state.status))
                .tint(context.state.status.color)
        }
    }

    @ViewBuilder
    private func compactLeadingView() -> some View {
        Image(systemName: "vial.viewfinder")
            .foregroundColor(.blue)
    }

    @ViewBuilder
    private func compactTrailingView(_ context: ActivityViewContext<LabCollectionAttributes>) -> some View {
        Text(context.state.status.rawValue.prefix(4))
            .font(.caption2)
    }

    @ViewBuilder
    private func minimalView(_ context: ActivityViewContext<LabCollectionAttributes>) -> some View {
        Image(systemName: context.state.status.iconName)
            .foregroundColor(context.state.status.color)
    }

    private func progressValue(for status: LabStatus) -> Double {
        switch status {
        case .delivered:
            1.0

        case .processing:
            0.6

        case .ready:
            1.0

        case .sampleCollected:
            0.25
        }
    }
}

struct LabCollectionActivityView: View {
    let context: ActivityViewContext<LabCollectionAttributes>

    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text(context.attributes.labName)
                    .font(.headline)
                Text(context.attributes.testType)
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
                if context.state.status != .delivered {
                    Text("Ready by \(context.state.estimatedReadyTime, style: .time)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .activityBackgroundTint(.clear)
    }
}
