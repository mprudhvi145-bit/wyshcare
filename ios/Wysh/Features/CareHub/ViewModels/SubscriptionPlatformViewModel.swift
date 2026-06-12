import Foundation
import SwiftUI

struct SubscriptionPlan: Identifiable {
    let id = UUID()
    let name: String
    let subtitle: String
    let price: String
    let period: String
    let icon: String
    let color: Color
    let isPopular: Bool
    let features: [String]
    let isCurrentPlan: Bool
}

@MainActor
@Observable
final class SubscriptionPlatformViewModel {
    var plans: [SubscriptionPlan] = []
    var selectedPlanId: UUID?
    var showComparison = false

    var selectedPlan: SubscriptionPlan? {
        plans.first { $0.id == selectedPlanId }
    }

    init() {
        loadPlans()
        selectedPlanId = plans.first { $0.isCurrentPlan }?.id
    }

    deinit {}

    private func loadPlans() {
        plans = [
            SubscriptionPlan(
                name: "Free",
                subtitle: "Essential health tracking",
                price: "₹0",
                period: "forever",
                icon: "heart.fill",
                color: .green,
                isPopular: false,
                features: [
                    "Basic health score tracking",
                    "Up to 3 health records",
                    "Community support",
                    "Basic insights"
                ],
                isCurrentPlan: false
            ),
            SubscriptionPlan(
                name: "Care Premium",
                subtitle: "Complete care management",
                price: "₹499",
                period: "per month",
                icon: "crown.fill",
                color: .yellow,
                isPopular: true,
                features: [
                    "Everything in Free",
                    "Unlimited health records",
                    "AI-powered health insights",
                    "Care team coordination",
                    "Priority appointments",
                    "Family member management (up to 4)",
                    "Insurance claim assistance",
                    "24/7 chat support"
                ],
                isCurrentPlan: true
            ),
            SubscriptionPlan(
                name: "Family Shield",
                subtitle: "Protect your whole family",
                price: "₹799",
                period: "per month",
                icon: "person.3.fill",
                color: .blue,
                isPopular: false,
                features: [
                    "Everything in Care Premium",
                    "Up to 8 family members",
                    "Family health dashboard",
                    "Shared care coordination",
                    "Family insurance pooling",
                    "Emergency contact setup",
                    "Health alerts for family"
                ],
                isCurrentPlan: false
            ),
            SubscriptionPlan(
                name: "Enterprise",
                subtitle: "For organizations",
                price: "₹2,499",
                period: "per month",
                icon: "building.2.fill",
                color: .indigo,
                isPopular: false,
                features: [
                    "Everything in Family Shield",
                    "Unlimited family members",
                    "Dedicated care coordinator",
                    "Corporate health analytics",
                    "Wellness program management",
                    "API access for HR systems",
                    "Priority support SLA"
                ],
                isCurrentPlan: false
            )
        ]
    }

    func selectPlan(_ plan: SubscriptionPlan) {
        selectedPlanId = plan.id
    }
}
