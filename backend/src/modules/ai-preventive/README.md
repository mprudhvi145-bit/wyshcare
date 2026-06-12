# AI Preventive Care Engine Module

This module provides evidence-based preventive care recommendations based on USPSTF, CDC, and other clinical guidelines.

## Features

- Generates personalized preventive care recommendations based on user health data
- Integrates with existing health models (Conditions, Medications, Vital Records, etc.)
- Implements evidence-based rules from USPSTF, CDC, ACC/AHA, ADA, and other guidelines
- Stores recommendations in the existing PreventiveRecommendation model
- Emits events for audit logging and timeline updates
- Provides REST API endpoints for managing recommendations
- Implements role-based access control

## API Endpoints

- `POST /ai-preventive/generate/:userId` - Generate preventive recommendations for a user
- `GET /ai-preventive/:userId` - Get preventive recommendations for a user (with optional status/category filters)
- `PATCH /ai-preventive/:id/complete` - Mark a preventive recommendation as complete
- `PATCH /ai-preventive/:id/dismiss` - Dismiss a preventive recommendation
- `GET /ai-preventive/stats/:userId` - Get preventive care statistics for a user

## Data Flow

1. Controller receives request and validates permissions
2. Service aggregates user health data from multiple sources
3. Service applies evidence-based rules to generate recommendations
4. Service deduplicates against existing active recommendations
5. Service persists new recommendations to database
6. Service emits event for audit logging and timeline updates
7. Controller returns generated recommendations

## Recommendation Categories

- MEDICATION
- LIFESTYLE
- SCREENING
- FOLLOW_UP
- SPECIALIST
- VACCINATION
- LAB
- EDUCATION

## Evidence Sources

- USPSTF (U.S. Preventive Services Task Force)
- CDC/ACIP (Centers for Disease Control and Prevention/Advisory Committee on Immunization Practices)
- ACC/AHA (American College of Cardiology/American Heart Association)
- ADA (American Diabetes Association)
- WHO (World Health Organization)
- APA (American Psychological Association)
- AASM (American Academy of Sleep Medicine)
- NCCN (National Comprehensive Cancer Network)
- KDIGO (Kidney Disease: Improving Global Outcomes)
- CMS (Centers for Medicare & Medicaid Services)

## Dependencies

- PrismaModule for database access
- EventEmitterModule for event emission
- AiModule for event emission utility