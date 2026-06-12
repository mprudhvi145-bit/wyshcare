import SwiftUI

struct WyshSegmentedControl<Option: Hashable & Identifiable>: View where Option: RawRepresentable, Option.RawValue == String {
    let options: [Option]
    @Binding var selection: Option
    let equalWidths: Bool

    init(options: [Option], selection: Binding<Option>, equalWidths: Bool = true) {
        self.options = options
        self._selection = selection
        self.equalWidths = equalWidths
    }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(options, id: \.id) { option in
                Button {
                    withAnimation(.interactiveSpring(response: 0.3, dampingFraction: 0.8)) {
                        selection = option
                    }
                } label: {
                    Text(option.rawValue)
                        .font(.subheadline)
                        .fontWeight(selection == option ? .semibold : .regular)
                        .lineLimit(1)
                        .frame(maxWidth: equalWidths ? .infinity : nil)
                        .padding(.vertical, 10)
                        .padding(.horizontal, 16)
                        .foregroundColor(selection == option ? .white : .primary)
                        .background(selection == option ? Color.accentColor : .clear)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

struct WyshSegmentedControl_Previews: PreviewProvider {
    enum TestOption: String, CaseIterable, Identifiable {
        case daily = "Daily"
        case weekly = "Weekly"
        case monthly = "Monthly"

        var id: String { rawValue }
    }

    static var previews: some View {
        VStack(spacing: 20) {
            WyshSegmentedControl(
                options: TestOption.allCases,
                selection: .constant(.daily)
            )
            WyshSegmentedControl(
                options: TestOption.allCases,
                selection: .constant(.weekly)
            )
            WyshSegmentedControl(
                options: [TestOption.daily, TestOption.monthly],
                selection: .constant(.monthly)
            )
        }
        .padding()
    }
}
