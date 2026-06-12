import Foundation

enum HTTPMethod: String {
    case delete = "DELETE"
    case get = "GET"
    case patch = "PATCH"
    case post = "POST"
    case put = "PUT"
}

enum APIError: LocalizedError {
    case decodingError
    case invalidURL
    case networkError(Error)
    case noData
    case serverError(String)
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .decodingError:
            return "Failed to process response"

        case .invalidURL:
            return "Invalid URL"

        case .networkError(let err):
            return err.localizedDescription

        case .noData:
            return "No data received"

        case .serverError(let msg):
            return msg

        case .unauthorized:
            return "Session expired. Please login again."
        }
    }

    static func == (lhs: Self, rhs: Self) -> Bool {
        lhs.localizedDescription == rhs.localizedDescription
    }
}

final class APIClient: Sendable {
    static let shared = APIClient()
    private let baseURL = "https://api.wyshcare.com/api/v1"
    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.waitsForConnectivity = true
        self.session = URLSession(configuration: config)
        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
            self.decoder.dateDecodingStrategy = .iso8601
    }

    deinit {}

    func request<T: Decodable & Sendable>(
        _ path: String,
        method: HTTPMethod = .get,
        body: (any Encodable & Sendable)? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method.rawValue
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if requiresAuth, let token = await KeychainService.shared.getToken() {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            urlRequest.httpBody = try JSONEncoder().encode(AnyEncodable(body))
        }

        let (data, response) = try await session.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError("Invalid response")
        }

        switch httpResponse.statusCode {
        case 200...299:
            let envelope = try decoder.decode(APIEnvelope<T>.self, from: data)
            return envelope.data

        case 401:
            throw APIError.unauthorized

        default:
            let error = try? decoder.decode(APIErrorResponse.self, from: data)
            throw APIError.serverError(error?.message ?? "Server error")
        }
    }

    func requestVoid(
        _ path: String,
        method: HTTPMethod = .get,
        body: (any Encodable & Sendable)? = nil,
        requiresAuth: Bool = true
    ) async throws {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method.rawValue
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if requiresAuth, let token = await KeychainService.shared.getToken() {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            urlRequest.httpBody = try JSONEncoder().encode(AnyEncodable(body))
        }

        let (_, response) = try await session.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError("Invalid response")
        }

        switch httpResponse.statusCode {
        case 200...299:
            return

        case 401:
            throw APIError.unauthorized

        default:
            throw APIError.serverError("Server error")
        }
    }
}

struct APIEnvelope<T: Decodable>: Decodable {
    let success: Bool
    let data: T
}

struct APIErrorResponse: Decodable {
    let message: String
}

struct AnyEncodable: Encodable {
    let value: (any Encodable)

    init(_ value: any Encodable) {
        self.value = value
    }

    func encode(to encoder: any Encoder) throws {
        try value.encode(to: encoder)
    }
}
