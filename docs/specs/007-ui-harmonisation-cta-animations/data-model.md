# Data Model (Conceptual) — UI Harmonisation

This feature is UI-focused; no backend data entities are introduced. We define conceptual entities to guide consistency.

## Entities

### Design Tokens (concept)

-   Typography scale: {xs, sm, base, lg, xl, 2xl, 3xl+}
-   Spacing scale: {xs, sm, md, lg, xl, 2xl}
-   Palette: primary, secondary, neutral (text, subtle, border), states (success, warn, error)
-   Radius: {sm, md, lg, full}; Shadow: {sm, md}

### CTA

-   Variants: primary, secondary, tertiary
-   States: default, hover, active, focus, disabled
-   Size: sm, md, lg (tap target ≥ 44px on mobile)
-   Content: label (concise), optional icon (leading), aria-label if needed

### Section Header

-   Parts: eyebrow/badge (optional), title (H2/H3), subtitle (supporting)
-   Alignment: center/left depending on page context

### Motion Policy

-   Triggers: in-view (appear), hover, press
-   Properties: opacity, translateY (≤ 12px), scale (≤ 1.02)
-   Duration: 150–300ms; Easing: standard ease-out; Reduced motion: disable nonessential

## Relationships

-   Pages compose Sections; Sections use CTAs and Section Headers
-   CTAs reuse Tokens; Motion Policy applies to Sections and CTAs

## Validation Rules

-   Contrast AA for text/CTA; focus visible on keyboard
-   CTA above-the-fold where mandated by spec; max one primary CTA per section
