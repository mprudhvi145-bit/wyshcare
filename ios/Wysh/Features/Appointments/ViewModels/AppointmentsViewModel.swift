import Observation
import SwiftUI

@Observable
final class AppointmentsViewModel {
    var appointments: [AppointmentItem] = []
    var isLoading = false

    deinit {}

    func appointments(for tab: AppointmentsView.AppointmentTab) -> [AppointmentItem] {
        switch tab {
        case .upcoming:
            return appointments.filter { $0.status == .upcoming }

        case .past:
            return appointments.filter { $0.status == .completed || $0.status == .cancelled || $0.status == .missed }
        }
    }

    func loadAppointments() async {
        isLoading = true
        try? await Task.sleep(nanoseconds: 600_000_000)
        appointments = sampleAppointments
        isLoading = false
    }

    func bookAppointment(doctorName: String, specialty: String, reason: String, date: Date, mode: AppointmentMode) {
        let newAppointment = AppointmentItem(
            doctorName: doctorName,
            specialty: specialty,
            reason: reason,
            date: date,
            duration: 30,
            mode: mode,
            status: .upcoming,
            isVideoCallAvailable: mode == .video
        )
        withAnimation {
            appointments.insert(newAppointment, at: 0)
        }
    }

    func cancelAppointment(_ appointment: AppointmentItem) {
        guard let index = appointments.firstIndex(where: { $0.id == appointment.id }) else { return }
        var updated = appointments[index]
        updated = AppointmentItem(
            doctorName: updated.doctorName,
            specialty: updated.specialty,
            reason: updated.reason,
            date: updated.date,
            duration: updated.duration,
            mode: updated.mode,
            status: .cancelled,
            isVideoCallAvailable: updated.isVideoCallAvailable
        )
        appointments[index] = updated
    }

    private var sampleAppointments: [AppointmentItem] {
        let calendar = Calendar.current
        let today = Date()
        guard let day3 = calendar.date(byAdding: .day, value: 3, to: today),
              let day7 = calendar.date(byAdding: .day, value: 7, to: today),
              let dayMinus5 = calendar.date(byAdding: .day, value: -5, to: today),
              let dayMinus14 = calendar.date(byAdding: .day, value: -14, to: today),
              let dayMinus30 = calendar.date(byAdding: .day, value: -30, to: today) else {
            return []
        }
        return [
            AppointmentItem(
                doctorName: "Dr. Aarav Sharma",
                specialty: "Cardiologist",
                reason: "Chest pain follow-up",
                date: day3,
                duration: 30,
                mode: .video,
                status: .upcoming,
                isVideoCallAvailable: true
            ),
            AppointmentItem(
                doctorName: "Dr. Priya Patel",
                specialty: "Dermatologist",
                reason: "Skin rash consultation",
                date: day7,
                duration: 20,
                mode: .inPerson,
                status: .upcoming,
                isVideoCallAvailable: false
            ),
            AppointmentItem(
                doctorName: "Dr. Rajesh Kumar",
                specialty: "General Physician",
                reason: "Annual checkup",
                date: dayMinus5,
                duration: 30,
                mode: .inPerson,
                status: .completed,
                isVideoCallAvailable: false
            ),
            AppointmentItem(
                doctorName: "Dr. Sneha Reddy",
                specialty: "Pediatrician",
                reason: "Vaccination follow-up",
                date: dayMinus14,
                duration: 15,
                mode: .chat,
                status: .completed,
                isVideoCallAvailable: false
            ),
            AppointmentItem(
                doctorName: "Dr. Amit Verma",
                specialty: "Orthopedic",
                reason: "Knee pain consultation",
                date: dayMinus30,
                duration: 45,
                mode: .inPerson,
                status: .cancelled,
                isVideoCallAvailable: false
            )
        ]
    }
}
