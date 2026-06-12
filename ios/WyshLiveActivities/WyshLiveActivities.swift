import ActivityKit
import SwiftUI
import WidgetKit

@main
struct WyshLiveActivities: WidgetBundle {
    var body: some Widget {
        TelemedicineLiveActivity()
        LabCollectionLiveActivity()
        MedicineDeliveryLiveActivity()
        ClaimStatusLiveActivity()
    }
}
