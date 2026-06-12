# AI Lifestyle Engine Module

## Overview

The AI Lifestyle Engine is a comprehensive module that analyzes users' lifestyle factors based on wearable data, health goals, medical conditions, and personal preferences to generate personalized lifestyle recommendations and scores.

## Features

1. **Lifestyle Assessment**: Evaluates five key lifestyle categories:
   - Activity (steps, exercise, heart rate)
   - Nutrition (diet quality, hydration)
   - Sleep (duration, quality, consistency)
   - Stress (HRV, heart rate, self-reported)
   - Substance Use (smoking, alcohol consumption)

2. **Personalized Recommendations**: Generates actionable, evidence-based recommendations with:
   - Specific, measurable goals
   - Difficulty levels (easy, moderate, hard)
   - Estimated impact on health score
   - Timeframe to see results
   - Required resources/tools

3. **Lifestyle Scoring**: Provides scores (0-100) for each category and an overall lifestyle score

4. **Data Integration**: Connects with existing models:
   - WearableMetric (steps, heart rate, sleep, etc.)
   - HealthGoal
   - Condition
   - Medication
   - VitalRecord
   - LifestyleProfile

5. **Event Emission**: Emits domain events for integration with other systems:
   - LifestyleScoreUpdated
   - LifestyleRecommendationGenerated

6. **Audit Logging**: Creates audit logs for compliance and tracking:
   - LIFESTYLE_ASSESSMENT_COMPLETED
   - LIFESTYLE_RECOMMENDATION_GENERATED

7. **Timeline Integration**: Updates timeline when significant lifestyle changes occur

## Installation

The module is automatically imported when the application starts. No additional installation steps are required.

## Usage

### API Endpoints

All endpoints require JWT authentication and are prefixed with `/ai-lifestyle`.

#### Assess Lifestyle
```
POST /assess/:userId
```
Assess current lifestyle and generate scores for a user.

**Parameters:**
- `userId` (path): The user ID to assess

**Response:**
```json
{
  "userId": "string",
  "activityScore": number (0-100),
  "nutritionScore": number (0-100),
  "sleepScore": number (0-100),
  "stressScore": number (0-100),
  "substanceUseScore": number (0-100),
  "overallLifestyleScore": number (0-100)
}
```

#### Generate Recommendations
```
POST /recommendations/:userId
```
Generate personalized lifestyle recommendations for a user.

**Parameters:**
- `userId` (path): The user ID to generate recommendations for

**Request Body:**
```json
{
  "focusAreas": ["activity" | "nutrition" | "sleep" | "stress" | "substance_use"], // Optional
  "timeframe": "short" | "medium" | "long", // Optional (default: medium)
  "difficultyPreference": "easy" | "moderate" | "hard" // Optional (default: moderate)
}
```

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "category": "activity" | "nutrition" | "sleep" | "stress" | "substance_use",
    "title": "string",
    "description": "string",
    "specificGoal": "string",
    "difficultyLevel": "easy" | "moderate" | "hard",
    "estimatedImpact": number (0-100),
    "timeframeToSeeResults": "string",
    "requiredResources": ["string"],
    "priority": "low" | "medium" | "high",
    "createdAt": "date"
  }
]
```

#### Get Lifestyle Profile
```
GET /profile/:userId
```
Get the lifestyle profile for a user.

**Parameters:**
- `userId` (path): The user ID

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "sleepHoursAvg": number,
  "sleepQuality": "string",
  "activityLevel": "string",
  "exerciseDaysPerWeek": number,
  "dietType": "string",
  "waterIntakeL": number,
  "stressLevel": "string",
  "screenTimeHrs": number,
  "smokingStatus": "string",
  "alcoholConsumption": "string",
  "occupation": "string",
  "metadata": {},
  "createdAt": "date",
  "updatedAt": "date"
}
```

#### Get History
```
GET /history/:userId
```
Get lifestyle assessment history for a user.

