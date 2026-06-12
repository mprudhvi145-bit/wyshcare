import SwiftUI

struct ProviderNetworkView: View {
    @State private var viewModel = ProviderNetworkViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DS.Space.xxl) {
                typeChips
                providersList
            }
            .padding(.horizontal, DS.Space.xl)
            .padding(.vertical, DS.Space.lg)
        }
        .background(DS.Color.background)
        .navigationTitle("Provider Network")
        .navigationBarTitleDisplayMode(.large)
        .searchable(text: $viewModel.searchText, prompt: "Search providers")
    }

    private var typeChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DS.Space.sm + 2) {
                ForEach(ProviderType.allCases, id: \.rawValue) { type in
                    Button {
                        withAnimation(.spring(response: 0.35)) {
                            viewModel.selectedType = type
                            viewModel.searchText = ""
                        }
                    } label: {
                        HStack(spacing: DS.Space.sm - 2) {
                            Image(systemName: type.icon)
                                .font(.caption)
                            Text(type.rawValue)
                                .font(.subheadline.weight(viewModel.selectedType == type ? .semibold : .regular))
                        }
                        .padding(.horizontal, DS.Space.md)
                        .padding(.vertical, DS.Space.sm)
                        .background(viewModel.selectedType == type ? DS.Color.primary : Color(.systemGray6))
                        .foregroundColor(viewModel.selectedType == type ? .white : .primary)
                        .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var providersList: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            Text(viewModel.selectedType.rawValue)
                .font(.title2.weight(.bold))

            if viewModel.filteredProviders.isEmpty {
                EmptyStateView(icon: "magnifyingglass", title: "No Providers Found", message: "Try a different category or search term.")
            } else {
                ForEach(viewModel.filteredProviders) { provider in
                    providerCard(provider)
                }
            }
        }
    }

    private func providerCard(_ provider: Provider) -> some View {
        PrimaryCard {
            VStack(alignment: .leading, spacing: DS.Space.md) {
                cardHeader(provider: provider)
                specialtiesRow(provider: provider)
                bookButton
            }
        }
    }

    private func cardHeader(provider: Provider) -> some View {
        HStack(spacing: DS.Space.md) {
            providerIcon(provider: provider)
            providerInfo(provider: provider)
            Spacer()
            providerRating(provider: provider)
        }
    }

    private func providerIcon(provider: Provider) -> some View {
        ZStack {
            Circle()
                .fill(provider.color.opacity(0.15))
                .frame(width: 44, height: 44)
            Image(systemName: provider.icon)
                .font(.system(size: DS.Space.lg + 2, weight: .medium))
                .foregroundStyle(provider.color)
        }
    }

    private func providerInfo(provider: Provider) -> some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            HStack(spacing: DS.Space.sm - 2) {
                Text(provider.name)
                    .font(.subheadline.weight(.semibold))
                statusBadge(isOpen: provider.isOpen)
            }
            Text(provider.location)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private func statusBadge(isOpen: Bool) -> some View {
        if isOpen {
            Text("Open")
                .font(.caption2.weight(.medium))
                .foregroundStyle(DS.Color.success)
                .padding(.horizontal, DS.Space.sm - 2)
                .padding(.vertical, 2)
                .background(DS.Color.success.opacity(0.12))
                .clipShape(Capsule())
        } else {
            Text("Closed")
                .font(.caption2.weight(.medium))
                .foregroundStyle(.secondary)
                .padding(.horizontal, DS.Space.sm - 2)
                .padding(.vertical, 2)
                .background(Color(.systemGray5))
                .clipShape(Capsule())
        }
    }

    private func providerRating(provider: Provider) -> some View {
        VStack(alignment: .trailing, spacing: 2) {
            HStack(spacing: 2) {
                Image(systemName: "star.fill")
                    .font(.caption2)
                    .foregroundStyle(.yellow)
                Text(String(format: "%.1f", provider.rating))
                    .font(.caption.weight(.semibold))
            }
            Text(provider.distance)
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
    }

    private func specialtiesRow(provider: Provider) -> some View {
        HStack(spacing: DS.Space.sm - 2) {
            ForEach(provider.specialties.prefix(3), id: \.self) { spec in
                Text(spec)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, DS.Space.sm)
                    .padding(.vertical, DS.Space.xs)
                    .background(Color(.systemGray6))
                    .clipShape(Capsule())
            }
            if provider.specialties.count > 3 {
                Text("+\(provider.specialties.count - 3)")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
    }

    private var bookButton: some View {
        Button(action: {}, label: {
            Text("Book Appointment")
                .font(.subheadline.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, DS.Space.sm)
                .background(DS.Color.primary)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        })
    }
}

#Preview {
    NavigationStack {
        ProviderNetworkView()
    }
}
