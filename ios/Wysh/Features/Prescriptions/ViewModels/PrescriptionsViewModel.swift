import Observation
import SwiftUI

@Observable
final class PrescriptionsViewModel {
    var prescriptions: [PrescriptionItem] = []
    var isLoading = false
    var selectedFilter: PrescriptionStatus?

    deinit {}

    var filteredPrescriptions: [PrescriptionItem] {
        guard let filter = selectedFilter else { return prescriptions }
        return prescriptions.filter { $0.status == filter }
    }

    func count(for status: PrescriptionStatus) -> Int {
        prescriptions.filter { $0.status == status }.count
    }

    func loadPrescriptions() async {
        isLoading = true
        try? await Task.sleep(nanoseconds: 600_000_000)
        prescriptions = samplePrescriptions
        isLoading = false
    }

    func requestRefill(_ prescription: PrescriptionItem) {
        // Submit refill request
        guard let index = prescriptions.firstIndex(where: { $0.id == prescription.id }) else { return }
        let updatedMedications = prescription.medications.map { med in
            MedicationItem(
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                refillsLeft: med.refillsLeft - 1
            )
        }
        let updated = PrescriptionItem(
            doctorName: prescription.doctorName,
            specialty: prescription.specialty,
            hospital: prescription.hospital,
            date: prescription.date,
            diagnosis: prescription.diagnosis,
            medications: updatedMedications,
            status: prescription.medications.allSatisfy { $0.refillsLeft <= 1 } ? .refillDue : prescription.status,
            refillEligible: prescription.medications.contains { $0.refillsLeft > 0 },
            refillRemaining: prescription.medications.count { $0.refillsLeft > 0 }
        )
        prescriptions[index] = updated
    }

    func markAsCompleted(_ prescription: PrescriptionItem) {
        guard let index = prescriptions.firstIndex(where: { $0.id == prescription.id }) else { return }
        let updated = PrescriptionItem(
            doctorName: prescription.doctorName,
            specialty: prescription.specialty,
            hospital: prescription.hospital,
            date: prescription.date,
            diagnosis: prescription.diagnosis,
            medications: prescription.medications,
            status: .completed,
            refillEligible: false,
            refillRemaining: 0
        )
        prescriptions[index] = updated
    }

    private var samplePrescriptions: [PrescriptionItem] {
        let calendar = Calendar.current
        let today = Date()
        guard let dayMinus14 = calendar.date(byAdding: .day, value: -14, to: today),
              let dayMinus60 = calendar.date(byAdding: .day, value: -60, to: today),
              let dayMinus90 = calendar.date(byAdding: .day, value: -90, to: today),
              let dayMinus7 = calendar.date(byAdding: .day, value: -7, to: today) else {
            return []
        }
        return [
            PrescriptionItem(
                doctorName: "Dr. Aarav Sharma",
                specialty: "Cardiologist",
                hospital: "Apollo Hospital, Delhi",
                date: today,
                diagnosis: "Type 2 Diabetes Mellitus with Hypertension",
                medications: [
                    MedicationItem(name: "Metformin 500mg", dosage: "500mg", frequency: "Twice daily after meals", duration: "3 months", refillsLeft: 2),
                    MedicationItem(name: "Amlodipine 5mg", dosage: "5mg", frequency: "Once daily in morning", duration: "3 months", refillsLeft: 2),
                    MedicationItem(name: "Atorvastatin 10mg", dosage: "10mg", frequency: "Once daily at night", duration: "3 months", refillsLeft: 1)
                ],
                status: .active,
                refillEligible: true,
                refillRemaining: 2
            ),
            PrescriptionItem(
                doctorName: "Dr. Priya Patel",
                specialty: "Dermatologist",
                hospital: "Max Clinic, Mumbai",
                date: dayMinus14,
                diagnosis: "Acne Vulgaris - Moderate severity",
                medications: [
                    MedicationItem(name: "Clindamycin Gel 1%", dosage: "Apply twice daily", frequency: "Twice daily on affected area", duration: "6 weeks", refillsLeft: 0),
                    MedicationItem(name: "Doxycycline 100mg", dosage: "100mg", frequency: "Once daily after breakfast", duration: "6 weeks", refillsLeft: 0)
                ],
                status: .active,
                refillEligible: true,
                refillRemaining: 1
            ),
            PrescriptionItem(
                doctorName: "Dr. Rajesh Kumar",
                specialty: "General Physician",
                hospital: "Fortis, Bangalore",
                date: dayMinus60,
                diagnosis: "Acute Bronchitis",
                medications: [
                    MedicationItem(name: "Amoxicillin 500mg", dosage: "500mg", frequency: "Three times daily for 7 days", duration: "7 days", refillsLeft: 0),
                    MedicationItem(name: "Dextromethorphan Syrup", dosage: "10ml", frequency: "Three times daily", duration: "5 days", refillsLeft: 0)
                ],
                status: .completed,
                refillEligible: false,
                refillRemaining: 0
            ),
            PrescriptionItem(
                doctorName: "Dr. Sneha Reddy",
                specialty: "Pediatrician",
                hospital: "Rainbow Hospital, Hyderabad",
                date: dayMinus90,
                diagnosis: "Seasonal Allergic Rhinitis",
                medications: [
                    MedicationItem(name: "Cetirizine Syrup 5mg/5ml", dosage: "5ml", frequency: "Once daily at bedtime", duration: "30 days", refillsLeft: 0),
                    MedicationItem(name: "Fluticasone Nasal Spray", dosage: "1 spray each nostril", frequency: "Once daily", duration: "30 days", refillsLeft: 0)
                ],
                status: .completed,
                refillEligible: false,
                refillRemaining: 0
            ),
            PrescriptionItem(
                doctorName: "Dr. Amit Verma",
                specialty: "Orthopedic",
                hospital: "Medanta, Gurgaon",
                date: dayMinus7,
                diagnosis: "Lower Back Pain - Muscular strain",
                medications: [
                    MedicationItem(name: "Accelofenac 100mg", dosage: "100mg", frequency: "Twice daily after meals", duration: "10 days", refillsLeft: 1),
                    MedicationItem(name: "Thiocolchicoside 4mg", dosage: "4mg", frequency: "Twice daily", duration: "10 days", refillsLeft: 1),
                    MedicationItem(name: "Omeprazole 20mg", dosage: "20mg", frequency: "Once daily before breakfast", duration: "10 days", refillsLeft: 1)
                ],
                status: .active,
                refillEligible: true,
                refillRemaining: 1
            )
        ]
    }
}
