# Architecture

This document describes the high-level architecture of the Carbon Footprint
Assistant. It is intended for contributors and evaluators who want to understand
how the system is structured.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                       │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  CarbonForm  │  │  Dashboard   │  │   AiAssistant      │    │
│  │  (4-step     │  │  (SVG charts │  │   (Insight cards    │    │
│  │   wizard)    │  │   + compare) │  │    + chat UI)       │    │
│  └──────┬───────┘  └──────▲───────┘  └──────▲─────────────┘    │
│         │                 │                  │                   │
│         ▼                 │                  │                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     page.tsx (Client)                     │   │
│  │  Orchestrates: calculate → save → generateInsights       │   │
│  └──────┬───────────────────┬───────────────┬──────────────┘   │
│         │                   │               │                   │
│  ┌──────▼───────┐  ┌───────▼───────┐  ┌───▼────────────┐      │
│  │ calculator.ts│  │ firebase.ts   │  │ gemini.ts       │      │
│  │ (Pure math)  │  │ (Server Action)│  │ (Server Action) │      │
│  │ factors.ts   │  │ Firestore ADC │  │ Gemini API +    │      │
│  │ rules.ts     │  │               │  │ rules fallback  │      │
│  └──────────────┘  └───────────────┘  └─────────────────┘      │
│                                                                 │
│  lib/validators.ts — Zod schemas for all data contracts         │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/
│   ├── actions/
│   │   ├── firebase.ts    # Server Actions for Firestore persistence
│   │   └── gemini.ts      # Server Actions for Gemini AI + fallback
│   ├── globals.css        # Tailwind CSS entry point
│   ├── layout.tsx         # Root layout with security headers
│   └── page.tsx           # Main page orchestrator (client component)
├── components/
│   ├── AiAssistant.tsx    # AI insight cards + chat interface
│   ├── CarbonForm.tsx     # Multi-step assessment form
│   ├── Dashboard.tsx      # SVG charts + comparison bars
│   └── HistoryPanel.tsx   # Past calculation history table
├── hooks/
│   └── useAnonymousAuth.ts # Firebase anonymous auth hook
└── lib/
    ├── calculator.ts      # Pure, deterministic calculation engine
    ├── factors.ts         # Sourced emission factors (DEFRA, EPA, IPCC)
    ├── rules.ts           # Ranked rule-based insight fallback
    └── validators.ts      # Zod schemas for all data contracts
```

## Key Design Decisions

### 1. Pure Calculation Engine

The calculator is a set of pure functions with no I/O. Given the same input, it
always produces the same output. This makes it trivially unit-testable and
enables the UI to compute results instantly without network calls.

### 2. Server Actions for Secrets

Gemini API keys and Firebase Admin credentials never reach the client. All
sensitive operations use Next.js Server Actions, which execute server-side.

### 3. Graceful Degradation

Every external dependency has a fallback:

- **Gemini unavailable** → deterministic rule-based insight engine
- **Firestore unavailable** → mock save (app still works)
- **No API key configured** → offline mode with clear messaging

### 4. Sourced Emission Factors

Every constant in `factors.ts` is documented with its scientific source (DEFRA
2023, EPA, IPCC AR6, Our World in Data). This makes the platform auditable and
trustworthy.

### 5. Accessibility First

All components are built with semantic HTML, ARIA attributes, and screen-reader
support. Automated `vitest-axe` tests enforce WCAG 2.1 AA compliance.
