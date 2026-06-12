import SwiftUI
import WidgetKit

@main
struct WyshWidgetsBundle: WidgetBundle {
    var body: some Widget {
        HealthScoreWidget()
        MedicationReminderWidget()
        AppointmentsWidget()
        InsuranceStatusWidget()
        AIInsightWidget()
    }
}
