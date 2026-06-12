import Observation
import SwiftUI

@Observable
final class SearchNavigationState {
    var showSearch = false
    var showCommandCenter = false
    var showInbox = false

    deinit {}
}
