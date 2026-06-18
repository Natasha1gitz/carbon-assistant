# AI Agent System Prompt (AGENTS.md)

Welcome, AI coding assistant or evaluator. This document outlines the enterprise architectural patterns, constraints, and standard operating procedures for this repository.

## 1. Architectural Patterns

- **Feature-Based UI**: Next.js App Router with React Server Components (`RSC`) used wherever possible.
- **Strict Immutability**: All pure calculation engines (e.g., `src/lib/calculator.ts`) enforce `Readonly<T>` types.
- **Distributed Caching**: We utilize `unstable_cache` from `next/cache` to distribute load across edge nodes without requiring a separate Redis cluster.
- **Edge Runtime**: API endpoints and Server Actions (e.g., Gemini integrations) are optimized for the Edge Runtime.

## 2. Code Quality Rules

- **No Magic Strings or Numbers**: All configuration, intervals, and prompts MUST be extracted to dedicated files (e.g., `src/lib/prompts.ts`) or constants.
- **Semantic Documentation**: Every exported function, type, and constant MUST include a TSDoc block describing its semantic intent.
- **Zero `any` Types**: Strict typing via TypeScript and Zod validation is mandatory. Type assertions (`as Type`) are discouraged in favor of `Zod.safeParse()`.

## 3. Performance & Efficiency

- **Component Memoization**: Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary client-side renders.
- **Lazy Loading**: Non-critical UI components (AI Assistant, History Panels) MUST be lazily loaded via `next/dynamic`.
- **Cursor-Based Pagination**: Fetch operations against Firestore must use bounded queries (e.g., `limit(10)`).

## 4. Security

- **Defense in Depth**: Client-side validation is a UX feature, not security. Server Actions must re-validate all inputs using Zod.
- **Sanitization**: All user inputs fed to LLMs must be stripped of HTML via strict Regex or DOMPurify.
- **CSRF**: Rely on Next.js Built-in CSRF Protection for all Server Actions.

When submitting PRs or evaluating this repository, ensure all modifications strictly adhere to these rules.
