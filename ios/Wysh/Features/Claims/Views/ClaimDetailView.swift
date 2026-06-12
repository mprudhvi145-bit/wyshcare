import SwiftUI

struct ClaimDetailView: View {
    var claim: Claim

    var body: some View {
        List {
            claimInfoSection
            timelineSection
            documentsSection
            providerNotesSection
        }
        .navigationTitle("Claim \(claim.id)")
        .navigationBarTitleDisplayMode(.inline)
    }

    @ViewBuilder private var claimInfoSection: some View {
        Section {
            VStack(spacing: 0) {
                LabeledContent("Claim ID", value: claim.id)
                LabeledContent("Amount", value: "$\(claim.amount)")
                LabeledContent("Status", value: claim.status.rawValue)
                LabeledContent("Date Filed", value: claim.date.formatted(date: .abbreviated, time: .omitted))
                LabeledContent("Provider", value: claim.provider)
                LabeledContent("Description", value: claim.description)
            }
        } header: {
            Text("Claim Information")
        }
    }

    private var timelineSection: some View {
        Section("Timeline") {
            ForEach(Array(claim.timeline.enumerated()), id: \.element.id) { index, entry in
                HStack(alignment: .top, spacing: 14) {
                    VStack(spacing: 0) {
                        Image(systemName: entry.status.icon)
                            .font(.caption)
                            .foregroundStyle(timelineColor(for: entry.status))
                            .frame(width: 24, height: 24)
                            .background(timelineColor(for: entry.status).opacity(0.12))
                            .clipShape(Circle())
                        if index < claim.timeline.count - 1 {
                            Rectangle()
                                .fill(Color(.systemGray4))
                                .frame(width: 1, height: 30)
                        }
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.status.rawValue)
                            .font(.subheadline.bold())
                        Text(entry.note)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(entry.date.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                    .padding(.bottom, index < claim.timeline.count - 1 ? 8 : 0)
                }
            }
        }
    }

    private var documentsSection: some View {
        Section("Documents") {
            ForEach(claim.documents) { doc in
                HStack {
                    Image(systemName: "doc.text")
                        .foregroundStyle(doc.isUploaded ? .green : .orange)
                    Text(doc.name)
                        .font(.subheadline)
                    Spacer()
                    Text(doc.type)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Image(systemName: doc.isUploaded ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                        .foregroundStyle(doc.isUploaded ? .green : .orange)
                        .font(.caption)
                }
            }
        }
    }

    private var providerNotesSection: some View {
        Section("Provider Notes") {
            Text("No additional notes from provider.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private func labeledRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .multilineTextAlignment(.trailing)
        }
    }

    private func statusColor(for status: ClaimStatus) -> Color {
        switch status {
        case .approved:
            return .green

        case .pending:
            return .orange

        case .rejected:
            return .red

        case .settled:
            return .purple

        case .underReview:
            return .blue
        }
    }

    private func timelineColor(for status: TimelineStatus) -> Color {
        switch status {
        case .approved:
            return .green

        case .rejected:
            return .red

        case .settled:
            return .purple

        case .submitted:
            return .blue

        case .underReview:
            return .orange
        }
    }
}

#Preview {
    NavigationStack {
        ClaimDetailView(
            claim: Claim(
                id: "CLM-8847",
                policyId: "POL-2024-001",
                amount: 1_250,
                status: .approved,
                date: Date(),
                provider: "City General Hospital",
                description: "ER visit — chest pain evaluation",
                documents: [
                    ClaimDocument(name: "ER Summary Report", type: "PDF", isUploaded: true)
                ],
                timeline: [
                    ClaimTimelineEntry(status: .submitted, date: Date().addingTimeInterval(-86_400 * 14), note: "Claim submitted"),
                    ClaimTimelineEntry(status: .underReview, date: Date().addingTimeInterval(-86_400 * 10), note: "Under review"),
                    ClaimTimelineEntry(status: .approved, date: Date(), note: "Approved")
                ]
            )
        )
    }
}
