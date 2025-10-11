# Feature Specification: Branch naming convention for features and fixes

**Feature Branch**: `feat-003-branch-naming-convention`  
**Created**: 2025-10-11  
**Status**: Draft  
**Input**: User description: "je veuix que les branches soient nommées fix-xxx-xxx ou feat-xxx-xxx par exemple. Peux tu mettre à a jour le nom de la branche et suivre ce principe pour toutes les autres création de branches"

## User Scenarios & Testing (mandatory)

### Primary User Story

As a contributor, I want all Git branches to follow a clear, consistent naming convention so that branch purpose is immediately visible and automation (reviews, CI, release tooling) can rely on predictable names.

### Acceptance Scenarios

1. Given a developer creates a feature branch, When they name it using the agreed pattern, Then the branch name starts with `feat-` followed by concise kebab-case context words (e.g., `feat-landing-cta`).
2. Given a developer creates a bugfix branch, When they name it using the agreed pattern, Then the branch name starts with `fix-` followed by concise kebab-case context words (e.g., `fix-mobile-menu`).
3. Given the current working branch does not respect the convention, When the convention is adopted, Then the branch is renamed locally to comply without changing code history.
4. Given a docs-only change, When a branch is created, Then it starts with `docs-` and follows the same slug format.
5. Given a branch is created via `/specify`, When the branch is created, Then it includes a numeric identifier `NNN` immediately after the prefix (e.g., `feat-003-…`); otherwise, no numeric identifier is required.
6. Given automation relies on branch names, When a non-conforming name is used, Then there is no automated enforcement (no pre-commit/pre-push/CI blocking); contributors rely on documentation and review to correct names.
7. Given contributors are new to the project, When they read the contribution docs, Then they can quickly find and understand the branch naming rules with examples.

### Edge Cases

-   Maximum branch name length is 60 characters; names longer than this SHOULD be trimmed while keeping meaning.
-   Non-ASCII characters are normalized (accents removed) and non-alphanumerics replaced with single hyphens.
-   Allowed prefixes include: `feat-`, `fix-`, `hotfix-`, `chore-`, `docs-`, `refactor-`, `test-`, `style-`, `perf-`, `build-`, `ci-`, `revert-`, `release-`.
-   Ticket/issue identifiers are optional; if used, prefer formats like `ABC-123` or `#123` appended appropriately (e.g., `feat-landing-cta-ABC-123`).

## Requirements (mandatory)

### Functional Requirements

-   FR-001: The project MUST adopt the following allowed prefixes: `feat-`, `fix-`, `hotfix-`, `chore-`, `docs-`, `refactor-`, `test-`, `style-`, `perf-`, `build-`, `ci-`, `revert-`, `release-`.
-   FR-002: Branch names MUST use meaningful kebab-case descriptors after the prefix (2–4 words recommended), normalize accents, allow only a–z, 0–9 and hyphens, and MUST not exceed 60 characters.
-   FR-003: The current local branch MUST be updated to comply with the convention without altering commit history.
-   FR-004: Project documentation MUST clearly state the convention and include examples for all allowed prefixes.
-   FR-005: No automated enforcement is required (no pre-commit/pre-push/CI blocking); documentation and code review are sufficient.
-   FR-006: The convention SHOULD be consistently applied across all newly created branches going forward (team-wide).
-   FR-007: For branches created via `/specify`, a numeric identifier `NNN` MUST be included immediately after the prefix (e.g., `feat-003-branch-naming-convention`); for other branches, including `NNN` is not required.

## Clarifications

None at this time.

## Review & Acceptance Checklist

### Content Quality

-   [ ] No implementation details (languages, frameworks, APIs)
-   [ ] Focused on user value and business needs
-   [ ] Written for non-technical stakeholders
-   [ ] All mandatory sections completed

### Requirement Completeness

-   [ ] No [NEEDS CLARIFICATION] markers remain
-   [ ] Requirements are testable and unambiguous
-   [ ] Success criteria are measurable
-   [ ] Scope is clearly bounded
-   [ ] Dependencies and assumptions identified

## Execution Status

-   [ ] User description parsed
-   [ ] Key concepts extracted
-   [ ] Ambiguities marked
-   [ ] User scenarios defined
-   [ ] Requirements generated
-   [ ] Entities identified
-   [ ] Review checklist passed
