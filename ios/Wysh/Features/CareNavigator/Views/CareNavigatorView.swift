import SwiftUI

struct CareNavigatorView: View {
    @State private var viewModel = CareNavigatorViewModel()
    @State private var messageText = ""
    @FocusState private var isInputFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollViewReader { proxy in
                    scrollContent(proxy: proxy)
                }

                Divider()

                inputBar
            }
            .navigationTitle("Care Navigator")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func scrollContent(proxy: ScrollViewProxy) -> some View {
        ScrollView {
            messageList
                .onChange(of: viewModel.messages.count) { _, _ in
                    withAnimation { proxy.scrollTo(viewModel.messages.last?.id ?? UUID(), anchor: .bottom) }
                }
                .onChange(of: viewModel.isTyping) { _, typing in
                    if typing { withAnimation { proxy.scrollTo(UUID(), anchor: .bottom) } }
                }
        }
        .background(Color(.systemGroupedBackground))
        .onTapGesture { isInputFocused = false }
    }

    private var messageList: some View {
        LazyVStack(spacing: 12) {
            welcomeMessage

            if viewModel.showSuggestedQuestions {
                suggestedQuestions
            }

            ForEach(viewModel.messages) { message in
                MessageBubbleView(message: message)
                    .id(message.id)
            }

            if viewModel.isTyping {
                typingIndicator
                    .id("typing")
            }
        }
        .padding()
    }

    private var welcomeMessage: some View {
        VStack(spacing: 8) {
            Image(systemName: "cross.circle.fill")
                .font(.system(size: 48))
                .foregroundStyle(.tint)
            Text("Hello, I'm your AI Care Navigator")
                .font(.title3)
                .fontWeight(.semibold)
                .multilineTextAlignment(.center)
            Text("Ask me anything about your health, medications, insurance, or care plan. I'm here to help.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .padding(.vertical, 24)
    }

    private var suggestedQuestions: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Suggested Questions")
                .font(.caption)
                .foregroundStyle(.secondary)
                .padding(.leading, 4)

            ForEach(viewModel.suggestedQuestions, id: \.self) { question in
                Button {
                    messageText = question
                    sendMessage()
                } label: {
                    Text(question)
                        .font(.subheadline)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(.ultraThinMaterial, in: Capsule())
                        .foregroundStyle(.primary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.bottom, 8)
    }

    private var typingIndicator: some View {
        HStack(spacing: 4) {
            Text("Wysh AI is typing")
                .font(.caption)
                .foregroundStyle(.secondary)
            ForEach(0..<3) { _ in
                Circle()
                    .fill(Color(.systemGray3))
                    .frame(width: 6, height: 6)
                    .opacity(viewModel.isTyping ? 0.3 : 1)
            }
            Spacer()
        }
        .padding(.horizontal, 4)
    }

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("Ask about your health...", text: $messageText)
                .textFieldStyle(.plain)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(Color(.systemGray6), in: Capsule())
                .focused($isInputFocused)
                .submitLabel(.send)
                .onSubmit {
                    sendMessage()
                }

            Button {
                sendMessage()
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(messageText.trimmingCharacters(in: .whitespaces).isEmpty ? Color(.systemGray3) : .accentColor)
            }
            .disabled(messageText.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(.ultraThinMaterial)
    }

    private func sendMessage() {
        let text = messageText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        messageText = ""
        isInputFocused = false
        viewModel.sendMessage(text)
    }
}

// MARK: - Message Bubble

struct MessageBubbleView: View {
    let message: ChatMessage

    var body: some View {
        Group {
            if message.isInsight {
                InsightCardView(message: message)
            } else {
                HStack {
                    if message.isUser { Spacer(minLength: 60) }
                    Text(message.text)
                        .font(.subheadline)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(message.isUser ? Color.accentColor : Color(.systemGray5))
                        .foregroundStyle(message.isUser ? .white : .primary)
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                    if !message.isUser { Spacer(minLength: 60) }
                }
            }
        }
    }
}

#Preview {
    CareNavigatorView()
}
