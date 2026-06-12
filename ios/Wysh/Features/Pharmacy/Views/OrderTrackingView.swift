import SwiftUI

struct OrderItem {
    let name: String
    let qty: Int
    let price: Int
}

enum OrderStatus: String, CaseIterable {
    case confirmed = "Confirmed"
    case delivered = "Delivered"
    case ordered = "Ordered"
    case outForDelivery = "Out for Delivery"
    case packed = "Packed"
    case shipped = "Shipped"

    var icon: String {
        switch self {
        case .confirmed:
            return "checkmark.circle.fill"

        case .delivered:
            return "hand.thumbsup.fill"

        case .ordered:
            return "bag.fill"

        case .outForDelivery:
            return "figure.walk"

        case .packed:
            return "shippingbox.fill"

        case .shipped:
            return "truck.box.fill"
        }
    }

    var color: Color {
        switch self {
        case .confirmed:
            return .blue

        case .delivered:
            return .green

        case .ordered:
            return .gray

        case .outForDelivery:
            return .mint

        case .packed:
            return .orange

        case .shipped:
            return .purple
        }
    }
}

struct OrderTrackingView: View {
    @Environment(\.dismiss)
    private var dismiss
    let orderNumber = "WYSH-ORD-2024-8912"
    let estimatedDelivery = Date().addingTimeInterval(86_400 * 2)
    @State private var currentStatus: OrderStatus = .shipped

    var statuses: [OrderStatus] {
        OrderStatus.allCases
    }

    var currentIndex: Int {
        statuses.firstIndex(of: currentStatus) ?? 0
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    orderHeader
                    trackingTimeline
                    deliveryInfo
                    orderDetails
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Track Order")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Share") {
                        // Share tracking
                    }
                    .fontWeight(.medium)
                }
            }
        }
    }

    private var orderHeader: some View {
        VStack(spacing: 6) {
            ZStack {
                Circle()
                    .fill(currentStatus.color.opacity(0.15))
                    .frame(width: 72, height: 72)
                Image(systemName: currentStatus.icon)
                    .font(.system(size: 32))
                    .foregroundColor(currentStatus.color)
            }

            Text(currentStatus.rawValue)
                .font(.title2.weight(.bold))

            Text("Order \(orderNumber)")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func timelineIndicator(status: OrderStatus, index: Int) -> some View {
        VStack(spacing: 0) {
            ZStack {
                Circle()
                    .fill(index <= currentIndex ? status.color : Color(.systemGray5))
                    .frame(width: 32, height: 32)
                Image(systemName: status.icon)
                    .font(.system(size: 12))
                    .foregroundColor(index <= currentIndex ? .white : .secondary)
            }

            if index < statuses.count - 1 {
                Rectangle()
                    .fill(index < currentIndex ? status.color : Color(.systemGray5))
                    .frame(width: 2, height: 36)
            }
        }
    }

    private func timelineRow(status: OrderStatus, index: Int) -> some View {
        HStack(spacing: 14) {
            timelineIndicator(status: status, index: index)

            VStack(alignment: .leading, spacing: 2) {
                Text(status.rawValue)
                    .font(.subheadline.weight(index == currentIndex ? .semibold : .regular))
                    .foregroundColor(index <= currentIndex ? .primary : .secondary)

                if index == currentIndex {
                    Text(index == statuses.count - 1 ? "Delivered at your doorstep" : "In progress")
                        .font(.caption)
                        .foregroundColor(status.color)
                }
            }

            Spacer()

            if index < currentIndex {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                    .font(.system(size: 16))
            }
        }
    }

    private var trackingTimeline: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(statuses.enumerated()), id: \.element.rawValue) { index, status in
                timelineRow(status: status, index: index)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var deliveryInfo: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Delivery Information", systemImage: "location.fill")
                .font(.subheadline.weight(.semibold))

            VStack(spacing: 6) {
                HStack {
                    Image(systemName: "calendar")
                        .foregroundColor(.blue)
                    Text("Estimated by \(estimatedDelivery.formatted(date: .abbreviated, time: .omitted))")
                        .font(.subheadline)
                    Spacer()
                }

                HStack(alignment: .top) {
                    Image(systemName: "house.fill")
                        .foregroundColor(.blue)
                    Text("Flat 42, Sunshine Apartments, MG Road, Bangalore - 560001")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Spacer()
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func orderItemRow(item: OrderItem, index: Int) -> some View {
        HStack {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.blue.opacity(0.06))
                    .frame(width: 40, height: 40)
                Image(systemName: "pills.fill")
                    .font(.system(size: 16))
                    .foregroundColor(.blue.opacity(0.5))
            }

            VStack(alignment: .leading, spacing: 1) {
                Text(item.name)
                    .font(.subheadline.weight(.medium))
                Text("Qty: \(item.qty) • ₹\(item.price)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
    }

    private var orderTotalRow: some View {
        HStack {
            Text("Total")
                .font(.subheadline.weight(.semibold))
            Spacer()
            Text("₹\(sampleItems.reduce(0) { $0 + $1.price })")
                .font(.subheadline.weight(.bold))
                .foregroundColor(.blue)
        }
    }

    private var orderDetails: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Order Items", systemImage: "bag.fill")
                .font(.subheadline.weight(.semibold))

            ForEach(Array(sampleItems.enumerated()), id: \.offset) { index, item in
                orderItemRow(item: item, index: index)
                if index < sampleItems.count - 1 { Divider() }
            }

            Divider()
            orderTotalRow
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var sampleItems: [OrderItem] {
        [
            OrderItem(name: "Metformin 500mg", qty: 2, price: 178),
            OrderItem(name: "Vitamin D3 60K", qty: 1, price: 249),
            OrderItem(name: "Accu-Chek Strips", qty: 1, price: 1_240)
        ]
    }
}

#Preview {
    OrderTrackingView()
}
