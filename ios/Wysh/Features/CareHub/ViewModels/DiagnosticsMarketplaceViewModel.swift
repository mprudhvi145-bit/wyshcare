import Foundation
import SwiftUI

struct DiagnosticTest: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let price: String
    let originalPrice: String?
    let labName: String
    let turnaround: String
    let icon: String
    let color: Color
    let category: DiagnosticCategory
    let isPopular: Bool
    let isRecommended: Bool
}

enum DiagnosticCategory: String, CaseIterable {
    case blood = "Blood Tests"
    case cardiac = "Cardiac"
    case imaging = "Imaging"
    case packages = "Health Packages"
    case preventive = "Preventive"
    case radiology = "Radiology"

    var icon: String {
        switch self {
        case .blood:
            return "drop.fill"

        case .cardiac:
            return "heart.fill"

        case .imaging:
            return "radiograph"

        case .packages:
            return "square.stack.3d.up.fill"

        case .preventive:
            return "shield.fill"

        case .radiology:
            return "xray"
        }
    }
}

struct HealthPackage: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let price: String
    let originalPrice: String
    let tests: [String]
    let icon: String
    let color: Color
    let savings: String
}

@MainActor
@Observable
final class DiagnosticsMarketplaceViewModel {
    var tests: [DiagnosticTest] = []
    var packages: [HealthPackage] = []
    var selectedCategory: DiagnosticCategory = .blood
    var searchText = ""

