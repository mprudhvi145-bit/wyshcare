import SwiftUI
import WidgetKit

struct AIInsightEntry: TimelineEntry {
    let date: Date
    let insight: String
    let category: String
    let iconName: String
}

struct AIInsightProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> AIInsightEntry {
        AIInsightEntry(
            date: Date(),
            insight: "Your resting heart rate has decreased by 5 bpm this week. Keep up the great work!",
            category: "Heart Health",
            iconName: "heart.fill"
        )
    }

    func snapshot(for configuration: AIInsightWidgetIntent, in context: Context) async -> AIInsightEntry {
        placeholder(in: context)
    }

    func timeline(for configuration: AIInsightWidgetIntent, in context: Context) async -> Timeline<AIInsightEntry> {
        let entry = AIInsightEntry(
            date: Date(),
            insight: "Your resting heart rate has decreased by 5 bpm this week. Keep up the great work!",
            category: "Heart Health",
            iconName: "heart.fill"
        )
        return Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3_600)))
    }
}

struct AIInsightWidgetEntryView: View {
    var entry: AIInsightEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: entry.iconName)
                    .font(.caption)
                    .foregroundColor(.purple)
                Text(entry.category)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.purple)
                Spacer()
                Image(systemName: "sparkle")
                    .font(.caption)
                    .foregroundColor(.yellow)
            }

            Text(entry.insight)
                .font(.subheadline)
                .lineLimit(4)

            Spacer()

            Text("AI Health Insight")
                .font(.system(size: 8))
                .foregroundColor(.secondary)
        }
        .padding()
        .containerBackground(.background, for: .widget)
    }
}

struct AIInsightWidget: Widget {
    let kind: String = "AIInsightWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: AIInsightWidgetIntent.self,
            provider: AIInsightProvider()
        ) { entry in
            AIInsightWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("AI Insight")
        .description("Daily AI-powered health insight.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
