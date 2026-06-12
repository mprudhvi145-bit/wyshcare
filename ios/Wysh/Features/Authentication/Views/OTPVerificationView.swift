import SwiftUI

struct OTPVerificationView: View {
    @State private var authViewModel: AuthViewModel
    @State private var otpDigits: [String] = Array(repeating: "", count: 6)
    @FocusState private var focusedIndex: Int?
    @State private var timeRemaining = 30
    @State private var canResend = false

    let phoneNumber: String
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    init(phoneNumber: String) {
        self.phoneNumber = phoneNumber
        self.authViewModel = AuthViewModel()
    }

    private var maskedPhone: String {
        guard phoneNumber.count > 4 else { return phoneNumber }
        let last4 = String(phoneNumber.suffix(4))
        return "XXXXXX\(last4)"
    }

    private var isFormValid: Bool {
        otpDigits.allSatisfy { $0.count == 1 && $0.rangeOfCharacter(from: CharacterSet.decimalDigits) != nil }
    }

    var body: some View {
        VStack(spacing: 24) {
            Spacer().frame(height: 40)
            otpHeaderSection
            Spacer().frame(height: 16)
            otpFieldsSection
            otpVerifyButton
            otpResendButton
            Spacer()
        }
        .background(.white)
        .navigationBarTitleDisplayMode(.inline)
        .onReceive(timer) { _ in
            if timeRemaining > 0 {
                timeRemaining -= 1
                canResend = false
            } else {
                canResend = true
            }
        }
        .onAppear { focusedIndex = 0 }
    }

    private var otpHeaderSection: some View {
        VStack(spacing: 0) {
            Text("Enter Verification Code")
                .font(.title2.weight(.semibold))
            Text("We sent a code to \(maskedPhone)")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private var otpFieldsSection: some View {
        HStack(spacing: 10) {
            ForEach(0..<6, id: \.self) { index in
                TextField("", text: $otpDigits[index])
                    .font(.title.weight(.bold))
                    .multilineTextAlignment(.center)
                    .frame(width: 48, height: 56)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(focusedIndex == index ? .blue : .clear, lineWidth: 2)
                    )
                    .keyboardType(.numberPad)
                    .focused($focusedIndex, equals: index)
                    .onChange(of: otpDigits[index]) { _, newValue in
                        if newValue.count > 1 {
                            otpDigits[index] = String(newValue.suffix(1))
                        }
                        if !newValue.isEmpty && index < 5 {
                            focusedIndex = index + 1
                        }
                    }
            }
        }
        .padding(.horizontal, 24)
    }

    private var otpVerifyButton: some View {
        Button {
            let code = otpDigits.joined()
            focusedIndex = nil
            authViewModel.verifyOTP(code: code)
        } label: {
            Text("Verify")
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(isFormValid ? .blue : .blue.opacity(0.4))
                .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .disabled(!isFormValid)
        .padding(.horizontal, 24)
    }

    private var otpResendButton: some View {
        Button {
            resendCode()
        } label: {
            Text(canResend ? "Resend Code" : "Resend code in \(timeRemaining)s")
                .font(.subheadline)
                .foregroundStyle(canResend ? .blue : .secondary)
        }
        .disabled(!canResend)
    }

    private func resendCode() {
        guard canResend else { return }
        timeRemaining = 30
        canResend = false
        otpDigits = Array(repeating: "", count: 6)
        focusedIndex = 0
        authViewModel.resendOTP()
    }
}
