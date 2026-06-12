# AI Risk Prediction Engine Module

This module implements a comprehensive AI Risk Prediction Engine for the WyshCare healthcare platform.

## Overview

The AI Risk Prediction Engine provides risk assessments for multiple health conditions using rule-based algorithms that can be extended with machine learning models in the future.

## Features

- **Multiple Risk Types Supported**:
  - Cardiovascular Disease
  - Diabetes Progression
  - Hypertension Risk
  - Kidney Disease
  - Mental Health
  - Readmission Risk
  - Medication Adherence
  - Frailty
  - Mortality Risk

- **Data Integration**:
  - Lifestyle profiles (smoking, activity, diet, stress, sleep)
  - Vital signs (BP, heart rate, BMI, temperature, SpO2)
  - Wearable device metrics
  - Laboratory results
  - Medical conditions and diagnoses
  - Medication adherence data
  - Family history
  - Clinical orders and symptoms
  - Prescriptions

- **Output**:
  - Risk scores (0-1 scale)
  - Risk levels (Low, Moderate, High, Critical)
  - Risk drivers (factors contributing to risk)
  - Recommended actions
  - Model version tracking

- **Storage & Events**:
  - Stores predictions in RiskPrediction table with expiration (30 days)
  - Emits RiskCalculated events via EventEmitter
  - Creates audit logs (RISK_PREDICTION_CALCULATED)
  - Updates timeline when risk levels change significantly

- **API Endpoints**:
  - POST /ai-risk/assess - Assess all risk types for a user
  - GET /ai-risk/history/:userId - Get risk history for a user
  - GET /ai-risk/latest/:userId - Get latest risk predictions for a user

## Implementation Details

The module consists of:
1. **Service Layer** (`ai-risk-prediction.service.ts`) - Main orchestration service
2. **Assessors** (in `services/assessors/`) - Individual risk assessment modules
3. **Controller** (`ai-risk.controller.ts`) - REST API endpoints
4. **Interfaces** (`interfaces/ai-risk.interface.ts`) - TypeScript interfaces
5. **DTO** (`dto/assess-risk.dto.ts`) - Data transfer objects
6. **Module** (`ai-risk.module.ts`) - NestJS module definition

Each assessor implements a common `RiskAssessor` interface and evaluates risk based on evidence-based factors specific to that condition.

## Design Principles

- **Extensible**: New risk types can be added by implementing the RiskAssessor interface
- **Configurable**: Risk factors and weights can be adjusted without changing core logic
- **Production Ready**: Includes proper error handling, validation, and logging
- **HIPAA Conscious**: Designed with healthcare data privacy in mind
- **Audit Compliant**: Full audit trail for all risk predictions

## Usage

The module is automatically registered in the application via app.module.ts and requires no additional setup beyond standard NestJS module loading.

API endpoints are protected by JWT authentication and role-based access control.