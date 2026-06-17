# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT open a public GitHub issue.**
2. Email the maintainer at: [security@example.com]
3. Include a description of the vulnerability, steps to reproduce, and potential impact.
4. You will receive an acknowledgment within 48 hours and a resolution timeline within 7 days.

## Security Measures Implemented

### Server-Side

| Measure                      | Implementation                                                               |
| ---------------------------- | ---------------------------------------------------------------------------- |
| **No API keys in client**    | Gemini API key is server-side only via `"use server"` Next.js Server Actions |
| **Firebase Admin ADC**       | Uses Application Default Credentials — no credential files in the codebase   |
| **Anonymous authentication** | Firebase Anonymous Auth — no PII collected                                   |
| **Input validation**         | All inputs validated via Zod schemas with bounded ranges before processing   |

### HTTP Security Headers

All responses include defense-in-depth headers configured in `next.config.ts`:

| Header                    | Value                                       |
| ------------------------- | ------------------------------------------- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' ...` |
| `X-Frame-Options`         | `DENY`                                      |
| `X-Content-Type-Options`  | `nosniff`                                   |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`           |
| `Permissions-Policy`      | `camera=(), microphone=(), geolocation=()`  |

### Input Validation Bounds

All numeric inputs are bounded to prevent abuse:

| Field                       | Min | Max       |
| --------------------------- | --- | --------- |
| `car_km_per_week`           | 0   | 20,000    |
| `electricity_kwh_per_month` | 0   | 100,000   |
| `flights_per_year`          | 0   | 200       |
| `goods_spend_usd_per_month` | 0   | 1,000,000 |
| `waste_kg_per_week`         | 0   | 1,000     |
| `household_size`            | 1   | 50        |

### Architecture Security

- **Pure calculation engine** — `calculator.ts` has zero I/O, making it immune to injection attacks.
- **Server Actions** — All external service calls (Gemini, Firestore) execute server-side only.
- **Graceful degradation** — If external services fail, rule-based fallbacks ensure no error leaks.
- **No personal data** — Only anonymous device IDs and emission numbers are stored.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |

## Dependencies

Dependencies are audited regularly via `npm audit`. The project uses:

- `next` — React framework with built-in security features
- `firebase` / `firebase-admin` — Google's SDK with built-in auth
- `zod` — Runtime type validation
- `@google/generative-ai` — Gemini SDK (server-side only)
