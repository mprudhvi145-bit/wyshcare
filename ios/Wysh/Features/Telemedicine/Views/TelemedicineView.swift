import SwiftUI

struct TelemedicineView: View {
    @State private var viewModel = TelemedicineViewModel()
    @Environment(\.dismiss)
    private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if viewModel.callState == .waiting {
                    waitingRoomView
                } else if viewModel.callState == .connected {
                    callView
                } else {
                    callEndedView
                }
            }
            .navigationTitle(viewModel.callState == .waiting ? "Waiting Room" : viewModel.callState == .connected ? "Consultation" : "Call Ended")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                trailingToolbarItem
                leadingToolbarItem
            }
            .sheet(isPresented: $viewModel.showSOAP) {
                SOAPNotesView()
            }
        }
    }

    @ToolbarContentBuilder private var trailingToolbarItem: some ToolbarContent {
        ToolbarItem(placement: .navigationBarTrailing) {
            if viewModel.callState != .ended {
                Button {
                    viewModel.toggleSOAP()
                } label: {
                    Image(systemName: "list.clipboard")
                        .fontWeight(.semibold)
                }
            }
        }
    }

    @ToolbarContentBuilder private var leadingToolbarItem: some ToolbarContent {
        ToolbarItem(placement: .navigationBarLeading) {
            if viewModel.callState == .waiting {
                Button("Leave") { dismiss() }
            }
        }
    }

    private var waitingRoomView: some View {
        VStack(spacing: 28) {
            Spacer()
            doctorProfileView
            waitStatsView
            consultationInfoView
            Spacer()
            joinButton
        }
        .padding()
        .background(Color(.systemGroupedBackground))
    }

    private var doctorProfileView: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.blue.opacity(0.1))
                    .frame(width: 120, height: 120)
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.blue)
            }

            VStack(spacing: 6) {
                Text("Dr. Aarav Sharma")
                    .font(.title2.weight(.bold))
                Text("Cardiologist")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }

    private var waitStatsView: some View {
        HStack(spacing: 24) {
            VStack(spacing: 4) {
                Text("Est. Wait")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("~3 min")
                    .font(.title3.weight(.bold))
                    .foregroundColor(.blue)
            }
            VStack(spacing: 4) {
                Text("Patients")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("2 ahead")
                    .font(.title3.weight(.bold))
                    .foregroundColor(.orange)
            }
            VStack(spacing: 4) {
                Text("Duration")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("30 min")
                    .font(.title3.weight(.bold))
            }
        }
    }

    private var consultationInfoView: some View {
        VStack(spacing: 4) {
            Text("Consultation ID: #CON-2024-8912")
                .font(.caption2)
                .foregroundStyle(.tertiary)
            Label("Video & audio will be recorded", systemImage: "record.circle")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }

    private var joinButton: some View {
        Button {
            withAnimation(.spring(response: 0.5)) {
                viewModel.startCall()
            }
        } label: {
            Label("Join Waiting Room", systemImage: "arrow.right.circle.fill")
                .font(.headline.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.blue)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .padding(.horizontal)
    }

    private var callView: some View {
        VStack(spacing: 0) {
            videoArea
            callControls
        }
        .background(Color.black)
    }

    private var videoArea: some View {
        ZStack {
            Rectangle()
                .fill(Color.black)

            VStack(spacing: 12) {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.gray)
                Text("Dr. Aarav Sharma")
                    .font(.title3.weight(.semibold))
                    .foregroundColor(.white)
                Text(viewModel.callDuration)
                    .font(.title.monospacedDigit())
                    .foregroundColor(.white)
            }
        }
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
    }

    private var callControls: some View {
        HStack(spacing: 28) {
            controlButton(
                icon: viewModel.isMicrophoneOn ? "mic.fill" : "mic.slash.fill",
                color: viewModel.isMicrophoneOn ? .white : .red
            ) { viewModel.toggleMicrophone() }
            controlButton(
                icon: viewModel.isCameraOn ? "video.fill" : "video.slash.fill",
                color: viewModel.isCameraOn ? .white : .red
            ) { viewModel.toggleCamera() }
            controlButton(
                icon: "speaker.wave.2.fill",
                color: viewModel.isSpeakerOn ? .white : .gray
            ) { viewModel.toggleSpeaker() }
            controlButton(
                icon: "list.clipboard",
                color: .white
            ) { viewModel.toggleSOAP() }
            controlButton(
                icon: "phone.down.fill",
                color: .red
            ) {
                withAnimation(.spring(response: 0.5)) {
                    viewModel.endCall()
                }
            }
        }
        .padding(.vertical, 24)
        .background(Color(.systemGray6).opacity(0.95))
    }

    private func controlButton(icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.2))
                    .frame(width: 56, height: 56)
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundColor(color)
            }
        }
    }

    private var callEndedView: some View {
        VStack(spacing: 24) {
            Spacer()
            endedIconView
            endedTextView
            Spacer()
            endedButtonsView
        }
        .padding()
        .background(Color(.systemGroupedBackground))
    }

    private var endedIconView: some View {
        ZStack {
            Circle()
                .fill(Color.gray.opacity(0.1))
                .frame(width: 100, height: 100)
            Image(systemName: "phone.down.fill")
                .font(.system(size: 40))
                .foregroundColor(.gray)
        }
    }

    private var endedTextView: some View {
        VStack(spacing: 6) {
            Text("Call Ended")
                .font(.title2.weight(.bold))
            VStack(spacing: 6) {
                Text("Duration: \(viewModel.callDuration)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text("Dr. Aarav Sharma - Cardiologist")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }

    private var endedButtonsView: some View {
        VStack(spacing: 12) {
            Button {
                viewModel.showSOAP = true
            } label: {
                Label("View SOAP Notes", systemImage: "list.clipboard")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }

            Button {
                dismiss()
            } label: {
                Text("End Session")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color(.systemGray6))
                    .foregroundColor(.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
        .padding(.horizontal)
    }
}

#Preview {
    TelemedicineView()
}
