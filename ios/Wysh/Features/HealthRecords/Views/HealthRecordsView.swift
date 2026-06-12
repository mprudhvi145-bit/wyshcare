import SwiftUI

enum HealthRecordCategory: String, CaseIterable {
    case abdmRecords = "ABDM Records"
    case dischargeSummaries = "Discharge Summaries"
    case insuranceDocuments = "Insurance Documents"
    case labReports = "Lab Reports"
    case prescriptions = "Prescriptions"
    case vaccinations = "Vaccinations"

    var icon: String {
        switch self {
        case .abdmRecords:
            return "heart.text.square.fill"

        case .dischargeSummaries:
            return "doc.text.fill"

        case .insuranceDocuments:
            return "shield.fill"

        case .labReports:
            return "flask.fill"

        case .prescriptions:
            return "pills.fill"

        case .vaccinations:
            return "syringe.fill"
        }
    }

    var color: Color {
        switch self {
        case .abdmRecords:
            return .teal

        case .dischargeSummaries:
            return .red

        case .insuranceDocuments:
            return .green

        case .labReports:
            return .orange

        case .prescriptions:
            return .purple

        case .vaccinations:
            return .blue
        }
    }
}

struct HealthRecordItem: Identifiable {
    let id = UUID()
    let title: String
    let date: Date
    let type: HealthRecordCategory
    let summary: String
    let fileURL: URL?
}

struct HealthRecordItemsView: View {
    @State private var viewModel = HealthRecordItemsViewModel()
    @State private var searchText = ""
    @State private var selectedCategory: HealthRecordCategory?
    @State private var showDetail = false
    @State private var selectedRecord: HealthRecordItem?

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 14), count: 2)

    var filteredCategories: [HealthRecordCategory] {
        if searchText.isEmpty { return HealthRecordCategory.allCases }
        return HealthRecordCategory.allCases.filter {
            $0.rawValue.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            mainContent
                .navigationTitle("Health Records")
                .toolbar { toolbarContent }
                .sheet(isPresented: $showDetail) { sheetContent }
        }
    }

    @ViewBuilder private var mainContent: some View {
        ScrollView {
            VStack(spacing: 16) {
                searchBar
                    .padding(.horizontal)

                if selectedCategory == nil {
                    categoryGrid
                } else {
                    recordsList
                }
            }
            .padding(.vertical)
        }
        .background(Color(.systemGroupedBackground))
    }

    @ToolbarContentBuilder private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .navigationBarTrailing) {
            Button {
                if selectedCategory != nil {
                    withAnimation { selectedCategory = nil }
                }
            } label: {
                if selectedCategory != nil {
                    Text("All Categories")
                        .font(.subheadline)
                }
            }
        }
    }

    @ViewBuilder private var sheetContent: some View {
        if let record = selectedRecord {
            RecordDetailView(record: record)
        }
    }

    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            TextField("Search records...", text: $searchText)
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
        LazyVGrid(columns: columns, spacing: 14) {
            ForEach(filteredCategories, id: \.self) { category in
                Button {
                    withAnimation(.spring(response: 0.35)) {
                        selectedCategory = category
                    }
                } label: {
                    CategoryCard(
                        category: category,
                        count: viewModel.count(for: category)
                    )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal)
    }

    private var recordsList: some View {
        guard let selectedCategory else {
            return AnyView(EmptyView())
        }
        let records = viewModel.records(for: selectedCategory)
        return AnyView(
            Group {
                if records.isEmpty {
                    ContentUnavailableView(
                        "No Records",
                        systemImage: "tray",
                        description: Text("No \(selectedCategory.rawValue.lowercased()) found.")
                    )
                    .padding(.top, 40)
                } else {
                    LazyVStack(spacing: 10) {
                        ForEach(records) { record in
                            Button {
                                selectedRecord = record
                                showDetail = true
                            } label: {
                                RecordRow(record: record)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)
                }
            }
        )
    }
}

struct CategoryCard: View {
    let category: HealthRecordCategory
    let count: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(category.color.opacity(0.15))
                        .frame(width: 40, height: 40)
                    Image(systemName: category.icon)
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(category.color)
                }
                Spacer()
                Text("\(count)")
                    .font(.title3.weight(.bold))
                    .foregroundColor(category.color)
            }
            Text(category.rawValue)
                .font(.subheadline.weight(.semibold))
                .lineLimit(2)
            HStack {
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption2.weight(.semibold))
                    .foregroundColor(Color.secondary)
            }
        }
        .padding(14)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .dsShadow()
    }
}

struct RecordRow: View {
    let record: HealthRecordItem

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(record.type.color.opacity(0.15))
                    .frame(width: 36, height: 36)
                Image(systemName: record.type.icon)
                    .font(.system(size: 16))
                    .foregroundColor(record.type.color)
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(record.title)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)
                Text(record.summary)
                    .font(.caption)
                    .foregroundColor(Color.secondary)
                    .lineLimit(1)
                Text(record.date, style: .date)
                    .font(.caption2)
                    .foregroundColor(Color.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption2.weight(.semibold))
                .foregroundColor(Color.secondary)
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    HealthRecordItemsView()
}
