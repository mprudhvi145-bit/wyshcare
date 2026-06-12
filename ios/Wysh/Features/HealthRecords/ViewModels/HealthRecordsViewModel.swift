import Observation
import SwiftUI

@Observable
final class HealthRecordItemsViewModel {
    var records: [HealthRecordItem] = []
    var searchText = ""
    var isLoading = false

    var filteredRecords: [HealthRecordItem] {
        if searchText.isEmpty { return records }
        return records.filter {
            $0.title.localizedCaseInsensitiveContains(searchText) ||
            $0.summary.localizedCaseInsensitiveContains(searchText)
        }
    }

    func count(for category: HealthRecordCategory) -> Int {
        records.filter { $0.type == category }.count
    }

    func records(for category: HealthRecordCategory) -> [HealthRecordItem] {
        let catRecords = records.filter { $0.type == category }
        if searchText.isEmpty { return catRecords }
        return catRecords.filter {
            $0.title.localizedCaseInsensitiveContains(searchText) ||
            $0.summary.localizedCaseInsensitiveContains(searchText)
        }
    }

    deinit {}

    func loadRecords() async {
        isLoading = true
        try? await Task.sleep(nanoseconds: 600_000_000)
        records = sampleRecords
        isLoading = false
    }

    func deleteRecord(_ record: HealthRecordItem) {
        records.removeAll { $0.id == record.id }
    }

    private var sampleRecords: [HealthRecordItem] {
        [
            HealthRecordItem(
                title: "Complete Blood Count",
                date: Date().addingTimeInterval(-86_400 * 2),
                type: .labReports,
                summary: "Hb: 14.2, WBC: 7800, Platelets: 2.5L",
                fileURL: nil
            ),
            HealthRecordItem(
                title: "Lipid Profile",
                date: Date().addingTimeInterval(-86_400 * 5),
                type: .labReports,
                summary: "Cholesterol: 180, HDL: 45, LDL: 110",
                fileURL: nil
            ),
            HealthRecordItem(
                title: "Amoxicillin 500mg",
                date: Date().addingTimeInterval(-86_400 * 10),
                type: .prescriptions,
                summary: "Twice daily for 7 days - Dr. Mehta",
                fileURL: nil
            ),
            HealthRecordItem(
                title: "Hepatitis B Vaccine",
                date: Date().addingTimeInterval(-86_400 * 30),
                type: .vaccinations,
                summary: "Dose 2 of 3 - Adult Hepatitis B",
                fileURL: nil
            ),
            HealthRecordItem(
                title: "Hospital Discharge - Jan 2024",
                date: Date().addingTimeInterval(-86_400 * 60),
                type: .dischargeSummaries,
                summary: "Appendectomy - 3 day stay - City Hospital",
                fileURL: nil
            ),
            HealthRecordItem(
                title: "Family Floater Policy",
                date: Date().addingTimeInterval(-86_400 * 90),
                type: .insuranceDocuments,
                summary: "₹10L coverage - Valid till Dec 2025",
                fileURL: nil
            ),
            HealthRecordItem(
                title: "ABDM Health Locker Sync",
                date: Date().addingTimeInterval(-86_400 * 7),
                type: .abdmRecords,
                summary: "8 records synced from ABHA Health Locker",
                fileURL: nil
            )
        ]
    }
}
