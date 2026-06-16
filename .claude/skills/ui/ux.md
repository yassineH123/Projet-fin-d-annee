---
name: ui-ux-pro-max
description: UI/UX design rules for frontend development. Use when building pages, components, styling, layouts, dark mode, accessibility, animations, forms, navigation, charts, or responsive design. Includes accessibility standards, touch targets, performance, typography, color tokens, animation timing, form validation, navigation patterns, and responsive breakpoints.
---

# UI/UX Pro Max Skill

## When to Apply This Skill

Use these rules for ALL frontend tasks: new pages, components, UI improvements, style choices, layout work, dark mode, accessibility, animations, forms, navigation, charts, and responsive design.

---

## Priority 1 — CRITICAL: Accessibility

| Rule | Standard | Avoid |
|------|----------|-------|
| **Text contrast** | ≥4.5:1 for normal text, ≥3:1 for large text (WCAG AA) | Low-contrast gray text on white/light backgrounds |
| **Focus indicators** | Visible `:focus-visible` outline, never `outline: none` without replacement | Removing focus rings for aesthetic reasons |
| **Color not sole indicator** | Always pair color with icon, pattern, or text label | Red-only error states without icon or text |
| **Alt text** | Descriptive `alt` on all meaningful images, `alt=""` on decorative ones | Missing or generic alt="image" |
| **Semantic HTML** | `<button>`, `<nav>`, `<main>`, `<header>`, `<label>` correctly | `<div onClick>` for interactive controls |
| **ARIA roles** | Add `role`, `aria-label`, `aria-expanded` only when native semantics fall short | Overriding correct native semantics with ARIA |
| **Keyboard navigation** | Full keyboard operability, logical tab order | Mouse-only interactions |
| **Reduced motion** | Respect `prefers-reduced-motion`, disable/slow animations | Forcing animations regardless of OS setting |

---

## Priority 2 — CRITICAL: Touch & Interaction

| Rule | Do | Don't |
|------|----|----|
| **Touch targets** | ≥44×44pt with ≥8px spacing between interactive elements | Tiny tap targets without padding |
| **Tap feedback** | Visual feedback (ripple/opacity/elevation) within 80–150ms | No visual response on tap/click |
| **Hover states** | Smooth transition, clear affordance for clickable elements | No hover state on interactive elements |
| **Gesture conflicts** | One primary gesture per region | Nested tap/drag conflicts |
| **Disabled state** | Visually clear, non-interactive, use `disabled` attribute | Controls that look active but do nothing |
| **Loading states** | Skeleton screens or spinners for async operations >200ms | Blank/invisible UI while loading |

---

## Priority 3 — HIGH: Performance

| Rule | Do | Don't |
|------|----|----|
| **Images** | WebP/AVIF format, lazy loading, explicit `width`/`height` | Unoptimized JPEGs, layout shift from missing dimensions |
| **Animations** | CSS transforms/opacity (GPU), avoid layout-triggering properties | Animating `width`, `height`, `top`, `left` |
| **Bundle** | Code-split by route, lazy-load heavy components | Single monolithic bundle |
| **Lists** | Virtualize long lists (>50 items) | Rendering all items to DOM |
| **CLS** | Keep Cumulative Layout Shift <0.1 | Elements appearing after content load and shifting layout |
| **Font loading** | `font-display: swap`, preconnect to font origins | Invisible text during font load (FOIT) |

---

## Priority 4 — HIGH: Style Selection

### UI Style Guide — Match to Product Type

| Product Type | Recommended Styles | Avoid |
|---|---|---|
| **Carpooling / Transport** | Clean functional, trust-focused, clear hierarchy | Heavy dark moody aesthetics |
| **SaaS / Dashboard** | Minimal, data-dense, clear typography | Overly decorative, heavy gradients |
| **E-commerce / Marketplace** | Warm, conversion-focused, clear CTAs | Cold/clinical or overly abstract |
| **Social / Community** | Vibrant, content-first, expressive | Sterile, corporate monotone |
| **Healthcare / Trust** | Clean whites, clear hierarchy, accessible | Dark or edgy aesthetics |
| **Fintech / Finance** | Authoritative, data-focused, professional | Casual, playful, low-contrast |

### Icon Rules
- Use **Lucide Icons** (already in project) or **Phosphor Icons** (`@phosphor-icons/react`)
- Consistent stroke width (1.5px or 2px, never mixed)
- Filled vs outline discipline — one style per hierarchy level
- NEVER use emojis as structural icons (navigation, buttons, status)
- All icons ≥24×24px with ≥44×44px tap area

---

## Priority 5 — HIGH: Typography & Color

### Typography Rules

| Rule | Standard | Avoid |
|------|----------|-------|
| **Base size** | ≥16px for body text | 12–14px body text |
| **Line height** | 1.5–1.6 for body, 1.1–1.3 for headings | 1.0 or >2.0 |
| **Font choice** | Expressive display font + readable body font | Inter/Roboto/Arial/System fonts |
| **Scale** | Consistent typographic scale (8/12/14/16/20/24/32/48px) | Random sizes with no system |
| **Max width** | 65–75ch for reading columns | Full-width paragraphs on large screens |
| **Weight range** | 400 (regular) + 600/700 (semibold/bold) + optionally 800/900 for display | Only one weight throughout |

### Color Rules

| Rule | Standard | Avoid |
|------|----------|-------|
| **Semantic tokens** | CSS variables (`--color-primary`, `--text-muted`, `--surface`) | Hardcoded hex values scattered in components |
| **Palette** | 1 dominant brand color + 1–2 accent colors + neutral scale | >3 competing accent colors |
| **Dark mode** | Test independently, don't invert light-mode colors | Assuming light-mode colors work on dark backgrounds |
| **State colors** | Consistent success/warning/error/info system | Random greens/reds per component |

