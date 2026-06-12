import Observation
import SwiftUI

enum CallState {
    case connected
    case ended
    case waiting
}

@Observable
final class TelemedicineViewModel {
    var callState: CallState = .waiting
    var isMicrophoneOn = true
    var isCameraOn = true
    var isSpeakerOn = false
    var showSOAP = false
    var callDuration = "00:00"

    private var timer: Timer?
    private var secondsElapsed = 0

    func startCall() {
        callState = .connected
        startTimer()
    }

    func endCall() {
        stopTimer()
        callState = .ended
    }

    func toggleMicrophone() {
        isMicrophoneOn.toggle()
    }

    func toggleCamera() {
        isCameraOn.toggle()
    }

    func toggleSpeaker() {
        isSpeakerOn.toggle()
    }

    func toggleSOAP() {
        showSOAP.toggle()
    }

    private func startTimer() {
        secondsElapsed = 0
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self else { return }
            secondsElapsed += 1
            let minutes = secondsElapsed / 60
            let seconds = secondsElapsed % 60
            callDuration = String(format: "%02d:%02d", minutes, seconds)
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    deinit {
        timer?.invalidate()
    }
}
