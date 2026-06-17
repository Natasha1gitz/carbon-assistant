# 🌍 Carbon Footprint Assistant

A highly efficient, serverless web application that helps individuals
**Understand**, **Track**, and **Reduce** their personal carbon footprint
through dynamic data inputs and an interactive Google Gemini AI assistant.

[![CI](https://github.com/your-username/carbon-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/carbon-assistant/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🏆 Hackathon Submission Details

### 1. Your Chosen Vertical

**Sustainability & Climate Action**
The Carbon Footprint Assistant addresses the critical need for individual climate awareness by calculating, tracking, and providing actionable insights to reduce personal carbon emissions.

### 2. Approach and Logic

Our approach is to bridge the gap between complex emission factors and everyday human behavior.

- **Deterministic Math Engine**: We calculate base emissions strictly using verified science-backed factors (DEFRA, EPA, IEA).
- **Generative AI Layer**: We feed these precise calculations into Google Gemini 1.5 Flash via structured prompts. Gemini acts as an intelligent coach, contextualizing the math and returning highly tailored, realistic behavioral changes.
- **Resilience**: The logic operates on a "graceful degradation" model. If the AI is unavailable, the application falls back to a deterministic rules-based engine.

### 3. How the Solution Works

1. **Understand (Input)**: Users fill out a dynamic form detailing their weekly travel, home energy use, diet, and consumption habits.
2. **Track (Calculate & Store)**: The app computes the exact `kg CO₂e` breakdown. Using Firebase Anonymous Auth, it securely stores historical entries bound to the device session (zero PII collected).
3. **Reduce (AI Insights)**: A Server Action sends the user's carbon profile to Google Gemini. The AI returns a JSON array of customized recommendations. The React frontend visualizes these alongside an interactive dashboard.

### 4. Any Assumptions Made

- We assume standard global average emission factors where specific local grids or variables aren't provided (e.g., using IEA world average for electricity instead of localized zip-code grids).
- We assume an anonymous, session-based user tracking model is preferred over requiring hard logins to reduce friction and protect user privacy.
- We assume users want actionable _lifestyle_ changes, so the AI is explicitly instructed not to recommend massive infrastructure overhauls (like buying a new Tesla) if they have a small footprint.

---

## ✨ Features

| Pillar         | Feature                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Understand** | Multi-dimensional carbon calculator covering transport, home energy, diet, and consumption |
| **Track**      | Frictionless history with Firebase Anonymous Authentication (zero PII)                     |
| **Reduce**     | AI-powered personalized reduction advice via Google Gemini with deterministic fallback     |

### Technical Highlights

- **Pure calculation engine** — deterministic, side-effect-free, 100% unit-tested
- **Zero-bloat architecture** — enforced strictly by `knip` static analysis
- **Conventional Commits** — strict git hygiene enforced by `commitlint` and Husky
- **Enterprise-grade mock data** — utilizing `@faker-js/faker` for randomized, deterministic testing
- **WCAG 2.1 AA & Performance** — automated by `vitest-axe`, `@axe-core/react`, and Lighthouse CI (`@lhci/cli`)
- **Security hardened** — `eslint-plugin-security`, CSP, Server Actions, and Zod boundaries
- **Graceful degradation** — works offline; Gemini → rule-based fallback, Firestore → mock store

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/carbon-assistant.git
cd carbon-assistant

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your Firebase and Gemini API keys
# Or set USE_GEMINI=false and USE_FIRESTORE=false for offline mode

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quality Gates

| Check            | Command                 | Requirement     |
| ---------------- | ----------------------- | --------------- |
| TypeScript       | `npm run typecheck`     | Zero errors     |
| ESLint + a11y    | `npm run lint`          | Zero warnings   |
| Code Formatting  | `npm run format:check`  | Fully formatted |
| Unused Exports   | `npm run knip`          | Zero unused     |
| Unit tests       | `npm run test`          | All passing     |
| Coverage         | `npm run test:coverage` | ≥90% statements |
| Lighthouse CI    | `npm run lhci`          | ≥95% score      |
| Production build | `npm run build`         | Successful      |

All checks run automatically in CI via GitHub Actions on every push and PR.

---

## 🏗️ Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system overview.

```
src/
├── app/actions/       # Server Actions (Firebase, Gemini)
├── components/        # React components (Form, Dashboard, AI, History)
├── hooks/             # Custom hooks (anonymous auth)
└── lib/               # Pure business logic (calculator, factors, rules, validators)
```

### Key Design Decisions

1. **Pure math engine** — `calculator.ts` has zero I/O; same input → same output
2. **Server Actions for secrets** — API keys never reach the client
3. **Graceful degradation** — every external dependency has a fallback
4. **Sourced factors** — every emission constant cites DEFRA, EPA, or IPCC

---

## 🛡️ Security

- **Content-Security-Policy** restricts script/style/connect sources
- **X-Frame-Options: DENY** prevents clickjacking
- **X-Content-Type-Options: nosniff** prevents MIME sniffing
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** disables camera, microphone, geolocation
- **Server Actions** keep all API keys and credentials server-side

---

## ♿ Accessibility

- Skip-to-content link
- Semantic `<fieldset>` and `<legend>` for form groups
- `aria-live="polite"` for dynamic content updates
- `aria-describedby` for error messages
- Screen-reader-only data tables behind SVG charts
- Automated `vitest-axe` WCAG 2.1 AA tests in CI

---

## 📊 Emission Factor Sources

All factors in `src/lib/factors.ts` are documented with their provenance:

| Factor                 | Source                                       |
| ---------------------- | -------------------------------------------- |
| Car per-km factors     | UK DEFRA / DESNZ 2023 Conversion Factors     |
| Public transit per-km  | DEFRA 2023 (bus/rail averages)               |
| Flight per-km          | DEFRA 2023 (incl. radiative forcing uplift)  |
| Electricity per-kWh    | IEA / Our World in Data ~2022 world average  |
| Natural gas per-kWh    | DEFRA 2023                                   |
| Diet annual footprints | Scarborough et al. 2014 / Our World in Data  |
| Goods per-USD          | EXIOBASE consumer-spend emission intensity   |
| Waste per-kg           | EPA WARM model                               |
| Global average         | Our World in Data, 2022 per-capita emissions |
| Sustainable target     | Paris-aligned 2030 per-capita target         |

---

## 📝 License

[MIT](LICENSE)
