import SwiftUI

enum AppointmentMode: String, CaseIterable {
    case audio = "Audio"
    case chat = "Chat"
    case inPerson = "In-Person"
    case video = "Video"

    var icon: String {
        switch self {
        case .audio:
            return "phone.fill"

        case .chat:
            return "message.fill"

        case .inPerson:
            return "person.fill"

        case .video:
            return "video.fill"
        }
    }
}

enum AppointmentStatus: String {
    case cancelled = "Cancelled"
    case completed = "Completed"
    case missed = "Missed"
    case upcoming = "Upcoming"

    var color: Color {
        switch self {
        case .cancelled:
            return .red

        case .completed:
            return .green

        case .missed:
            return .orange

        case .upcoming:
            return .blue
        }
    }
}

struct AppointmentItem: Identifiable {
    let id = UUID()
    let doctorName: String
    let specialty: String
    let reason: String
    let date: Date
    let duration: Int
    let mode: AppointmentMode
    let status: AppointmentStatus
    let isVideoCallAvailable: Bool
}

struct AppointmentsView: View {
    @State private var viewModel = AppointmentsViewModel()
    @State private var selectedTab: AppointmentTab = .upcoming
    @State private var showBooking = false
    @State private var selectedAppointment: AppointmentItem?

    enum AppointmentTab: String, CaseIterable {
        case upcoming = "Upcoming"
        case past = "Past"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                segmentedControl
                    .padding(.horizontal)
                    .padding(.vertical, 8)

                ScrollView {
                    if viewModel.appointments(for: selectedTab).isEmpty {
                        emptyStateView
                    } else {
                        appointmentsList
                    }
                }
                .background(Color(.systemGroupedBackground))
            }
            .navigationTitle("Appointments")
            .toolbar {
                toolbarContent
            }
            .sheet(isPresented: $showBooking) {
                BookAppointmentView()
            }
            .sheet(item: $selectedAppointment) { appointment in
                AppointmentDetailSheet(appointment: appointment)
            }
            .overlay(alignment: .bottomTrailing) {
                bookButton
            }
        }
    }

    @ViewBuilder private var emptyStateView: some View {
        ContentUnavailableView(
            selectedTab == .upcoming ? "No Upcoming Appointments" : "No Past Appointments",
            systemImage: selectedTab == .upcoming ? "calendar.badge.plus" : "clock.arrow.circlepath",
            description: Text(selectedTab == .upcoming
                ? "Book your first appointment to get started."
                : "Your appointment history will appear here.")
        )
        .padding(.top, 40)
    }

    private var appointmentsList: some View {
        LazyVStack(spacing: 12) {
            ForEach(viewModel.appointments(for: selectedTab)) { appointment in
                Button {
                    selectedAppointment = appointment
                } label: {
                    AppointmentCard(appointment: appointment)
                }
                .buttonStyle(.plain)
            }
        }
        .padding()
    }

    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .navigationBarTrailing) {
            Button {
                showBooking = true
            } label: {
                Image(systemName: "plus")
                    .fontWeight(.semibold)
            }
        }
    }

    private var segmentedControl: some View {
        Picker("Tab", selection: $selectedTab) {
            ForEach(AppointmentTab.allCases, id: \.self) { tab in
                Text(tab.rawValue).tag(tab)
            }
        }
        .pickerStyle(.segmented)
    }

    private var bookButton: some View {
        Button {
            showBooking = true
        } label: {
            Label("Book Appointment", systemImage: "plus")
                .font(.subheadline.weight(.semibold))
                .padding(.horizontal, 20)
                .padding(.vertical, 14)
                .background(Color.blue)
                .foregroundColor(.white)
                .clipShape(Capsule())
                .dsShadow()
        }
        .padding()
    }
}

struct AppointmentCard: View {
    let appointment: AppointmentItem

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            headerSection
            dateSection
            reasonSection
        }
        .padding(14)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .dsShadow()
    }

    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(appointment.doctorName)
                    .font(.subheadline.weight(.semibold))
                Text(appointment.specialty)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Text(appointment.status.rawValue)
                .font(.caption2.weight(.medium))
                .foregroundColor(appointment.status.color)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(appointment.status.color.opacity(0.12))
                .clipShape(Capsule())
        }
    }

    private var dateSection: some View {
        HStack(spacing: 12) {
            Label(appointment.date.formatted(date: .abbreviated, time: .shortened), systemImage: "clock")
                .font(.caption)
                .foregroundColor(.secondary)

            Label("\(appointment.duration) min", systemImage: "hourglass")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }

    private var reasonSection: some View {
        HStack {
            Text(appointment.reason)
                .font(.caption)
                .foregroundColor(.primary)
                .lineLimit(1)

            Spacer()

            Label(appointment.mode.rawValue, systemImage: appointment.mode.icon)
                .font(.caption2.weight(.medium))
                .foregroundColor(.blue)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.blue.opacity(0.1))
                .clipShape(Capsule())
        }
    }
}

struct AppointmentDetailSheet: View {
    let appointment: AppointmentItem

    @Environment(\.dismiss)
    private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    profileSection
                    detailsSection
                    joinCallButton
                    cancelButton
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Appointment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
            }
        }
    }

    private var profileSection: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(Color.blue.opacity(0.15))
                    .frame(width: 72, height: 72)
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 36))
                    .foregroundColor(.blue)
            }

            Text(appointment.doctorName)
                .font(.title2.weight(.bold))
            Text(appointment.specialty)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var detailsSection: some View {
        GroupBox {
            VStack(spacing: 12) {
                detailRow(icon: "calendar", label: "Date", value: appointment.date.formatted(date: .long, time: .shortened))
                Divider()
                detailRow(icon: "hourglass", label: "Duration", value: "\(appointment.duration) minutes")
                Divider()
                detailRow(icon: appointment.mode.icon, label: "Mode", value: appointment.mode.rawValue)
                Divider()
                detailRow(icon: "text.alignleft", label: "Reason", value: appointment.reason)
            }
        } label: {
            Label("Appointment Details", systemImage: "info.circle")
        }
    }

    @ViewBuilder private var joinCallButton: some View {
        if appointment.isVideoCallAvailable && appointment.status == .upcoming {
            Button {
                dismiss()
            } label: {
                Label("Join Call", systemImage: "video.fill")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.green)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
    }

    @ViewBuilder private var cancelButton: some View {
        if appointment.status == .upcoming {
            Button(role: .destructive) {
                dismiss()
            } label: {
                Text("Cancel Appointment")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.red.opacity(0.1))
                    .foregroundColor(.red)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
    }

    private func detailRow(icon: String, label: String, value: String) -> some View {
        HStack {
            Image(systemName: icon)
                .frame(width: 20)
                .foregroundColor(.blue)
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
    AppointmentsView()
}
