import SwiftUI

struct SuggestedAction: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void
}

struct SuggestedActionsView: View {
    let actions: [SuggestedAction]

    private let columns = [
        GridItem(.flexible(), spacing: DS.Space.md),
        GridItem(.flexible(), spacing: DS.Space.md)
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.sm) {
            Text("Quick Actions")
                .font(.footnote)
                .fontWeight(.semibold)
                .foregroundStyle(DS.Color.secondaryLabel)
                .padding(.horizontal, DS.Space.md)

            LazyVGrid(columns: columns, spacing: DS.Space.sm) {
                ForEach(actions) { action in
                    Button {
                        action.action()
                    } label: {
                        HStack(spacing: DS.Space.sm) {
                            Image(systemName: action.icon)
                                .font(.subheadline)
                                .foregroundStyle(action.color)

                            Text(action.title)
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundStyle(.primary)

                            Spacer(minLength: 0)
                        }
                        .padding(DS.Space.md)
                        .background(DS.Color.card)
                        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.small))
                        .dsShadow()
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, DS.Space.md)
        }
    }
}
