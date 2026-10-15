---
name: Academic Operations System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#4d556b'
  on-tertiary: '#ffffff'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  data-tabular:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-sm: 1rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers an administrative experience tailored for higher education registrars, academic advisors, department heads, and admissions staff. The system balances institutional authority with modern software agility. It avoids visual clutter, bureaucratic friction, and decorative excess, projecting clarity, efficiency, reliability, and calm control.

The visual style is **Corporate Modern Minimalist**:
- **Structured Hierarchy:** Information displays follow strict typographic and structural priorities to reduce cognitive load during complex multi-step workflows.
- **Airy Data Density:** Generous white space combined with clean borders ensures high-volume academic data (transcripts, course sections, roster status) remains readable without inducing fatigue.
- **Micro-Interactions:** Subtle hover states, precise focus indicators, and crisp elevation transitions provide tactical responsiveness.
- **Purposeful Color:** Color is reserved strictly for orientation, state indication (e.g., active enrollment, academic holds, prerequisite alerts), and decisive calls to action.

## Colors

The palette grounds high-stakes administrative operations in stable, accessible tones.

### Color Tokens & Assignments
- **Canvas & Surface:**
  - `bg-canvas`: `#F8FAFC` (Slate-50) – Canvas background behind application shells and content workspaces.
  - `bg-surface`: `#FFFFFF` – Primary card, table, modal, and drawer backgrounds.
  - `bg-subtle`: `#F1F5F9` (Slate-100) – Filter bars, table header bands, neutral chip surfaces, and nested container backgrounds.
  - `border-subtle`: `#E2E8F0` (Slate-200) – Component boundaries, divider rules, and input outlines.
  - `border-muted`: `#CBD5E1` (Slate-300) – Active borders on hover and structural dividers.

- **Typography & Icons:**
  - `text-primary`: `#0F172A` (Slate-900) – High-contrast titles, tabular numbers, active labels, and critical values.
  - `text-secondary`: `#1E293B` (Slate-800) – Body copy, table cell content, and primary navigation items.
  - `text-muted`: `#64748B` (Slate-500) – Meta descriptions, helper text, inactive navigation, and table column headers.

- **Brand & Action (Institutional Blue):**
  - `accent-primary`: `#2563EB` (Blue-600) – Primary action buttons, active tab indicators, selected radio/checkbox fills, and focus rings.
  - `accent-hover`: `#1D4ED8` (Blue-700) – Hover state for primary buttons and interactive links.
  - `accent-subtle`: `#EFF6FF` (Blue-50) – Light active state fills, selected row highlights, and informational message containers.

- **Semantic & Status Tokens:**
  - `status-active` / `success`: `#10B981` (Emerald-500) and `#059669` (Emerald-600) – Active matriculation status, completed degree audits, open seats, paid dues.
  - `status-active-subtle`: `#ECFDF5` (Emerald-50) – Badge background for active student states.
  - `status-warning`: `#F59E0B` (Amber-500) – Academic probation, missing prerequisite warnings, pending financial clearance.
  - `status-warning-subtle`: `#FFFBEB` (Amber-50).
  - `status-critical`: `#EF4444` (Red-500) – Registration holds, dismissed status, system errors.
  - `status-critical-subtle`: `#FEF2F2` (Red-50).

## Typography

The type system uses `Inter` across all structural tiers to leverage its neutral grotesque tone and high-legibility tabular figures.

### Typographic Principles
- **Tabular Numerics:** Enable `font-feature-settings: "tnum"` on all data tables, student ID blocks, credit calculations, GPA numbers, and currency cells to ensure vertical digit alignment.
- **Label Capitalization:** Apply uppercase treatment only to `label-xs` tokens (e.g., column headers, status tags, eyebrow headers), accompanied by positive tracking (`+0.04em`).
- **Data Scannability:** Restrict `headline-xl` to top-level view headings (e.g., Student Record Overview). Use `headline-sm` and `title-md` for modular card headers to conserve vertical space.

## Layout & Spacing

The layout is built on an **anchored fluid grid system** with fixed structural sidebars and fluid analytical content regions.

### Grid & Breakpoints
- **Desktop (≥ 1280px):** 12-column layout. Margin: `2.5rem` (`margin-lg`), Gutters: `1.5rem` (`gutter`). Navigation is fixed at 260px wide, and the main stage expands fluidly up to an optional max-width of 1600px for ultrawide panels.
- **Tablet (768px – 1279px):** 8-column layout. Margin: `1.5rem` (`margin`), Gutters: `1rem` (`gutter-sm`). The sidebar collapses to an icon rail (64px wide).
- **Mobile (< 768px):** 4-column layout. Margin: `1rem` (`margin-sm`), Gutters: `1rem` (`gutter-sm`). Navigation moves into a persistent bottom bar or drawer overlay. Multi-column tables collapse into stacked record cards.

