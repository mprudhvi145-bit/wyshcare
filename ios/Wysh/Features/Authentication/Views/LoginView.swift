import SwiftUI

struct LoginView: View {
    @State private var authViewModel = AuthViewModel()
    @State private var emailOrPhone = ""
    @FocusState private var focusedField: Bool

    private var isFormValid: Bool {
        !emailOrPhone.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var body: some View {
        VStack(spacing: 0) {
            Spacer().frame(height: 80)
            loginLogoSection
            loginWelcomeSection
            Spacer().frame(height: 32)
            loginFormSection
            Spacer().frame(height: 24)
            socialLoginSection
            Spacer()
            termsFooter
        }
        .background(.white)
        .navigationBarHidden(true)
    }

    private var loginLogoSection: some View {
        VStack(spacing: 0) {
            Image(systemName: "heart.text.square.fill")
                .font(.system(size: 60))
                .foregroundStyle(.blue)
                .symbolRenderingMode(.hierarchical)
            Text("Wysh")
                .font(.largeTitle.weight(.bold))
                .padding(.top, 8)
        }
    }

    private var loginWelcomeSection: some View {
        VStack(spacing: 0) {
            Spacer().frame(height: 40)
            Text("Welcome to Wysh")
                .font(.title2.weight(.semibold))
            Text("Your health, simplified")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .padding(.top, 4)
        }
    }

    private var loginFormSection: some View {
        VStack(spacing: 16) {
            TextField("Phone number or email", text: $emailOrPhone)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .disableAutocorrection(true)
                .focused($focusedField)
                .padding(16)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 14))

            Button {
                focusedField = false
                authViewModel.login(emailOrPhone: emailOrPhone)
            } label: {
                Text("Continue")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(isFormValid ? .blue : .blue.opacity(0.4))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .disabled(!isFormValid)
        }
        .padding(.horizontal, 24)
    }

    private var socialLoginSection: some View {
        VStack(spacing: 12) {
            socialButton(
                icon: "applelogo",
                title: "Continue with Apple",
                scheme: .dark
            ) {
                focusedField = false
                authViewModel.loginWithApple()
            }

            socialButton(
                icon: "g.circle.fill",
                title: "Continue with Google",
                scheme: .light
            ) {
                focusedField = false
                authViewModel.loginWithGoogle()
            }
        }
        .padding(.horizontal, 24)
    }

    private var termsFooter: some View {
        HStack(spacing: 4) {
            Text("By continuing, you agree to our")
                .font(.caption2)
                .foregroundStyle(.secondary)
            Button("Terms of Service") {}
                .font(.caption2)
                .foregroundStyle(.blue)
            Text("and")
                .font(.caption2)
                .foregroundStyle(.secondary)
            Button("Privacy Policy") {}
                .font(.caption2)
                .foregroundStyle(.blue)
        }
        .padding(.bottom, 32)
    }

    private func socialButton(
        icon: String,
        title: String,
        scheme: ColorScheme,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            Label(title, systemImage: icon)
                .font(.headline)
                .foregroundStyle(scheme == .dark ? .white : .black)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(scheme == .dark ? .black : Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(
                    scheme == .light ?
                    RoundedRectangle(cornerRadius: 14).stroke(Color(.systemGray4), lineWidth: 1) : nil
                )
        }
    }
}
