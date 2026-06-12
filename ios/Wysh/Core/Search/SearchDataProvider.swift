import Foundation

@MainActor
enum SearchDataProvider {
    static func allItems() -> [SearchResultItem] {
        doctors() + appointments() + prescriptions() + medications()
        + diagnostics() + records() + insurance() + claims()
        + payments() + timeline() + family()
    }

    static func doctors() -> [SearchResultItem] {
        [
            SearchResultItem(title: "Dr. Priya Sharma", subtitle: "Primary Care · Apollo Hospitals", category: .doctors),
            SearchResultItem(title: "Dr. Sanjay Patel", subtitle: "Cardiology · Fortis Healthcare", category: .doctors),
            SearchResultItem(title: "Dr. Meera Krishnan", subtitle: "Dermatology · Max Healthcare", category: .doctors),
            SearchResultItem(title: "Dr. Arjun Nair", subtitle: "Orthopedics · Medanta Medicity", category: .doctors),
            SearchResultItem(title: "Dr. Kavita Reddy", subtitle: "Gynecology · Cloudnine Hospital", category: .doctors),
            SearchResultItem(title: "Dr. Vikram Desai", subtitle: "Neurology · Kokilaben Hospital", category: .doctors),
            SearchResultItem(title: "Dr. Anita Rao", subtitle: "Care Coordinator · Wysh Health", category: .doctors)
        ]
    }

    static func appointments() -> [SearchResultItem] {
        [
            SearchResultItem(title: "Dr. Priya Sharma", subtitle: "Today, 3:30 PM · Apollo Hospitals", category: .appointments),
            SearchResultItem(title: "Dr. Sanjay Patel", subtitle: daysFromNow(3) + " · Fortis Healthcare", category: .appointments),
            SearchResultItem(title: "Dr. Meera Krishnan", subtitle: "Follow-up · " + daysFromNow(7), category: .appointments),
            SearchResultItem(title: "Dr. Arjun Nair", subtitle: "Checkup · " + daysFromNow(14), category: .appointments)
        ]
    }

    static func prescriptions() -> [SearchResultItem] {
        [
            SearchResultItem(title: "Metformin 500mg", subtitle: "Dr. Priya Sharma · 1 tablet twice daily", category: .prescriptions),
            SearchResultItem(title: "Amlodipine 5mg", subtitle: "Dr. Sanjay Patel · 1 tablet daily", category: .prescriptions),
            SearchResultItem(title: "Azithromycin 250mg", subtitle: "Dr. Meera Krishnan · 3-day course", category: .prescriptions),
            SearchResultItem(title: "Paracetamol 650mg", subtitle: "Dr. Priya Sharma · As needed for fever", category: .prescriptions),
            SearchResultItem(title: "Vitamin D3 60K IU", subtitle: "Dr. Anita Rao · Weekly for 8 weeks", category: .prescriptions)
        ]
    }

    static func medications() -> [SearchResultItem] {
        [
            SearchResultItem(title: "Metformin 500mg", subtitle: "Cipla · Strip of 30 tablets", category: .medications),
            SearchResultItem(title: "Amlodipine 5mg", subtitle: "Sun Pharma · Strip of 15 tablets", category: .medications),
            SearchResultItem(title: "Azithromycin 250mg", subtitle: "Dr. Reddy's · 6 tablets", category: .medications),
            SearchResultItem(title: "Paracetamol 650mg", subtitle: "Micro Labs · Strip of 15 tablets", category: .medications),
            SearchResultItem(title: "Vitamin D3 60K IU", subtitle: "Abbott · 4 capsules", category: .medications),
            SearchResultItem(title: "Omeprazole 20mg", subtitle: "Dr. Reddy's · Strip of 30 capsules", category: .medications),
            SearchResultItem(title: "Atorvastatin 10mg", subtitle: "Pfizer · Strip of 15 tablets", category: .medications)
        ]
    }

    static func diagnostics() -> [SearchResultItem] {
        [
            SearchResultItem(title: "Complete Blood Count", subtitle: "Thyrocare · ₹450 · Reports in 6 hrs", category: .diagnostics),
            SearchResultItem(title: "Lipid Profile", subtitle: "Thyrocare · ₹650 · Reports in 8 hrs", category: .diagnostics),
            SearchResultItem(title: "HbA1c", subtitle: "Metropolis · ₹550 · Reports in 12 hrs", category: .diagnostics),
            SearchResultItem(title: "Thyroid Profile (T3, T4, TSH)", subtitle: "Thyrocare · ₹600 · Reports in 6 hrs", category: .diagnostics),
            SearchResultItem(title: "Liver Function Test", subtitle: "Metropolis · ₹500 · Reports in 10 hrs", category: .diagnostics),
            SearchResultItem(title: "Kidney Function Test", subtitle: "Thyrocare · ₹400 · Reports in 8 hrs", category: .diagnostics),
            SearchResultItem(title: "Chest X-Ray", subtitle: "Apollo Diagnostics · ₹550 · Reports in 4 hrs", category: .diagnostics),
            SearchResultItem(title: "ECG", subtitle: "Medanta · ₹350 · Reports in 30 mins", category: .diagnostics),
            SearchResultItem(title: "MRI Brain", subtitle: "Fortis · ₹4,500 · Reports in 24 hrs", category: .diagnostics)
        ]
    }

