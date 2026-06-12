import SwiftUI

struct TaskRow: View {
    let title: String
    let subtitle: String?
    let isComplete: Bool
    let action: (() -> Void)?

    var body: some View {
        HStack(spacing: DS.Space.lg) {
            Button(action: { action?() }, label: {
                Image(systemName: isComplete ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(isComplete ? DS.Color.success : .secondary)
            })
            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text(title).font(.headline).foregroundStyle(.primary)
                if let subtitle {
                    Text(subtitle).font(.caption).foregroundStyle(.secondary)
                }
            }
            Spacer()
        }
        .padding(DS.Space.lg)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.small + 4))
    }
}
