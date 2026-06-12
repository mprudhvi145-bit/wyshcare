import SwiftUI

struct SOAPNote: Identifiable {
    let id = UUID()
    let section: String
    let content: String
    let icon: String
    let color: Color
}

struct SOAPNotesView: View {
    @Environment(\.dismiss)
    private var dismiss
    @State private var notes: [SOAPNote] = []

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    headerView

                    ForEach(notes) { note in
                        SOAPSectionCard(note: note)
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("SOAP Notes")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Export") {
                        // Export action
                    }
                    .fontWeight(.medium)
                }
            }
            .onAppear {
                loadSampleNotes()
            }
        }
    }

    private var headerView: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Dr. Aarav Sharma")
                    .font(.subheadline.weight(.semibold))
                Text("Cardiology Consultation • \(Date.now.formatted(date: .abbreviated, time: .shortened))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
            ZStack {
                Circle()
                    .fill(Color.blue.opacity(0.1))
                    .frame(width: 40, height: 40)
                Image(systemName: "stethoscope")
                    .font(.system(size: 16))
                    .foregroundColor(.blue)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func loadSampleNotes() {
        notes = [
            SOAPNote(
                section: "Subjective",
                content: "Patient reports intermittent chest pain for the past 2 weeks. Pain is described as a dull ache, localized to the left side of chest, lasting 5-10 minutes. Provoked by physical exertion and stress. Relieved by rest. Associated with shortness of breath and mild dizziness. No history of similar episodes. Patient is a 45-year-old male, non-smoker, with a family history of coronary artery disease.",
                icon: "person.fill.questionmark",
                color: .blue
            ),
            SOAPNote(
                section: "Objective",
                content: "BP: 138/88 mmHg\nHR: 82 bpm, regular\nRR: 16/min\nSpO2: 98% on room air\nTemp: 36.8°C\nBMI: 27.4\n\nCVS: S1S2 normal, no murmurs\nRS: Air entry equal, clear\nECG: Normal sinus rhythm, no ST changes\nECHO: LVEF 55%, no wall motion abnormality",
                icon: "heart.text.square.fill",
                color: .red
            ),
            SOAPNote(
                section: "Assessment",
                content: "1. Atypical chest pain - likely musculoskeletal, but cardiac etiology cannot be ruled out given family history.\n2. Hypertension - Stage 1 (new diagnosis)\n3. Overweight (BMI 27.4)\n\nDifferential: Costochondritis, GERD, Anxiety disorder.",
                icon: "stethoscope",
                color: .orange
            ),
            SOAPNote(
                section: "Plan",
                content: "1. Prescribe T. Atenolol 25mg OD for BP control\n2. T. Pantoprazole 40mg OD - trial for GERD\n3. Stress test (TMT) to be scheduled within 1 week\n4. Lipid profile, HbA1c, TSH blood work\n5. Lifestyle modification: Low salt diet, 30min brisk walking daily\n6. Follow up in 2 weeks with reports\n7. Refer to cardiologist if symptoms persist",
                icon: "list.clipboard.fill",
                color: .green
            )
        ]
    }
}

struct SOAPSectionCard: View {
    let note: SOAPNote

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(note.color.opacity(0.15))
                        .frame(width: 32, height: 32)
                    Image(systemName: note.icon)
                        .font(.system(size: 14))
                        .foregroundColor(note.color)
                }
                Text(note.section)
                    .font(.headline.weight(.semibold))
                Spacer()
            }

            Text(note.content)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineSpacing(4)
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

#Preview {
    SOAPNotesView()
}
