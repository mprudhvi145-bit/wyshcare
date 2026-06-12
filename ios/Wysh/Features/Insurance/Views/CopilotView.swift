import SwiftUI

struct CopilotView: View {
    @State private var messages: [CopilotMessage] = [
        CopilotMessage(role: .assistant, content: "Hi! I'm your Claims Copilot. I can help analyze your claims, check document completeness, and predict approval risks. What would you like to review?")
    ]
    @State private var inputText = ""
    @State private var isAnalyzing = false
    @State private var showAnalysis = false

    var body: some View {
        VStack(spacing: 0) {
            riskScoreBanner
            copilotChatSection
            copilotInputBar
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("AI Claims Copilot")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var copilotChatSection: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(messages) { message in
                        ChatBubble(message: message)
                            .id(message.id)
                    }
                    if isAnalyzing {
                        analyzingIndicator
                    }
                    if showAnalysis {
                        analysisCard
                            .id("analysis")
                    }
                }
                .padding()
            }
            .onChange(of: messages.count) { _, _ in
                withAnimation { proxy.scrollTo(messages.last?.id, anchor: .bottom) }
            }
        }
    }

    private var analyzingIndicator: some View {
        HStack {
            ProgressView()
                .padding(.trailing, 4)
            Text("Analyzing...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal)
    }

    private var copilotInputBar: some View {
        HStack(spacing: 12) {
            TextField("Ask about your claim...", text: $inputText)
                .textFieldStyle(.plain)
                .padding(12)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 20))

            Button {
                sendMessage()
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.title2)
                    .foregroundStyle(.blue)
            }
            .disabled(inputText.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
    }

    private var riskScoreBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.shield.fill")
                .foregroundStyle(.orange)
            VStack(alignment: .leading, spacing: 2) {
                Text("Claim Risk Score: 72/100")
                    .font(.subheadline.bold())
                Text("Medium risk — document review recommended")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Button("Review") { showAnalysis.toggle() }
                .font(.caption.bold())
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(.orange.opacity(0.15))
                .foregroundStyle(.orange)
                .clipShape(Capsule())
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
    }

    private var analysisCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Pre-Submit Analysis")
                .font(.headline)

            Group {
                analysisRow(icon: "doc.text.magnifyingglass", label: "Document Completeness", status: "3 of 4 documents uploaded", color: .orange)
                analysisRow(icon: "checkmark.shield", label: "Coverage Verification", status: "Procedure is covered", color: .green)
                analysisRow(icon: "exclamationmark.triangle", label: "Pre-Authorization", status: "Required — not yet obtained", color: .red)
                analysisRow(icon: "calendar.badge.clock", label: "Filing Timeline", status: "Within 90-day window", color: .green)
                analysisRow(icon: "dollarsign.circle", label: "Estimated Reimbursement", status: "$2,450 (80% of $3,062)", color: .blue)
            }

            Button("Submit for Review") {
                withAnimation {
                    messages.append(CopilotMessage(role: .assistant, content: "I've submitted your claim for initial review. You'll be notified once the pre-review is complete. Current estimated processing time: 5-7 business days."))
                    showAnalysis = false
                }
            }
            .buttonStyle(.borderedProminent)
            .frame(maxWidth: .infinity)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal)
    }

    private func analysisRow(icon: String, label: String, status: String, color: Color) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .foregroundStyle(color)
                .frame(width: 20)
            Text(label)
                .font(.subheadline)
            Spacer()
            Text(status)
                .font(.caption)
                .foregroundStyle(color)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(color.opacity(0.1))
                .clipShape(Capsule())
        }
    }

    private func sendMessage() {
        let text = inputText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        messages.append(CopilotMessage(role: .user, content: text))
        inputText = ""
        isAnalyzing = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            isAnalyzing = false
            let response: String
            if text.lowercased().contains("risk") {
                response = "Based on my analysis, your claim has a risk score of 72/100. The main risk factors are: (1) Missing pre-authorization documentation, (2) Procedure code requires medical necessity review. I recommend uploading the pre-auth form and adding a physician's letter of medical necessity."
            } else if text.lowercased().contains("document") {
                response = "I've checked your documents. You have uploaded 3 of 4 required items:\n✅ Claim form (signed)\n✅ Itemized bill\n✅ Physician referral\n❌ Pre-authorization certificate (missing)\n\nWould you like me to generate the pre-authorization form?"
            } else {
                response = "I've reviewed your policy and claim details. Your PPO plan covers this procedure at 80% after a $2,500 deductible. The estimated out-of-pocket cost is $612. Would you like a detailed breakdown or help with any specific concern?"
            }
            withAnimation {
                messages.append(CopilotMessage(role: .assistant, content: response))
            }
        }
    }
}

struct CopilotMessage: Identifiable {
    let id = UUID()
    var role: ChatRole
    var content: String
}

enum ChatRole {
    case assistant
    case user
}

struct ChatBubble: View {
    var message: CopilotMessage

    var body: some View {
        HStack {
            if message.role == .user { Spacer(minLength: 60) }
            Text(message.content)
                .font(.subheadline)
                .padding(12)
                .background(message.role == .user ? Color.blue : Color(.systemGray5))
                .foregroundStyle(message.role == .user ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            if message.role == .assistant { Spacer(minLength: 60) }
        }
    }
}

#Preview {
    NavigationStack {
        CopilotView()
    }
}
