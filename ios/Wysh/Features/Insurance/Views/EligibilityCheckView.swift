import SwiftUI

struct EligibilityCheckView: View {
    @State private var selectedCategory: CoverageCategory = .hospitalization
    @State private var procedureDescription = ""
    @State private var estimatedCost: Double?
    @State private var isChecking = false
    @State private var eligibilityResult: EligibilityResult?

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                formSection
                if let result = eligibilityResult {
                    eligibilityResultCard(result)
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Eligibility Check")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Check") { checkEligibility() }
                    .disabled(procedureDescription.isEmpty || isChecking)
            }
        }
    }

    private var formSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Check Coverage")
                .font(.title2.bold())

            categoryPickerSection
            descriptionInputSection
            costInputSection
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var categoryPickerSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Procedure / Service Category")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Picker("Category", selection: $selectedCategory) {
                ForEach(CoverageCategory.allCases) { category in
                    Text(category.rawValue).tag(category)
                }
            }
            .pickerStyle(.menu)
            .padding(12)
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }

    private var descriptionInputSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Procedure Description")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            TextField("e.g., Knee MRI, Root Canal...", text: $procedureDescription)
                .textFieldStyle(.plain)
                .padding(12)
                .background(Color(.secondarySystemGroupedBackground))
                .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }

    private var costInputSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Estimated Cost (optional)")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            HStack {
                Text("$")
                    .foregroundStyle(.secondary)
                TextField("Amount", value: $estimatedCost, format: .number)
                    .textFieldStyle(.plain)
                    .keyboardType(.decimalPad)
            }
            .padding(12)
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }

    private func eligibilityResultCard(_ result: EligibilityResult) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            resultHeader(result)
            resultDetails(result)
            resultNote(result)
            resultPreAuthRow(result)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func resultHeader(_ result: EligibilityResult) -> some View {
        HStack {
            Image(systemName: result.isCovered ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.title2)
                .foregroundStyle(result.isCovered ? .green : .red)
            Text(result.isCovered ? "Coverage Available" : "Not Covered")
                .font(.headline)
        }
    }

    private func resultDetails(_ result: EligibilityResult) -> some View {
        Group {
            DetailRow(label: "Estimated Coverage", value: "$\(result.estimatedCoverage)")
            DetailRow(label: "Your Estimate", value: "$\(result.estimatedOOP)")
            DetailRow(label: "Coinsurance", value: "\(result.coinsurance)%")
            DetailRow(label: "Copay", value: "$\(result.copay)")
            DetailRow(label: "Deductible Applied", value: "$\(result.deductibleApplied)")
        }
    }

    private func resultNote(_ result: EligibilityResult) -> some View {
        Group {
            if let note = result.note {
                Text(note)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
    }

    private func resultPreAuthRow(_ result: EligibilityResult) -> some View {
        HStack(spacing: 12) {
            Label("Pre-Auth Required", systemImage: result.preAuthRequired ? "exclamationmark.triangle" : "checkmark.shield")
                .font(.caption.bold())
                .foregroundStyle(result.preAuthRequired ? .orange : .green)
            if result.preAuthRequired {
                NavigationLink(destination: CopilotView()) {
                    Text("Start Pre-Auth")
                        .font(.caption.bold())
                }
            }
        }
    }

    private func checkEligibility() {
        isChecking = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            let baseCost = estimatedCost ?? Double.random(in: 500...5_000)
            let coverage = baseCost * 0.8
            let oop = baseCost * 0.2
            eligibilityResult = EligibilityResult(
                isCovered: true,
                estimatedCoverage: Int(coverage),
                estimatedOOP: Int(oop),
                coinsurance: 20,
                copay: 50,
                deductibleApplied: 250,
                preAuthRequired: selectedCategory == .hospitalization,
                note: "This procedure is covered under your PPO plan with a 20% coinsurance after deductible."
            )
            isChecking = false
        }
    }
}

struct EligibilityResult {
    var isCovered: Bool
    var estimatedCoverage: Int
    var estimatedOOP: Int
    var coinsurance: Int
    var copay: Int
    var deductibleApplied: Int
    var preAuthRequired: Bool
    var note: String?
}

struct DetailRow: View {
    var label: String
    var value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline.bold())
        }
    }
}

#Preview {
    NavigationStack {
        EligibilityCheckView()
    }
}
