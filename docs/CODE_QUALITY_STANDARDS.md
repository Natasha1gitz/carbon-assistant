# Code Quality Standards

## Enforced Standards

This project enforces code quality through automated tooling at multiple layers:

### 1. TypeScript — Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- **Zero `any` types** — All data flows are fully typed
- **`import type` syntax** — Used for type-only imports to enable tree-shaking
- **Strict null checks** — All nullable values are explicitly handled

### 2. ESLint

- React Hooks rules (exhaustive-deps, rules-of-hooks)
- TypeScript-specific rules via `@typescript-eslint`
- Import ordering and unused variable detection

### 3. Prettier

- Consistent formatting across all files
- Format check enforced in CI (`npx prettier --check .`)

### 4. Zod Runtime Validation

All user inputs are validated at runtime with bounded ranges:

```typescript
car_km_per_week: z.number().min(0).max(20_000).default(0);
```

This serves as both a security measure (rejecting unbounded inputs) and a
documentation surface (the schema IS the API contract).

### 5. Pure Functions

The calculation engine (`calculator.ts`) is:

- **Deterministic** — Same input always produces same output
- **Side-effect-free** — Zero I/O, no database calls, no network
- **Trivially testable** — No mocking required

### 6. Error Handling

- **No `console.error`** in production code — replaced with `console.warn` for non-critical paths
- **ErrorBoundary** component catches unhandled React errors
- **Graceful degradation** — External service failures never crash the app
- **Structured error states** — UI error messages via React state, not console output

### 7. Code Organization

| Directory          | Responsibility                                       |
| ------------------ | ---------------------------------------------------- |
| `src/lib/`         | Pure logic — calculator, factors, rules, validators  |
| `src/app/actions/` | Server Actions — Gemini, Firebase (server-side only) |
| `src/components/`  | React components — UI layer                          |
| `src/hooks/`       | Custom React hooks — auth, state management          |
| `docs/`            | Architecture, PRD, judge evidence                    |

## Quality Gates

All quality checks run in CI on every push/PR:

```bash
npm run lint          # ESLint
npx tsc --noEmit      # TypeScript strict type check
npx prettier --check . # Format consistency
npx vitest run         # All tests (90% coverage gate)
npm run build          # Production build verification
```

## Naming Conventions

| Type             | Convention              | Example                |
| ---------------- | ----------------------- | ---------------------- |
| Components       | PascalCase              | `CarbonForm.tsx`       |
| Hooks            | camelCase, `use` prefix | `useAnonymousAuth.ts`  |
| Utilities        | camelCase               | `calculator.ts`        |
| Constants        | SCREAMING_SNAKE_CASE    | `GLOBAL_AVG_ANNUAL_KG` |
| Types/Interfaces | PascalCase              | `FootprintResult`      |
| Test files       | `*.test.ts(x)`          | `calculator.test.ts`   |
