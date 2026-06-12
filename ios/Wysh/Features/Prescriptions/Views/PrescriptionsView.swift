import SwiftUI

struct PrescriptionItem: Identifiable {
    let id = UUID()
    let doctorName: String
    let specialty: String
    let hospital: String
    let date: Date
    let diagnosis: String
    let medications: [MedicationItem]
    let status: PrescriptionStatus
    let refillEligible: Bool
    let refillRemaining: Int
}

enum PrescriptionStatus: String {
    case active = "Active"
    case completed = "Completed"
    case refillDue = "Refill Due"

    var color: Color {
        switch self {
        case .active:
            return .green

        case .completed:
            return .gray

        case .refillDue:
            return .orange
        }
    }
}

struct MedicationItem: Identifiable {
    let id = UUID()
    let name: String
    let dosage: String
    let frequency: String
    let duration: String
    let refillsLeft: Int
}

struct PrescriptionsView: View {
    @State private var viewModel = PrescriptionsViewModel()
    @State private var selectedFilter: PrescriptionStatus?
    @State private var showDetail: PrescriptionItem?

    var filteredPrescriptions: [PrescriptionItem] {
        if let filter = selectedFilter {
            return viewModel.prescriptions.filter { $0.status == filter }
        }
        return viewModel.prescriptions
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 14) {
                    filterChips
                    prescriptionsList
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Prescriptions")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        // Add new prescription
                    }
                    .fontWeight(.semibold)
                }
            }
            .sheet(item: $showDetail) { prescription in
                PrescriptionDetailView(prescription: prescription)
            }
        }
    }

    private var filterChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                Button {
                    withAnimation { selectedFilter = nil }
                } label: {
                    Text("All (\(viewModel.prescriptions.count))")
                        .font(.caption.weight(.medium))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 7)
                        .background(selectedFilter == nil ? Color.blue : Color(.systemGray6))
                        .foregroundColor(selectedFilter == nil ? .white : .primary)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)

                ForEach([PrescriptionStatus.active, .completed, .refillDue], id: \.rawValue) { status in
                    Button {
                        withAnimation { selectedFilter = status }
                    } label: {
                        Text("\(status.rawValue) (\(viewModel.count(for: status)))")
                            .font(.caption.weight(.medium))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 7)
                            .background(selectedFilter == status ? status.color : Color(.systemGray6))
                            .foregroundColor(selectedFilter == status ? .white : .primary)
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var prescriptionsList: some View {
        LazyVStack(spacing: 12) {
            if filteredPrescriptions.isEmpty {
                ContentUnavailableView(
                    "No Prescriptions",
                    systemImage: "pills",
                    description: Text("No prescriptions match this filter.")
                )
                .padding(.top, 30)
            }

            ForEach(filteredPrescriptions) { prescription in
                Button {
                    showDetail = prescription
                } label: {
                    PrescriptionCard(prescription: prescription)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

struct PrescriptionCard: View {
    let prescription: PrescriptionItem
    @State private var showRefillAlert = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            cardHeader
            diagnosisText
            dateAndMedCount
            if !prescription.medications.isEmpty {
                medicationsList
            }
            if prescription.refillEligible {
                refillButton
            }
        }
        .padding(14)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .dsShadow()
    }

    private var cardHeader: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(prescription.doctorName)
                    .font(.subheadline.weight(.semibold))
                Text(prescription.specialty)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Text(prescription.status.rawValue)
                .font(.caption2.weight(.medium))
                .foregroundColor(prescription.status.color)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(prescription.status.color.opacity(0.12))
                .clipShape(Capsule())
        }
    }

    private var diagnosisText: some View {
        Text(prescription.diagnosis)
            .font(.caption)
            .foregroundColor(.primary)
            .lineLimit(1)
    }

    private var dateAndMedCount: some View {
        HStack(spacing: 8) {
            Image(systemName: "calendar")
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(prescription.date, style: .date)
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()

            Image(systemName: "pills.fill")
                .font(.caption2)
                .foregroundColor(.secondary)
            Text("\(prescription.medications.count) medicines")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }

    private var medicationsList: some View {
        VStack(alignment: .leading, spacing: 4) {
            ForEach(prescription.medications.prefix(2)) { med in
                HStack {
                    Circle()
                        .fill(Color.blue.opacity(0.3))
                        .frame(width: 6, height: 6)
                    Text("\(med.name) • \(med.dosage)")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            if prescription.medications.count > 2 {
                Text("+ \(prescription.medications.count - 2) more")
                    .font(.caption2)
                    .foregroundColor(.blue)
            }
        }
    }

    private var refillButton: some View {
        Button {
            showRefillAlert = true
        } label: {
            Text("Refill (\(prescription.refillRemaining) remaining)")
                .font(.caption.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .background(Color.blue)
                .foregroundColor(.white)
                .clipShape(Capsule())
        }
        .alert("Refill Requested", isPresented: $showRefillAlert) {
            Button("OK") {}
        } message: {
            Text("Refill request for \(prescription.medications.first?.name ?? "") has been sent to your pharmacy.")
        }
    }
}

#Preview {
    PrescriptionsView()
}
