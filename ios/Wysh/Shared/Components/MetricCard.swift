import SwiftUI

struct MetricCard: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        PrimaryCard {
            VStack(spacing: DS.Space.sm) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundStyle(color)
                Text(value)
                    .font(.title.weight(.bold))
                    .foregroundStyle(.primary)
                Text(label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
        }
    }
}
