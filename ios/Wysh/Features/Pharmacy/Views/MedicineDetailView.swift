import SwiftUI

struct MedicineDetailView: View {
    let medicine: Medicine
    @State private var quantity = 1
    @State private var addedToCart = false
    @Environment(\.dismiss)
    private var dismiss
    var viewModel: PharmacyViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    imageSection
                    infoSection
                    priceSection
                    descriptionSection
                    prescriptionSection
                    quantitySection
                    actionButtons
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Medicine Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
            }
        }
    }

    private var imageSection: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.blue.opacity(0.06))
                .frame(height: 200)
            VStack(spacing: 12) {
                Image(systemName: "pills.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.blue.opacity(0.4))
                Text(medicine.manufacturer)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }

    private var infoSection: some View {
        VStack(spacing: 4) {
            Text(medicine.name)
                .font(.title2.weight(.bold))
                .multilineTextAlignment(.center)

            HStack(spacing: 4) {
                Image(systemName: "star.fill")
                    .font(.caption)
                    .foregroundColor(.yellow)
                Text(String(format: "%.1f", medicine.rating))
                    .font(.subheadline.weight(.medium))
                Text("(\(Int(medicine.rating * 100)) reviews)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Text(medicine.unit)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }

    private var priceSection: some View {
        HStack(spacing: 8) {
            Text("₹\(medicine.price * quantity)")
                .font(.title.weight(.bold))
                .foregroundColor(.blue)

            if let original = medicine.originalPrice {
                Text("₹\(original * quantity)")
                    .font(.title3)
                    .strikethrough()
                    .foregroundColor(.secondary)

                let discount = Int((Double(original - medicine.price) / Double(original)) * 100)
                Text("\(discount)% OFF")
                    .font(.caption.weight(.bold))
                    .foregroundColor(.green)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.green.opacity(0.1))
                    .clipShape(Capsule())
            }

            Spacer()
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Description", systemImage: "text.alignleft")
                .font(.subheadline.weight(.semibold))

            Text(medicine.description)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineSpacing(4)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var prescriptionSection: some View {
        Group {
            if medicine.requiresPrescription {
                HStack(spacing: 10) {
                    Image(systemName: "doc.text.fill")
                        .foregroundColor(.red)
                    Text("Prescription Required")
                        .font(.subheadline.weight(.medium))
                    Spacer()
                    Button("Upload") {
                        dismiss()
                    }
                    .font(.subheadline.weight(.semibold))
                }
                .padding()
                .background(Color.red.opacity(0.06))
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    private var quantitySection: some View {
        HStack {
            Text("Quantity")
                .font(.subheadline.weight(.medium))

            Spacer()

            HStack(spacing: 16) {
                Button {
                    if quantity > 1 { quantity -= 1 }
                } label: {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.blue)
                }

                Text("\(quantity)")
                    .font(.title3.weight(.semibold))
                    .frame(minWidth: 40)

                Button {
                    if quantity < 10 { quantity += 1 }
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.blue)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var actionButtons: some View {
        VStack(spacing: 10) {
            addToCartButton
            buyNowButton
        }
    }

    private var addToCartButton: some View {
        Button {
            viewModel.addToCart(medicine, quantity: quantity)
            withAnimation(.spring(response: 0.35)) { addedToCart = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { dismiss() }
        } label: {
            HStack {
                Image(systemName: addedToCart ? "checkmark.circle.fill" : "cart.badge.plus")
                Text(addedToCart ? "Added to Cart" : "Add to Cart - ₹\(medicine.price * quantity)")
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(addedToCart ? Color.green : Color.blue)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .disabled(addedToCart)
    }

    private var buyNowButton: some View {
        Button {
            viewModel.addToCart(medicine, quantity: quantity)
            dismiss()
        } label: {
            Text("Buy Now")
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.orange)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }
}

#Preview {
    MedicineDetailView(
        medicine: Medicine(
            name: "Metformin 500mg",
            manufacturer: "USV Pvt Ltd",
            price: 89,
            originalPrice: 120,
            description: "Metformin is used along with diet and exercise to improve blood sugar control in adults with type 2 diabetes mellitus.",
            category: .diabetes,
            requiresPrescription: true,
            rating: 4.5,
            unit: "Strip of 10 tablets"
        ),
        viewModel: PharmacyViewModel()
    )
}