---

## Priority 6 — MEDIUM: Animation & Motion

| Rule | Standard | Avoid |
|------|----------|-------|
| **Micro-interaction timing** | 150–300ms for hover/focus/tap | >500ms for simple state changes |
| **Page transitions** | 200–400ms with meaningful easing | Instant route changes or >600ms transitions |
| **Easing** | `ease-out` for entering, `ease-in` for exiting | Linear easing for all animations |
| **Exit faster** | Exit animations should be 20–30% shorter than enter | Exit = same duration as enter |
| **Spring physics** | Use spring easing for draggable/dismissible elements | Linear spring motion that feels mechanical |
| **Stagger** | Stagger list items by 30–60ms for reveals | All items animating simultaneously |
| **GPU only** | Only animate `transform` and `opacity` | Animating layout-triggering properties |

---

## Priority 7 — MEDIUM: Forms & Feedback

| Rule | Do | Don't |
|------|----|----|
| **Labels** | Always visible labels above inputs, never placeholder-only | Disappearing placeholder as only label |
| **Error placement** | Error message directly below the field that caused it | Generic error at top only |
| **Inline validation** | Validate on blur (not on every keystroke) | Real-time validation that triggers before user finishes |
| **Error clarity** | "Email must include @" not "Invalid input" | Vague error messages |
| **Success feedback** | Confirm submission clearly (toast, redirect, or confirmation state) | Silent success with no feedback |
| **Loading button** | Show spinner in button while submitting, disable it | Re-clickable submit button during async operation |
| **Autofill** | Support browser autofill with correct `autocomplete` attributes | Blocking autofill |
| **Password** | Show/hide toggle on password fields | No way to verify password input |

---

## Priority 8 — MEDIUM: Navigation Patterns

| Rule | Standard | Avoid |
|------|----------|-------|
| **Hierarchy** | Max 3 levels of navigation depth | Deep nested menus requiring 4+ clicks |
| **Active state** | Clear visual indicator of current page/section | No active state in navigation |
| **Back behavior** | Predictable, restores scroll position | Back button losing user's place |
| **Mobile nav** | Hamburger reveals full menu, not partial | Partial overlay that confuses interaction |
| **Breadcrumbs** | On pages >2 levels deep | Breadcrumbs on flat site structure |
| **Skip links** | `Skip to main content` as first focusable element | No skip navigation for keyboard users |

---

## Priority 9 — HIGH: Layout & Responsive

| Rule | Do | Don't |
|------|----|----|
| **Mobile first** | Design 320px → 768px → 1280px | Desktop-first that breaks on mobile |
| **Spacing rhythm** | 4/8dp base grid — use multiples (4, 8, 12, 16, 24, 32, 48) | Random spacing values |
| **Content width** | Max 1280px centered container with responsive gutters | Edge-to-edge text on wide screens |
| **Breakpoint consistency** | Same breakpoints throughout (`sm`/`md`/`lg`/`xl`) | Per-component arbitrary breakpoints |
| **Flex/Grid** | Flexbox for 1D, CSS Grid for 2D | Nested tables for layout |
| **Overflow** | Handle text overflow gracefully (truncate or wrap) | Text clipping without ellipsis |
| **Images** | Responsive with `max-width: 100%` | Fixed-width images breaking mobile layout |

---

## Priority 10 — MEDIUM: Charts & Data Visualization

| Chart Type | Use For | Avoid When |
|---|---|---|
| **Line chart** | Trends over time, continuous data | Categorical comparisons |
| **Bar chart** | Category comparisons, rankings | Time series with many points |
| **Pie/Donut** | Part-to-whole (max 5–6 segments) | >6 segments, or when differences are small |
| **Area chart** | Volume over time, cumulative values | Comparing multiple overlapping series |
| **Scatter** | Correlation between two variables | General audiences unfamiliar with the format |

Chart rules:
- Always label axes
- Use accessible color palettes (not red/green alone)
- Mobile: prefer horizontal bar over vertical for many labels
- Loading state: skeleton that matches chart dimensions

---

## Pre-Delivery Checklist

### Visual Quality
- [ ] No emojis as icons (SVG/icon library instead)
- [ ] Consistent icon style and stroke width
- [ ] Color contrast meets WCAG AA in both light and dark mode
- [ ] Semantic color tokens used (no hardcoded hex in components)

### Interaction
- [ ] All clickable elements have hover + active states
- [ ] Touch targets ≥44×44px
- [ ] Forms: labels visible, errors inline, loading states on submit
- [ ] Loading/empty/error states handled for all async data

### Layout
- [ ] Tested at 375px, 768px, 1280px widths
- [ ] Spacing follows 4/8dp grid
- [ ] No content hidden behind fixed headers/navbars
- [ ] Text doesn't overflow its container

### Accessibility
- [ ] Tab order is logical
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Screen reader labels on icons/images

---

## Common Anti-Patterns (Never Do)

1. **Purple gradient on white** — the most overused SaaS cliché
2. **Text on image without overlay** — always add a scrim for readability
3. **Disabled button with no explanation** — tell users WHY it's disabled
4. **Infinite scroll with no way back** — add a "back to top" or pagination alternative
5. **Modal on mobile that can't be dismissed** — always have a clear close affordance
6. **Card with no hover state** — if it's clickable, make it feel clickable
7. **Form that loses data on error** — preserve user input when validation fails
8. **Inconsistent button styles** — one button variant per semantic purpose
9. **>5 items in bottom navigation** — cognitive overload
10. **Dark mode as inverted light mode** — test independently with appropriate colors