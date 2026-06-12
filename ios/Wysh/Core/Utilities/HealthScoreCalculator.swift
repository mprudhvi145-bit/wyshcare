import Foundation

struct HealthScoreResult {
    let score: Int
    let level: HealthScoreLevel
    let vitalSignsScore: Double
    let activityScore: Double
    let sleepScore: Double
    let medicationScore: Double
    let riskFactorScore: Double
    let engagementScore: Double
}

enum HealthScoreLevel: String {
    case excellent = "Excellent"
    case fair = "Fair"
    case good = "Good"
    case poor = "Poor"

    var color: String {
        switch self {
        case .excellent:
            "green"

        case .good:
            "blue"

        case .fair:
            "orange"

        case .poor:
            "red"
        }
    }
}

struct HealthScoreInput {
    let heartRate: Double
    let bloodPressureSystolic: Double
    let bloodPressureDiastolic: Double
    let bloodOxygen: Double
    let respiratoryRate: Double
    let steps: Double
    let exerciseMinutes: Double
    let sleepHours: Double
    let medicationAdherence: Double
    let hasRiskFactors: Bool
    let riskFactorCount: Int
    let healthcareVisits: Int
    let screeningsCompleted: Int
}

struct HealthScoreCalculator {
    private let vitalSignsWeight = 0.30
    private let activityWeight = 0.20
    private let sleepWeight = 0.15
    private let medicationWeight = 0.15
    private let riskFactorWeight = 0.10
    private let engagementWeight = 0.10

    func compute(input: HealthScoreInput) -> HealthScoreResult {
        let vitalScore = computeVitalSignsScore(
            heartRate: input.heartRate,
            systolic: input.bloodPressureSystolic,
            diastolic: input.bloodPressureDiastolic,
            oxygen: input.bloodOxygen,
            respiratoryRate: input.respiratoryRate
        )

        let activityScore = computeActivityScore(steps: input.steps, exerciseMinutes: input.exerciseMinutes)
        let sleepScore = computeSleepScore(hours: input.sleepHours)
        let medicationScore = input.medicationAdherence * 100
        let riskScore = computeRiskFactorScore(has: input.hasRiskFactors, count: input.riskFactorCount)
        let engagementScore = computeEngagementScore(visits: input.healthcareVisits, screenings: input.screeningsCompleted)

        let totalScore = Int(round(
            vitalScore * vitalSignsWeight +
            activityScore * activityWeight +
            sleepScore * sleepWeight +
            medicationScore * medicationWeight +
            riskScore * riskFactorWeight +
            engagementScore * engagementWeight
        ))

        let clampedScore = min(max(totalScore, 0), 100)

        let level: HealthScoreLevel = {
            switch clampedScore {
            case 80...100:
                .excellent

            case 60..<80:
                .good

            case 40..<60:
                .fair

            default:
                .poor
            }
        }()

        return HealthScoreResult(
            score: clampedScore,
            level: level,
            vitalSignsScore: vitalScore,
            activityScore: activityScore,
            sleepScore: sleepScore,
            medicationScore: medicationScore,
            riskFactorScore: riskScore,
            engagementScore: engagementScore
        )
    }

    private func computeVitalSignsScore(
        heartRate: Double,
        systolic: Double,
        diastolic: Double,
        oxygen: Double,
        respiratoryRate: Double
    ) -> Double {
        let hrScore = computeHeartRateScore(heartRate)
        let bpScore = computeBloodPressureScore(systolic: systolic, diastolic: diastolic)
        let oxScore = computeOxygenScore(oxygen)
        let rrScore = computeRespiratoryRateScore(respiratoryRate)
        return (hrScore * 0.25 + bpScore * 0.35 + oxScore * 0.25 + rrScore * 0.15)
    }

    private func computeHeartRateScore(_ heartRate: Double) -> Double {
        switch heartRate {
        case 60...80:
            100

        case 50..<60, 81...100:
            80

        case 101...120:
            60

        case 41..<50, 121...140:
            40

        default:
            20
        }
    }

    private func computeBloodPressureScore(systolic: Double, diastolic: Double) -> Double {
        if systolic < 120 && diastolic < 80 { return 100 }
        if systolic < 130 && diastolic < 85 { return 85 }
        if systolic < 140 || diastolic < 90 { return 70 }
        if systolic < 160 || diastolic < 100 { return 50 }
        return 30
    }

    private func computeOxygenScore(_ oxygen: Double) -> Double {
        switch oxygen {
        case 0.95...1.0:
            100

        case 0.90..<0.95:
            80

        case 0.85..<0.90:
            50

        default:
            20
        }
    }

    private func computeRespiratoryRateScore(_ respiratoryRate: Double) -> Double {
        switch respiratoryRate {
        case 12...16:
            100

        case 16...20, 10..<12:
            80

        case 20...25, 8..<10:
            60

        default:
            30
        }
    }

    private func computeActivityScore(steps: Double, exerciseMinutes: Double) -> Double {
        let stepsScore = min(steps / 10_000, 1.0) * 100
        let exerciseScore = min(exerciseMinutes / 150, 1.0) * 100
        return stepsScore * 0.5 + exerciseScore * 0.5
    }

    private func computeSleepScore(hours: Double) -> Double {
        switch hours {
        case 7...9:
            100

        case 6..<7, 9...10:
            80

        case 5..<6, 10...12:
            60

        case 4..<5:
            40

        default:
            20
        }
    }

    private func computeRiskFactorScore(has: Bool, count: Int) -> Double {
        guard has else { return 100 }
        let deduction = Double(count) * 15.0
        return max(100 - deduction, 0)
    }

    private func computeEngagementScore(visits: Int, screenings: Int) -> Double {
        let visitScore = min(Double(visits) / 4.0, 1.0) * 100
        let screeningScore = min(Double(screenings) / 3.0, 1.0) * 100
        return visitScore * 0.5 + screeningScore * 0.5
    }
}
