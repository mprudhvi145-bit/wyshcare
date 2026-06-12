import HealthKit
import Observation

enum HealthMetricType: String, CaseIterable {
    case bloodOxygen, bloodPressure, heartRate, respiratoryRate, sleep, steps, weight, workouts

    var hkType: HKQuantityType? {
        switch self {
        case .bloodOxygen:
            HKQuantityType(.oxygenSaturation)

        case .bloodPressure:
            HKQuantityType(.bloodPressureSystolic)

        case .heartRate:
            HKQuantityType(.heartRate)

        case .respiratoryRate:
            HKQuantityType(.respiratoryRate)

        case .sleep:
            nil

        case .steps:
            HKQuantityType(.stepCount)

        case .weight:
            HKQuantityType(.bodyMass)

        case .workouts:
            nil
        }
    }
}

@MainActor
@Observable
final class HealthKitService {
    static let shared = HealthKitService()
    let healthStore = HKHealthStore()

    var isAuthorized = false
    var steps: Double = 0
    var heartRate: Double = 0
    var weight: Double = 0
    var bloodPressureSystolic: Double = 0
    var bloodPressureDiastolic: Double = 0
    var bloodOxygen: Double = 0
    var respiratoryRate: Double = 0
    var sleepHours: Double = 0

    private init() {}

    func requestAuthorization() async {
        let typesToRead: Set<HKObjectType> = [
            HKQuantityType(.stepCount),
            HKQuantityType(.heartRate),
            HKQuantityType(.bodyMass),
            HKQuantityType(.bloodPressureSystolic),
            HKQuantityType(.bloodPressureDiastolic),
            HKQuantityType(.oxygenSaturation),
            HKQuantityType(.respiratoryRate),
            HKCategoryType(.sleepAnalysis),
            HKObjectType.workoutType()
        ]

        guard HKHealthStore.isHealthDataAvailable() else { return }

        do {
            try await healthStore.requestAuthorization(toShare: [], read: typesToRead)
            isAuthorized = true
            await fetchAllMetrics()
        } catch {
            print("HealthKit authorization failed: \(error)")
        }
    }

    deinit {}

    func fetchAllMetrics() async {
        await withTaskGroup(of: Void.self) { group in
            for metric in HealthMetricType.allCases {
                group.addTask { await self.fetchMetric(metric) }
            }
        }
    }

    private func fetchMetric(_ metric: HealthMetricType) async {
        let now = Date()
        let startOfDay = Calendar.current.startOfDay(for: now)

        switch metric {
        case .bloodOxygen:
            bloodOxygen = await fetchLatest(for: HKQuantityType(.oxygenSaturation))

        case .bloodPressure:
            bloodPressureSystolic = await fetchLatest(for: HKQuantityType(.bloodPressureSystolic))
            bloodPressureDiastolic = await fetchLatest(for: HKQuantityType(.bloodPressureDiastolic))

        case .heartRate:
            heartRate = await fetchAverage(for: HKQuantityType(.heartRate), from: startOfDay, to: now)

        case .respiratoryRate:
            respiratoryRate = await fetchAverage(for: HKQuantityType(.respiratoryRate), from: startOfDay, to: now)

        case .sleep:
            sleepHours = await fetchSleepHours(from: startOfDay, to: now)

        case .steps:
            steps = await fetchSum(for: HKQuantityType(.stepCount), from: startOfDay, to: now)

        case .weight:
            weight = await fetchLatest(for: HKQuantityType(.bodyMass))

        case .workouts:
            break
        }
    }

    private func fetchSum(for type: HKQuantityType, from start: Date, to end: Date) async -> Double {
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end)
        let result = try? await withCheckedThrowingContinuation { (cont: CheckedContinuation<Double, Error>) in
            let query = HKStatisticsQuery(quantityType: type, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, error in
                if let error { cont.resume(throwing: error); return }
                cont.resume(returning: stats?.sumQuantity()?.doubleValue(for: HKUnit.count()) ?? 0)
            }
            healthStore.execute(query)
        }
        return result ?? 0
    }

    private func fetchAverage(for type: HKQuantityType, from start: Date, to end: Date) async -> Double {
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end)
        let result = try? await withCheckedThrowingContinuation { (cont: CheckedContinuation<Double, Error>) in
            let query = HKStatisticsQuery(quantityType: type, quantitySamplePredicate: predicate, options: .discreteAverage) { _, stats, error in
                if let error { cont.resume(throwing: error); return }
                let unit = type == HKQuantityType(.heartRate) ? HKUnit(from: "count/min") : HKUnit.percent()
                cont.resume(returning: stats?.averageQuantity()?.doubleValue(for: unit) ?? 0)
            }
            healthStore.execute(query)
        }
        return result ?? 0
    }

    private func fetchLatest(for type: HKQuantityType) async -> Double {
        let predicate = HKQuery.predicateForSamples(
            withStart: Calendar.current.date(byAdding: .day, value: -30, to: Date()),
            end: Date()
        )
        let sort = [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)]
        let result = try? await withCheckedThrowingContinuation { (cont: CheckedContinuation<Double, Error>) in
            let query = HKSampleQuery(sampleType: type, predicate: predicate, limit: 1, sortDescriptors: sort) { _, samples, error in
                if let error { cont.resume(throwing: error); return }
                let value = (samples?.first as? HKQuantitySample)?.quantity.doubleValue(for: HKUnit.gramUnit(with: .kilo)) ?? 0
                cont.resume(returning: value)
            }
            healthStore.execute(query)
        }
        return result ?? 0
    }

    private func fetchSleepHours(from start: Date, to end: Date) async -> Double {
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end)
        let result = try? await withCheckedThrowingContinuation { (cont: CheckedContinuation<Double, Error>) in
            let query = HKSampleQuery(
                sampleType: HKCategoryType(.sleepAnalysis),
                predicate: predicate,
                limit: 0,
                sortDescriptors: []
            ) { _, samples, error in
                if let error { cont.resume(throwing: error); return }
                let hours = (samples as? [HKCategorySample])?.reduce(0.0) { total, sample in
                    total + sample.endDate.timeIntervalSince(sample.startDate) / 3_600
                } ?? 0
                cont.resume(returning: hours)
            }
            healthStore.execute(query)
        }
        return result ?? 0
    }
}
