import SwiftUI

struct DiagnosticsMarketplaceView: View {
    @State private var viewModel = DiagnosticsMarketplaceViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DS.Space.xxl) {
                categoryChips
                if viewModel.selectedCategory == .packages {
                    packagesSection
                } else {
                    testsSection
                }
            }
            .padding(.horizontal, DS.Space.xl)
            .padding(.vertical, DS.Space.lg)
        }
        .background(DS.Color.background)
        .navigationTitle("Diagnostics")
        .navigationBarTitleDisplayMode(.large)
        .searchable(text: $viewModel.searchText, prompt: "Search tests")
    }

    private var categoryChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DS.Space.sm + 2) {
                ForEach(DiagnosticCategory.allCases, id: \.rawValue) { category in
                    Button {
                        withAnimation(.spring(response: 0.35)) {
                            viewModel.selectedCategory = category
                            viewModel.searchText = ""
                        }
                    } label: {
                        HStack(spacing: DS.Space.sm - 2) {
                            Image(systemName: category.icon)
                                .font(.caption)
                            Text(category.rawValue)
                                .font(.subheadline.weight(viewModel.selectedCategory == category ? .semibold : .regular))
                        }
                        .padding(.horizontal, DS.Space.md)
                        .padding(.vertical, DS.Space.sm)
                        .background(viewModel.selectedCategory == category ? DS.Color.primary : Color(.systemGray6))
                        .foregroundColor(viewModel.selectedCategory == category ? .white : .primary)
                        .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var testsSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            Text(viewModel.selectedCategory.rawValue)
                .font(.title2.weight(.bold))

            if viewModel.filteredTests.isEmpty {
                EmptyStateView(icon: "magnifyingglass", title: "No Tests Found", message: "Try a different category or search term.")
            } else {
                ForEach(viewModel.filteredTests) { test in
                    testCard(test)
                }
            }
        }
    }

    private func testCard(_ test: DiagnosticTest) -> some View {
        PrimaryCard {
            VStack(alignment: .leading, spacing: DS.Space.md) {
                testCardHeader(for: test)
                testCardFooter(for: test)
            }
        }
    }

    private func testCardHeader(for test: DiagnosticTest) -> some View {
        HStack(spacing: DS.Space.md) {
            ZStack {
                Circle()
                    .fill(test.color.opacity(0.15))
                    .frame(width: 40, height: 40)
                Image(systemName: test.icon)
                    .font(.system(size: DS.Space.lg, weight: .medium))
                    .foregroundStyle(test.color)
            }

            VStack(alignment: .leading, spacing: DS.Space.xs) {
                HStack(spacing: DS.Space.sm - 2) {
                    Text(test.name)
                        .font(.subheadline.weight(.semibold))
                    if test.isPopular {
                        Text("Popular")
                            .font(.caption2.weight(.medium))
                            .foregroundStyle(DS.Color.primary)
                            .padding(.horizontal, DS.Space.sm - 2)
                            .padding(.vertical, 2)
                            .background(DS.Color.primary.opacity(0.12))
                            .clipShape(Capsule())
                    }
                }
                Text(test.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            Spacer()
        }
    }

    private func testCardFooter(for test: DiagnosticTest) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(test.labName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("Reports in \(test.turnaround)")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                HStack(spacing: DS.Space.xs) {
                    if let original = test.originalPrice {
                        Text(original)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .strikethrough()
                    }
                    Text(test.price)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(DS.Color.success)
                }
                Button("Book Now") {}
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, DS.Space.md)
                    .padding(.vertical, DS.Space.sm - 2)
                    .background(DS.Color.primary)
                    .foregroundColor(.white)
                    .clipShape(Capsule())
            }
        }
    }

    private var packagesSection: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            Text("Health Packages")
                .font(.title2.weight(.bold))

            ForEach(viewModel.packages) { pkg in
                packageCardView(for: pkg)
            }
        }
    }

    private func packageCardView(for pkg: HealthPackage) -> some View {
        PrimaryCard {
            VStack(alignment: .leading, spacing: DS.Space.md) {
                packageCardHeader(for: pkg)
                packageSavingsBadge(for: pkg)
                packageTestsList(for: pkg)
                packagePriceRow(for: pkg)
            }
        }
    }

    private func packageCardHeader(for pkg: HealthPackage) -> some View {
        HStack(spacing: DS.Space.md) {
            ZStack {
                Circle()
                    .fill(pkg.color.opacity(0.15))
                    .frame(width: 44, height: 44)
                Image(systemName: pkg.icon)
                    .font(.system(size: DS.Space.lg + 2, weight: .medium))
                    .foregroundStyle(pkg.color)
            }

            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text(pkg.name)
                    .font(.headline.weight(.semibold))
                Text(pkg.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
    }

    private func packageSavingsBadge(for pkg: HealthPackage) -> some View {
        Text(pkg.savings)
            .font(.caption.weight(.bold))
            .foregroundStyle(DS.Color.success)
            .padding(.horizontal, DS.Space.sm)
            .padding(.vertical, DS.Space.xs)
            .background(DS.Color.success.opacity(0.12))
            .clipShape(Capsule())
    }

    private func packageTestsList(for pkg: HealthPackage) -> some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            Text("Includes \(pkg.tests.count) tests:")
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(pkg.tests.joined(separator: ", "))
                .font(.caption2)
                .foregroundStyle(.tertiary)
                .lineLimit(2)
        }
    }

    private func packagePriceRow(for pkg: HealthPackage) -> some View {
        HStack {
            Text(pkg.originalPrice)
                .font(.headline)
                .foregroundStyle(.secondary)
                .strikethrough()
            Text(pkg.price)
                .font(.title2.weight(.bold))
                .foregroundStyle(DS.Color.success)
            Spacer()
            Button("Buy Now") {}
                .font(.subheadline.weight(.semibold))
                .padding(.horizontal, DS.Space.xl)
                .padding(.vertical, DS.Space.sm)
                .background(DS.Color.primary)
                .foregroundColor(.white)
                .clipShape(Capsule())
        }
    }
}

#Preview {
    NavigationStack {
        DiagnosticsMarketplaceView()
    }
}
