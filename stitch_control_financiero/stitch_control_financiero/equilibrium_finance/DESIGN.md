# Design System Specification: The Architectural Ledger

## 1. Overview & Creative North Star
**Creative North Star: "The Editorial Vault"**

This design system moves away from the "SaaS-template" look by treating financial data with the reverence of a high-end editorial publication. We reject the cluttered, line-heavy aesthetic of traditional banking. Instead, we embrace **Architectural Layering**—using tonal shifts, expansive white space, and sophisticated typography to create an environment of "Quiet Authority." 

The goal is to foster a "High-Trust" experience through intentional asymmetry and a "Glass & Stone" philosophy: structural elements feel heavy and stable (Deep Navy/Slate), while data overlays feel light and ethereal (Glassmorphism).

---

## 2. Color & Tonal Depth
This system relies on the interplay of light rather than the friction of lines.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or containers. 
*   **Separation via Surface:** Boundaries must be defined by shifts in background tokens (e.g., a `surface-container-low` section sitting on a `surface` background).
*   **The Signature Texture:** For primary Call-to-Actions (CTAs) or high-level summary cards, use a subtle linear gradient transitioning from `primary` (#041627) to `primary_container` (#1a2b3c) at a 135-degree angle. This adds a "brushed metal" depth that flat hex codes lack.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials:
*   **Base Layer:** `surface` (#f7f9fb) – The desk.
*   **Section Layer:** `surface_container_low` (#f2f4f6) – Large grouping areas.
*   **Interactive Layer:** `surface_container_lowest` (#ffffff) – Individual cards or data tables. This "brightest" white creates a natural "pop" against the softer background without needing a drop shadow.

---

## 3. Typography: The Dual-Tone Hierarchy
We use a two-font system to balance institutional stability with modern readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech-forward" feel. Use `display-lg` to `headline-sm` for large monetary balances and section titles.
*   **Body & Data (Inter):** The workhorse. Inter is used for all numerical data, labels, and paragraph text. Its high x-height ensures that complex financial tables remain legible even at `body-sm`.

**Hierarchy Tip:** Always pair a `headline-md` (Manrope) with a `label-md` (Inter, All-Caps, 0.05em tracking) to create an editorial "Header & Subheader" relationship that feels curated.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to create "float"; we use them to create "atmosphere."

*   **The Layering Principle:** Place a `surface_container_lowest` card inside a `surface_container` area. The contrast between #ffffff and #eceef0 is sufficient for the human eye to perceive elevation.
*   **Ambient Shadows:** Use only for temporary overlays (modals/dropdowns). 
    *   *Spec:* `Y: 12px, Blur: 32px, Color: rgba(25, 28, 30, 0.06)`. This mimics soft, natural light.
*   **Glassmorphism:** For the fixed left sidebar, use a background of `surface_container_lowest` at 85% opacity with a `backdrop-filter: blur(20px)`. This allows the content of the dashboard to bleed through slightly as it scrolls, maintaining a sense of space.
*   **The Ghost Border Fallback:** If a border is required for accessibility, use `outline_variant` (#c4c6cd) at **15% opacity**.

---

## 5. Components

### Cards & Data Tables
*   **Constraint:** No dividers. Use `24px` or `32px` of vertical whitespace to separate rows or groups.
*   **The "Cell Highlight":** For data tables, instead of a border, use a subtle background shift to `surface_bright` on hover.

### Buttons
*   **Primary:** Gradient of `primary` to `primary_container`. Text: `on_primary`. Radius: `md` (0.375rem).
*   **Secondary:** `surface_container_high` background. Text: `on_surface`. No border.
*   **Tertiary (Ghost):** No background. Text: `primary`. Used for low-priority actions like "Cancel" or "Export."

### Interactive Charts & Progress Bars
*   **The Success/Danger Axis:** Use `secondary` (Emerald Green) for growth and `error` (Rose Red) for over-budget states. 
*   **Visual Soul:** Data lines in charts should use a `2px` stroke width. Fill the area beneath the line with a fading gradient of the stroke color (10% opacity to 0%).

### Input Fields
*   **Default State:** Background `surface_container_highest` with a bottom-only "Ghost Border" of `outline_variant` at 20%.
*   **Focus State:** The bottom border transitions to `primary` (#041627) at 2px height.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `manrope` for any number over 24px. It gives financial figures an "authoritative" weight.
*   **Do** use `surface_container_lowest` for the main content "stage" to keep the UI feeling fresh and high-contrast.
*   **Do** lean into `xl` (0.75rem) roundedness for large containers to soften the "institutional" feel.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#191c1e) to maintain a premium, ink-on-paper look.
*   **Don't** use icons as the primary method of navigation. Always pair icons with `label-md` text for clarity and trust.
*   **Don't** use standard 1px gray dividers. If you feel the need for a line, increase your padding by 16px instead.