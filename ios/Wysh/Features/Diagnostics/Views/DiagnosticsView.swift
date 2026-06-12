import SwiftUI

enum LabCategory: String, CaseIterable {
    case blood = "Blood"
    case cardiac = "Cardiac"
    case diabetic = "Diabetic"
    case hormone = "Hormone"
    case imaging = "Imaging"
    case thyroid = "Thyroid"
    case urine = "Urine"
    case vitamin = "Vitamin"

    var icon: String {
        switch self {
        case .blood:
            return "drop.fill"

        case .cardiac:
            return "heart.fill"

        case .diabetic:
            return "circle.hexagongrid.fill"

        case .hormone:
            return "scale.3d"

        case .imaging:
            return "radiograph.fill"

        case .thyroid:
            return "butterfly"

        case .urine:
            return "drop.circle.fill"

        case .vitamin:
            return "sun.max.fill"
        }
    }
}

struct LabTest: Identifiable {
    let id = UUID()
    let name: String
    let category: LabCategory
    let price: Int
    let preparation: String
    let reportTime: String
    let homeCollection: Bool
}

struct LabOrder: Identifiable {
    let id = UUID()
    let testName: String
    let labName: String
    let date: Date
    let status: String
    let statusColor: Color
}

struct DiagnosticsView: View {
    @State private var viewModel = DiagnosticsViewModel()
    @State private var searchText = ""
    @State private var selectedCategory: LabCategory?
    @State private var selectedTest: LabTest?
    @State private var selectedLab = "Apollo Diagnostics"
    @State private var homeCollection = false
    @State private var selectedDate = Date()
    @State private var selectedTime = Date()
    @State private var showBooking = false

    let labs = ["Apollo Diagnostics", "Lal PathLabs", "Dr. Lal's Lab", "SRL Diagnostics", "Metropolis", "Suburban Diagnostics"]

    var filteredTests: [LabTest] {
        var result = viewModel.tests
        if !searchText.isEmpty {
            result = result.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
        if let category = selectedCategory {
            result = result.filter { $0.category == category }
        }
        return result
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    searchBar
                    categoryChips
                    featuredTests
                    bookingSection
                    orderHistory
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Diagnostics")
            .sheet(isPresented: $showBooking) {
                if let test = selectedTest {
                    bookingSheet(test: test)
                }
            }
        }
    }

    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            TextField("Search lab tests...", text: $searchText)
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

