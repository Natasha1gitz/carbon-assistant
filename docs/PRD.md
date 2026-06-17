# Product Requirements Document (PRD)

## 1. Problem Statement

Climate change is the defining challenge of our generation, yet most people have
no practical way to understand their personal contribution to carbon emissions.
The **Carbon Footprint Awareness Platform** bridges this gap by enabling users to:

1. **Understand** — Calculate their annual carbon footprint from lifestyle inputs
2. **Track** — Persist and compare footprint history over time
3. **Reduce** — Receive AI-powered, personalized reduction recommendations

## 2. Target Users

- Environmentally conscious individuals seeking actionable insights
- Students and educators teaching sustainability concepts
- Organizations running carbon awareness campaigns

## 3. Core Features

### 3.1 Carbon Footprint Calculator

- **Multi-step input wizard** covering 4 lifestyle categories:
  - 🚗 Transport (car km, fuel type, public transit, flights)
  - 🏠 Home Energy (electricity, gas, household size)
  - 🥗 Diet (6 diet types from heavy meat to vegan)
  - 🛍️ Consumption (goods spending, waste)
- **Pure calculation engine** — deterministic, no I/O, fully testable
- **Source-cited emission factors** from DEFRA 2023, EPA, IPCC AR6

### 3.2 Results Dashboard

- Total annual footprint in kg CO₂e and tonnes
- Per-category breakdown with animated bar chart
- Comparison against global average (4,800 kg) and Paris 1.5°C target (2,000 kg)
- Color-coded status badge (below target / above target)

### 3.3 AI-Powered Insights (Gemini)

- **Primary**: Google Gemini 1.5 Flash generates personalized recommendations
- **Fallback**: Deterministic rule-based engine (always available, fully offline)
- Each recommendation includes category, action, and estimated annual savings
- Multi-turn chat interface for follow-up questions

### 3.4 Footprint History

- Anonymous tracking via Firebase Anonymous Auth
- Firestore subcollection per user (`users/{uid}/footprints/{id}`)
- History table with trend comparison

## 4. Technical Architecture

| Layer      | Technology                            | Rationale                                      |
| ---------- | ------------------------------------- | ---------------------------------------------- |
| Framework  | Next.js 15 (App Router)               | SSR, Server Actions, built-in optimization     |
| Language   | TypeScript (strict mode)              | Type safety, maintainability                   |
| Validation | Zod                                   | Runtime type safety with bounded ranges        |
| AI         | Google Gemini 1.5 Flash               | Fast, cost-effective, structured JSON output   |
| Database   | Cloud Firestore                       | Serverless, real-time, per-user subcollections |
| Auth       | Firebase Anonymous Auth               | No PII, instant onboarding                     |
| Styling    | Tailwind CSS + Custom CSS             | Utility-first with glassmorphism design system |
| Testing    | Vitest + Testing Library + vitest-axe | Fast, React-native, accessibility audits       |
| CI/CD      | GitHub Actions                        | Lint → typecheck → format → test → build       |

## 5. Non-Functional Requirements

| Requirement          | Target                                         |
| -------------------- | ---------------------------------------------- |
| Test coverage        | ≥ 90% (enforced in CI)                         |
| Accessibility        | WCAG 2.1 Level AA (axe audits per component)   |
| Build time           | < 30 seconds                                   |
| First Load JS        | < 350 kB                                       |
| Security headers     | CSP, X-Frame-Options, HSTS                     |
| Graceful degradation | App works without Gemini AND without Firestore |

## 6. Google Cloud Integration

- **Vertex AI / Gemini** — Personalized carbon reduction insights
- **Cloud Firestore** — Footprint history persistence
- **Firebase Auth** — Anonymous user identity
- **Cloud Run** — Production deployment target (Dockerfile included)

## 7. Success Metrics

- Users can calculate their footprint in < 2 minutes
- AI recommendations are specific, quantified, and actionable
- Application loads in < 3 seconds on 3G networks
- Zero accessibility violations (axe-core)
- 90%+ test coverage maintained across all changes
