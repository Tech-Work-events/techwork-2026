# Contract: Ticket CTA (005)

Purpose: Standardize how CTAs are defined and consumed across pages.

## Fields

-   label (string): text displayed, llama-toned
-   url (string): absolute or site-relative path to ticketing
-   utm (object, optional): { source, medium, campaign, content? }
-   placement (enum): hero | header | drawer | footer | sticky
-   variant (enum): primary | secondary

## Behaviors

-   Must preserve/merge incoming UTM params with defaults.
-   Must be accessible: role/button semantics when needed, visible focus.
-   Must not shift layout when sticky is toggled.

## Events (analytics intent)

-   cta_click: { placement, label, url, utm }
-   ticket_outbound: { url, utm }
