import Observation
import SwiftUI

extension LabCategory {
    var color: Color {
        switch self {
        case .blood:
            return .red

        case .cardiac:
            return .pink

        case .diabetic:
            return .orange

        case .hormone:
            return .indigo

        case .imaging:
            return .purple

        case .thyroid:
            return .mint

        case .urine:
            return .yellow

        case .vitamin:
            return .green
        }
    }
}

@Observable
final class DiagnosticsViewModel {
    var tests: [LabTest] = []
    var orders: [LabOrder] = []
    var searchText = ""
    var selectedCategory: LabCategory?
    var isLoading = false

    deinit {}

    var filteredTests: [LabTest] {
        var result = tests
        if !searchText.isEmpty {
            result = result.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
        if let category = selectedCategory {
            result = result.filter { $0.category == category }
        }
        return result
    }

    func loadTests() async {
        isLoading = true
        try? await Task.sleep(nanoseconds: 500_000_000)
        tests = sampleTests
        orders = sampleOrders
        isLoading = false
    }

    func bookTest(_ test: LabTest, lab: String, date: Date, homeCollection: Bool) {
        let order = LabOrder(
            testName: test.name,
            labName: lab,
            date: date,
            status: "Confirmed",
            statusColor: .green
        )
        withAnimation {
            orders.insert(order, at: 0)
        }
    }

    private var sampleTests: [LabTest] {
        [
            LabTest(name: "Complete Blood Count", category: .blood, price: 350, preparation: "No preparation", reportTime: "6 hrs", homeCollection: true),
            LabTest(name: "Lipid Profile", category: .blood, price: 500, preparation: "Fasting 10-12 hrs", reportTime: "12 hrs", homeCollection: true),
            LabTest(name: "Thyroid Profile (T3, T4, TSH)", category: .thyroid, price: 650, preparation: "No preparation", reportTime: "8 hrs", homeCollection: true),
            LabTest(name: "Urine Routine", category: .urine, price: 150, preparation: "First morning sample", reportTime: "4 hrs", homeCollection: true),
            LabTest(name: "HbA1c", category: .diabetic, price: 400, preparation: "No preparation", reportTime: "6 hrs", homeCollection: true),
            LabTest(name: "Chest X-Ray", category: .imaging, price: 800, preparation: "No preparation", reportTime: "2 hrs", homeCollection: false),
            LabTest(name: "ECG", category: .cardiac, price: 300, preparation: "No preparation", reportTime: "30 min", homeCollection: false),
            LabTest(name: "Vitamin D", category: .vitamin, price: 700, preparation: "No preparation", reportTime: "24 hrs", homeCollection: true),
            LabTest(name: "Liver Function Test", category: .blood, price: 550, preparation: "Fasting 8-10 hrs", reportTime: "12 hrs", homeCollection: true),
            LabTest(name: "Kidney Function Test", category: .blood, price: 450, preparation: "No preparation", reportTime: "8 hrs", homeCollection: true)
        ]
    }

    private var sampleOrders: [LabOrder] {
        [
            LabOrder(testName: "Complete Blood Count", labName: "Apollo Diagnostics", date: Date().addingTimeInterval(-86_400 * 7), status: "Completed", statusColor: .green),
            LabOrder(testName: "Lipid Profile", labName: "Lal PathLabs", date: Date().addingTimeInterval(-86_400 * 30), status: "Completed", statusColor: .green),
            LabOrder(testName: "Thyroid Profile", labName: "Apollo Diagnostics", date: Date().addingTimeInterval(-86_400 * 2), status: "Processing", statusColor: .orange)
        ]
    }
}
