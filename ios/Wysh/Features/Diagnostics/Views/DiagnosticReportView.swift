import SwiftUI

struct LabResult: Identifiable {
    let id = UUID()
    let testName: String
    let value: String
    let unit: String
    let referenceRange: String
    let isAbnormal: Bool
    let flag: FlagType

    enum FlagType: String {
        case normal = "Normal"
        case high = "High"
        case low = "Low"
        case critical = "Critical"
    }
}

struct ReportGroup: Identifiable {
    let id = UUID()
    let category: String
    let results: [LabResult]
}

struct DiagnosticReportView: View {
    @State private var reportGroups: [ReportGroup] = []

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                reportHeader

                ForEach(reportGroups) { group in
                    reportSection(group: group)
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Lab Report")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Share") {
                    // Share action
                }
            }
        }
        .onAppear {
            loadSampleReport()
        }
    }

    private var reportHeader: some View {
        VStack(spacing: 6) {
            ZStack {
                Circle()
                    .fill(Color.blue.opacity(0.1))
                    .frame(width: 56, height: 56)
                Image(systemName: "doc.text.fill")
                    .font(.system(size: 24))
                    .foregroundColor(.blue)
            }

            Text("Complete Blood Count")
                .font(.title3.weight(.bold))

            HStack(spacing: 12) {
                Label("15 May 2024", systemImage: "calendar")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Label("Apollo Diagnostics", systemImage: "building.2")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            HStack(spacing: 12) {
                statusBadge(text: "3 Abnormal", color: .orange)
                statusBadge(text: "10 Normal", color: .green)
                statusBadge(text: "1 Critical", color: .red)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func statusBadge(text: String, color: Color) -> some View {
        Text(text)
            .font(.caption2.weight(.medium))
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.12))
            .clipShape(Capsule())
    }

    private func reportSection(group: ReportGroup) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(group.category)
                .font(.headline.weight(.semibold))
                .padding(.horizontal)
                .padding(.vertical, 10)

            Divider()

            ForEach(Array(group.results.enumerated()), id: \.element.id) { index, result in
                resultRow(result: result)
                if index < group.results.count - 1 {
                    Divider()
                        .padding(.leading)
                }
            }
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func resultRow(result: LabResult) -> some View {
        HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                Text(result.testName)
                    .font(.subheadline.weight(.medium))
                Text("\(result.value) \(result.unit)")
                    .font(.caption)
                    .foregroundColor(result.isAbnormal ? .red : .secondary)
                Text("Ref: \(result.referenceRange)")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                flagIndicator(result: result)
                Text(result.flag.rawValue)
                    .font(.caption2.weight(.medium))
                    .foregroundColor(flagColor(result: result))
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(result.isAbnormal ? Color.red.opacity(0.03) : Color.clear)
    }

    private func flagIndicator(result: LabResult) -> some View {
        let color = flagColor(result: result)
        return Image(systemName: result.isAbnormal ? "exclamationmark.triangle.fill" : "checkmark.circle.fill")
            .font(.system(size: 14))
            .foregroundColor(color)
    }

    private func flagColor(result: LabResult) -> Color {
        switch result.flag {
        case .normal:
            return .green

        case .high:
            return .orange

        case .low:
            return .blue

        case .critical:
            return .red
        }
    }

    private func loadSampleReport() {
        reportGroups = [
            ReportGroup(category: "Hematology", results: [
                LabResult(testName: "Hemoglobin", value: "14.2", unit: "g/dL", referenceRange: "13.0 - 17.0", isAbnormal: false, flag: .normal),
                LabResult(testName: "WBC Count", value: "11,800", unit: "/μL", referenceRange: "4,000 - 10,000", isAbnormal: true, flag: .high),
                LabResult(testName: "RBC Count", value: "5.1", unit: "M/μL", referenceRange: "4.5 - 5.5", isAbnormal: false, flag: .normal),
                LabResult(testName: "Platelet Count", value: "2,50,000", unit: "/μL", referenceRange: "1,50,000 - 4,50,000", isAbnormal: false, flag: .normal),
                LabResult(testName: "Hematocrit", value: "42", unit: "%", referenceRange: "40 - 50", isAbnormal: false, flag: .normal)
            ]),
            ReportGroup(category: "Differential Count", results: [
                LabResult(testName: "Neutrophils", value: "75", unit: "%", referenceRange: "40 - 70", isAbnormal: true, flag: .high),
                LabResult(testName: "Lymphocytes", value: "18", unit: "%", referenceRange: "20 - 40", isAbnormal: true, flag: .low),
                LabResult(testName: "Monocytes", value: "5", unit: "%", referenceRange: "2 - 8", isAbnormal: false, flag: .normal),
                LabResult(testName: "Eosinophils", value: "2", unit: "%", referenceRange: "1 - 4", isAbnormal: false, flag: .normal)
            ]),
            ReportGroup(category: "Biochemistry", results: [
                LabResult(testName: "Fasting Glucose", value: "186", unit: "mg/dL", referenceRange: "70 - 100", isAbnormal: true, flag: .critical),
                LabResult(testName: "HbA1c", value: "8.2", unit: "%", referenceRange: "< 5.7", isAbnormal: true, flag: .high),
                LabResult(testName: "Total Cholesterol", value: "190", unit: "mg/dL", referenceRange: "< 200", isAbnormal: false, flag: .normal)
            ])
        ]
    }
}

#Preview {
    NavigationStack {
        DiagnosticReportView()
    }
}
