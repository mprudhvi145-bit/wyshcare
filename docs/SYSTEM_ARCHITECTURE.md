# System Architecture

Generated: 2026-06-12

## Backend

- NestJS (Node.js) backend in `backend/`
- 60+ modules registered in app.module.ts
- Prisma ORM with PostgreSQL
- GraphQL (Apollo) + REST endpoints

## Frontend

- Next.js app in `frontend/`
- 195 TSX components

## Mobile

- Flutter apps in `apps/`
- Doctor mobile app (new)

## AI Architecture

- AiOrchestratorService as central AI router
  - 5 providers: Gemini, OpenAI, OpenRouter, NVIDIA NIM, Ollama
  - ProviderFactory pattern for multi-LLM support
- AI modules: ai, ai-risk, ai-lifestyle, ai-preventive
- Digital Twin with 7 engine services

## Infrastructure

- Docker/Docker Compose
- Redis, RabbitMQ, PostgreSQL
- Supabase (auth + storage)
- LiveKit (video telemedicine)
- Razorpay (payments)