    private var categoryChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(LabCategory.allCases, id: \.self) { category in
                    categoryChip(for: category)
                }
            }
        }
    }

    private func categoryChip(for category: LabCategory) -> some View {
        Button {
            withAnimation(.spring(response: 0.35)) {
                if selectedCategory == category {
                    selectedCategory = nil
                } else {
                    selectedCategory = category
                }
            }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: category.icon)
                    .font(.caption)
                Text(category.rawValue)
                    .font(.caption)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(selectedCategory == category ? category.color : Color(.systemBackground))
            .foregroundColor(selectedCategory == category ? .white : .primary)
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private var featuredTests: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Available Tests")
                .font(.headline.weight(.semibold))

            if filteredTests.isEmpty {
                Text("No tests found")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.vertical, 20)
                    .frame(maxWidth: .infinity)
            } else {
                ForEach(filteredTests) { test in
                    testRow(for: test)
                }
            }
        }
    }

    private func testRow(for test: LabTest) -> some View {
        Button {
            selectedTest = test
            showBooking = true
        } label: {
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(test.category.color.opacity(0.15))
                        .frame(width: 40, height: 40)
                    Image(systemName: test.category.icon)
                        .font(.system(size: 16))
                        .foregroundColor(test.category.color)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(test.name)
                        .font(.subheadline.weight(.semibold))
                    Text("Reports in \(test.reportTime) • \(test.preparation)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text("₹\(test.price)")
                        .font(.subheadline.weight(.bold))
                    Text(test.homeCollection ? "Home" : "Lab")
                        .font(.caption2)
                        .foregroundColor(.blue)
                }
            }
            .padding(12)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
    }

    private var bookingSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Book a Test")
                .font(.headline.weight(.semibold))

            bookingCard
        }
    }

    private var bookingCard: some View {
        VStack(spacing: 12) {
            labPickerView
            homeCollectionToggle
            if homeCollection {
                DatePicker("Preferred Date", selection: $selectedDate, in: Date()..., displayedComponents: .date)
                DatePicker("Preferred Time", selection: $selectedTime, displayedComponents: .hourAndMinute)
            }
            reportsLink
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var labPickerView: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Select Lab")
                .font(.caption.weight(.medium))
                .foregroundColor(.secondary)

            Picker("Lab", selection: $selectedLab) {
                ForEach(labs, id: \.self) { lab in
                    Text(lab).tag(lab)
                }
            }
            .pickerStyle(.menu)
            .padding(10)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }

    private var homeCollectionToggle: some View {
        Toggle(isOn: $homeCollection.animation()) {
            Label("Home Collection Available", systemImage: "house.fill")
                .font(.subheadline)
        }
        .tint(.blue)
    }

    private var reportsLink: some View {
        NavigationLink {
            DiagnosticReportView()
        } label: {
            Label("View Reports", systemImage: "doc.text.fill")
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color(.systemGray6))
                .foregroundColor(.primary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var orderHistory: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Order History")
                .font(.headline.weight(.semibold))

            ForEach(viewModel.orders) { order in
                orderRow(for: order)
            }
        }
    }

    private func orderRow(for order: LabOrder) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(order.testName)
                    .font(.subheadline.weight(.semibold))
                Text(order.labName)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(order.date, style: .date)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            Spacer()
            Text(order.status)
                .font(.caption2.weight(.medium))
                .foregroundColor(order.statusColor)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(order.statusColor.opacity(0.12))
                .clipShape(Capsule())
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func bookingSheet(test: LabTest) -> some View {
        NavigationStack {
            sheetContent(test: test)
                .background(Color(.systemGroupedBackground))
                .navigationTitle("Book Test")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Cancel") { showBooking = false }
                    }
                }
        }
    }

    private func sheetContent(test: LabTest) -> some View {
        ScrollView {
            sheetBody(test: test)
                .padding()
        }
    }

    private func sheetBody(test: LabTest) -> some View {
        VStack(spacing: 20) {
            testHeaderView(test: test)
            testDetailsGroup(test: test)
            bookingDetailsGroup
            bookButton(test: test)
        }
    }

    private func testHeaderView(test: LabTest) -> some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(test.category.color.opacity(0.15))
                    .frame(width: 64, height: 64)
                Image(systemName: test.category.icon)
                    .font(.system(size: 28))
                    .foregroundColor(test.category.color)
            }
            Text(test.name)
                .font(.title2.weight(.bold))
            Text("₹\(test.price)")
                .font(.title3.weight(.semibold))
                .foregroundColor(.blue)
        }
    }

    private func testDetailsGroup(test: LabTest) -> some View {
        GroupBox {
            VStack(spacing: 8) {
                detailRow(label: "Preparation", value: test.preparation)
                Divider()
                detailRow(label: "Report Time", value: test.reportTime)
                Divider()
                detailRow(label: "Home Collection", value: test.homeCollection ? "Available" : "Lab Visit Required")
            }
        } label: {
            Label("Test Details", systemImage: "info.circle")
        }
    }

    private var bookingDetailsGroup: some View {
        GroupBox {
            VStack(spacing: 8) {
                Picker("Lab", selection: $selectedLab) {
                    ForEach(labs, id: \.self) { lab in
                        Text(lab).tag(lab)
                    }
                }

                Toggle("Home Collection", isOn: $homeCollection)

                if homeCollection {
                    DatePicker("Date", selection: $selectedDate, in: Date()..., displayedComponents: .date)
                    DatePicker("Time", selection: $selectedTime, displayedComponents: .hourAndMinute)
                }
            }
        } label: {
            Label("Booking Details", systemImage: "calendar.badge.plus")
        }
    }

    private func bookButton(test: LabTest) -> some View {
        Button {
            showBooking = false
        } label: {
            HStack {
                Image(systemName: "cart.badge.plus")
                Text("Book Test - ₹\(test.price)")
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.blue)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }

    private func detailRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.medium))
                .multilineTextAlignment(.trailing)
        }
    }
}

#Preview {
    DiagnosticsView()
}
