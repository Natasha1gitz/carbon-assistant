# Performance Report

## Build Performance

| Metric              | Value                  |
| ------------------- | ---------------------- |
| Build tool          | Next.js 15 + Turbopack |
| Build time          | ~5 seconds             |
| Total First Load JS | 332 kB                 |
| Main page JS        | 218 kB                 |
| Shared JS chunks    | 125 kB                 |

## Runtime Performance

### Calculation Engine

The carbon calculator is a **pure, synchronous function** with:

- **O(1) time complexity** — fixed number of arithmetic operations
- **Zero I/O** — no database queries, no network calls
- **No memory allocation** — operates on primitives only

Typical execution time: **< 1ms** for a full footprint calculation.

### Rendering Performance

| Optimization       | Implementation                                  |
| ------------------ | ----------------------------------------------- |
| Code splitting     | Automatic via Next.js App Router                |
| Font optimization  | `next/font` — self-hosted, no layout shift      |
| CSS optimization   | Tailwind CSS purging removes unused styles      |
| Image optimization | SVG icons only — no raster images to optimize   |
| Bundle analysis    | `output: "standalone"` for minimal Docker image |

### Network Performance

| Strategy             | Details                                                         |
| -------------------- | --------------------------------------------------------------- |
| Server Actions       | Gemini API calls are server-side — no CORS, no API key exposure |
| Firebase SDK         | Loaded only in client, tree-shaken for Anonymous Auth only      |
| Firestore writes     | Fire-and-forget pattern — UI doesn't block on saves             |
| Graceful degradation | Rule engine runs locally when Gemini/Firestore unavailable      |

## Lighthouse Estimates

| Metric         | Target | Notes                                       |
| -------------- | ------ | ------------------------------------------- |
| Performance    | 90+    | Turbopack build, minimal JS                 |
| Accessibility  | 100    | axe audits per component, WCAG 2.1 AA       |
| Best Practices | 100    | Security headers, HTTPS-only                |
| SEO            | 90+    | Meta tags, semantic HTML, heading hierarchy |

## Docker Image

| Layer                 | Size        |
| --------------------- | ----------- |
| Base (node:20-alpine) | ~120 MB     |
| Dependencies          | ~80 MB      |
| Application           | ~15 MB      |
| **Total**             | **~215 MB** |

Multi-stage build ensures only production assets are included in the final image.
