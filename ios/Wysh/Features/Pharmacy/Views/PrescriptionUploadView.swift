import PhotosUI
import SwiftUI

struct PrescriptionUploadView: View {
    @Environment(\.dismiss)
    private var dismiss
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var selectedImageData: Data?
    @State private var isUploading = false
    @State private var uploadComplete = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    headerSection
                    uploadArea
                    instructionsSection
                    submitButton
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Upload Prescription")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
            }
            .alert("Prescription Submitted", isPresented: $uploadComplete) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your prescription has been uploaded successfully. Our team will verify it shortly.")
            }
        }
    }

    private var headerSection: some View {
        VStack(spacing: 6) {
            ZStack {
                Circle()
                    .fill(Color.blue.opacity(0.1))
                    .frame(width: 64, height: 64)
                Image(systemName: "doc.text.viewfinder")
                    .font(.system(size: 28))
                    .foregroundColor(.blue)
            }

            Text("Upload Prescription")
                .font(.title3.weight(.bold))
            Text("Upload a clear photo of your prescription for medicine fulfillment.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private var uploadArea: some View {
        VStack(spacing: 16) {
            if let imageData = selectedImageData, let uiImage = UIImage(data: imageData) {
                imagePreview(uiImage: uiImage)
            } else {
                imagePicker
            }
        }
        .onChange(of: selectedPhoto) { _, newValue in
            Task {
                if let data = try? await newValue?.loadTransferable(type: Data.self) {
                    await MainActor.run { selectedImageData = data }
                }
            }
        }
    }

    private func imagePreview(uiImage: UIImage) -> some View {
        VStack(spacing: 16) {
            Image(uiImage: uiImage)
                .resizable()
                .scaledToFit()
                .frame(maxHeight: 300)
                .clipShape(RoundedRectangle(cornerRadius: 14))

            HStack(spacing: 12) {
                Button(role: .destructive) {
                    selectedImageData = nil
                    selectedPhoto = nil
                } label: {
                    Label("Remove", systemImage: "trash")
                        .font(.subheadline.weight(.medium))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.red.opacity(0.1))
                        .foregroundColor(.red)
                        .clipShape(Capsule())
                }

                PhotosPicker(selection: $selectedPhoto, matching: .images) {
                    Label("Retake", systemImage: "camera.fill")
                        .font(.subheadline.weight(.medium))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.blue.opacity(0.1))
                        .foregroundColor(.blue)
                        .clipShape(Capsule())
                }
            }
        }
    }

    private var imagePicker: some View {
        PhotosPicker(selection: $selectedPhoto, matching: .images) {
            VStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [10]))
                        .foregroundColor(.blue.opacity(0.3))
                        .frame(height: 200)

                    VStack(spacing: 8) {
                        Image(systemName: "camera.viewfinder")
                            .font(.system(size: 40))
                            .foregroundColor(.blue)
                        Text("Tap to upload prescription")
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(.blue)
                        Text("JPG, PNG • Max 10MB")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
    }

    private var instructionsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Guidelines", systemImage: "list.bullet.rectangle")
                .font(.subheadline.weight(.semibold))

            VStack(alignment: .leading, spacing: 8) {
                guidelineRow(number: 1, text: "Ensure the prescription is clearly visible")
                guidelineRow(number: 2, text: "Include doctor's name, date, and signature")
                guidelineRow(number: 3, text: "List all medicines with dosage clearly")
                guidelineRow(number: 4, text: "Avoid shadows or glare on the document")
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func guidelineRow(number: Int, text: String) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Text("\(number).")
                .font(.caption.weight(.bold))
                .foregroundColor(.blue)
            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }

    private var submitButton: some View {
        Button {
            isUploading = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                isUploading = false
                uploadComplete = true
            }
        } label: {
            HStack {
                if isUploading {
                    ProgressView()
                        .tint(.white)
                }
                Text(isUploading ? "Uploading..." : "Submit Prescription")
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background((isUploading || selectedImageData == nil) ? Color.blue.opacity(0.4) : Color.blue)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .disabled(isUploading || selectedImageData == nil)
    }
}

#Preview {
    PrescriptionUploadView()
}
