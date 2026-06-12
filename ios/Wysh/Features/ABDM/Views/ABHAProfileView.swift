import SwiftUI

struct ABHAProfileView: View {
    let viewModel: ABDMViewModel

    @Environment(\.dismiss)
    private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    profileHeader
                    profileDetails
                    linkedPrograms
                    authenticationMethods
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("ABHA Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }

    private var profileHeader: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(.tint.opacity(0.12))
                    .frame(width: 80, height: 80)
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(.tint)
            }
            Text(viewModel.abhaProfile.name)
                .font(.title2)
                .fontWeight(.bold)
            Text(viewModel.abhaProfile.abhaNumber)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .monospaced()
            HStack(spacing: 4) {
                Circle()
                    .fill(viewModel.abhaProfile.isLinked ? .green : .orange)
                    .frame(width: 8, height: 8)
                Text(viewModel.abhaProfile.isLinked ? "Linked" : "Not Linked")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .dsShadow()
    }

    private var profileDetails: some View {
        VStack(spacing: 0) {
            profileRow(label: "Full Name", value: viewModel.abhaProfile.name)
            Divider().padding(.leading)
            profileRow(label: "ABHA Number", value: viewModel.abhaProfile.abhaNumber)
            Divider().padding(.leading)
            profileRow(label: "Phone", value: viewModel.abhaProfile.phone)
            Divider().padding(.leading)
            profileRow(label: "Email", value: viewModel.abhaProfile.email)
            Divider().padding(.leading)
            profileRow(label: "Date of Birth", value: viewModel.abhaProfile.dob)
            Divider().padding(.leading)
            profileRow(label: "Gender", value: viewModel.abhaProfile.gender)
            Divider().padding(.leading)
            profileRow(label: "Blood Group", value: viewModel.abhaProfile.bloodGroup)
            Divider().padding(.leading)
            profileRow(label: "Address", value: viewModel.abhaProfile.address)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .dsShadow()
    }

    private func profileRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .frame(width: 100, alignment: .leading)
            Text(value)
                .font(.subheadline)
            Spacer()
        }
        .padding()
    }

    private var linkedPrograms: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Linked Programs")
                .font(.headline)
            if viewModel.linkedPrograms.isEmpty {
                Text("No programs linked")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                ForEach(viewModel.linkedPrograms, id: \.id) { program in
                    HStack {
                        Image(systemName: "building.columns.fill")
                            .foregroundStyle(.tint)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(program.name)
                                .font(.subheadline)
                                .fontWeight(.medium)
                            Text(program.description)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text(program.status)
                            .font(.caption)
                            .foregroundStyle(.green)
                    }
                    .padding()
                    .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 10))
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .dsShadow()
    }

    private var authenticationMethods: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Authentication Methods")
                .font(.headline)
            authRow(method: "Aadhaar OTP", linked: true)
            authRow(method: "Mobile OTP", linked: true)
            authRow(method: "Biometric", linked: false)
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .dsShadow()
    }

    private func authRow(method: String, linked: Bool) -> some View {
        HStack {
            Image(systemName: linked ? "lock.fill" : "lock.open")
                .foregroundStyle(linked ? .green : .secondary)
            Text(method)
                .font(.subheadline)
            Spacer()
            Text(linked ? "Linked" : "Not linked")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ABHAProfileView(
        viewModel: ABDMViewModel()
    )
}
