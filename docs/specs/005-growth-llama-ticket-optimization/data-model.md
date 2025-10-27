# Conceptual Data Model (005)

Note: conceptual only; no implementation details.

## Entities

### TicketCTA

-   label: string (llama-toned)
-   url: string (ticketing endpoint)
-   utmDefaults: { source, medium, campaign, content? }
-   placements: ["hero", "header", "drawer", "footer", "sticky"]
-   variant: enum (primary, secondary)

### SocialProof

-   logos: [ { name, url?, img } ]
-   quotes: [ { author, role?, text } ]
-   photos: [ { src, alt } ]
-   counts: { attendeesExpected?, editions?, partners? }

### FAQItem

-   q: string
-   a: string (concise, friendly)
-   category?: string

### EmailCapture

-   placement: enum (footer, inline)
-   consentRequired: boolean
-   successCopy: string

### AnalyticsEvent (logical)

-   name: string (cta_click, ticket_outbound)
-   props: { placement, label, url, utm }
-   consentGate: boolean