### Spacing Principles
- Internal card padding uses `space-lg` (24px) for desktop and scales to `space-md` (16px) on compact dashboards.
- Tight row items (avatar + name, badge dot + text) use `space-xs` (4px) to `space-sm` (8px).
- Grouped controls (action bars, filter pill lists) use `space-sm` (8px).

## Elevation & Depth

Visual hierarchy is maintained through crisp surface planes and subtle, low-opacity ambient shadows rather than dramatic drop shadows.

### Elevation Hierarchy
- **Level 0 (Flat Canvas):** `#F8FAFC`. Base view canvas with no border or shadow.
- **Level 1 (Default Containers & Cards):** `#FFFFFF` background with a crisp border (`1px solid #E2E8F0`) and micro ambient shadow:
  - `box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.05);`
- **Level 2 (Dropdowns, Popovers, & Hovered Cards):**
  - `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05);`
  - Border: `1px solid #E2E8F0`.
- **Level 3 (Slide-over Drawers, Floating Command Palettes, Modals):**
  - `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06);`
  - Dimmer Overlay: `rgba(15, 23, 42, 0.4)` backdrop blur of `4px`.

### Focus Elevation
Interactive components elevated during keyboard focus omit heavy shadows in favor of a clean, high-contrast focus ring: `box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #2563EB;`.

## Shapes

The interface uses standard rounded forms to balance institutional reliability with modern SaaS software conventions:

- **Cards & Data Panels:** `1rem` (`rounded-xl` / 16px).
- **Buttons, Form Inputs, & Select Triggers:** `0.5rem` (`rounded-md` / 8px).
- **Badges, Tags, & Status Pills:** `9999px` (Full pill shape) for status chips; `0.375rem` (6px) for compact table-embedded tags.
- **Dialogs & Slide-out Panels:** `1rem` (`rounded-xl` / 16px) on dialog corners; matching internal inset radii to ensure nested harmony.

## Components

### Buttons
- **Primary:** Background `#2563EB`, text `#FFFFFF`, border `transparent`. Hover `#1D4ED8`. Active `#1E40AF`. Height 40px, horizontal padding 16px (`space-md`), border radius 8px (`rounded-md`). Text: `label-md`.
- **Secondary / Outline:** Background `#FFFFFF`, text `#0F172A`, border `1px solid #E2E8F0`. Hover `#F8FAFC` and border `#CBD5E1`.
- **Ghost:** Background `transparent`, text `#64748B`. Hover background `#F1F5F9`, text `#0F172A`.
- **Destructive:** Background `#EF4444`, text `#FFFFFF`. Hover `#DC2626`.

### Cards & Containers
- Built on `#FFFFFF` with `1px solid #E2E8F0`, rounded corners at `16px` (`rounded-xl`), and Elevation Level 1.
- Standard card header includes a bottom divider rule `1px solid #F1F5F9`, separating title and action toggles from content modules.

### Status Badges & Chips
- Designed as full pills (`rounded-full`) with uppercase `label-xs` tracking.
- **Active Student Status:** Background `#ECFDF5`, text `#065F46`, paired with an internal 6px solid emerald dot (`#10B981`).
- **Academic Hold:** Background `#FEF2F2`, text `#991B1B`, paired with a solid red dot (`#EF4444`).
- **Pending / Probation:** Background `#FFFBEB`, text `#92400E`, paired with an amber dot (`#F59E0B`).

### Input Fields & Controls
- Height 40px, background `#FFFFFF`, border `1px solid #E2E8F0`, text `#0F172A`, placeholder `#94A3B8`.
- Focus state: border color `#2563EB` with outline ring `0 0 0 1px #2563EB`.
- Error state: border color `#EF4444` accompanied by red helper text below the field.

### Checkboxes & Radios
- Size 16px × 16px with `4px` corner radius for checkboxes, circular for radios.
- Unchecked: border `1.5px solid #CBD5E1`, background `#FFFFFF`.
- Checked: border `transparent`, background `#2563EB`, with a crisp white centered check icon.

### Data Tables (Rosters & Degree Audits)
- Header row: background `#F8FAFC`, height 40px, text `label-xs` in `#64748B`, bottom border `1px solid #E2E8F0`.
- Data rows: height 52px, alternating background `#FFFFFF` with row hover `#F8FAFC`, bottom border `1px solid #F1F5F9`.
- Typography within cells: `body-md` / `data-tabular` using slate-800 (`#1E293B`).

### Key Student Management Components
- **Student Profile Strip:** A pinned header component showing student avatar, legal name, student ID (formatted monospace or tabular), current standing pill badge, enrolled degree, and quick-action menu (Add Hold, Email, View Transcript).
- **Course Schedule Grid:** A 5-day matrix using light blue `#EFF6FF` course blocks bordered with `#2563EB` left accent stripes (3px) displaying Course ID, section, room number, and enrolled capacity indicator.