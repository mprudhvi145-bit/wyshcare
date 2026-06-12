import QuickLook
import SwiftUI

struct RecordDetailView: View {
    let record: HealthRecordItem
    @Environment(\.dismiss)
    private var dismiss
    @State private var showShareSheet = false
    @State private var showDeleteConfirmation = false
    @State private var isDownloading = false

    var body: some View {
        NavigationStack {
            contentView
        }
    }

    private var contentView: some View {
        ScrollView {
            VStack(spacing: 20) {
                headerSection
                previewSection
                metadataSection
                actionsSection
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Record Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Done") { dismiss() }
                    .fontWeight(.semibold)
            }
        }
        .confirmationDialog(
            "Delete this record?",
            isPresented: $showDeleteConfirmation,
            titleVisibility: .visible
        ) {
            Button("Delete", role: .destructive) {
                deleteRecord()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This action cannot be undone.")
        }
        .sheet(isPresented: $showShareSheet) {
            if let url = record.fileURL {
                ShareSheet(items: [url])
            }
        }
    }

    private var headerSection: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(record.type.color.opacity(0.15))
                    .frame(width: 72, height: 72)
                Image(systemName: record.type.icon)
                    .font(.system(size: 30))
                    .foregroundColor(record.type.color)
            }

            Text(record.title)
                .font(.title2.weight(.bold))
                .multilineTextAlignment(.center)

            HStack(spacing: 8) {
                Text(record.type.rawValue)
                    .font(.caption.weight(.medium))
                    .foregroundColor(record.type.color)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(record.type.color.opacity(0.12))
                    .clipShape(Capsule())

                Text(record.date, style: .date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var documentPreviewCard: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray6))
                .frame(height: 200)
            VStack(spacing: 8) {
                Image(systemName: "doc.viewfinder.fill")
                    .font(.system(size: 40))
                    .foregroundColor(.blue)
                Text("Tap to preview document")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }

    private var summaryPreviewCard: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray6))
                .frame(height: 120)
            VStack(spacing: 6) {
                Image(systemName: "text.alignleft")
                    .font(.system(size: 28))
                    .foregroundColor(.secondary)
                Text(record.summary)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
        }
    }

    private var previewContent: some View {
        Group {
            if record.fileURL != nil {
                documentPreviewCard
            } else {
                summaryPreviewCard
            }
        }
    }

    private var previewSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Preview", systemImage: "eye.fill")
                .font(.subheadline.weight(.semibold))

            previewContent
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var metadataSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Details", systemImage: "info.circle.fill")
                .font(.subheadline.weight(.semibold))

            VStack(spacing: 0) {
                metadataRow(label: "Record Type", value: record.type.rawValue)
                Divider()
                metadataRow(label: "Date", value: record.date.formatted(date: .long, time: .shortened))
                Divider()
                metadataRow(label: "Summary", value: record.summary)
                Divider()
                metadataRow(
                    label: "File",
                    value: record.fileURL?.lastPathComponent ?? "Not available"
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func metadataRow(label: String, value: String) -> some View {
        HStack(alignment: .top) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
                .frame(width: 80, alignment: .leading)
            Text(value)
                .font(.caption)
                .foregroundColor(.primary)
            Spacer()
        }
        .padding(.vertical, 8)
    }

    private var shareRecordButton: some View {
        Button {
            showShareSheet = true
        } label: {
            Label("Share", systemImage: "square.and.arrow.up")
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.blue)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var downloadButton: some View {
        Button {
            isDownloading = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                isDownloading = false
            }
        } label: {
            Label(
                isDownloading ? "Downloading..." : "Download",
                systemImage: isDownloading ? "arrow.down.circle.fill" : "arrow.down.circle"
            )
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color(.systemGray6))
                .foregroundColor(.primary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(isDownloading)
    }

    private var deleteRecordButton: some View {
        Button(role: .destructive) {
            showDeleteConfirmation = true
        } label: {
            Label("Delete Record", systemImage: "trash")
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.red.opacity(0.1))
                .foregroundColor(.red)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var actionsContent: some View {
        VStack(spacing: 10) {
            shareRecordButton
            downloadButton
            deleteRecordButton
        }
    }

    private var actionsSection: some View {
        actionsContent
    }

    private func deleteRecord() {
        dismiss()
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    RecordDetailView(
        record: HealthRecordItem(
            title: "Complete Blood Count",
            date: Date(),
            type: .labReports,
            summary: "Hb: 14.2 g/dL, WBC: 7800/μL, Platelets: 2.5L/μL",
            fileURL: nil
        )
    )
}
