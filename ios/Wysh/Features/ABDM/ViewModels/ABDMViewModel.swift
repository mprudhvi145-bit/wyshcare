import Foundation
import SwiftUI

struct ABHAProfileData {
    let name: String
    let abhaNumber: String
    let phone: String
    let email: String
    let dob: String
    let gender: String
    let bloodGroup: String
    let address: String
    let isLinked: Bool
}

struct ABDMConsent: Identifiable {
    let id = UUID()
    let grantedTo: String
    let purpose: String
    let accessLevel: String
    let expiry: String
    let status: String
    let idString: String
}

struct ImportedRecord: Identifiable {
    let id = UUID()
    let title: String
    let date: String
    let source: String
    let type: RecordType

    enum RecordType {
        case labReport, prescription, diagnostic

        var icon: String {
            switch self {
            case .diagnostic:
                return "heart.text.clipboard"

            case .labReport:
                return "doc.text.magnifyingglass"

            case .prescription:
                return "pills"
            }
        }
    }
}

struct CareContext: Identifiable {
    let id = UUID()
    let facility: String
    let program: String
    let status: String
}

struct LinkedProgram: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let status: String
}

@Observable
final class ABDMViewModel {
    var showProfile = false

    deinit {}

    let abhaProfile = ABHAProfileData(
        name: "Vimarshak Prudhvi",
        abhaNumber: "45-1234-5678-9012",
        phone: "+91 98765 43210",
        email: "vimarshak@example.com",
        dob: "15 Jan 1990",
        gender: "Male",
        bloodGroup: "O+",
        address: "123, MG Road, Bengaluru, Karnataka 560001",
        isLinked: true
    )

    let activeConsents = [
        ABDMConsent(
            grantedTo: "Apollo Hospitals",
            purpose: "View Lab Reports",
            accessLevel: "Full Access",
            expiry: "Dec 31, 2026",
            status: "Active",
            idString: "ABDM-CN-2024-001234"
        ),
        ABDMConsent(
            grantedTo: "PharmEasy",
            purpose: "View Prescriptions",
            accessLevel: "Read Only",
            expiry: "Jun 15, 2026",
            status: "Active",
            idString: "ABDM-CN-2024-001235"
        ),
        ABDMConsent(
            grantedTo: "Care Insurance",
            purpose: "Claims Processing",
            accessLevel: "Limited",
            expiry: "Mar 01, 2026",
            status: "Expired",
            idString: "ABDM-CN-2024-001236"
        )
    ]

    let importedRecords = [
        ImportedRecord(
            title: "Complete Blood Count",
            date: "12 May 2026",
            source: "Apollo Labs",
            type: .labReport
        ),
        ImportedRecord(
            title: "Lipid Profile",
            date: "12 May 2026",
            source: "Apollo Labs",
            type: .labReport
        ),
        ImportedRecord(
            title: "Cardiology OPD Summary",
            date: "28 Apr 2026",
            source: "Apollo Hospitals",
            type: .diagnostic
        ),
        ImportedRecord(
            title: "Prescription - Lisinopril",
            date: "15 Apr 2026",
            source: "Dr. Sharma",
            type: .prescription
        )
    ]

    let careContexts = [
        CareContext(facility: "Apollo Hospitals", program: "OPD Care", status: "Active"),
        CareContext(facility: "PharmEasy", program: "Medicine Delivery", status: "Active"),
        CareContext(facility: "Swasthya Slip", program: "Digital Health", status: "Active")
    ]

    let linkedPrograms = [
        LinkedProgram(name: "Ayushman Bharat", description: "PM-JAY health insurance scheme", status: "Linked"),
        LinkedProgram(name: "State Health Scheme", description: "Karnataka state health coverage", status: "Linked")
    ]

    func linkABHA() {
        print("ABHA linking flow started")
    }

    func requestABDMConsent() {
        print("New consent request initiated")
    }

    func importRecords() {
        print("Importing records from ABDM")
    }

    func shareRecords() {
        print("Sharing records")
    }

    func requestConsent() {
        print("Requesting new consent")
    }
}
