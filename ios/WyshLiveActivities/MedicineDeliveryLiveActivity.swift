import ActivityKit
import SwiftUI
import WidgetKit

struct MedicineDeliveryAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: DeliveryStatus
        var estimatedArrival: Date
        var currentLocation: String
    }

    var orderId: String
    var medicineName: String
    var pharmacyName: String
}

enum DeliveryStatus: String, Codable, Hashable, CaseIterable {
    case delivered = "Delivered"
    case inTransit = "In Transit"
    case pickedUp = "Picked Up"
    case preparing = "Preparing"

    var iconName: String {
        switch self {
        case .delivered:
            "checkmark.circle.fill"

        case .inTransit:
            "box.truck.fill"

        case .pickedUp:
            "bag.badge.checkmark"

        case .preparing:
            "bag.fill"
        }
    }

    var color: Color {
        switch self {
        case .delivered:
            .green

        case .inTransit:
            .purple

        case .pickedUp:
            .orange

        case .preparing:
            .blue
        }
    }
}

struct MedicineDeliveryLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: MedicineDeliveryAttributes.self) { context in
            MedicineDeliveryActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    leadingContent(context: context)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    trailingContent(context: context)
                }
                DynamicIslandExpandedRegion(.center) {
                    centerContent(context: context)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    bottomContent(context: context)
                }
            } compactLeading: {
                Image(systemName: "box.truck.fill")
                    .foregroundColor(.purple)
            } compactTrailing: {
                Text(context.state.status.rawValue.prefix(4))
                    .font(.caption2)
            } minimal: {
                Image(systemName: context.state.status.iconName)
                    .foregroundColor(context.state.status.color)
            }
        }
    }

    private func leadingContent(context: ActivityViewContext<MedicineDeliveryAttributes>) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(context.attributes.pharmacyName)
                .font(.headline)
            Text(context.attributes.medicineName)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }

    private func trailingContent(context: ActivityViewContext<MedicineDeliveryAttributes>) -> some View {
        VStack(spacing: 2) {
            Image(systemName: context.state.status.iconName)
                .foregroundColor(context.state.status.color)
                .font(.title2)
            Text(context.state.status.rawValue)
                .font(.caption)
        }
    }

    private func centerContent(context: ActivityViewContext<MedicineDeliveryAttributes>) -> some View {
        VStack(spacing: 2) {
            Text("Estimated Arrival")
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(context.state.estimatedArrival, style: .time)
                .font(.subheadline)
                .fontWeight(.semibold)
        }
    }

    private func bottomContent(context: ActivityViewContext<MedicineDeliveryAttributes>) -> some View {
        HStack {
            Image(systemName: "location.fill")
                .font(.caption)
                .foregroundColor(.secondary)
            Text(context.state.currentLocation)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(1)
            Spacer()
        }
    }
}

struct MedicineDeliveryActivityView: View {
    let context: ActivityViewContext<MedicineDeliveryAttributes>

    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text(context.attributes.medicineName)
                    .font(.headline)
                    .fontWeight(.bold)
                Text(context.attributes.pharmacyName)
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
                Text("Arrives \(context.state.estimatedArrival, style: .time)")
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
