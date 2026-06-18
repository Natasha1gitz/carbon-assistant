# Testing Strategy

## Philosophy

The testing strategy follows the **testing pyramid** principle:

- **Unit tests** (fast, deterministic) form the foundation
- **Component tests** (with accessibility audits) cover UI behavior
- **Integration tests** (build verification) ensure deployment readiness

All tests run without network access or external credentials, enabling fast
CI pipelines and local development.

## Test Categories

### 1. Unit Tests — Pure Logic

| File                 | Tests | Covers                                                                                  |
| -------------------- | ----- | --------------------------------------------------------------------------------------- |
| `calculator.test.ts` | 9     | Emission math, edge cases (zero inputs, boundary values), fuel types, household sharing |
| `rules.test.ts`      | 6     | Rule-based insight engine, ranking, diet ladder, savings estimates                      |
| `validators.test.ts` | 20+   | Zod schema validation: bounds, negative values, invalid enums, type coercion            |

### 2. Component Tests — UI Behavior + Accessibility

| File                    | Tests | Covers                                                                    |
| ----------------------- | ----- | ------------------------------------------------------------------------- |
| `CarbonForm.test.tsx`   | 4     | Step navigation, form rendering, **axe accessibility audit**              |
| `Dashboard.test.tsx`    | 2     | Result rendering, **axe accessibility audit**                             |
| `AiAssistant.test.tsx`  | 10    | Insight cards, source labels, chat input, **axe accessibility audit**     |
| `HistoryPanel.test.tsx` | 8     | Empty state, table structure, data rendering, **axe accessibility audit** |

### 3. Build Verification

The CI pipeline runs `next build --turbopack` which catches:

- TypeScript type errors (strict mode)
- Import resolution failures
- Dead code and unused exports

## Coverage Gate

The project enforces a **90% coverage threshold** in `vitest.config.ts`:

```ts
coverage: {
  thresholds: {
    lines: 90,
    functions: 90,
    branches: 90,
    statements: 90,
  },
}
```

## Accessibility Testing

Every UI component includes an [axe-core](https://github.com/dequelabs/axe-core)
audit via `vitest-axe`. This automatically checks:

- WCAG 2.1 Level AA compliance
- Missing alt text, labels, and ARIA attributes
- Color contrast ratios
- Heading hierarchy
- Keyboard navigation support

## CI Pipeline

The GitHub Actions CI workflow (`ci.yml`) runs on every push and PR:

```yaml
Steps:
  1. npm ci                    # Install exact dependencies
  2. npm run lint              # ESLint
  3. npx tsc --noEmit          # TypeScript strict type check
  4. npx prettier --check .    # Format check
  5. npx vitest run            # All tests
  6. npm run build             # Production build
```

## Running Tests Locally

```bash
# Run all tests
npx vitest run

# Run with coverage report
npx vitest run --coverage

# Run in watch mode during development
npx vitest

# Run a specific test file
npx vitest run src/lib/calculator.test.ts
```

## Design Decisions

1. **No mocking of the calculation engine** — It's pure and fast enough to test directly.
2. **Rule engine always tested without Gemini** — Ensures the fallback path works.
3. **Axe tests per component** — Catches accessibility regressions at the component level.
4. **Zod tested independently** — Schema validation is a security boundary and needs dedicated coverage.
5. **Mutation Testing Resilience** — Tests are designed to fail if underlying logic or boundary conditions mutate, proving tests assert behavior, not just code coverage lines.
