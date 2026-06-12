import SwiftUI

struct Doctor: Identifiable {
    let id = UUID()
    let name: String
    let specialty: String
    let experience: Int
    let rating: Double
    let location: String
    let available: Bool
}

struct BookAppointmentView: View {
    @Environment(\.dismiss)
    private var dismiss
    @State private var searchQuery = ""
    @State private var selectedSpecialty: String?
    @State private var selectedDate = Date()
    @State private var selectedTimeSlot: String?
    @State private var reason = ""
    @State private var selectedDoctor: Doctor?
    @State private var isBooking = false
    @State private var showConfirmation = false

    let specialties = [
        "General Physician", "Cardiologist", "Dermatologist", "Pediatrician",
        "Orthopedic", "ENT", "Ophthalmologist", "Gynecologist", "Neurologist", "Psychiatrist"
    ]

    let timeSlots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
        "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM"
    ]

    let doctors: [Doctor] = [
        Doctor(name: "Dr. Aarav Sharma", specialty: "Cardiologist", experience: 15, rating: 4.8, location: "Apollo Hospital, Delhi", available: true),
        Doctor(name: "Dr. Priya Patel", specialty: "Dermatologist", experience: 10, rating: 4.6, location: "Max Clinic, Mumbai", available: true),
        Doctor(name: "Dr. Rajesh Kumar", specialty: "General Physician", experience: 20, rating: 4.7, location: "Fortis, Bangalore", available: true),
        Doctor(name: "Dr. Sneha Reddy", specialty: "Pediatrician", experience: 12, rating: 4.9, location: "Rainbow Hospital, Hyderabad", available: false),
        Doctor(name: "Dr. Amit Verma", specialty: "Orthopedic", experience: 18, rating: 4.5, location: "Medanta, Gurgaon", available: true)
    ]

    var filteredDoctors: [Doctor] {
        var result = doctors
        if !searchQuery.isEmpty {
            result = result.filter { $0.name.localizedCaseInsensitiveContains(searchQuery) }
        }
        if let specialty = selectedSpecialty {
            result = result.filter { $0.specialty == specialty }
        }
        return result
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    doctorSearchSection
                    specialtySection
                    if selectedDoctor != nil {
                        dateSection
                        timeSlotSection
                        reasonSection
                        bookButton
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Book Appointment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .alert("Appointment Booked", isPresented: $showConfirmation) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your appointment with \(selectedDoctor?.name ?? "") has been scheduled.")
            }
        }
    }

    private var doctorSearchSection: some View {
        VStack(spacing: 10) {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                TextField("Search doctors...", text: $searchQuery)
                    .textFieldStyle(.plain)
                if !searchQuery.isEmpty {
                    Button { searchQuery = "" } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding(12)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))

            if !filteredDoctors.isEmpty {
                ForEach(filteredDoctors) { doctor in
                    doctorRow(for: doctor)
                }
            } else if !searchQuery.isEmpty {
                Text("No doctors found")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.top, 8)
            }
        }
    }

    private func doctorRow(for doctor: Doctor) -> some View {
        Button {
            withAnimation(.spring(response: 0.35)) {
                selectedDoctor = doctor
            }
        } label: {
            doctorRowLabel(for: doctor)
        }
        .buttonStyle(.plain)
        .disabled(!doctor.available)
    }

    private func doctorRowLabel(for doctor: Doctor) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 3) {
                Text(doctor.name)
                    .font(.subheadline.weight(.semibold))
                Text("\(doctor.specialty) • \(doctor.experience) yrs exp")
                    .font(.caption)
                    .foregroundColor(.secondary)
                HStack {
                    Image(systemName: "star.fill")
                        .font(.caption2)
                        .foregroundColor(.yellow)
                    Text(String(format: "%.1f", doctor.rating))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Text(doctor.location)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }
            Spacer()
            if selectedDoctor?.id == doctor.id {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.blue)
            } else if !doctor.available {
                Text("Unavailable")
                    .font(.caption2)
                    .foregroundColor(.red)
            }
        }
        .padding(12)
        .background(selectedDoctor?.id == doctor.id ? Color.blue.opacity(0.06) : Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(selectedDoctor?.id == doctor.id ? Color.blue : Color.clear, lineWidth: 1)
        )
    }

    private var specialtySection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Filter by Specialty")
                .font(.subheadline.weight(.semibold))

            specialtyScrollContent
        }
    }

    private var specialtyScrollContent: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                allSpecialtyButton
                ForEach(specialties, id: \.self) { specialty in
                    specialtyButton(for: specialty)
                }
            }
        }
    }

    private var allSpecialtyButton: some View {
        Button {
            withAnimation { selectedSpecialty = nil }
        } label: {
            Text("All")
                .font(.caption)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(selectedSpecialty == nil ? Color.blue : Color(.systemGray6))
                .foregroundColor(selectedSpecialty == nil ? .white : .primary)
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private func specialtyButton(for specialty: String) -> some View {
        Button {
            withAnimation { selectedSpecialty = specialty }
        } label: {
            Text(specialty)
                .font(.caption)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(selectedSpecialty == specialty ? Color.blue : Color(.systemGray6))
                .foregroundColor(selectedSpecialty == specialty ? .white : .primary)
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private var dateSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Select Date", systemImage: "calendar")
                .font(.subheadline.weight(.semibold))

            DatePicker("Appointment Date", selection: $selectedDate, in: Date()..., displayedComponents: .date)
                .datePickerStyle(.graphical)
                .padding()
                .background(Color(.systemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var timeSlotSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Select Time", systemImage: "clock")
                .font(.subheadline.weight(.semibold))

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                ForEach(timeSlots, id: \.self) { slot in
                    Button {
                        withAnimation { selectedTimeSlot = slot }
                    } label: {
                        Text(slot)
                            .font(.caption.weight(.medium))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(selectedTimeSlot == slot ? Color.blue : Color(.systemBackground))
                            .foregroundColor(selectedTimeSlot == slot ? .white : .primary)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var reasonSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Reason for Visit", systemImage: "text.alignleft")
                .font(.subheadline.weight(.semibold))

            TextField("e.g. Fever, cough since 3 days", text: $reason)
                .textFieldStyle(.plain)
                .padding(12)
                .background(Color(.systemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var bookButton: some View {
        Button {
            isBooking = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                isBooking = false
                showConfirmation = true
            }
        } label: {
            HStack {
                if isBooking {
                    ProgressView()
                        .tint(.white)
                }
                Text(isBooking ? "Booking..." : "Book Appointment")
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(isBooking || reason.isEmpty || selectedTimeSlot == nil ? Color.blue.opacity(0.5) : Color.blue)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .disabled(isBooking || reason.isEmpty || selectedTimeSlot == nil)
    }
}

#Preview {
    BookAppointmentView()
}
