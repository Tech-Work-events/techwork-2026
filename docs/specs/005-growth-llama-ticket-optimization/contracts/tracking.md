# Contract: Tracking & UTM propagation (005)

Purpose: Ensure consistent attribution from landing to ticketing.

## UTM Handling

-   Inputs: existing query params (utm_source, utm_medium, utm_campaign, utm_content)
-   Defaults: defined centrally for TicketCTA when missing
-   Merge rule: incoming params override defaults; remove empties
-   Propagation: all ticket CTA hrefs include final UTM set

## Consent

-   Events dispatched only when consent allows; otherwise no-op

## Events (names)

-   cta_click (on CTA interaction)
-   ticket_outbound (on navigating to provider)
