import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    @State private var searchNav = SearchNavigationState()
    @State private var inboxStore = InboxStore()
    @State private var familyStore = FamilyStore()

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            tabContent
            commandCenterTrigger
                .padding(.trailing, DS.Space.xl)
                .padding(.bottom, 60)
        }
        .ignoresSafeArea(.keyboard)
    }

    private var tabContent: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem { Label("Home", systemImage: "house") }
                .tag(0)

            HealthTimelineView()
                .tabItem { Label("Timeline", systemImage: "clock") }
                .tag(1)

            CareHubView()
                .tabItem { Label("Care", systemImage: "cross.circle") }
                .tag(2)

            WalletView()
                .tabItem { Label("Wallet", systemImage: "creditcard") }
                .tag(3)

            ProfileView()
                .tabItem { Label("Profile", systemImage: "person.circle") }
                .tag(4)
        }
        .tint(.blue)
        .environment(searchNav)
        .environment(inboxStore)
        .environment(familyStore)
        .fullScreenCover(isPresented: $searchNav.showSearch) {
            UniversalSearchView()
        }
        .sheet(isPresented: $searchNav.showCommandCenter) {
            CommandCenterView()
                .presentationDetents([.medium, .large])
                .presentationBackground(.ultraThinMaterial)
        }
        .sheet(isPresented: $searchNav.showInbox) {
            InboxView()
        }
    }

    private var commandCenterTrigger: some View {
        Button { searchNav.showCommandCenter = true } label: {
            Image(systemName: "sparkle")
                .font(.title2.weight(.semibold))
                .foregroundStyle(.white)
                .frame(width: 44, height: 44)
                .background(DS.Color.primary.gradient, in: Circle())
                .dsShadow()
        }
    }
}