**Parameters:**
- `userId` (path): The user ID
- `limit` (query): Maximum number of records to return (optional, default: 50)

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "overallScore": number,
    "activityScore": number,
    "nutritionScore": number,
    "sleepScore": number,
    "stressScore": number,
    "substanceUseScore": number,
    "assessmentDate": "date",
    "factors": {}
  }
]
```

#### Get Current Score
```
GET /score/:userId
```
Get the current lifestyle score breakdown for a user.

**Parameters:**
- `userId` (path): The user ID

**Response:**
```json
{
  "userId": "string",
  "activityScore": number (0-100),
  "nutritionScore": number (0-100),
  "sleepScore": number (0-100),
  "stressScore": number (0-100),
  "substanceUseScore": number (0-100),
  "overallLifestyleScore": number (0-100)
}
```

## Data Models

The module leverages existing Prisma models:

### WearableMetric
Tracks biometric data from wearable devices:
- `metricType`: STEPS, HEART_RATE, SLEEP_DURATION, etc.
- `value`: The measured value
- `unit`: Unit of measurement
- `recordedAt`: Timestamp of measurement

### HealthGoal
User-defined health goals:
- `category`: MEDICAL, FITNESS, NUTRITION, LIFESTYLE, MENTAL_HEALTH
- `targetValue`: Target value to achieve
- `currentValue`: Current progress
- `status`: ACTIVE, COMPLETED, CANCELLED, ARCHIVED

### Condition
Medical conditions:
- `icdCode`: ICD-10 code
- `displayName`: Condition name
- `status`: ACTIVE, etc.
- `severity`: Condition severity

### LifestyleProfile
Lifestyle factors:
- `sleepHoursAvg`: Average sleep hours per night
- `sleepQuality`: Self-reported sleep quality
- `activityLevel`: Self-reported activity level
- `exerciseDaysPerWeek`: Exercise frequency
- `dietType`: Diet type (vegetarian, mediterranean, etc.)
- `waterIntakeL`: Daily water intake in liters
- `stressLevel`: Self-reported stress level
- `smokingStatus`: Smoking status
- `alcoholConsumption`: Alcohol consumption level
- `occupation`: Occupation

## Algorithm Details

### Activity Assessment
- **Steps Score**: Based on daily average steps (0-10,000+ steps)
- **Exercise Score**: Based on exercise frequency per week (0-5+ days)
- **Heart Rate Score**: Based on resting heart rate and variability
- **Overall Activity Score**: Weighted average (40% steps, 40% exercise, 20% HR)

### Nutrition Assessment
- **Diet Score**: Based on diet type (plant-based/mediterranean = high score)
- **Hydration Score**: Based on daily water intake (0-3+ liters)
- **Goal Alignment Score**: Based on progress toward nutrition goals
- **Overall Nutrition Score**: Weighted average (50% diet, 30% hydration, 20% goals)

### Sleep Assessment
- **Duration Score**: Based on hours slept per night (7-9 hours optimal)
- **Quality Score**: Based on wearable data and self-reported quality
- **Consistency Score**: Based on night-to-night variability
- **Overall Sleep Score**: Weighted average (40% duration, 40% quality, 20% consistency)

### Stress Assessment
- **HRV Score**: Based on heart rate variability (higher HRV = lower stress)
- **Heart Rate Score**: Based on resting heart rate (lower HR = lower stress)
- **Reported Score**: Based on self-reported stress level
- **Condition Score**: Based on number and severity of active conditions
- **Overall Stress Score**: Weighted average (30% HRV, 20% HR, 30% reported, 20% condition)

### Substance Use Assessment
- **Smoking Score**: Based on smoking status (never = 1.0, heavy = 0.0)
- **Alcohol Score**: Based on alcohol consumption level (never = 1.0, very heavy = 0.0)
- **Overall Substance Use Score**: Weighted average (50% smoking, 50% alcohol)

### Overall Lifestyle Score
Weighted average of category scores:
- Activity: 25%
- Nutrition: 25%
- Sleep: 20%
- Stress: 15%
- Substance Use: 15%

## Events

The module emits the following events through NestJS EventEmitter2:

### lifestyle.score.updated
Emitted when a lifestyle assessment is completed:
```javascript
{
  userId: string,
  overallScore: number,
  activityScore: number,
  nutritionScore: number,
  sleepScore: number,
  stressScore: number,
  substanceUseScore: number,
  assessmentId: string
}
```

### lifestyle.recommendation.generated
Emitted when lifestyle recommendations are generated:
```javascript
{
  userId: string,
  recommendationId: string,
  category: string,
  title: string
}
```

## Audit Logs

The module creates audit logs for compliance:

### LIFESTYLE_ASSESSMENT_COMPLETED
Created when a lifestyle assessment is completed:
```javascript
{
  action: 'LIFESTYLE_ASSESSMENT_COMPLETED',
  resourceType: 'LifestyleAssessment',
  resourceId: assessmentRecordId,
  userId: string,
  metadata: {
    overallScore: number,
    activityScore: number,
    nutritionScore: number,
    sleepScore: number,
    stressScore: number,
    substanceUseScore: number,
    timestamp: string
  }
}
```

### LIFESTYLE_RECOMMENDATION_GENERATED
Created when lifestyle recommendations are generated:
```javascript
{
  action: 'LIFESTYLE_RECOMMENDATION_GENERATED',
  resourceType: 'LifestyleRecommendation',
  resourceId: userId,
  userId: string,
  metadata: {
    recommendationsCount: number,
    focusAreas: string[],
    timeframe: string,
    difficultyPreference: string,
    timestamp: string
  }
}
```

## Error Handling

The module follows standard NestJS error handling patterns:
- Returns 404 if user is not found
- Returns 403 if user attempts to access another user's data without permission
- Returns 500 for internal server errors with appropriate logging

## Performance Considerations

- All data fetching is done in parallel using Promise.all()
- Assessment algorithms are optimized for O(n) complexity where n is the number of data points
- Recommendations are generated based on the most recent 30 days of wearable data
- Database queries are limited to necessary fields and use appropriate indexing

## Security

- All endpoints require JWT authentication
- Users can only access their own data unless they have ADMIN role
- Data validation is performed at the DTO level
- No sensitive data is exposed in API responses

## Testing

Unit tests should cover:
- Assessment algorithms for each lifestyle category
- Recommendation generation logic
- Score calculation methods
- Event emission
- Audit log creation
- Controller endpoint behavior