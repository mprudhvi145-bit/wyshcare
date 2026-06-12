import SwiftUI

struct AddFamilyMemberView: View {
    @State private var viewModel = FamilyViewModel()
    @State private var name = ""
    @State private var phone = ""
    @State private var selectedRelationship: Relationship = .spouse
    @State private var isInviting = false
    @State private var didInvite = false
    @Environment(\.dismiss)
    private var dismiss

    var body: some View {
        NavigationStack {
            formContent
        }
    }

    private var formContent: some View {
        Form {
            personalInfoSection
            inviteSection
            infoSection
        }
        .navigationTitle("Add Member")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button("Cancel") { dismiss() }
            }
        }
        .alert("Invitation Sent", isPresented: $didInvite) {
            Button("OK") { dismiss() }
        } message: {
            Text("An invitation has been sent to \(name) at \(phone). They'll be added once they accept.")
        }
    }

    private var personalInfoSection: some View {
        Section("Personal Information") {
            TextField("Full Name", text: $name)
                .textContentType(.name)

            TextField("Phone Number", text: $phone)
                .textContentType(.telephoneNumber)
                .keyboardType(.phonePad)

            Picker("Relationship", selection: $selectedRelationship) {
                ForEach(Relationship.allCases) { relationship in
                    Text(relationship.rawValue).tag(relationship)
                }
            }
        }
    }

    private var inviteSection: some View {
        Section {
            Button {
                inviteMember()
            } label: {
                HStack {
                    Spacer()
                    if isInviting {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Label("Invite Member", systemImage: "envelope.badge.fill")
                            .font(.headline)
                    }
                    Spacer()
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || isInviting)
            .listRowInsets(EdgeInsets())
            .listRowBackground(Color.clear)
        }
    }

    private var infoSection: some View {
        Section {
            VStack(alignment: .leading, spacing: 8) {
                Label("Member will receive an invite via SMS", systemImage: "info.circle.fill")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Label("Health data is shared privately and securely", systemImage: "lock.shield.fill")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Label("They can accept or decline the invitation", systemImage: "person.badge.key.fill")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(.vertical, 4)
        }
    }

    private func inviteMember() {
        guard !name.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        isInviting = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            viewModel.addMember(name: name, phone: phone, relationship: selectedRelationship)
            isInviting = false
            didInvite = true
        }
    }
}

#Preview {
    AddFamilyMemberView()
}
