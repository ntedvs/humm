# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Humm is a pitch deck collaboration platform for Active Angels investment group. Teams upload company pitch decks (PDFs), which are automatically analyzed by Claude AI into structured investment summaries. Members collaborate with role-based access control.

**Stack**: Next.js 16 + React 19, PostgreSQL (Neon), Drizzle ORM, BetterAuth, AWS S3, Anthropic Claude API

## Development Commands

```bash
# Development server (localhost:3000)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint

# Database migrations
pnpm drizzle generate   # Generate migration from schema changes
pnpm drizzle migrate    # Run pending migrations
pnpm drizzle studio     # Open Drizzle Studio for database inspection
```

## Architecture & Key Patterns

### Database Schema Structure

Schema is split across two files in `src/drizzle/`:
- `auth.ts` - BetterAuth managed tables (user, session, account, verification)
- `app.ts` - Application tables (company, upload, relation, activity)

**Critical relationships**:
- `relation` table has unique constraint on `(companyId, userId)` - prevents duplicate memberships
- All foreign keys use cascade deletes except `upload.userId` (set null to preserve history)
- Activity logging uses `jsonb` metadata field with typed schema

### Permission System

Role hierarchy: `viewer < editor < owner`

**Permission utilities** (`src/utils/permissions.ts`):
- `requireCompanyAccess(userId, companyId, minRole)` - Throws if insufficient permissions (use in server actions)
- `getRole(userId, companyId)` - Returns user's role or null
- `canDelete(userId, companyId, uploaderId)` - Special case: owners OR original uploader can delete files

**Enforce permissions in server actions**:
```typescript
const session = await protect()
await requireCompanyAccess(session.user.id, companyId, "editor")
```

### Server Actions Pattern

All mutations use Next.js server actions (`actions.ts` files). Common pattern:

1. Call `protect()` for auth (or `protect(true)` for admin-only)
2. Call `requireCompanyAccess()` for company-scoped actions
3. Perform business logic
4. Log activity via `logActivity()` helper
5. `revalidatePath()` to refresh UI

### AI Analysis Flow

**File upload → analysis pipeline** (`src/app/[slug]/upload/page.tsx` and `src/lib/ai.ts`):

1. File uploaded via server action (50MB limit configured in `next.config.ts`)
2. Upload record created with `processed: null`
3. Claude PDF analysis called with structured output tool forcing
4. Results parsed into 5-section summary + structured fields (description, stage, valuation, askingAmount)
5. Company table updated if structured fields exist and are currently null
6. Upload marked with `processed` timestamp or `error` field

**Analysis format**: Exactly 5 markdown sections (Overview, Problem & Solution, Product & Market Traction, Team & Differentiators, Financials & Outlook), each one paragraph. No bullet points or em dashes.

### Activity Logging

All significant actions logged to `activity` table via `src/utils/activity.ts`:
- File uploads/deletes
- Member additions/removals
- Role changes

Metadata field structure varies by activity type - see `activityTable` schema for typed metadata shape.

### Authentication Flow

- BetterAuth with email/password
- Admin plugin enabled for global admin role
- `protect()` helper in `src/utils/server.ts` handles auth + redirects
- Session accessed via `auth.api.getSession({ headers })`

### File Storage

AWS S3 via `@aws-sdk/client-s3`:
- Bucket structure: `{uploadId}.{extension}`
- Presigned URLs for downloads (7-day expiry)
- Files stored separately from metadata (upload table only has reference)

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth session secret
- `BETTER_AUTH_URL` - Auth callback URL (http://localhost:3000 for dev)
- `STORAGE_ID` - AWS access key ID
- `STORAGE_SECRET` - AWS secret access key
- `ANTHROPIC_API_KEY` - Claude API key

## Import Aliases

TypeScript configured with `@/*` alias mapping to `src/*`:
```typescript
import { db } from "@/lib/drizzle"
import { companyTable } from "@/drizzle/app"
```

## Database Migrations

Schema changes workflow:
1. Edit schema in `src/drizzle/app.ts` or `src/drizzle/auth.ts`
2. Run `pnpm drizzle generate` to create migration SQL
3. Review generated SQL in `src/drizzle/migrations/`
4. Run `pnpm drizzle migrate` to apply

Migrations are stored in `src/drizzle/migrations/` and tracked in `_journal.json`.

## Type Safety Notes

- Drizzle schema exports inferred types: `Upload`, `Relation`, `Activity`
- Server actions must be marked `"use server"`
- Client components must be marked `"use client"`
- React 19 uses new `react-jsx` transform (no React imports needed)