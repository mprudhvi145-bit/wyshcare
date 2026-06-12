import CoreImage.CIFilterBuiltins
import SwiftUI

struct PrescriptionDetailView: View {
    let prescription: PrescriptionItem
    @Environment(\.dismiss)
    private var dismiss
    @State private var showShareSheet = false
    @State private var showPrintPreview = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    doctorInfoSection
                    medicationsSection
                    qrCodeSection
                    actionsSection
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Prescription")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
            }
            .sheet(isPresented: $showShareSheet) {
                ShareSheet(items: ["Prescription from \(prescription.doctorName) dated \(prescription.date.formatted(date: .abbreviated, time: .omitted))"])
            }
        }
    }

    private var doctorAvatarSection: some View {
        ZStack {
            Circle()
                .fill(Color.blue.opacity(0.1))
                .frame(width: 64, height: 64)
            Image(systemName: "person.circle.fill")
                .font(.system(size: 32))
                .foregroundColor(.blue)
        }
    }

    private var doctorDateStatusRow: some View {
        HStack(spacing: 12) {
            Label(
                prescription.date.formatted(date: .abbreviated, time: .omitted),
                systemImage: "calendar"
            )
                .font(.caption)
                .foregroundColor(.secondary)
            Text(prescription.status.rawValue)
                .font(.caption2.weight(.medium))
                .foregroundColor(prescription.status.color)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(prescription.status.color.opacity(0.12))
                .clipShape(Capsule())
        }
    }

    private var diagnosisSection: some View {
        Text(prescription.diagnosis)
            .font(.subheadline)
            .foregroundColor(.primary)
            .padding(.horizontal)
            .padding(.vertical, 8)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private var doctorInfoContent: some View {
        VStack(spacing: 10) {
            doctorAvatarSection

            Text(prescription.doctorName)
                .font(.title2.weight(.bold))

            Text(prescription.specialty)
                .font(.subheadline)
                .foregroundColor(.secondary)

            Text(prescription.hospital)
                .font(.caption)
                .foregroundStyle(.tertiary)

            doctorDateStatusRow

            diagnosisSection
        }
    }

    private var doctorInfoSection: some View {
        doctorInfoContent
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var medicationCardContent: some View {
        ForEach(prescription.medications) { medication in
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(medication.name)
                        .font(.subheadline.weight(.semibold))
                    Spacer()
                    if medication.refillsLeft > 0 {
                        Text("\(medication.refillsLeft) refills left")
                            .font(.caption2)
                            .foregroundColor(.blue)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.blue.opacity(0.1))
                            .clipShape(Capsule())
                    }
                }

                VStack(spacing: 4) {
                    medDetailRow(icon: "scalemass.fill", label: "Dosage", value: medication.dosage)
                    medDetailRow(icon: "clock.fill", label: "Frequency", value: medication.frequency)
                    medDetailRow(icon: "calendar", label: "Duration", value: medication.duration)
                }
                .padding(.leading, 4)
            }
            .padding(12)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 10))

            if medication.id != prescription.medications.last?.id {
                Divider()
            }
        }
    }

    private var medicationsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Medications", systemImage: "pills.fill")
                .font(.headline.weight(.semibold))

            medicationCardContent
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func medDetailRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 10))
                .foregroundColor(.secondary)
                .frame(width: 14)
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(value)
                .font(.caption2.weight(.medium))
            Spacer()
        }
    }

    private var qrCodeSection: some View {
        VStack(spacing: 8) {
            Text("Digital Verification")
                .font(.subheadline.weight(.semibold))

            Image(uiImage: generateQRCode(from: "WYSH-RX-\(prescription.id.uuidString.prefix(8).uppercased())"))
                .interpolation(.none)
                .resizable()
                .scaledToFit()
                .frame(width: 120, height: 120)

            Text("RX-\(prescription.id.uuidString.prefix(8).uppercased())")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var shareButton: some View {
        Button {
            showShareSheet = true
        } label: {
            Label("Share Prescription", systemImage: "square.and.arrow.up")
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.blue)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var printButton: some View {
        Button {
            showPrintPreview = true
        } label: {
            Label("Print", systemImage: "printer.fill")
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color(.systemGray6))
                .foregroundColor(.primary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var markCompletedButton: some View {
        Button(role: .destructive) {
            dismiss()
        } label: {
            Label("Mark as Completed", systemImage: "checkmark.circle")
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.green.opacity(0.1))
                .foregroundColor(.green)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var actionsContent: some View {
        VStack(spacing: 10) {
            shareButton
            printButton
            if prescription.status == .active {
                markCompletedButton
            }
        }
    }

    private var actionsSection: some View {
        actionsContent
    }

    private func generateQRCode(from string: String) -> UIImage {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)

        guard let outputImage = filter.outputImage,
              let cgImage = context.createCGImage(outputImage, from: outputImage.extent) else {
            return UIImage(systemName: "xmark.circle") ?? UIImage()
        }
        return UIImage(cgImage: cgImage)
    }
}

#Preview {
    PrescriptionDetailView(
        prescription: PrescriptionItem(
            doctorName: "Dr. Aarav Sharma",
            specialty: "Cardiologist",
            hospital: "Apollo Hospital, Delhi",
            date: Date(),
            diagnosis: "Type 2 Diabetes Mellitus with Hypertension",
            medications: [
                MedicationItem(name: "Metformin 500mg", dosage: "500mg", frequency: "Twice daily after meals", duration: "3 months", refillsLeft: 2),
                MedicationItem(name: "Amlodipine 5mg", dosage: "5mg", frequency: "Once daily in morning", duration: "3 months", refillsLeft: 2),
                MedicationItem(name: "Atorvastatin 10mg", dosage: "10mg", frequency: "Once daily at night", duration: "3 months", refillsLeft: 1)
            ],
            status: .active,
            refillEligible: true,
            refillRemaining: 2
        )
    )
}
