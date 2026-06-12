import SwiftUI

struct ForgotPasswordView: View {
    @State private var authViewModel = AuthViewModel()
    @State private var emailOrPhone = ""
    @State private var submitted = false
    @FocusState private var focusedField: Bool

    var body: some View {
        VStack(spacing: 0) {
            forgotPasswordHeader
            if !submitted {
                forgotPasswordForm
            } else {
                forgotPasswordConfirmation
            }
            Spacer()
        }
        .background(.white)
        .navigationBarTitleDisplayMode(.inline)
    }

    private var forgotPasswordHeader: some View {
        VStack(spacing: 0) {
            Spacer().frame(height: 60)
            Image(systemName: "lock.rotation")
                .font(.system(size: 52))
                .foregroundStyle(.blue)
                .symbolRenderingMode(.hierarchical)
            Text("Forgot Password")
                .font(.title2.weight(.semibold))
                .padding(.top, 12)
            Text("Enter your email or phone number to receive a reset link")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
                .padding(.top, 4)
            Spacer().frame(height: 32)
        }
    }

    private var forgotPasswordForm: some View {
        VStack(spacing: 0) {
            forgotPasswordTextFieldSection

            Button(
                action: {
                    focusedField = false
                    authViewModel.forgotPassword(contact: emailOrPhone)
                    withAnimation { submitted = true }
                },
                label: {
                    Text("Send Reset Link")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(!emailOrPhone.trimmingCharacters(in: .whitespaces).isEmpty ? .blue : .blue.opacity(0.4))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }
            )
            .disabled(emailOrPhone.trimmingCharacters(in: .whitespaces).isEmpty)
            .padding(.horizontal, 24)
            .padding(.top, 16)
        }
    }

    private var forgotPasswordTextFieldSection: some View {
        VStack(spacing: 16) {
            TextField("Email or phone number", text: $emailOrPhone)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .disableAutocorrection(true)
                .focused($focusedField)
                .padding(16)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .padding(.horizontal, 24)
    }

    private var forgotPasswordConfirmation: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 48))
                .foregroundStyle(.green)
            Text("Reset link sent!")
                .font(.title3.weight(.semibold))
            Text("Check your inbox or messages for the reset link.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 24)
    }
}
