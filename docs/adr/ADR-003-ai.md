# ADR-003: Multi-Provider AI Architecture with AiOrchestrator

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** Vimarshak Prudhvi  
**Tags:** ai, llm, architecture, orchestration

---

## Context

WyshCare needs AI capabilities across multiple domains:
- Clinical NLP (report summarization, symptom analysis, medication review)
- Digital Twin health scoring and risk prediction
- Care plan generation and adherence monitoring
- Consultation transcription and SOAP note generation
- OCR for prescription and document processing
- Search indexing and recommendation engine

## Decision Drivers

- **Provider diversity:** Different tasks need different models (Gemini for vision, OpenAI for general NLP, NVIDIA NIM for healthcare-specific models)
- **Cost optimization:** Route simple tasks to cheaper models, complex tasks to premium models
- **Resilience:** No single point of failure — fallback between providers
- **Compliance:** Some healthcare data must stay within India (Ollama/local models)
- **Extensibility:** Must support new providers without rewriting orchestration logic

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **Multi-provider with AiOrchestrator** | Flexibility; cost optimization; resilience; local model support | Higher initial complexity; provider API surface fragmentation |
| **Single LLM (e.g., only OpenAI)** | Simplest implementation; consistent API | Vendor lock-in; no local deployment; expensive for high-volume tasks |
| **LangChain** | Broad integration ecosystem; popular | Heavy abstraction; overkill for most tasks; debugging complexity; version churn |
| **Self-hosted single model** | Full data control; no API costs | Requires GPU infrastructure; limited model capabilities; ongoing maintenance |

## Decision

**Use AiOrchestratorService** with a `ProviderFactory` pattern, routing to 5 providers based on task type, cost, and compliance requirements.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     AiOrchestratorService                          │
│  (Central AI router — task routing, fallback, retry, audit)       │
└────┬──────┬──────┬──────┬──────┬──────┬──────────────────────────┘
     │      │      │      │      │      │
     ▼      ▼      ▼      ▼      ▼      ▼
┌────────┐┌──────┐┌────────┐┌──────────┐┌───────┐┌──────────────┐
│ Gemini ││OpenAI││OpenRoute││NVIDIA NIM││Ollama ││ Future Provider│
│(Google)││      ││r       ││(FHIR/etc)││(Local)││ (extensible)  │
└────────┘└──────┘└────────┘└──────────┘└───────┘└──────────────┘
```

### ProviderFactory Pattern

```typescript
interface AIProvider {
  name: string;
  capabilities: AICapability[];
  generate(prompt: AIPrompt): Promise<AIResponse>;
  generateStream(prompt: AIPrompt): AsyncIterable<AIResponse>;
}

class ProviderFactory {
  getProvider(taskType: AIJobType, constraints?: AIConstraints): AIProvider;
  // Routes based on: model requirements, cost budget, latency needs,
  // data residency rules, fallback order
}
```

### Provider Assignments

| Provider | Primary Use Cases | Selection Rationale |
|----------|-------------------|---------------------|
| **Gemini** | Vision/OCR, document analysis, multimodal | Best-in-class vision; Google Cloud integration |
| **OpenAI** | General NLP, summarization, care plan generation | Strong general-purpose model; broad capability |
| **OpenRouter** | Fallback, model experimentation | Access to 200+ models; cost comparison |
| **NVIDIA NIM** | Healthcare-specific inference, FHIR processing | Domain-tuned models; HIPAA-compliant infra |
| **Ollama** | Local inference, India data residency | Fully offline; no data leaves network; phi-3/Mistral |

### AIJob Queue Model

All AI tasks are queued via the `AIJob` model:

```prisma
model AIJob {
  id            String      @id
  userId        String?
  jobType       AIJobType   // OCR, REPORT_SUMMARY, SYMPTOM_ANALYSIS, etc.
  status        AIJobStatus // QUEUED → PROCESSING → COMPLETED / FAILED
  inputPayload  Json
  outputPayload Json?
  languageCode  String?
  safetyFlags   String[]
  maxRetries    Int         @default(3)
  priority      Int         @default(0)
  queue         String?     // for queue-level routing
}
```

### Fallback & Resilience

- Primary → secondary → tertiary provider chain per task type
- Automatic retry with exponential backoff (configurable via `maxRetries`)
- Dead-letter queue for jobs that exhaust all retries (status: `ESCALATED`)
- Circuit breaker pattern: if a provider returns >5% error rate in 5-min window, route to fallback

### Safety & Compliance

- Content filtering via `safetyFlags` array on each AIJob
- All AI outputs logged with model version and confidence scores
- PHI/PII filtering layer between provider and prompt (prevents data leakage to external APIs)
- Ollama used exclusively for tasks requiring India-only data residency
- `AIRecommendation` model stores all AI-generated clinical suggestions with confidence, reasoning, and source model

### Digital Twin AI Integration

The Digital Twin (health scoring, risk prediction, care gap detection) uses:
- **Health Score Engine:** Aggregates `HealthScore` across physical, mental, lifestyle, adherence, sleep, nutrition dimensions
- **Risk Prediction Engine:** `RiskPrediction` with 12 prediction types using ensemble of provider models
- **Care Gap Engine:** `CareGap` detected via guideline comparison using Gemini (clinical knowledge) + local models (patient data)

## Consequences

**Positive:**
- Zero downtime during provider outages — automatic failover
- Cost optimization: $0.50/1K tasks on Ollama vs $3-8/1K on external APIs
- Data residency compliance: sensitive data never leaves local network
- New providers can be added via `ProviderFactory` without modifying orchestration
- Digital Twin benefits from ensemble approach (different models for different dimensions)

**Negative:**
- Orchestration layer adds ~5-10ms latency per request
- Multiple API integrations increase maintenance surface
- Prompt engineering must account for provider-specific behaviors
- Cost tracking more complex across 5 providers

**Mitigations:**
- Streaming support for latency-sensitive tasks (chat, transcription)
- Shared prompt template library normalizes provider differences
- Metering/audit layer in AiOrchestrator tracks per-provider costs