    static func records() -> [SearchResultItem] {
        [
            SearchResultItem(title: "Blood Report — Jun 2026", subtitle: "Complete Blood Count · Thyrocare", category: .records),
            SearchResultItem(title: "Lipid Profile — Jun 2026", subtitle: "Cholesterol Panel · Metropolis", category: .records),
            SearchResultItem(title: "Chest X-Ray — May 2026", subtitle: "Apollo Diagnostics", category: .records),
            SearchResultItem(title: "ECG Report — May 2026", subtitle: "Medanta Heart Institute", category: .records),
            SearchResultItem(title: "Vaccination Record", subtitle: "Hepatitis B, Tetanus, COVID-19", category: .records),
            SearchResultItem(title: "Discharge Summary — Apr 2026", subtitle: "Apollo Hospitals · General Ward", category: .records)
        ]
    }

    static func insurance() -> [SearchResultItem] {
        [
            SearchResultItem(title: "Star Health Insurance", subtitle: "Family Floater · ₹5,00,000 coverage", category: .insurance),
            SearchResultItem(title: "Wysh Care Premium", subtitle: "₹499/mo · Comprehensive health plan", category: .insurance),
            SearchResultItem(title: "Family Shield", subtitle: "₹199/mo · Family add-on coverage", category: .insurance),
            SearchResultItem(title: "Critical Illness Rider", subtitle: "₹10,00,000 · Cancer & heart coverage", category: .insurance)
        ]
    }

    static func claims() -> [SearchResultItem] {
        [
            SearchResultItem(title: "CLAIM-2026-0042", subtitle: "Hospitalization · ₹45,000 · Approved", category: .claims),
            SearchResultItem(title: "CLAIM-2026-0041", subtitle: "Diagnostics · ₹2,300 · Pending", category: .claims),
            SearchResultItem(title: "CLAIM-2026-0039", subtitle: "Pharmacy · ₹1,200 · Processing", category: .claims),
            SearchResultItem(title: "CLAIM-2026-0035", subtitle: "Consultation · ₹800 · Approved", category: .claims)
        ]
    }

    static func payments() -> [SearchResultItem] {
        [
            SearchResultItem(title: "Wysh Care Premium", subtitle: "₹499 · Renewed on Jun 15, 2026", category: .payments),
            SearchResultItem(title: "Clinic Visit — Dr. Sharma", subtitle: "₹1,200 · Jun 11, 2026", category: .payments),
            SearchResultItem(title: "Pharmacy — Metformin", subtitle: "₹340 · Jun 10, 2026", category: .payments),
            SearchResultItem(title: "Insurance Claim Payout", subtitle: "₹45,000 · Credited on Jun 5, 2026", category: .payments),
            SearchResultItem(title: "Health Wallet Top-up", subtitle: "₹2,000 · Added on Jun 1, 2026", category: .payments)
        ]
    }

    static func timeline() -> [SearchResultItem] {
        [
            SearchResultItem(title: "Dr. Priya Sharma Consultation", subtitle: "Diagnosis: Seasonal Allergy · Rx issued", category: .timeline),
            SearchResultItem(title: "CBC Report Uploaded", subtitle: "All values within normal range", category: .timeline),
            SearchResultItem(title: "Metformin Refill", subtitle: "30-day supply · Refill #3 of 6", category: .timeline),
            SearchResultItem(title: "Insurance Claim Approved", subtitle: "₹45,000 credited to account", category: .timeline),
            SearchResultItem(title: "Blood Sugar Reading", subtitle: "Fasting: 102 mg/dL · Within target", category: .timeline)
        ]
    }

    static func family() -> [SearchResultItem] {
        [
            SearchResultItem(title: "Ravi Sharma", subtitle: "Father · Age 62 · Blood group B+", category: .family),
            SearchResultItem(title: "Anita Sharma", subtitle: "Mother · Age 58 · Blood group A+", category: .family),
            SearchResultItem(title: "Neha Sharma", subtitle: "Spouse · Age 34 · Blood group O+", category: .family),
            SearchResultItem(title: "Aarav Sharma", subtitle: "Son · Age 6 · Blood group B+", category: .family)
        ]
    }

    private static func daysFromNow(_ days: Int) -> String {
        guard let date = Calendar.current.date(byAdding: .day, value: days, to: Date()) else { return "" }
        let f = DateFormatter()
        f.dateFormat = "MMM d"
        return f.string(from: date)
    }
}
