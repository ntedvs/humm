# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Humm is a company-based file management application where authenticated users can upload, organize, and access files across different companies. Files are categorized as "material" or "work" and stored in AWS S3.

**Access Model**: All authenticated users can view and download files from any company. Authentication is required for all routes except sign-in.

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Database operations
npm run drizzle generate    # Generate migrations from schema
npm run drizzle migrate     # Run migrations
npm run drizzle studio      # Open Drizzle Studio (DB GUI)
npm run drizzle push        # Push schema changes directly (dev only)
```

## Architecture

### Database Schema Structure

The application uses **two separate schema files** in `src/drizzle/`:

1. **`auth.ts`** - Better Auth tables (user, session, account, verification)
2. **`app.ts`** - Application tables (company, upload)

Both schemas must be referenced in `drizzle.config.ts` for migrations to work. The config uses `schema: "src/drizzle"` to include all schema files.

### Authentication Pattern

All route protection uses the `protect()` utility from `src/utils/server.ts`:

```typescript
// Regular auth protection
const session = await protect()

// Admin-only protection
const session = await protect(true)
```

**Do not use** `auth.api.getSession()` directly. Always use `protect()`.

### File Storage Pattern

Files are stored in S3 with the key pattern: `{company-slug}/{upload-id}.{extension}`

File downloads use **signed URLs** (1-hour expiration) generated via the `sign()` server action in `src/app/[slug]/actions.ts`. The action requires authentication via `protect()`.

### Server Actions

Server actions are used extensively for:

- Form submissions (company creation, file upload, user invite)
- Generating S3 signed URLs
- Authentication operations

All server actions that modify data or access protected resources must call `protect()` at the start.

### Database Relationships

- **Company** → has many → **Uploads** (cascade delete)
- **User** → has many → **Uploads** (set null on delete)
- **Upload** has fields: `name`, `type` (material|work), `extension`, `companyId`, `userId`

Company slugs are auto-generated using `@sindresorhus/slugify` and must be unique.

## Environment Variables

Required in `.env`:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `STORAGE_ID` - AWS access key ID
- `STORAGE_SECRET` - AWS secret access key
- Better Auth variables (auto-configured)

## Key Technical Details

- **Next.js 16** with App Router (all routes are Server Components)
- **Better Auth** handles authentication with email/password and admin plugin
- **Drizzle ORM** with relational queries (use `db.query` API for nested data)
- **File type detection** uses `file-type` library, falls back to user-provided extension
- **S3 bucket** is hardcoded as `"humm-bucket"` in upload and sign actions
- **AWS region** is hardcoded as `"us-east-1"` in `src/lib/storage.ts`
