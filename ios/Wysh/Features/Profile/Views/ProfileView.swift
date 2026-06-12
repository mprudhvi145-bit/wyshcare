import SwiftUI

struct DSInfoRow: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: DS.Space.md) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundStyle(DS.Color.primary)
                .frame(width: DS.Space.xxxl, height: DS.Space.xxxl)
                .background(DS.Color.primary.opacity(0.1), in: RoundedRectangle(cornerRadius: DS.Radius.small - 4))
            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text(label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(.subheadline)
            }
            Spacer()
        }
        .padding(.horizontal, DS.Space.lg)
        .padding(.vertical, DS.Space.sm + 2)
    }
}

struct ProfileView: View {
    @State private var viewModel = ProfileViewModel()
    @State private var showSettings = false
    @Environment(SearchNavigationState.self)
    private var searchNav
    @Environment(InboxStore.self)
    private var inboxStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: DS.Space.xl) {
                    profileHeader
                    personalInfoSection
                    connectedAccountsSection
                    familySection
                    insuranceSection
                    abhaSection
                    subscriptionsSection
                    Spacer(minLength: DS.Space.xxl)
                    logoutButton
                }
                .padding(.horizontal, DS.Space.xl)
                .padding(.top, DS.Space.lg)
                .padding(.bottom, DS.Space.xxxl)
            }
            .background(DS.Color.background)
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                toolbarContent
            }
            .sheet(isPresented: $showSettings) {
                SettingsView(viewModel: viewModel)
            }
        }
    }

    private var toolbarContent: some ToolbarContent {
        ToolbarItemGroup(placement: .navigationBarTrailing) {
            Button {
                searchNav.showInbox = true
            } label: {
                Image(systemName: "bell")
                    .overlay(
                        Group {
                            if inboxStore.unreadCount > 0 {
                                Text("\(inboxStore.unreadCount)")
                                    .font(.caption2.weight(.bold))
                                    .foregroundStyle(.white)
                                    .frame(width: 16, height: 16)
                                    .background(.red)
                                    .clipShape(Circle())
                                    .offset(x: 6, y: -6)
                            }
                        },
                        alignment: .topTrailing
                    )
            }

            Button {
                searchNav.showSearch = true
            } label: {
                Image(systemName: "magnifyingglass")
            }

            Button {
                showSettings = true
            } label: {
                Image(systemName: "gearshape.fill")
            }
        }
    }

    private var profileHeader: some View {
        VStack(spacing: DS.Space.md) {
            ZStack {
                Circle()
                    .fill(DS.Color.primary.opacity(0.12))
                    .frame(width: 88, height: 88)
                Text(viewModel.avatarInitials)
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundStyle(DS.Color.primary)
            }
            Text(viewModel.name)
                .font(.title2)
                .fontWeight(.bold)
            Text("Wysh ID: \(viewModel.wyshId)")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .monospaced()
        }
        .frame(maxWidth: .infinity)
        .padding(DS.Space.xl)
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.large))
        .dsShadow()
    }

    private var personalInfoSection: some View {
        VStack(spacing: 0) {
            sectionHeader("Personal Information")
            DSInfoRow(icon: "phone.fill", label: "Phone", value: viewModel.phone)
            Divider().padding(.leading, 56)
            DSInfoRow(icon: "envelope.fill", label: "Email", value: viewModel.email)
            Divider().padding(.leading, 56)
            DSInfoRow(icon: "drop.fill", label: "Blood Group", value: viewModel.bloodGroup)
        }
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        .dsShadow()
    }

    private var connectedAccountsSection: some View {
        VStack(spacing: 0) {
            sectionHeader("Connected Accounts")
            ForEach(viewModel.connectedAccounts) { account in
                HStack(spacing: DS.Space.md) {
                    Image(systemName: account.icon)
                        .font(.title3)
                        .foregroundStyle(DS.Color.primary)
                        .frame(width: DS.Space.xxxl, height: DS.Space.xxxl)
                        .background(DS.Color.primary.opacity(0.1), in: RoundedRectangle(cornerRadius: DS.Radius.small - 4))
                    VStack(alignment: .leading, spacing: DS.Space.xs) {
                        Text(account.provider)
                            .font(.subheadline)
                            .fontWeight(.medium)
                        Text(account.email)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text(account.status)
                        .font(.caption)
                        .foregroundStyle(DS.Color.success)
                }
                .padding(DS.Space.lg)
                if account.id != viewModel.connectedAccounts.last?.id {
                    Divider().padding(.leading, 56)
                }
            }
        }
        .background(DS.Color.card)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        .dsShadow()
    }

    private var familySection: some View {
        PrimaryCard(title: "Family", icon: "person.2.fill") {
            Text("Manage family members and their health profiles.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private var insuranceSection: some View {
        PrimaryCard(title: "Insurance", icon: "shield.fill") {
            VStack(alignment: .leading, spacing: DS.Space.xs) {
                Text("Star Health Insurance")
                    .font(.subheadline.weight(.medium))
                Text("Coverage: ₹5,00,000")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                ProgressView(value: 125_000, total: 500_000)
                    .tint(DS.Color.primary)
            }
        }
    }

    private var abhaSection: some View {
        PrimaryCard(title: "ABHA", icon: "heart.text.square.fill") {
            Text("Link your ABHA (Ayushman Bharat Health Account) to access your unified health records.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private var subscriptionsSection: some View {
        PrimaryCard(title: "Subscriptions", icon: "crown.fill") {
            Text("Manage your Wysh care plans and subscriptions.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private var logoutButton: some View {
        Button(role: .destructive) {
            viewModel.logout()
        } label: {
            Label("Logout", systemImage: "rectangle.portrait.and.arrow.right")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, DS.Space.sm + 6)
                .background(DS.Color.critical.opacity(0.1), in: RoundedRectangle(cornerRadius: DS.Radius.medium))
        }
        .buttonStyle(.plain)
    }

    private func sectionHeader(_ title: String) -> some View {
        HStack {
            Text(title)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
            Spacer()
        }
        .padding(.horizontal, DS.Space.lg)
        .padding(.top, DS.Space.sm + 6)
        .padding(.bottom, DS.Space.xs)
    }
}

#Preview {
    ProfileView()
}
