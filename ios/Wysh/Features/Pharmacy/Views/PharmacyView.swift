import SwiftUI

struct Medicine: Identifiable {
    let id = UUID()
    let name: String
    let manufacturer: String
    let price: Int
    let originalPrice: Int?
    let description: String
    let category: MedicineCategory
    let requiresPrescription: Bool
    let rating: Double
    let unit: String
}

enum MedicineCategory: String, CaseIterable {
    case antibiotics = "Antibiotics"
    case cold = "Cold & Flu"
    case diabetes = "Diabetes"
    case heart = "Heart"
    case painRelief = "Pain Relief"
    case skin = "Skin"
    case stomach = "Stomach"
    case vitamins = "Vitamins"

    var icon: String {
        switch self {
        case .antibiotics:
            return "capsule.fill"

        case .cold:
            return "thermometer"

        case .diabetes:
            return "drop.fill"

        case .heart:
            return "heart.fill"

        case .painRelief:
            return "bandage.fill"

        case .skin:
            return "hand.raised.fill"

        case .stomach:
            return "staroflife.fill"

        case .vitamins:
            return "leaf.fill"
        }
    }
}

struct PharmacyView: View {
    @State private var viewModel = PharmacyViewModel()
    @State private var searchText = ""
    @State private var showCart = false
    @State private var showDetail: Medicine?
    @State private var showUpload = false

    let columns = Array(repeating: GridItem(.flexible(), spacing: 12), count: 2)

    var filteredMedicines: [Medicine] {
        if searchText.isEmpty { return viewModel.medicines }
        return viewModel.medicines.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.manufacturer.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    searchBar
                    categoryGrid
                    featuredSection
                    if !searchText.isEmpty {
                        searchResults
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Pharmacy")
            .toolbar {
                toolbarContent
            }
            .sheet(isPresented: $showCart) {
                CartView(viewModel: viewModel)
            }
            .sheet(isPresented: $showUpload) {
                PrescriptionUploadView()
            }
            .sheet(item: $showDetail) { medicine in
                MedicineDetailView(medicine: medicine, viewModel: viewModel)
            }
        }
    }

    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            TextField("Search medicines...", text: $searchText)
                .textFieldStyle(.plain)
            if !searchText.isEmpty {
                Button { searchText = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var categoryGrid: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(MedicineCategory.allCases, id: \.self) { category in
                Button {
                    searchText = category.rawValue
                } label: {
                    VStack(spacing: 8) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.blue.opacity(0.1))
                                .frame(height: 60)
                            Image(systemName: category.icon)
                                .font(.system(size: 24))
                                .foregroundColor(.blue)
                        }
                        Text(category.rawValue)
                            .font(.caption.weight(.medium))
                            .lineLimit(1)
                    }
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var featuredSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Featured Medicines")
                    .font(.headline.weight(.semibold))
                Spacer()
                Button("View All") {}
                    .font(.caption.weight(.medium))
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(viewModel.featuredMedicines) { medicine in
                        Button {
                            showDetail = medicine
                        } label: {
                            FeaturedMedicineCard(medicine: medicine, viewModel: viewModel)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var searchResults: some View {
        LazyVStack(spacing: 10) {
            ForEach(filteredMedicines) { medicine in
                Button {
                    showDetail = medicine
                } label: {
                    MedicineRow(medicine: medicine, viewModel: viewModel)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .navigationBarTrailing) {
            HStack(spacing: 4) {
                Button {
                    showUpload = true
                } label: {
                    Image(systemName: "camera.fill")
                        .fontWeight(.semibold)
                }

                Button {
                    showCart = true
                } label: {
                    ZStack(alignment: .topTrailing) {
                        Image(systemName: "cart.fill")
                            .fontWeight(.semibold)
                        if viewModel.cartItemCount > 0 {
                            Text("\(viewModel.cartItemCount)")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 16, height: 16)
                                .background(Color.red)
                                .clipShape(Circle())
                                .offset(x: 8, y: -8)
                        }
                    }
                }
            }
        }
    }
}

struct FeaturedMedicineCard: View {
    let medicine: Medicine
    let viewModel: PharmacyViewModel

    private var cardImage: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.blue.opacity(0.06))
                .frame(width: 140, height: 100)
            Image(systemName: "pills.fill")
                .font(.system(size: 36))
                .foregroundColor(.blue.opacity(0.5))
        }
    }

    @ViewBuilder private var priceInfo: some View {
        if let original = medicine.originalPrice {
            HStack(spacing: 4) {
                Text("₹\(medicine.price)")
                    .font(.caption.weight(.bold))
                    .foregroundColor(.blue)
                Text("₹\(original)")
                    .font(.caption2)
                    .strikethrough()
                    .foregroundColor(.secondary)
            }
        } else {
            Text("₹\(medicine.price)")
                .font(.caption.weight(.bold))
                .foregroundColor(.blue)
        }
    }

    @ViewBuilder private var rxLabel: some View {
        if medicine.requiresPrescription {
            Label("Rx", systemImage: "doc.text.fill")
                .font(.system(size: 8, weight: .bold))
                .foregroundColor(.red)
                .padding(.horizontal, 4)
                .padding(.vertical, 2)
                .background(Color.red.opacity(0.1))
                .clipShape(Capsule())
        }
    }

    private var addButton: some View {
        Button {
            viewModel.addToCart(medicine)
        } label: {
            Text("Add")
                .font(.caption2.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
                .background(Color.blue)
                .foregroundColor(.white)
                .clipShape(Capsule())
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            cardImage

            Text(medicine.name)
                .font(.caption.weight(.semibold))
                .lineLimit(1)

            priceInfo

            rxLabel

            addButton
        }
        .frame(width: 140)
        .padding(10)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

struct MedicineRow: View {
    let medicine: Medicine
    let viewModel: PharmacyViewModel

    private var medicineIcon: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.blue.opacity(0.06))
                .frame(width: 52, height: 52)
            Image(systemName: "pills.fill")
                .font(.system(size: 24))
                .foregroundColor(.blue.opacity(0.5))
        }
    }

    @ViewBuilder private var medicineInfo: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(medicine.name)
                .font(.subheadline.weight(.semibold))
            Text(medicine.manufacturer)
                .font(.caption)
                .foregroundColor(.secondary)

            HStack(spacing: 6) {
                Text("₹\(medicine.price)")
                    .font(.subheadline.weight(.bold))
                    .foregroundColor(.blue)
                if let original = medicine.originalPrice {
                    Text("₹\(original)")
                        .font(.caption)
                        .strikethrough()
                        .foregroundColor(.secondary)
                }
            }
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            medicineIcon
            medicineInfo
            Spacer()
            Button {
                viewModel.addToCart(medicine)
            } label: {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 28))
                    .foregroundColor(.blue)
            }
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    PharmacyView()
}
