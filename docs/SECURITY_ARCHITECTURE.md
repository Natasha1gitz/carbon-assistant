# Security Architecture

## Overview

The Carbon Footprint Assistant employs a defense-in-depth security strategy across
all layers of the application. This document describes the security architecture,
threat model, and mitigations implemented.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js Client (React)                                  │   │
│  │  • No API keys or secrets                                │   │
│  │  • Firebase Anonymous Auth (UID only)                    │   │
│  │  • Zod input validation (client-side pre-check)          │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │ Server Actions (HTTPS)                │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│  Next.js Server         │                                       │
│  ┌──────────────────────▼───────────────────────────────────┐   │
│  │  Server Actions ("use server")                           │   │
│  │  • Zod input validation (server-side enforcement)        │   │
│  │  • GEMINI_API_KEY — env var, never exposed to client     │   │
│  │  • Firebase Admin SDK — ADC auth, no credential files    │   │
│  │  • Graceful degradation on all external failures         │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼───────────────────────────────────┐   │
│  │  Pure Calculation Engine (calculator.ts)                  │   │
│  │  • Zero I/O — deterministic and injection-proof          │   │
│  │  • All emission factors are compile-time constants       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                          │
                ┌─────────┴──────────┐
                │                    │
        ┌───────▼──────┐    ┌───────▼──────┐
        │  Firestore   │    │  Gemini AI   │
        │  (per-user   │    │  (Vertex AI  │
        │  subcollect) │    │   or API)    │
        └──────────────┘    └──────────────┘
```

## Threat Model

| Threat                            | Mitigation                                                      |
| --------------------------------- | --------------------------------------------------------------- |
| **XSS**                           | Content-Security-Policy restricts script/style/connect sources  |
| **Clickjacking**                  | X-Frame-Options: DENY                                           |
| **MIME sniffing**                 | X-Content-Type-Options: nosniff                                 |
| **Referrer leakage**              | Referrer-Policy: strict-origin-when-cross-origin                |
| **API key exposure**              | Server Actions ensure GEMINI_API_KEY never reaches client       |
| **Input injection**               | Zod schemas with bounded numeric ranges and enum validation     |
| **Unauthorized Firestore access** | Security rules enforce owner-only read/create, no update/delete |
| **Unbounded input**               | All numeric fields have min/max constraints (e.g., 0–20,000 km) |
| **Data privacy**                  | Firebase Anonymous Auth — no email, name, or PII stored         |
| **Credential files in repo**      | ADC-based auth — no credential JSON in codebase                 |

## Data Flow Security

1. **User input** → Zod validation (client) → Server Action → Zod validation (server)
2. **Calculation** → Pure function, no I/O, deterministic
3. **AI insights** → Server-side Gemini call with API key from env → JSON parse with fallback
4. **Storage** → Firebase Admin SDK via ADC → Firestore with per-user security rules
5. **Response** → Security headers applied via `next.config.ts` middleware
