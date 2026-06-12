import Foundation
import SwiftUI

struct Provider: Identifiable {
    let id = UUID()
    let name: String
    let type: ProviderType
    let location: String
    let distance: String
    let rating: Double
    let specialties: [String]
    let phone: String
    let isOpen: Bool
    let icon: String
    let color: Color
}

enum ProviderType: String, CaseIterable {
    case clinic = "Clinics"
    case hospital = "Hospitals"
    case imaging = "Imaging Centers"
    case lab = "Diagnostic Labs"
    case pharmacy = "Pharmacies"

    var icon: String {
        switch self {
        case .clinic:
            return "cross.case.fill"

        case .hospital:
            return "building.2.fill"

        case .imaging:
            return "radiograph"

        case .lab:
            return "flask.fill"

        case .pharmacy:
            return "pills.fill"
        }
    }
}

@MainActor
@Observable
final class ProviderNetworkViewModel {
    var providers: [Provider] = []
    var selectedType: ProviderType = .hospital
    var searchText = ""

    var filteredProviders: [Provider] {
        let typeFiltered = providers.filter { $0.type == selectedType }
        if searchText.isEmpty { return typeFiltered }
        return typeFiltered.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.specialties.contains { $0.localizedCaseInsensitiveContains(searchText) }
        }
    }

    init() {
        loadSampleData()
    }

    deinit {}

    private static let sampleProviders: [Provider] = [
        Provider(
            name: "Apollo Hospitals",
            type: .hospital,
            location: "Bengaluru, Karnataka",
            distance: "2.3 km",
            rating: 4.8,
            specialties: ["Cardiology", "Neurology", "Orthopedics", "Oncology"],
            phone: "+91 80 5555 0100",
            isOpen: true,
            icon: "building.2.fill",
            color: .blue
        ),
        Provider(
            name: "Fortis Healthcare",
            type: .hospital,
            location: "Bengaluru, Karnataka",
            distance: "4.1 km",
            rating: 4.6,
            specialties: ["Cardiology", "Gastroenterology", "Nephrology"],
            phone: "+91 80 5555 0200",
            isOpen: true,
            icon: "building.2.fill",
            color: .teal
        ),
        Provider(
            name: "Manipal Hospitals",
            type: .hospital,
            location: "Bengaluru, Karnataka",
            distance: "6.8 km",
            rating: 4.7,
            specialties: ["Cardiology", "Neurology", "Orthopedics"],
            phone: "+91 80 5555 0300",
            isOpen: true,
            icon: "building.2.fill",
            color: .indigo
        ),
        Provider(
            name: "Narayana Health",
            type: .hospital,
            location: "Bengaluru, Karnataka",
            distance: "8.2 km",
            rating: 4.5,
            specialties: ["Cardiology", "Oncology", "Pediatrics"],
            phone: "+91 80 5555 0400",
            isOpen: false,
            icon: "building.2.fill",
            color: .purple
        ),
        Provider(
            name: "Dr. Sharma's Clinic",
            type: .clinic,
            location: "Indiranagar, Bengaluru",
            distance: "1.2 km",
            rating: 4.9,
            specialties: ["General Medicine", "Cardiology", "Diabetes"],
            phone: "+91 98765 43210",
            isOpen: true,
            icon: "cross.case.fill",
            color: .green
        ),
        Provider(
            name: "Prime Diagnostics",
            type: .lab,
            location: "Koramangala, Bengaluru",
            distance: "1.8 km",
            rating: 4.4,
            specialties: ["Blood Tests", "Microbiology", "Pathology"],
            phone: "+91 80 5555 0500",
            isOpen: true,
            icon: "flask.fill",
            color: .orange
        ),
        Provider(
            name: "Metropolis Lab",
            type: .lab,
            location: "MG Road, Bengaluru",
            distance: "3.5 km",
            rating: 4.3,
            specialties: ["Blood Tests", "Hormone Assays", "Genetic Testing"],
            phone: "+91 80 5555 0600",
            isOpen: true,
            icon: "flask.fill",
            color: .purple
        ),
        Provider(
            name: "Apollo Pharmacy",
            type: .pharmacy,
            location: "Indiranagar, Bengaluru",
            distance: "0.8 km",
            rating: 4.5,
            specialties: ["Prescriptions", "OTC Medicines", "Health Products"],
            phone: "+91 80 5555 0700",
            isOpen: true,
            icon: "pills.fill",
            color: .green
        ),
        Provider(
            name: "MedPlus Pharmacy",
            type: .pharmacy,
            location: "Koramangala, Bengaluru",
            distance: "1.5 km",
            rating: 4.2,
            specialties: ["Prescriptions", "Surgical Supplies"],
            phone: "+91 80 5555 0800",
            isOpen: true,
            icon: "pills.fill",
            color: .blue
        ),
        Provider(
            name: "Manipal Radiology",
            type: .imaging,
            location: "JP Nagar, Bengaluru",
            distance: "5.1 km",
            rating: 4.6,
            specialties: ["MRI", "CT Scan", "Ultrasound", "X-Ray"],
            phone: "+91 80 5555 0900",
            isOpen: true,
            icon: "radiograph",
            color: .indigo
        ),
        Provider(
            name: "Siemens Healthineers",
            type: .imaging,
            location: "Whitefield, Bengaluru",
            distance: "12.4 km",
            rating: 4.7,
            specialties: ["PET-CT", "MRI", "Mammography"],
            phone: "+91 80 5555 1000",
            isOpen: true,
            icon: "radiograph",
            color: .cyan
        )
    ]

    private func loadSampleData() {
        providers = Self.sampleProviders
    }
}
