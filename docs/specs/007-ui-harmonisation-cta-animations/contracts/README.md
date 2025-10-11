# UI Contracts

These contracts codify the expected behavior and presentation for UI elements across the site. They are technology-agnostic (WHAT/WHY), not implementation details.

## CTA Contract

-   Primary CTA must be visually dominant within its section (color/weight/size) and accessible (contrast AA, focus ring).
-   Label must be concise and action-oriented; optional leading icon allowed.
-   Size must ensure tap target ≥ 44px on mobile.
-   Hover/active/focus/disabled states must be visibly distinct.
-   Placement: above-the-fold on key pages (Home, Sponsors, CFP (open), Team/Location early).

## Section Header Contract

-   May include eyebrow/badge, then a clear title (H2/H3) and optional subtitle.
-   Spacing must follow the spacing scale and be consistent across pages.

## Motion Contract

-   Animations must serve comprehension (micro-interactions only).
-   In-view appearances: subtle opacity+translate; durations 150–300ms; ease-out.
-   Respects prefers-reduced-motion: disable nonessential motion.

## Accessibility Contract

-   Text and interactive elements meet AA contrast.
-   Keyboard focus is visible and not obscured by animations.
-   Decorative imagery uses empty alt="" and aria-hidden where appropriate.