    var filteredTests: [DiagnosticTest] {
        let categoryFiltered = tests.filter { $0.category == selectedCategory }
        if searchText.isEmpty { return categoryFiltered }
        return categoryFiltered.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.description.localizedCaseInsensitiveContains(searchText)
        }
    }

    init() {
        loadSampleData()
    }

    deinit {}

    private func loadSampleData() {
        tests = sampleTests()
        packages = samplePackages()
    }

    private func sampleTests() -> [DiagnosticTest] {
        bloodTests() + imagingTests() + cardiacTests() + radiologyTests() + preventiveTests()
    }

    private func bloodTests() -> [DiagnosticTest] {
        [
            DiagnosticTest(
                name: "Complete Blood Count (CBC)",
                description: "Measures red/white blood cells, hemoglobin, platelets",
                price: "₹299",
                originalPrice: "₹599",
                labName: "Apollo Diagnostics",
                turnaround: "6 hrs",
                icon: "drop.fill",
                color: .red,
                category: .blood,
                isPopular: true,
                isRecommended: true
            ),
            DiagnosticTest(
                name: "Lipid Profile",
                description: "Total cholesterol, HDL, LDL, triglycerides",
                price: "₹499",
                originalPrice: "₹899",
                labName: "Metropolis Lab",
                turnaround: "12 hrs",
                icon: "drop.fill",
                color: .blue,
                category: .blood,
                isPopular: true,
                isRecommended: true
            ),
            DiagnosticTest(
                name: "HbA1c",
                description: "Average blood sugar over 3 months",
                price: "₹399",
                originalPrice: nil,
                labName: "Thyrocare",
                turnaround: "8 hrs",
                icon: "drop.fill",
                color: .purple,
                category: .blood,
                isPopular: false,
                isRecommended: true
            ),
            DiagnosticTest(
                name: "Thyroid Profile (T3, T4, TSH)",
                description: "Comprehensive thyroid function panel",
                price: "₹449",
                originalPrice: "₹799",
                labName: "Apollo Diagnostics",
                turnaround: "12 hrs",
                icon: "drop.fill",
                color: .orange,
                category: .blood,
                isPopular: false,
                isRecommended: false
            )
        ]
    }

    private func imagingTests() -> [DiagnosticTest] {
        [
            DiagnosticTest(
                name: "Chest X-Ray",
                description: "Digital X-ray of chest (PA view)",
                price: "₹699",
                originalPrice: "₹1,299",
                labName: "Manipal Radiology",
                turnaround: "2 hrs",
                icon: "radiograph",
                color: .blue,
                category: .imaging,
                isPopular: true,
                isRecommended: false
            ),
            DiagnosticTest(
                name: "Ultrasound Abdomen",
                description: "Full abdomen ultrasound scan",
                price: "₹1,499",
                originalPrice: "₹2,499",
                labName: "Fortis Imaging",
                turnaround: "1 hr",
                icon: "radiograph",
                color: .teal,
                category: .imaging,
                isPopular: false,
                isRecommended: false
            )
        ]
    }

    private func cardiacTests() -> [DiagnosticTest] {
        [
            DiagnosticTest(
                name: "ECG (Electrocardiogram)",
                description: "Heart electrical activity recording",
                price: "₹349",
                originalPrice: "₹699",
                labName: "Apollo Cardiology",
                turnaround: "30 min",
                icon: "waveform.path.ecg",
                color: .red,
                category: .cardiac,
                isPopular: true,
                isRecommended: true
            ),
            DiagnosticTest(
                name: "Echocardiogram",
                description: "2D Echo with Doppler study",
                price: "₹2,499",
                originalPrice: "₹3,999",
                labName: "Fortis Heart Institute",
                turnaround: "45 min",
                icon: "heart.fill",
                color: .red,
                category: .cardiac,
                isPopular: false,
                isRecommended: false
            )
        ]
    }

    private func radiologyTests() -> [DiagnosticTest] {
        [
            DiagnosticTest(
                name: "Whole Body MRI",
                description: "Full body MRI screening",
                price: "₹12,999",
                originalPrice: "₹24,999",
                labName: "Manipal Radiology",
                turnaround: "2 hrs",
                icon: "xray",
                color: .indigo,
                category: .radiology,
                isPopular: false,
                isRecommended: false
            ),
            DiagnosticTest(
                name: "CT Scan (Chest)",
                description: "High-resolution chest CT",
                price: "₹4,999",
                originalPrice: "₹7,999",
                labName: "Apollo Radiology",
                turnaround: "1 hr",
                icon: "xray",
                color: .purple,
                category: .radiology,
                isPopular: false,
                isRecommended: false
            )
        ]
    }

    private func preventiveTests() -> [DiagnosticTest] {
        [
            DiagnosticTest(
                name: "Master Health Checkup",
                description: "60+ tests including CBC, Lipid, LFT, KFT, Thyroid, Vitamins",
                price: "₹1,999",
                originalPrice: "₹4,999",
                labName: "Thyrocare",
                turnaround: "24 hrs",
                icon: "heart.text.square",
                color: .green,
                category: .preventive,
                isPopular: true,
                isRecommended: true
            ),
            DiagnosticTest(
                name: "Diabetes Screening",
                description: "FBS, HbA1c, Urine Microalbumin",
                price: "₹599",
                originalPrice: "₹1,199",
                labName: "Metropolis Lab",
                turnaround: "8 hrs",
                icon: "drop.fill",
                color: .orange,
                category: .preventive,
                isPopular: false,
                isRecommended: true
            )
        ]
    }

    private func samplePackages() -> [HealthPackage] {
        [
            HealthPackage(
                name: "Premier Wellness",
                description: "Comprehensive annual health assessment with 80+ tests",
                price: "₹3,999",
                originalPrice: "₹9,999",
                tests: ["CBC", "Lipid Profile", "LFT", "KFT", "Thyroid", "HbA1c", "Vitamin D", "Vitamin B12", "Urinalysis", "Chest X-Ray", "ECG", "Ultrasound Abdomen"],
                icon: "crown.fill",
                color: .yellow,
                savings: "Save 60%"
            ),
            HealthPackage(
                name: "Cardiac Care",
                description: "Complete heart health evaluation package",
                price: "₹2,499",
                originalPrice: "₹5,999",
                tests: ["Lipid Profile", "ECG", "Echocardiogram", "hs-CRP", "Homocysteine", "Cardiac Risk Score"],
                icon: "heart.fill",
                color: .red,
                savings: "Save 58%"
            ),
            HealthPackage(
                name: "Women's Health",
                description: "Essential screenings for women",
                price: "₹2,999",
                originalPrice: "₹6,999",
                tests: ["CBC", "Thyroid", "Vitamin D", "Pap Smear", "Mammogram", "Bone Density", "Iron Studies"],
                icon: "figure.stand.dress",
                color: .pink,
                savings: "Save 57%"
            ),
            HealthPackage(
                name: "Diabetes Care Pack",
                description: "Complete diabetes monitoring and management panel",
                price: "₹1,499",
                originalPrice: "₹3,499",
                tests: ["HbA1c", "FBS", "PPBS", "Microalbumin", "Lipid Profile", "KFT", "Foot Assessment"],
                icon: "drop.fill",
                color: .orange,
                savings: "Save 57%"
            )
        ]
    }
}
