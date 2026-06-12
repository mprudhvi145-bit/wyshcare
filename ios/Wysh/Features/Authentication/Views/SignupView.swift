import SwiftUI

struct SignupView: View {
    @State private var authViewModel = AuthViewModel()
    @State private var fullName = ""
    @State private var phoneNumber = ""
    @State private var email = ""
    @FocusState private var focusedField: Field?

    enum Field { case name, phone, email }

    private var isFormValid: Bool {
        !fullName.trimmingCharacters(in: .whitespaces).isEmpty
            && !phoneNumber.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var body: some View {
        VStack(spacing: 0) {
            Spacer().frame(height: 60)
            signupHeaderSection
            Spacer().frame(height: 32)
            signupFormFields
            Spacer().frame(height: 24)
            signupSubmitButton
            Spacer()
        }
        .background(.white)
        .navigationBarTitleDisplayMode(.inline)
    }

    private var signupHeaderSection: some View {
        VStack(spacing: 0) {
            Image(systemName: "person.crop.circle.badge.plus")
                .font(.system(size: 52))
                .foregroundStyle(.blue)
                .symbolRenderingMode(.hierarchical)
            Text("Create Account")
                .font(.title2.weight(.semibold))
                .padding(.top, 12)
            Text("Fill in your details to get started")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .padding(.top, 4)
        }
    }

    private var signupFormFields: some View {
        VStack(spacing: 16) {
            TextField("Full Name", text: $fullName)
                .textContentType(.name)
                .autocapitalization(.words)
                .focused($focusedField, equals: .name)
                .padding(16)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 14))

            TextField("Phone Number", text: $phoneNumber)
                .textContentType(.telephoneNumber)
                .keyboardType(.phonePad)
                .focused($focusedField, equals: .phone)
                .padding(16)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 14))

            TextField("Email (optional)", text: $email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .disableAutocorrection(true)
                .focused($focusedField, equals: .email)
                .padding(16)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .padding(.horizontal, 24)
    }

    private var signupSubmitButton: some View {
        Button {
            focusedField = nil
            authViewModel.signup(name: fullName, phone: phoneNumber, email: email)
        } label: {
            Text("Create Account")
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
}
