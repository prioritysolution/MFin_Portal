<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# MFIN Portal Project Rules

## Project Architecture

- This is a production Next.js application.
- Follow `PROJECT_BLUEPRINT.md` before making architectural changes.
- Follow the rules in `.cursor/rules/`.
- Do not create fake APIs or mock backend responses unless explicitly requested.
- Backend is Laravel.
- Use the BFF architecture for authentication and protected API communication.

## Before Modifying Code

1. Inspect the existing implementation.
2. Read the relevant `.cursor/rules/*.mdc` file.
3. Check `PROJECT_BLUEPRINT.md`.
4. Reuse existing components, services, types, and utilities.
5. Do not create duplicate implementations.

## Authentication

- Authentication is handled through the BFF.
- Do not expose authentication tokens to client-side JavaScript.
- Use the existing encrypted `httpOnly` session cookie mechanism.
- Do not implement a second authentication mechanism.

## API Rules

- Do not invent API endpoints.
- Follow the Laravel API contract.
- Keep API mapping inside the appropriate feature/service layer.
- Validate API responses where required.

## UI Rules

- Reuse shared components from `src/components/shared`.
- Follow the existing design tokens.
- Keep responsive behavior consistent with the existing application.
- Do not introduce a new UI library without approval.

## Internationalization

Supported locales:

- `en`
- `bn`
- `hi`
- `or`

All user-facing text should use the existing i18n system.

## Code Quality

Before considering a change complete:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build