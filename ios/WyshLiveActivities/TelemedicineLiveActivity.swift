import ActivityKit
import SwiftUI
import WidgetKit

struct TelemedicineAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var doctorName: String
        var status: SessionStatus
        var elapsedSeconds: Int
    }

    var sessionId: String
    var specialty: String
}

enum SessionStatus: String, Codable, Hashable, CaseIterable {
    case connecting = "Connecting"
    case ended = "Ended"
    case inProgress = "In Progress"

    var iconName: String {
        switch self {
        case .connecting:
            "antenna.radiowaves.left.and.right"

        case .ended:
            "phone.down.fill"

        case .inProgress:
            "video.fill"
        }
    }

    var color: Color {
        switch self {
        case .connecting:
            .yellow

        case .ended:
            .gray

        case .inProgress:
            .green
        }
    }
}

struct TelemedicineLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TelemedicineAttributes.self) { context in
            TelemedicineLiveActivityView(context: context)
        }
        dynamicIsland: { context in
            makeDynamicIsland(context: context)
        }
    }

    private func makeDynamicIsland(context: ActivityViewContext<TelemedicineAttributes>) -> DynamicIsland {
        DynamicIsland {
            expandedRegions(for: context)
        }
        compactLeading: {
            Image(systemName: "video.fill")
                .foregroundColor(.green)
        }
        compactTrailing: {
            Text(formattedDuration(context.state.elapsedSeconds))
                .font(.caption2)
                .fontWeight(.semibold)
                .monospacedDigit()
        }
        minimal: {
            Image(systemName: context.state.status == .ended ? "phone.down.fill" : "video.fill")
                .foregroundColor(context.state.status.color)
        }
    }

    @DynamicIslandExpandedContentBuilder
    private func expandedRegions(for context: ActivityViewContext<TelemedicineAttributes>) -> DynamicIslandExpandedContent {
        DynamicIslandExpandedRegion(.leading) {
            VStack(alignment: .leading, spacing: 2) {
                Text(context.state.doctorName)
                    .font(.headline)
                    .fontWeight(.bold)
                Text(context.attributes.specialty)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        DynamicIslandExpandedRegion(.trailing) {
            VStack(spacing: 2) {
                Image(systemName: context.state.status.iconName)
                    .foregroundColor(context.state.status.color)
                    .font(.title2)
                Text(context.state.status.rawValue)
                    .font(.caption)
            }
        }
        DynamicIslandExpandedRegion(.center) {
            HStack {
                Image(systemName: "clock")
                    .font(.caption)
                Text(formattedDuration(context.state.elapsedSeconds))
                    .font(.system(.body, design: .monospaced))
                    .contentTransition(.numericText())
            }
        }
        DynamicIslandExpandedRegion(.bottom) {
            HStack {
                if context.state.status != .ended {
                    Label("End Call", systemImage: "phone.down.fill")
                        .font(.caption)
                        .foregroundColor(.red)
                }
                Spacer()
                if context.state.status == .connecting {
                    ProgressView()
                        .scaleEffect(0.7)
                }
            }
        }
    }

    private func formattedDuration(_ seconds: Int) -> String {
        let m = seconds / 60
        let s = seconds % 60
        return String(format: "%d:%02d", m, s)
    }
}

struct TelemedicineLiveActivityView: View {
    let context: ActivityViewContext<TelemedicineAttributes>

    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text(context.state.doctorName)
                    .font(.headline)
                    .fontWeight(.bold)
                Text(context.attributes.specialty)
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

                HStack {
                    Image(systemName: "clock")
                        .font(.caption)
                    Text(formattedDuration(context.state.elapsedSeconds))
                        .font(.system(.body, design: .monospaced))
                        .contentTransition(.numericText())
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .activityBackgroundTint(.clear)
    }

    private func formattedDuration(_ seconds: Int) -> String {
        let m = seconds / 60
        let s = seconds % 60
        return String(format: "%d:%02d", m, s)
    }
}
