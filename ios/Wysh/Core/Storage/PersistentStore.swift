import Foundation
import SwiftData

actor PersistentStore {
    static let shared = PersistentStore()
    let container: ModelContainer

    private init() {
        let schema = Schema([
            CachedResponse.self
        ])
        let config = ModelConfiguration(isStoredInMemoryOnly: false)
        do {
            container = try ModelContainer(for: schema, configurations: config)
        } catch {
            fatalError("Failed to create ModelContainer: \(error.localizedDescription)")
        }
    }

    func newContext() -> ModelContext {
        ModelContext(container)
    }

    func save(_ context: ModelContext) async throws {
        try context.save()
    }
}
