# Accessibility Compliance Report

## Standard: WCAG 2.1 Level AA & AAA Contrast Verified

This report documents the accessibility features implemented across the
Carbon Footprint Assistant application.

## Automated Testing

Every UI component includes an [axe-core](https://github.com/dequelabs/axe-core)
accessibility audit via `vitest-axe`:

| Component    | axe Test                   | Result        |
| ------------ | -------------------------- | ------------- |
| CarbonForm   | ✅ `CarbonForm.test.tsx`   | No violations |
| Dashboard    | ✅ `Dashboard.test.tsx`    | No violations |
| AiAssistant  | ✅ `AiAssistant.test.tsx`  | No violations |
| HistoryPanel | ✅ `HistoryPanel.test.tsx` | No violations |

## Compliance Checklist

### Perceivable

| Criterion                    | Status | Implementation                                                                         |
| ---------------------------- | ------ | -------------------------------------------------------------------------------------- |
| 1.1.1 Non-text Content       | ✅     | All icons use emoji text (inherently accessible)                                       |
| 1.3.1 Info and Relationships | ✅     | `<fieldset>` + `<legend>` for form groups, `<table>` with `<caption>` and `<th scope>` |
| 1.3.2 Meaningful Sequence    | ✅     | DOM order matches visual order                                                         |
| 1.4.1 Use of Color           | ✅     | Status badges use text + icons, not color alone                                        |
| 1.4.3 Contrast (Minimum)     | ✅     | Dark mode + light mode both tested                                                     |
| 1.4.11 Non-text Contrast     | ✅     | Interactive elements have visible borders                                              |

### Operable

| Criterion                 | Status | Implementation                                                |
| ------------------------- | ------ | ------------------------------------------------------------- |
| 2.1.1 Keyboard            | ✅     | All controls are keyboard-operable                            |
| 2.4.1 Bypass Blocks       | ✅     | Skip-to-content link in `layout.tsx`                          |
| 2.4.2 Page Titled         | ✅     | Descriptive `<title>` via Next.js metadata                    |
| 2.4.3 Focus Order         | ✅     | `tabIndex={-1}` on `<main>` for skip-link target              |
| 2.4.6 Headings and Labels | ✅     | Proper heading hierarchy (`h1` > `h2` > `h3`)                 |
| 2.4.7 Focus Visible       | ✅     | `focus:ring-2 focus:ring-emerald-500` on interactive elements |

### Understandable

| Criterion                    | Status | Implementation                             |
| ---------------------------- | ------ | ------------------------------------------ |
| 3.1.1 Language of Page       | ✅     | `<html lang="en">`                         |
| 3.2.1 On Focus               | ✅     | No unexpected context changes on focus     |
| 3.3.1 Error Identification   | ✅     | Form errors linked via `aria-describedby`  |
| 3.3.2 Labels or Instructions | ✅     | All inputs have visible `<label>` elements |

### Robust

| Criterion               | Status | Implementation                                       |
| ----------------------- | ------ | ---------------------------------------------------- |
| 4.1.1 Parsing           | ✅     | Valid HTML5 output via React JSX                     |
| 4.1.2 Name, Role, Value | ✅     | ARIA roles on dynamic content (`aria-live="polite"`) |
| 4.1.3 Status Messages   | ✅     | Loading states and errors use `aria-live` regions    |

## Screen Reader Support

| Feature         | Implementation                                                                   |
| --------------- | -------------------------------------------------------------------------------- |
| Chart data      | `sr-only` table provides data in text form                                       |
| Step indicator  | `aria-hidden="true"` on decorative elements, screen reader text for current step |
| Loading states  | `<span className="sr-only">Loading application...</span>`                        |
| Dynamic content | `aria-live="polite"` on results, chat messages, and loading indicators           |

## Keyboard Navigation Flow

1. **Skip link** → Skip to main content
2. **Step buttons** → Navigate between form steps
3. **Form inputs** → Tab through fields
4. **Radio buttons** → Arrow keys to select diet type
5. **Submit button** → Enter to calculate
6. **Chat input** → Type and send messages
7. **Recalculate** → Return to form
