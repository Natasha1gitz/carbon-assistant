# Contributing to Carbon Footprint Assistant

Thank you for your interest in contributing! This document provides guidelines
for contributing to the project.

## Development Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/carbon-assistant.git
    cd carbon-assistant
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Copy the environment variables:**

    ```bash
    cp .env.example .env.local
    ```

    Fill in your Firebase and Gemini API keys, or set `USE_GEMINI=false` and
    `USE_FIRESTORE=false` to run entirely offline.

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

## Quality Gates

All of the following must pass before merging:

| Check            | Command                 | Requirement     |
| ---------------- | ----------------------- | --------------- |
| TypeScript       | `npm run typecheck`     | Zero errors     |
| ESLint           | `npm run lint`          | Zero warnings   |
| Prettier         | `npm run format:check`  | Fully formatted |
| Unit tests       | `npm run test`          | All passing     |
| Coverage         | `npm run test:coverage` | ≥90% statements |
| Production build | `npm run build`         | Successful      |

## Code Standards

- **TypeScript Strict Mode** — no `any` types.
- **Functional components** with explicit return types.
- **Early returns** for guard clauses.
- **Accessible markup** — every interactive element needs `id`, `aria-label`,
  or `aria-describedby`.
- **Documented emission factors** — cite the scientific source for every
  constant in `lib/factors.ts`.

## Testing

- Write unit tests for all pure functions (calculator, validators).
- Write `vitest-axe` accessibility tests for every component.
- Aim for ≥90% code coverage.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add transport sub-category breakdown
fix: correct electricity factor source
test: add edge-case coverage for zero inputs
docs: update README with deployment guide
```
