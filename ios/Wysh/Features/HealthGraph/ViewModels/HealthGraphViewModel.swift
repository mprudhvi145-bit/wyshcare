import Foundation
import SwiftUI

enum TimeRange: String, CaseIterable {
    case oneMonth = "1M"
    case oneYear = "1Y"
    case sixMonths = "6M"
    case threeMonths = "3M"

    var label: String { rawValue }

    var days: Int {
        switch self {
        case .oneMonth:
            return 30

        case .oneYear:
            return 365

        case .sixMonths:
            return 180

        case .threeMonths:
            return 90
        }
    }
}

enum FilterType: String, CaseIterable {
    case claims = "Claims"
    case conditions = "Conditions"
    case doctors = "Doctors"
    case familyHistory = "Family History"
    case labs = "Labs"
    case medications = "Medications"
}

enum AnnotationType: String, CaseIterable {
    case condition = "Conditions"
    case doctorVisit = "Doctor Visits"
    case labResult = "Lab Results"

    var color: Color {
        switch self {
        case .condition:
            return .red

        case .doctorVisit:
            return .blue

        case .labResult:
            return .green
        }
    }
}

struct HealthDataPoint: Identifiable {
    let id = UUID()
    let date: Date
    let value: Double
    var chartTitle: String = ""
}

struct ChartAnnotation: Identifiable {
    let id = UUID()
    let date: Date
    let label: String
    let type: AnnotationType
}

@Observable
final class HealthGraphViewModel {
    var selectedRange: TimeRange = .sixMonths
    var activeFilters: Set<FilterType> = [.conditions, .doctors, .labs]

    private let calendar = Calendar.current

    deinit {}

    func data(for chartTitle: String) -> [HealthDataPoint] {
        let days = selectedRange.days
        let end = Date()
        switch chartTitle {
        case "Health Score":
            return (0..<days)
                .map { i in
                    let date = calendar.date(byAdding: .day, value: -i, to: end) ?? end
                    let base = 65.0 + Double(i % 30) * 0.8 + Double.random(in: -3...3)
                    return HealthDataPoint(date: date, value: min(100, max(0, base)))
                }
                .reversed()

        case "Risk Score":
            return (0..<days)
                .map { i in
                    let date = calendar.date(byAdding: .day, value: -i, to: end) ?? end
                    let base = 25.0 + Double(i % 45) * 0.3 + Double.random(in: -2...2)
                    return HealthDataPoint(date: date, value: min(100, max(0, base)))
                }
                .reversed()

        case "Key Vitals":
            return (0..<days)
                .map { i in
                    let date = calendar.date(byAdding: .day, value: -i, to: end) ?? end
                    let bp: Double = 120 + Double.random(in: -10...10)
                    return HealthDataPoint(date: date, value: bp)
                }
                .reversed()

        default:
            return []
        }
    }

    func annotations(for chartTitle: String) -> [ChartAnnotation] {
        let days = selectedRange.days
        let end = Date()
        var result: [ChartAnnotation] = []
        let conditionDates = [15, 45, 90, 180].filter { $0 < days }
        for day in conditionDates {
            let date = calendar.date(byAdding: .day, value: -day, to: end) ?? end
            result.append(ChartAnnotation(date: date, label: "Checkup", type: .doctorVisit))
        }
        let labDates = [7, 60, 120].filter { $0 < days }
        for day in labDates {
            let date = calendar.date(byAdding: .day, value: -day, to: end) ?? end
            result.append(ChartAnnotation(date: date, label: "Labs", type: .labResult))
        }
        return result
    }
}
