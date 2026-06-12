import SwiftUI

struct ABDMView: View {
    @State private var viewModel = ABDMViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    abhaProfileCard
                    consentManagerSection
                    healthInformationExchangeSection
                    careContextsSection
                    importShareSection
                    statusOverviewCard
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("ABDM")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private var abhaProfileCard: some View {
        VStack(spacing: 12) {
            abhaProfileContent
            abhaProfileAction
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .dsShadow()
        .sheet(isPresented: $viewModel.showProfile) {
            ABHAProfileView(viewModel: viewModel)
        }
    }

    private var abhaProfileContent: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(.tint.opacity(0.12))
                    .frame(width: 56, height: 56)
                Image(systemName: "person.fill")
                    .font(.title2)
                    .foregroundStyle(.tint)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(viewModel.abhaProfile.name)
                    .font(.headline)
                Text(viewModel.abhaProfile.abhaNumber)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .monospaced()
                statusBadge(viewModel.abhaProfile.isLinked)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var abhaProfileAction: some View {
        Group {
            if viewModel.abhaProfile.isLinked {
                Button("View Profile") {
                    viewModel.showProfile = true
                }
                .buttonStyle(.borderedProminent)
                .frame(maxWidth: .infinity)
            } else {
                Button("Link ABHA") {
                    viewModel.linkABHA()
                }
                .buttonStyle(.bordered)
                .frame(maxWidth: .infinity)
            }
        }
    }

    private func statusBadge(_ linked: Bool) -> some View {
        HStack(spacing: 4) {
            Circle()
                .fill(linked ? .green : .orange)
                .frame(width: 6, height: 6)
            Text(linked ? "Linked" : "Not Linked")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private var consentManagerSection: some View {
        SectionCard(title: "Consent Manager", icon: "doc.checkmark") {
            if viewModel.activeConsents.isEmpty {
                Text("No active consents")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(viewModel.activeConsents) { consent in
                    NavigationLink(destination: ConsentDetailView(consent: consent)) {
                        ConsentRowView(consent: consent)
                    }
                    .buttonStyle(.plain)
                    if consent.id != viewModel.activeConsents.last?.id {
                        Divider()
                    }
                }
            }
            Button("Request New Consent") {
                viewModel.requestConsent()
            }
            .font(.subheadline)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 8)
        }
    }

    private var healthInformationExchangeSection: some View {
        SectionCard(title: "Health Information Exchange", icon: "arrow.left.arrow.right") {
            VStack(alignment: .leading, spacing: 8) {
                ForEach(viewModel.importedRecords, id: \.id) { record in
                    HStack {
                        Image(systemName: record.type.icon)
                            .foregroundStyle(.tint)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(record.title)
                                .font(.subheadline)
                            Text(record.date)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text(record.source)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if record.id != viewModel.importedRecords.last?.id {
                        Divider()
                    }
                }
            }
        }
    }

    private var careContextsSection: some View {
        SectionCard(title: "Care Contexts", icon: "building.2") {
            ForEach(viewModel.careContexts, id: \.id) { context in
                HStack {
                    Image(systemName: "building.columns.fill")
                        .foregroundStyle(.tint)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(context.facility)
                            .font(.subheadline)
                            .fontWeight(.medium)
                        Text(context.program)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text(context.status)
                        .font(.caption)
                        .foregroundStyle(.green)
                }
                if context.id != viewModel.careContexts.last?.id {
                    Divider()
                }
            }
        }
    }

    private var importShareSection: some View {
        HStack(spacing: 12) {
            Button {
                viewModel.importRecords()
            } label: {
                Label("Import Records", systemImage: "square.and.arrow.down")
                    .font(.subheadline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color(.systemBackground), in: RoundedRectangle(cornerRadius: 12))
            }
            .buttonStyle(.plain)

            Button {
                viewModel.shareRecords()
            } label: {
                Label("Share Records", systemImage: "square.and.arrow.up")
                    .font(.subheadline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color(.systemBackground), in: RoundedRectangle(cornerRadius: 12))
            }
            .buttonStyle(.plain)
        }
    }

    private var statusOverviewCard: some View {
        SectionCard(title: "Status Overview", icon: "gauge.with.dots.needle.33percent") {
            VStack(spacing: 10) {
                statusRow(label: "ABHA Linked", value: viewModel.abhaProfile.isLinked ? "Yes" : "No")
                Divider()
                statusRow(label: "Active Consents", value: "\(viewModel.activeConsents.count)")
                Divider()
                statusRow(label: "Imported Records", value: "\(viewModel.importedRecords.count)")
                Divider()
                statusRow(label: "Linked Facilities", value: "\(viewModel.careContexts.count)")
            }
        }
    }

    private func statusRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
    }
}

// MARK: - Supporting Views

struct SectionCard<Content: View>: View {
    let title: String
    let icon: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.headline)
                    .foregroundStyle(.tint)
                Text(title)
                    .font(.headline)
            }
            content
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .dsShadow()
    }
}

struct ConsentRowView: View {
    let consent: ABDMConsent

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(consent.grantedTo)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(consent.purpose)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text(consent.status)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundStyle(consent.status == "Active" ? .green : .secondary)
                .padding(.horizontal, 8)
                .padding(.vertical, 2)
                .background(consent.status == "Active" ? Color.green.opacity(0.12) : Color(.systemGray5), in: Capsule())
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ABDMView()
}
