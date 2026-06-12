import SwiftUI

struct ConsentDetailView: View {
    let consent: ABDMConsent
    @Environment(\.dismiss)
    private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                consentHeader
                detailRows
                revokeButton
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Consent Details")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var consentHeader: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(.tint.opacity(0.12))
                    .frame(width: 64, height: 64)
                Image(systemName: "doc.checkmark.fill")
                    .font(.title)
                    .foregroundStyle(.tint)
            }
            Text(consent.grantedTo)
                .font(.title3)
                .fontWeight(.bold)
            Text(consent.purpose)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .dsShadow()
    }

    private var detailRows: some View {
        VStack(spacing: 0) {
            detailRow(label: "Status", value: consent.status, highlight: true)
            Divider().padding(.leading)
            detailRow(label: "Access Level", value: consent.accessLevel)
            Divider().padding(.leading)
            detailRow(label: "Granted To", value: consent.grantedTo)
            Divider().padding(.leading)
            detailRow(label: "Purpose", value: consent.purpose)
            Divider().padding(.leading)
            detailRow(label: "Expiry", value: consent.expiry)
            Divider().padding(.leading)
            detailRow(label: "Consent ID", value: consent.idString)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .dsShadow()
    }

    private func detailRow(label: String, value: String, highlight: Bool = false) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            if highlight {
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundStyle(value == "Active" ? .green : .secondary)
            } else {
                Text(value)
                    .font(.subheadline)
                    .foregroundStyle(.primary)
            }
        }
        .padding()
    }

    private var revokeButton: some View {
        Button(role: .destructive) {
            dismiss()
        } label: {
            Label("Revoke Consent", systemImage: "xmark.shield.fill")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(.red.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    NavigationStack {
        ConsentDetailView(
            consent: ABDMConsent(
                grantedTo: "Apollo Hospitals",
                purpose: "View Lab Reports",
                accessLevel: "Full Access",
                expiry: "Dec 31, 2026",
                status: "Active",
                idString: "ABDM-CN-2024-001234"
            )
        )
    }
}
