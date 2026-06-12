import SwiftUI

struct DigitalTwinView: View {
    @State private var viewModel = DigitalTwinViewModel()
    @State private var animateRing = false
    @State private var showCards = false

    var body: some View {
        NavigationStack {
            Group {
                mainContent
            }
            .navigationTitle("Digital Twin")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    if viewModel.isLoading {
                        ProgressView()
                    } else {
                        Button("Recompute", systemImage: "arrow.clockwise") {
                            Task { await viewModel.recompute() }
                        }
                    }
                }
            }
            .refreshable { await viewModel.load() }
            .onAppear {
                withAnimation(.easeOut(duration: 1.2)) { animateRing = true }
                withAnimation(.easeOut(duration: 0.8).delay(0.3)) { showCards = true }
            }
        }
    }

    // MARK: - Sections

    @ViewBuilder private var mainContent: some View {
        if viewModel.isLoading && !viewModel.scoresLoaded {
            LoadingStateView(message: "Loading your Digital Twin...")
        } else if let error = viewModel.errorMessage, !viewModel.dataLoaded {
            EmptyStateView(
                icon: "exclamationmark.triangle",
                title: "Unable to Load",
                message: error,
                actionTitle: "Retry"
            ) {
                Task { await viewModel.load() }
            }
        } else {
            ScrollView {
                VStack(spacing: DS.Space.xxl) {
                    headerSection
                    healthScoreRingSection
                    riskLevelSection

                    LazyVStack(spacing: DS.Space.lg) {
                        healthScoreCard
                        riskAssessmentCard
                        predictionsCard
                        careGapsCard
                        familyRiskCard
                        diseaseProgressionCard
                        preventiveCareCard
                        aiTwinSummaryCard
                    }
                }
                .padding(.horizontal, DS.Space.xl)
                .padding(.bottom, DS.Space.xxxxl)
            }
            .background(DS.Color.background)
        }
    }

    private var headerSection: some View {
        VStack(spacing: DS.Space.xs) {
            Image(systemName: "person.fill.viewfinder")
                .font(.system(size: DS.Space.xxxxl))
                .foregroundStyle(DS.Color.primary)
            Text("DIGITAL TWIN")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)
        }
    }

    private var healthScoreRingSection: some View {
        VStack(spacing: DS.Space.sm) {
            HealthScoreRing(
                score: Int(viewModel.healthScore),
                label: scoreLabel,
                trend: viewModel.formattedTrend()
            )
        }
    }

    private var scoreLabel: String {
        switch viewModel.healthScore {
        case 80...100:
            "Excellent"

        case 60..<80:
            "Good"

        case 40..<60:
            "Fair"

        default:
            "Poor"
        }
    }

    private var riskLevelSection: some View {
        HStack(spacing: DS.Space.sm) {
            Circle()
                .fill(viewModel.riskLevel.color)
                .frame(width: DS.Space.md, height: DS.Space.md)
            Text(viewModel.riskLevel.displayName)
                .font(.subheadline)
                .fontWeight(.medium)
            Text("Risk")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, DS.Space.lg)
        .padding(.vertical, DS.Space.sm)
        .background(.ultraThinMaterial, in: Capsule())
    }

    // MARK: - Cards

    private var healthScoreCard: some View {
        cardTransition(
            PrimaryCard(title: "Health Score", icon: "heart.fill") {
                HStack {
                    VStack(alignment: .leading, spacing: DS.Space.xs) {
                        Text("\(Int(viewModel.healthScore))")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                        HStack(spacing: DS.Space.xs) {
                            Image(systemName: viewModel.healthScoreTrend.direction.icon)
                                .font(.caption)
                                .foregroundStyle(viewModel.healthScoreTrend.direction == .up ? DS.Color.success : DS.Color.critical)
                            Text("\(viewModel.healthScoreTrend.percentage, specifier: "%.1f")% \(viewModel.healthScoreTrend.direction == .up ? "improvement" : "decline")")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    Spacer()
                    ZStack {
                        Circle()
                            .stroke(Color(.systemGray5), lineWidth: DS.Space.sm)
                            .frame(width: 80, height: 80)
                        Circle()
                            .trim(from: 0, to: animateRing ? CGFloat(viewModel.healthScore / 100) : 0)
                            .stroke(DS.Color.primary, style: StrokeStyle(lineWidth: DS.Space.sm, lineCap: .round))
                            .frame(width: 80, height: 80)
                            .rotationEffect(.degrees(-90))
                    }
                }
            },
            delay: 0.1
        )
    }

    private var riskAssessmentCard: some View {
        cardTransition(
            PrimaryCard(title: "Risk Assessment", icon: "exclamationmark.shield.fill") {
                riskAssessmentCardContent
            },
            delay: 0.2
        )
    }

    private var riskAssessmentCardContent: some View {
        VStack(spacing: DS.Space.md) {
            riskAssessmentCardBody
        }
    }

    private var riskAssessmentCardBody: some View {
        Group {
            riskAssessmentHeader
            if !viewModel.keyRisks.isEmpty {
                VStack(alignment: .leading, spacing: DS.Space.sm - 2) {
                    Text("Key Risks")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    ForEach(viewModel.keyRisks, id: \.self) { risk in
                        HStack(spacing: DS.Space.sm) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .font(.caption2)
                                .foregroundStyle(DS.Color.warning)
                            Text(risk)
                                .font(.subheadline)
                        }
                    }
                }
            }
        }
    }

    private var riskAssessmentHeader: some View {
        HStack {
            Text("Risk Score:")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text("\(Int(viewModel.riskScore))")
                .font(.title3)
                .fontWeight(.bold)
            Spacer()
            Text(viewModel.riskLevel.displayName)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundStyle(viewModel.riskLevel.color)
                .padding(.horizontal, DS.Space.sm + 2)
                .padding(.vertical, DS.Space.xs)
                .background(viewModel.riskLevel.color.opacity(0.15), in: Capsule())
        }
    }

    private var predictionsCard: some View {
        cardTransition(
            PrimaryCard(title: "Predictions", icon: "chart.line.uptrend.xyaxis") {
                VStack(alignment: .leading, spacing: DS.Space.sm + 2) {
                    ForEach(viewModel.predictions, id: \.id) { prediction in
                        HStack(spacing: DS.Space.sm + 2) {
                            Image(systemName: prediction.icon)
                                .foregroundStyle(DS.Color.primary)
                                .font(.title3)
                            VStack(alignment: .leading, spacing: DS.Space.xs) {
                                Text(prediction.title)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                Text(prediction.description)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        if prediction.id != viewModel.predictions.last?.id {
                            Divider()
                        }
                    }
                }
            },
            delay: 0.3
        )
    }

    private var careGapsCard: some View {
        cardTransition(
            PrimaryCard(title: "Care Gaps", icon: "list.clipboard.fill") {
                VStack(alignment: .leading, spacing: DS.Space.sm) {
                    ForEach(viewModel.careGaps, id: \.id) { gap in
                        HStack(spacing: DS.Space.sm + 2) {
                            Image(systemName: gap.dueSoon ? "exclamationmark.circle.fill" : "circle")
                                .foregroundStyle(gap.dueSoon ? DS.Color.warning : .secondary)
                                .font(.title3)
                            VStack(alignment: .leading, spacing: DS.Space.xs) {
                                Text(gap.title)
                                    .font(.subheadline)
                                Text(gap.description)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Text(gap.status)
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundStyle(gap.dueSoon ? DS.Color.warning : DS.Color.success)
                        }
                        if gap.id != viewModel.careGaps.last?.id {
                            Divider()
                        }
                    }
                }
            },
            delay: 0.4
        )
    }

    private var familyRiskCard: some View {
        cardTransition(
            PrimaryCard(title: "Family Risk", icon: "person.3.fill") {
                VStack(alignment: .leading, spacing: DS.Space.sm) {
                    ForEach(viewModel.familyRisks, id: \.id) { risk in
                        HStack(spacing: DS.Space.sm + 2) {
                            Image(systemName: "arrow.triangle.branch")
                                .font(.caption)
                                .foregroundStyle(DS.Color.primary)
                            VStack(alignment: .leading, spacing: DS.Space.xs) {
                                Text(risk.condition)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                Text("\(risk.relationship) · \(risk.riskLevel)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        if risk.id != viewModel.familyRisks.last?.id {
                            Divider()
                        }
                    }
                }
            },
            delay: 0.5
        )
    }

    private var diseaseProgressionCard: some View {
        cardTransition(
            PrimaryCard(title: "Disease Progression", icon: "heart.text.clipboard.fill") {
                diseaseProgressionCardContent
            },
            delay: 0.6
        )
    }

    private var diseaseProgressionCardContent: some View {
        VStack(alignment: .leading, spacing: DS.Space.md) {
            diseaseProgressionCardBody
        }
    }

    private var diseaseProgressionCardBody: some View {
        ForEach(viewModel.diseaseProgressions, id: \.id) { disease in
            VStack(alignment: .leading, spacing: DS.Space.sm - 2) {
                HStack {
                    Text(disease.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Spacer()
                    Text(disease.status)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundStyle(disease.statusColor)
                        .padding(.horizontal, DS.Space.sm)
                        .padding(.vertical, DS.Space.xs)
                        .background(disease.statusColor.opacity(0.15), in: Capsule())
                }
                if !disease.timelineEvents.isEmpty {
                    ForEach(disease.timelineEvents, id: \.self) { event in
                        HStack(spacing: DS.Space.sm) {
                            Circle()
                                .fill(Color(.systemGray3))
                                .frame(width: DS.Space.sm - 2, height: DS.Space.sm - 2)
                            Text(event)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            if disease.id != viewModel.diseaseProgressions.last?.id {
                Divider()
            }
        }
    }

    private var preventiveCareCard: some View {
        cardTransition(
            PrimaryCard(title: "Preventive Care", icon: "checkmark.shield.fill") {
                VStack(alignment: .leading, spacing: DS.Space.sm) {
                    ForEach(viewModel.preventiveCares, id: \.id) { care in
                        HStack(spacing: DS.Space.sm + 2) {
                            Image(systemName: care.completed ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(care.completed ? DS.Color.success : .secondary)
                            VStack(alignment: .leading, spacing: DS.Space.xs) {
                                Text(care.title)
                                    .font(.subheadline)
                                Text(care.frequency)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        if care.id != viewModel.preventiveCares.last?.id {
                            Divider()
                        }
                    }
                }
            },
            delay: 0.7
        )
    }

    private var aiTwinSummaryCard: some View {
        cardTransition(
            AIMessageCard(message: viewModel.aiSummary),
            delay: 0.8
        )
    }

    // MARK: - Helpers

    private func cardTransition<Content: View>(_ content: Content, delay: Double) -> some View {
        content
            .opacity(showCards ? 1 : 0)
            .offset(y: showCards ? 0 : DS.Space.xl)
            .animation(.spring.delay(delay), value: showCards)
    }
}

#Preview {
    DigitalTwinView()
}
