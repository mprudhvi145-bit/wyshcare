import SwiftUI

struct NewClaimView: View {
    @State private var viewModel = ClaimsViewModel()
    @State private var selectedPolicy = "POL-2024-001"
    @State private var amount: Decimal?
    @State private var description = ""
    @State private var providerName = ""
    @State private var documents: [ClaimDocument] = [
        ClaimDocument(name: "Itemized Bill", type: "PDF", isUploaded: false),
        ClaimDocument(name: "Medical Report", type: "PDF", isUploaded: false),
        ClaimDocument(name: "Referral Letter", type: "PDF", isUploaded: false),
        ClaimDocument(name: "Pre-Authorization", type: "PDF", isUploaded: false)
    ]
    @State private var isSubmitting = false
    @State private var didSubmit = false
    @Environment(\.dismiss)
    private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                policySection
                detailsSection
                documentsSection
                submitSection
            }
            .navigationTitle("New Claim")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .disabled(isSubmitting)
            .overlay {
                if isSubmitting {
                    ProgressView("Submitting claim...")
                        .padding()
                        .background(.regularMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
            .alert("Claim Submitted", isPresented: $didSubmit) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your claim has been submitted for review. You'll receive updates on the status.")
            }
        }
    }

    private var policySection: some View {
        Section("Policy") {
            Picker("Policy", selection: $selectedPolicy) {
                Text("BCS-PPO-88472X (Premium Plus PPO)").tag("POL-2024-001")
            }
        }
    }

    private var detailsSection: some View {
        Section("Claim Details") {
            HStack {
                Text("$")
                    .foregroundStyle(.secondary)
                TextField("Amount", value: $amount, format: .number)
                    .keyboardType(.decimalPad)
            }

            TextField("Provider Name", text: $providerName)

            ZStack(alignment: .topLeading) {
                if description.isEmpty {
                    Text("Describe the service or procedure...")
                        .foregroundStyle(.tertiary)
                        .padding(.top, 8)
                        .padding(.leading, 4)
                }
                TextEditor(text: $description)
                    .frame(minHeight: 80)
            }
        }
    }

    private var documentsSection: some View {
        Section("Documents") {
            ForEach($documents) { $doc in
                HStack {
                    Image(systemName: doc.isUploaded ? "doc.checkmark.fill" : "doc.badge.plus")
                        .foregroundStyle(doc.isUploaded ? .green : .blue)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(doc.name)
                            .font(.subheadline)
                        Text(doc.type)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Button(doc.isUploaded ? "Uploaded" : "Upload") {
                        doc.isUploaded.toggle()
                    }
                    .font(.caption.bold())
                    .buttonStyle(.bordered)
                    .tint(doc.isUploaded ? .green : .blue)
                }
            }

            Button {
                documents.append(ClaimDocument(name: "Additional Document", type: "PDF", isUploaded: false))
            } label: {
                Label("Add Document", systemImage: "plus.circle")
            }
        }
    }

    private var submitSection: some View {
        Section {
            Button {
                submitClaim()
            } label: {
                HStack {
                    Spacer()
                    Text(isSubmitting ? "Submitting..." : "Submit Claim")
                        .font(.headline)
                    Spacer()
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(!isFormValid || isSubmitting)
            .listRowInsets(EdgeInsets())
            .listRowBackground(Color.clear)
        }
    }

    private var isFormValid: Bool {
        guard let amount, amount > 0 else { return false }
        return !description.isEmpty && !providerName.isEmpty
    }

    private func submitClaim() {
        guard let amount else { return }
        isSubmitting = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            viewModel.submitClaim(
                policyId: selectedPolicy,
                amount: amount,
                description: description,
                documents: documents
            )
            isSubmitting = false
            didSubmit = true
        }
    }
}

#Preview {
    NewClaimView()
}
