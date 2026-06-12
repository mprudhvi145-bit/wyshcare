import SwiftUI

struct SubscriptionPlatformView: View {
    @State private var viewModel = SubscriptionPlatformViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DS.Space.xxl) {
                currentPlanBanner
                planCards
                featureComparison
            }
            .padding(.horizontal, DS.Space.xl)
            .padding(.vertical, DS.Space.lg)
        }
        .background(DS.Color.background)
        .navigationTitle("Subscriptions")
        .navigationBarTitleDisplayMode(.large)
    }

    private var currentPlanBanner: some View {
        let current = viewModel.plans.first { $0.isCurrentPlan }
        return Group {
            if let current {
                GlassCard {
                    HStack(spacing: DS.Space.md) {
                        Image(systemName: current.icon)
                            .font(.title)
                            .foregroundStyle(current.color)

                        VStack(alignment: .leading, spacing: DS.Space.xs) {
                            Text("Current Plan")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text(current.name)
                                .font(.title2.weight(.bold))
                            Text("\(current.price) · \(current.period)")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        Text("Active")
                            .font(.caption.weight(.medium))
                            .foregroundStyle(DS.Color.success)
                            .padding(.horizontal, DS.Space.sm)
                            .padding(.vertical, DS.Space.xs)
                            .background(DS.Color.success.opacity(0.12))
                            .clipShape(Capsule())
                    }
                }
            }
        }
    }

    private var planCards: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Choose Your Plan")

            ForEach(viewModel.plans) { plan in
                planCardView(for: plan)
            }
        }
    }

    private func planCardView(for plan: SubscriptionPlan) -> some View {
        PrimaryCard {
            VStack(alignment: .leading, spacing: DS.Space.md) {
                planCardHeader(for: plan)

                Divider()

                planFeaturesList(for: plan)

                if !plan.isCurrentPlan {
                    planActionButton(for: plan)
                }
            }
        }
    }

    private func planCardHeader(for plan: SubscriptionPlan) -> some View {
        HStack {
            planTitleSection(for: plan)
            Spacer()
            planPriceSection(for: plan)
        }
    }

    private func planTitleSection(for plan: SubscriptionPlan) -> some View {
        VStack(alignment: .leading, spacing: DS.Space.xs) {
            planNameAndBadges(for: plan)
            Text(plan.subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private func planNameAndBadges(for plan: SubscriptionPlan) -> some View {
        HStack(spacing: DS.Space.sm - 2) {
            Text(plan.name)
                .font(.headline.weight(.bold))
            if plan.isPopular {
                popularBadge
            }
            if plan.isCurrentPlan {
                currentPlanBadge
            }
        }
    }

    private var popularBadge: some View {
        Text("Most Popular")
            .font(.caption2.weight(.medium))
            .foregroundStyle(.white)
            .padding(.horizontal, DS.Space.sm)
            .padding(.vertical, 2)
            .background(DS.Color.primary)
            .clipShape(Capsule())
    }

    private var currentPlanBadge: some View {
        Text("Current")
            .font(.caption2.weight(.medium))
            .foregroundStyle(DS.Color.success)
            .padding(.horizontal, DS.Space.sm)
            .padding(.vertical, 2)
            .background(DS.Color.success.opacity(0.12))
            .clipShape(Capsule())
    }

    private func planPriceSection(for plan: SubscriptionPlan) -> some View {
        VStack(alignment: .trailing, spacing: 0) {
            Text(plan.price)
                .font(.title2.weight(.bold))
            Text(plan.period)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
    }

    private func planFeaturesList(for plan: SubscriptionPlan) -> some View {
        VStack(alignment: .leading, spacing: DS.Space.sm) {
            ForEach(plan.features, id: \.self) { feature in
                HStack(spacing: DS.Space.sm) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundStyle(plan.isCurrentPlan ? DS.Color.primary : .secondary)
                    Text(feature)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    private func planActionButton(for plan: SubscriptionPlan) -> some View {
        Button { viewModel.selectPlan(plan) } label: {
            Text(plan.price == "₹0" ? "Get Started" : "Upgrade to \(plan.name)")
                .font(.subheadline.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, DS.Space.sm)
                .background(plan.isPopular ? DS.Color.primary : Color(.systemGray5))
                .foregroundColor(plan.isPopular ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: DS.Radius.medium))
        }
    }

    private var featureComparison: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            SectionHeader(title: "Feature Comparison")

            GlassCard {
                VStack(alignment: .leading, spacing: DS.Space.md) {
                    featureRow("Health Records", free: "3 only", premium: "Unlimited", family: "Unlimited", enterprise: "Unlimited")
                    Divider()
                    featureRow("Family Members", free: "—", premium: "Up to 4", family: "Up to 8", enterprise: "Unlimited")
                    Divider()
                    featureRow("AI Insights", free: "Basic", premium: "Advanced", family: "Advanced", enterprise: "Custom")
                    Divider()
                    featureRow("Chat Support", free: "Community", premium: "24/7", family: "24/7", enterprise: "Priority SLA")
                    Divider()
                    featureRow("Care Coordination", free: "—", premium: "✓", family: "✓", enterprise: "Dedicated")
                }
            }
        }
    }

    private func featureRow(_ name: String, free: String, premium: String, family: String, enterprise: String) -> some View {
        VStack(alignment: .leading, spacing: DS.Space.sm) {
            Text(name)
                .font(.subheadline.weight(.semibold))

            HStack(spacing: DS.Space.sm) {
                featureCell("Free", value: free, isCurrent: viewModel.plans[0].isCurrentPlan)
                featureCell("Premium", value: premium, isCurrent: viewModel.plans[1].isCurrentPlan)
                featureCell("Family", value: family, isCurrent: viewModel.plans[2].isCurrentPlan)
                featureCell("Enterprise", value: enterprise, isCurrent: viewModel.plans[3].isCurrentPlan)
            }
        }
    }

    private func featureCell(_ plan: String, value: String, isCurrent: Bool) -> some View {
        VStack(spacing: DS.Space.xs) {
            Text(plan)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(isCurrent ? DS.Color.primary : .secondary)
            Text(value)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(DS.Space.sm)
        .background(isCurrent ? DS.Color.primary.opacity(0.06) : Color.clear)
        .clipShape(RoundedRectangle(cornerRadius: DS.Radius.small - 2))
    }
}

#Preview {
    NavigationStack {
        SubscriptionPlatformView()
    }
}
