import Foundation
import SwiftData

@Model
final class CachedResponse {
    @Attribute(.unique)
    var cacheKey: String
    var data: Data
    var createdAt: Date
    var expiresAt: Date

    init(cacheKey: String, data: Data, ttl: TimeInterval = 300) {
        self.cacheKey = cacheKey
        self.data = data
        self.createdAt = Date()
        self.expiresAt = Date().addingTimeInterval(ttl)
    }

    var isValid: Bool {
        Date() < expiresAt
    }

    deinit {}
}

actor LocalCache {
    private let container: ModelContainer
    private let context: ModelContext

    init() throws {
        let schema = Schema([CachedResponse.self])
        let config = ModelConfiguration(isStoredInMemoryOnly: false)
        container = try ModelContainer(for: schema, configurations: config)
        context = ModelContext(container)
        context.autosaveEnabled = true
    }

    func get<T: Decodable & Sendable>(key: String, type: T.Type) async throws -> T? {
        let predicate = #Predicate<CachedResponse> { $0.cacheKey == key }
        let fetch = FetchDescriptor(predicate: predicate)
        guard let cached = try context.fetch(fetch).first, cached.isValid else {
            return nil
        }
        return try JSONDecoder().decode(T.self, from: cached.data)
    }

    func set<T: Encodable & Sendable>(key: String, value: T, ttl: TimeInterval = 300) async throws {
        let data = try JSONEncoder().encode(value)
        let predicate = #Predicate<CachedResponse> { $0.cacheKey == key }
        let fetch = FetchDescriptor(predicate: predicate)
        if let existing = try context.fetch(fetch).first {
            existing.data = data
            existing.createdAt = Date()
            existing.expiresAt = Date().addingTimeInterval(ttl)
        } else {
            context.insert(CachedResponse(cacheKey: key, data: data, ttl: ttl))
        }
        try context.save()
    }

    func invalidate(key: String) async throws {
        let predicate = #Predicate<CachedResponse> { $0.cacheKey == key }
        let fetch = FetchDescriptor(predicate: predicate)
        if let cached = try context.fetch(fetch).first {
            context.delete(cached)
            try context.save()
        }
    }

    func clearAll() async throws {
        let fetch = FetchDescriptor<CachedResponse>()
        let results = try context.fetch(fetch)
        for item in results {
            context.delete(item)
        }
        try context.save()
    }
}
