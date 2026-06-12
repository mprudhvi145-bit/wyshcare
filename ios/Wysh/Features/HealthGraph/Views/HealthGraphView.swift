import Charts
import SwiftUI

struct HealthGraphView: View {
    @State private var viewModel = HealthGraphViewModel()
    @State private var selectedPoint: HealthDataPoint?
    @State private var selectedChart: String = "Health Score"

    let charts = ["Health Score", "Risk Score", "Key Vitals"]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    timeRangePicker
                    filterChips
                    chartCards
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Health Graph")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private var timeRangePicker: some View {
        Picker("Time Range", selection: $viewModel.selectedRange) {
            ForEach(TimeRange.allCases, id: \.self) { range in
                Text(range.label).tag(range)
            }
        }
        .pickerStyle(.segmented)
    }

    private var filterChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(FilterType.allCases, id: \.self) { filter in
                    Button {
                        withAnimation(.spring) {
                            if viewModel.activeFilters.contains(filter) {
                                viewModel.activeFilters.remove(filter)
                            } else {
                                viewModel.activeFilters.insert(filter)
                            }
                        }
                    } label: {
                        Text(filter.rawValue)
                            .font(.subheadline)
                            .fontWeight(viewModel.activeFilters.contains(filter) ? .semibold : .regular)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 6)
                            .background(viewModel.activeFilters.contains(filter) ? Color.accentColor : Color(.systemGray5))
                            .foregroundStyle(viewModel.activeFilters.contains(filter) ? .white : .primary)
                            .clipShape(Capsule())
                    }
                }
            }
        }
    }

    private var chartCards: some View {
        ForEach(charts, id: \.self) { chart in
            chartCard(title: chart)
        }
    }

    private func chartCard(title: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundStyle(.primary)

            chartView(title: title)

            legendView
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .dsShadow()
    }

    private func chartView(title: String) -> some View {
        let data = viewModel.data(for: title)

        return Chart {
            dataPoints(data: data)
            if let selected = selectedPoint, selected.chartTitle == title {
                RuleMark(
                    x: .value("Date", selected.date)
                )
                .foregroundStyle(.gray.opacity(0.3))
                .lineStyle(StrokeStyle(lineWidth: 1, dash: [5, 5]))

                PointMark(
                    x: .value("Date", selected.date),
                    y: .value("Value", selected.value)
                )
                .foregroundStyle(.orange)
                .symbolSize(100)
            }
            annotationMarks(title: title)
        }
        .chartYScale(domain: .automatic)
        .chartOverlay { proxy in
            chartOverlay(proxy: proxy, data: data, title: title)
        }
        .frame(height: 220)
    }

    private func dataPoints(data: [HealthDataPoint]) -> some ChartContent {
        ForEach(data) { point in
            LineMark(
                x: .value("Date", point.date),
                y: .value("Value", point.value)
            )
            .foregroundStyle(Color.accentColor)
            .lineStyle(StrokeStyle(lineWidth: 2))

            PointMark(
                x: .value("Date", point.date),
                y: .value("Value", point.value)
            )
            .foregroundStyle(Color.accentColor)
            .symbolSize(20)
        }
    }

    private func annotationMarks(title: String) -> some ChartContent {
        ForEach(viewModel.annotations(for: title)) { annotation in
            RuleMark(
                x: .value("Date", annotation.date)
            )
            .foregroundStyle(annotation.type.color.opacity(0.5))
            .lineStyle(StrokeStyle(lineWidth: 2, dash: [3, 3]))
            .annotation(position: .top) {
                annotationLabel(annotation)
            }
        }
    }

    private func chartOverlay(proxy: ChartProxy, data: [HealthDataPoint], title: String) -> some View {
        GeometryReader { geometry in
            Rectangle()
                .fill(.clear)
                .contentShape(Rectangle())
                .gesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { value in
                            let x = value.location.x - geometry.frame(in: .local).origin.x
                            guard let date: Date = proxy.value(atX: x) else { return }
                            let closest = data.min {
                                abs($0.date.timeIntervalSince(date)) < abs($1.date.timeIntervalSince(date))
                            }
                            if var closest {
                                closest.chartTitle = title
                                selectedPoint = closest
                            }
                        }
                        .onEnded { _ in
                            selectedPoint = nil
                        }
                )
        }
    }

    private func annotationLabel(_ annotation: ChartAnnotation) -> some View {
        HStack(spacing: 4) {
            Circle()
                .fill(annotation.type.color)
                .frame(width: 6, height: 6)
            Text(annotation.label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 2)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 4))
    }

    private var legendView: some View {
        HStack(spacing: 12) {
            ForEach(AnnotationType.allCases, id: \.self) { type in
                HStack(spacing: 4) {
                    Circle()
                        .fill(type.color)
                        .frame(width: 8, height: 8)
                    Text(type.rawValue)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}

#Preview {
    HealthGraphView()
}
