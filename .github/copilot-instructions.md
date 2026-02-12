# Copilot Instructions for Upload Image App

## Project Architecture

This is a **Next.js 16 full-stack application** for image upload management with the following architecture:

```
Client (React Components) 
  → Server Actions (Next.js "use server")
    → Image Service Layer
      → Prisma ORM
      → File System (public/uploads/)
```

- **Framework**: Next.js 16 with React 19, using App Router
- **Database**: SQLite with Prisma ORM (see `prisma/schema.prisma`)
- **Styling**: Tailwind CSS v4 + shadcn/ui components + Radix UI primitives
- **Storage**: Physical file system at `public/uploads/` + database metadata in `Images` table

## Key Workflows

### Image Upload Flow
1. User fills form in `UploadFileCard` component (client-side preview)
2. Form submitted via Server Action: `uploadImageAction()` → calls `uploadImage()` service
3. Service layer (`src/services/images.service.ts`):
   - Validates: title, file exists, is image, size ≤ 5MB
   - Saves file to `public/uploads/` with timestamp-UUID naming
   - Creates DB record with metadata (title, filename, mimeType, size)
4. Errors return `{ error: string }` object to client for alert display

### Image Deletion Flow
1. Delete button triggers `deleteImageAction()` Server Action
2. Verifies image exists in DB and filesystem before deletion
3. Deletes DB record then filesystem file (atomic checks prevent orphans)
4. Returns error if DB record or file missing

### Data Retrieval
- API endpoint `GET /api/images/` returns all images from DB via `getImages()` service
- Display page (`src/app/display/page.tsx`) likely fetches and renders images

## Development Commands

```bash
npm run dev          # Start Next.js dev server with Webpack (port 3000)
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint (configured in eslint.config.mjs)
prisma migrate dev   # Create/apply migrations after schema changes
prisma studio       # GUI to inspect/edit database
```

**Important**: Always use `npm run dev` with `--webpack` flag (configured in package.json) - do not use Turbopack.

## Database & Prisma Patterns

- **Schema location**: `prisma/schema.prisma` defines `Images` model
- **Singleton pattern**: `src/lib/prisma.ts` implements PrismaClient singleton to prevent connection pooling issues in development
- **Recent migrations**: 
  - `20251220021307_init`: Initial schema
  - `20260102004029_mime_type`: Added mimeType field
- **After schema changes**: Run `prisma migrate dev --name <description>` to create and apply migrations

## File Organization & Key Files

| Path | Purpose |
|------|---------|
| `src/services/images.service.ts` | Core business logic: upload validation, file I/O, DB operations |
| `src/app/actions/` | Server Actions (uploadImage.ts, deleteImage.ts) - thin wrappers around service |
| `src/components/UploadFileCard.tsx` | Main upload UI with preview; manages form submission |
| `src/app/api/images/route.ts` | GET endpoint for retrieving all images |
| `src/lib/prisma.ts` | Prisma client singleton |
| `public/uploads/` | Uploaded image files stored here (created dynamically) |

## Code Patterns & Conventions

### Server Actions & Form Handling
- Use `"use server"` directive in action files
- Actions wrapped in try-catch return `{ error?: string }` or void
- Client-side form submission alerts on error: `if (result?.error) alert(result.error)`

### File Naming
- Uploaded files: `{timestamp}-{uuid}.{extension}` (e.g., `1672531200000-abc123def-456.jpg`)
- Prevents collisions and makes files sortable

### Error Handling
- Service layer catches errors and returns error objects (avoid throwing)
- DB record created only after successful file write
- On DB creation failure, uploaded file is cleaned up with `unlink()`

### Component Patterns
- Use shadcn/ui for components (Button, Card, Label)
- Server components by default; add `"use client"` only for interactivity
- Import from `@/` path aliases (configured in tsconfig.json)

## Configuration Notes

- **Server Actions body limit**: 5MB (configured in next.config.ts)
- **React Strict Mode**: Disabled (reactStrictMode: false) - prevent double mounts in dev
- **Image MIME type validation**: Checked with `file.type.startsWith('image/')`
- **Database URL**: Set via `DATABASE_URL` environment variable (default: local SQLite)

## Common Tasks

**Add new image metadata field**: Update `prisma/schema.prisma` Images model → `prisma migrate dev --name add_field` → update TypeScript `ImageType` interface in `src/types/image.ts`

**Change file size limit**: Modify 5MB check in `src/services/images.service.ts` AND `serverActions.bodySizeLimit` in next.config.ts (keep in sync)

**Debug database state**: Run `npx prisma studio` to inspect Images table visually

**Check file upload errors**: Service logs to console - check `npm run dev` terminal for "UPLOAD CALLED" and error messages

# Error Handling Instructions
Please ensure that all potentially error-prone code uses try/catch blocks for error handling. If not, please add try/catch blocks for me.

# Form Actions Instructions
If you find some forms in tsx have no actions, please add actions for them. The actions should be in the `src/app/actions/` directory and should hanle the form submission logic, including any necessary validation and database interactions. Make sure to follow the existing patterns for Server Actions in Next.js, using the `"use server"` directive and returning appropriate error messages if validation fails.

# File System Cleanup Instructions
If there is an image has been deleted, please make sure that the image has been also deleted from the file system. You can use the `fs` module to check if the file exists and delete it if necessary. This will help prevent orphaned files from taking up space on the server.

# Image Validation Instructions
Please check every image that the users upload, if it's unsafe for the server, please prevent the upload and return an appropriate error message. You can use libraries like `file-type` to validate the file type and ensure it matches the expected image formats.