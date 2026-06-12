import SwiftUI

struct SettingsView: View {
    let viewModel: ProfileViewModel
    @Environment(\.dismiss)
    private var dismiss

    @State private var pushNotifications = true
    @State private var emailNotifications = true
    @State private var smsNotifications = false
    @State private var isDarkMode = false
    @State private var selectedLanguage = "English"
    @State private var passcodeEnabled = true
    @State private var biometricEnabled = true
    @State private var healthDataSharing = true
    @State private var analyticsEnabled = false

    let languages = ["English", "Hindi", "Kannada", "Telugu", "Tamil"]

    var body: some View {
        NavigationStack {
            Form {
                notificationsSection
                appearanceSection
                securitySection
                devicesSection
                dataPrivacySection
                legalSection
                aboutSection
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    // MARK: - Notifications

    private var notificationsSection: some View {
        Section {
            Toggle(isOn: $pushNotifications) {
                Label("Push Notifications", systemImage: "bell.fill")
            }
            Toggle(isOn: $emailNotifications) {
                Label("Email Notifications", systemImage: "envelope.fill")
            }
            Toggle(isOn: $smsNotifications) {
                Label("SMS Notifications", systemImage: "message.fill")
            }
        } header: {
            sectionHeader("Notifications")
        }
    }

    // MARK: - Appearance

    private var appearanceSection: some View {
        Section {
            Toggle(isOn: $isDarkMode) {
                Label("Dark Mode", systemImage: isDarkMode ? "moon.fill" : "sun.max.fill")
            }

            Picker(selection: $selectedLanguage) {
                ForEach(languages, id: \.self) { lang in
                    Text(lang).tag(lang)
                }
            } label: {
                Label("Language", systemImage: "globe")
            }
        } header: {
            sectionHeader("Appearance")
        }
    }

    // MARK: - Security

    private var securitySection: some View {
        Section {
            Toggle(isOn: $passcodeEnabled) {
                Label("Passcode Lock", systemImage: "lock.fill")
            }
            Toggle(isOn: $biometricEnabled) {
                Label("Biometric (Face ID / Touch ID)", systemImage: "faceid")
            }
        } header: {
            sectionHeader("Security")
        }
    }

    // MARK: - Devices

    private var devicesSection: some View {
        Section {
            HStack {
                Label("iPhone", systemImage: "iphone")
                Spacer()
                Text("This Device")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
                    .font(.caption)
            }

            HStack {
                Label("Apple Watch", systemImage: "applewatch")
                Spacer()
                Text("Connected")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
                    .font(.caption)
            }

            NavigationLink {
                deviceManagementPlaceholder
            } label: {
                Label("Manage Devices", systemImage: "plus.circle")
            }
        } header: {
            sectionHeader("Devices")
        }
    }

    private var deviceManagementPlaceholder: some View {
        List {
            Section {
                Label("iPhone 15 Pro", systemImage: "iphone")
                Label("Apple Watch Series 9", systemImage: "applewatch")
                Label("AirPods Pro", systemImage: "airpodspro")
            } header: {
                Text("Connected Devices")
            }

            Section {
                Button("Pair New Device", systemImage: "plus.circle") {}
            }
        }
        .navigationTitle("Devices")
    }

    // MARK: - Data & Privacy

    private var dataPrivacySection: some View {
        Section {
            Toggle(isOn: $healthDataSharing) {
                Label("Share Health Data with Providers", systemImage: "heart.text.square")
            }
            Toggle(isOn: $analyticsEnabled) {
                Label("Usage Analytics", systemImage: "chart.bar")
            }

            NavigationLink {
                DataPrivacyDetailView(title: "Data Sharing Preferences", message: "Control how your health data is shared with healthcare providers. Wysh encrypts all data end-to-end and never shares without your explicit consent.")
            } label: {
                Label("Data Sharing Preferences", systemImage: "arrow.triangle.branch")
            }

            NavigationLink {
                DataPrivacyDetailView(title: "Download My Data", message: "You can download a complete archive of your health data, records, and activity history at any time. This may take a few minutes to prepare.")
            } label: {
                Label("Download My Data", systemImage: "square.and.arrow.down")
            }

            NavigationLink {
                DataPrivacyDetailView(title: "Delete Account", message: "Permanently delete your account and all associated data. This action cannot be undone. Your data will be purged from all systems within 30 days.")
                    .foregroundStyle(.red)
            } label: {
                Label("Delete Account", systemImage: "trash")
                    .foregroundStyle(.red)
            }
        } header: {
            sectionHeader("Data & Privacy")
        }
    }

    // MARK: - Legal

    private var legalSection: some View {
        Section {
            NavigationLink {
                DataPrivacyDetailView(title: "Terms of Service", message: "These Terms of Service govern your use of the Wysh platform and all associated services. By using Wysh, you agree to these terms.")
            } label: {
                Label("Terms of Service", systemImage: "doc.text")
            }

            NavigationLink {
                DataPrivacyDetailView(title: "Privacy Policy", message: "Wysh is committed to protecting your privacy. This policy describes how we collect, use, and safeguard your personal and health information.")
            } label: {
                Label("Privacy Policy", systemImage: "hand.raised")
            }

            NavigationLink {
                DataPrivacyDetailView(title: "Licenses", message: "Wysh uses open source libraries and frameworks. Full license texts and attribution notices are available here.")
            } label: {
                Label("Licenses", systemImage: "scroll")
            }

            NavigationLink {
                DataPrivacyDetailView(title: "Open Source Credits", message: "We thank the open source community for their contributions. Key dependencies include SwiftUI, Combine, SwiftLint, and various Apple frameworks.")
            } label: {
                Label("Open Source Credits", systemImage: "chevron.left.forwardslash.chevron.right")
            }
        } header: {
            sectionHeader("Legal")
        }
    }

    // MARK: - About

    private var aboutSection: some View {
        Section {
            HStack {
                Label("Version", systemImage: "info.circle")
                Spacer()
                Text("1.0.0")
                    .foregroundStyle(.secondary)
            }
            HStack {
                Label("Build", systemImage: "hammer")
                Spacer()
                Text("2026.06.01")
                    .foregroundStyle(.secondary)
            }
        } header: {
            sectionHeader("About")
        }
    }

    // MARK: - Helpers

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
    }
}

// MARK: - Detail View

private struct DataPrivacyDetailView: View {
    let title: String
    let message: String

    var body: some View {
        List {
            Section {
                Text(message)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .padding(.vertical, DS.Space.sm)
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    SettingsView(viewModel: ProfileViewModel())
}
