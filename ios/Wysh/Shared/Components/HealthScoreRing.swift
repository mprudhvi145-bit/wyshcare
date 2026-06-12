import SwiftUI

struct HealthScoreRing: View {
    let score: Int
    let label: String
    let trend: String?

    private var color: Color {
        switch score {
        case 80...100:
            .green

        case 60..<80:
            .yellow

        default:
            .red
        }
    }

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .stroke(color.opacity(0.15), lineWidth: 8)
                Circle()
                    .trim(from: 0, to: CGFloat(score) / 100)
                    .stroke(color, style: .init(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(duration: 1), value: score)
                VStack(spacing: 2) {
                    Text("\(score)").font(.system(size: 36, weight: .bold))
                    Text(label).font(.caption2).foregroundStyle(.secondary)
                }
            }
            .frame(width: 120, height: 120)

            if let trend {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.up.right").font(.caption2)
                    Text(trend).font(.caption2)
                }
                .foregroundStyle(.green)
            }
        }
    }
}
