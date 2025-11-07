# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Humm is a Next.js application for angel investment groups to manage and analyze pitch decks. It provides multi-tenant company workspaces where team members can upload materials (pitch decks) and work files, with automatic AI-powered analysis of PDF pitch decks using Claude.

## Development Commands

```bash
# Development
pnpm dev              # Start Next.js dev server
pnpm build            # Build production bundle
pnpm start            # Run production server
pnpm lint             # Run ESLint

# Database
pnpm drizzle generate # Generate migrations from schema changes
pnpm drizzle migrate  # Apply pending migrations
pnpm drizzle studio   # Open Drizzle Studio (database GUI)
```

## Architecture

### Multi-Tenant Data Model

The app uses a company-based multi-tenancy model with role-based access control:

- **Companies** (workspace level) - Each has a unique slug for routing
- **Relations** (membership table) - Links users to companies with roles: `owner` > `editor` > `viewer`
- **Uploads** (files) - Belong to companies, categorized as `material` (pitch decks) or `work` (internal files)

Key constraint: `relationTable` has a unique constraint on `(companyId, userId)` to prevent duplicate memberships.

### Authentication & Authorization

- Uses `better-auth` with email/password authentication
- Admin plugin enabled for system-level privileges (creating companies)
- Authorization pattern: Always call `protect()` in server components/actions, then `requireCompanyAccess()` for company-specific operations
- Permission utilities in `src/utils/permissions.ts` implement role hierarchy checks

Example flow:

```typescript
const session = await protect()           // Ensure authenticated
await requireCompanyAccess(               // Ensure company access
  session.user.id,
  company.id,
  "editor"  // minimum required role
)
```

### Server Actions Pattern

This codebase uses Next.js Server Actions extensively (inline `"use server"` forms in RSCs). Key patterns:

1. **Form actions are inline** in page components, not separate files (except shared actions in `actions.ts`)
2. **Always revalidate permissions** in the action even if the page already checked (security)
3. **Redirect after mutations** using Next's `redirect()` function
4. Actions that fail throw errors - Next.js handles displaying them to users

### File Storage & Processing

Files are uploaded to AWS S3 with the key pattern: `{company-slug}/{upload-id}.{extension}`

PDF processing flow:

1. File uploaded via Server Action in `src/app/[slug]/upload/page.tsx`
2. Database record created immediately (shows "Analyzing..." state)
3. PDF buffer passed to `analyzePitchDeck()` which calls Claude API with document vision
4. Summary saved to `uploadTable.summary` or error saved to `uploadTable.error`
5. UI shows summary modal or error state based on result

File downloads use pre-signed S3 URLs generated via the `sign()` action in `src/app/[slug]/actions.ts` (expires in 1 hour).

### Database Schema Organization

Drizzle ORM schema split across two files:

- `src/drizzle/auth.ts` - better-auth tables (user, session, account, verification)
- `src/drizzle/app.ts` - application tables (company, upload, relation)

When modifying schema:

1. Edit the schema files
2. Run `pnpm drizzle generate` to create migration SQL
3. Run `pnpm drizzle migrate` to apply (or let app auto-apply on startup)
4. Migrations stored in `src/drizzle/migrations/`

### Styling System

Uses Tailwind CSS 4 with custom design tokens defined in `src/styles/base.css`:

- Custom color palette (deep indigo theme) defined in `@theme`
- Component classes (`.btn`, `.card`, `.input`, etc.) in `@layer components`
- Colors exposed as CSS custom properties: `--color-primary`, `--color-text`, etc.

When adding UI components, prefer using the existing component classes over recreating styles.

### Route Structure

```
/                           - User's company list
/new                        - Create company (admin only)
/invite                     - Accept company invitation
/signin                     - Authentication
/[slug]                     - Company dashboard (materials & work files)
/[slug]/upload              - Upload file form
/[slug]/members             - Team management (owner only)
/api/auth/[...]             - better-auth API routes
```

All company routes (`/[slug]/*`) require permission checks against the company accessed.

## Environment Variables

Required environment variables (stored in `.env`):

- `DATABASE_URL` - Neon PostgreSQL connection string
- `STORAGE_ID` - AWS access key ID
- `STORAGE_SECRET` - AWS secret access key
- `ANTHROPIC_API_KEY` - Claude API key (SDK auto-reads this)
- `BETTER_AUTH_SECRET` - better-auth session secret
- `BETTER_AUTH_URL` - Application URL (for auth callbacks)

## Key Implementation Details

### AI Analysis Prompt

The pitch deck analysis prompt in `src/lib/ai.ts` is specifically tailored for Active Angels investment group and generates a 5-section one-page summary. If customizing for other use cases, modify the `ANALYSIS_PROMPT` constant.

### Company Slug Generation

Company slugs are auto-generated from names using `@sindresorhus/slugify`. There's currently no collision handling - if a slug exists, the insert will fail. Consider adding collision handling if companies can be created by non-admin users.

### Member Management Rules

- Companies must always have at least one owner (enforced in remove member action)
- Adding members requires knowing their email (they must have an account)
- Role changes use a separate `RoleSelect` component with its own Server Action

### Upload Body Size

Next.js config sets `serverActions.bodySizeLimit` to 50mb to accommodate large file uploads.
