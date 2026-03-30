# Disappear — Project Structure & Style Guide

## Architecture

### Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript, React 19
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: S3-compatible (Cloudflare R2) — files are private, served via presigned URLs
- **Styling**: Tailwind CSS 3 + shadcn/ui components
- **Theme**: next-themes (dark mode default, class-based)

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout — ThemeProvider, Toaster
│   ├── page.tsx            # Home — upload zone, slug/API/terms buttons
│   ├── globals.css         # CSS variables, dark/light theme tokens
│   ├── docs/page.tsx       # API documentation (client component)
│   ├── terms/page.tsx      # Terms & conditions (server component)
│   ├── viewfile/[id]/      # File info + download page
│   ├── [slug]/route.ts     # Short URL redirect → /viewfile/:id
│   └── api/
│       ├── upload/route.ts       # POST — file upload with encryption support
│       ├── download/[file]/route.ts  # GET — presigned URL redirect or JSON
│       └── slug-check/route.ts   # GET — slug availability check
├── components/
│   ├── ui/                 # shadcn/ui primitives (button, dialog, input, progress, label)
│   ├── Title.tsx           # Terminal-style `> DISAPPEAR` with blinking cursor
│   ├── FileUpload.tsx      # Upload zone + confirmation step (password, options)
│   ├── FileDownload.tsx    # MEGA-style in-browser download with progress/speed
│   ├── SuccessDialog.tsx   # Post-upload modal with URLs + QR code
│   └── SlugDialog.tsx      # Custom slug input dialog
├── db/
│   ├── index.ts            # Lazy db() singleton (Drizzle + postgres.js)
│   ├── schema.ts           # Drizzle schema — uploadedFiles table
│   └── functions/          # DB query functions (get, save, slugAvailable)
├── s3/
│   ├── connect.ts          # Lazy S3Client singleton
│   └── functions/          # uploadFile, getPresignedUrl
├── upload/
│   └── uploadFile.ts       # Upload orchestrator (S3 + DB save)
└── lib/
    ├── utils.ts            # cn() — clsx + tailwind-merge
    ├── crypto.ts           # AES-256-GCM encryption/decryption (Web Crypto API)
    └── file-utils.ts       # stripMetadata (canvas re-encode), randomizeFileName
```

### Data Flow

**Upload**: FileUpload.tsx → (encrypt?) → XHR POST /api/upload → uploadFile.ts → S3 + DB
**Download**: FileDownload.tsx → GET /api/download/:id?raw=1 → presigned URL → XHR fetch → (decrypt?) → blob save
**Short URLs**: GET /:slug → DB lookup → redirect to /viewfile/:id

### Database Schema
```
uploadedFiles:
  id              UUID (PK, auto-generated)
  originalName    text (not null)
  mimeType        text (not null)
  size            bigint (not null)
  fileKey         text (not null) — S3 object key
  uploadedAt      integer (not null) — Unix timestamp seconds
  slug            text (unique, nullable)
  isEncrypted     integer (nullable) — 1 if encrypted
  encryptionSalt  text (nullable) — hex 16-byte PBKDF2 salt
  encryptionIv    text (nullable) — hex 12-byte AES-GCM IV
```

### Key Patterns
- **Lazy singletons**: `db()` and `connectS3()` are lazy functions to avoid build-time env var crashes
- **Client-side encryption**: Password never leaves the browser. Salt/IV stored in DB (not secret)
- **Presigned downloads**: Server generates 1hr presigned S3 URL, client fetches the blob directly
- **Download caching**: Encrypted file data is cached in a ref — wrong password retries don't re-download

---

## Style Guide

### Design Philosophy
Inspired by the Better Auth website aesthetic — **terminal-like, flat, brutalist**. No decoration, no softness, pure function.

### Core Principles
1. **Zero border radius** — everything is sharp square edges (`--radius: 0px`)
2. **No shadows** — no box-shadow, no drop-shadow, no glow effects anywhere
3. **No gradients** — flat solid colors only
4. **Monospace everywhere** — all UI text uses `font-mono` (JetBrains Mono)
5. **Lowercase text** — all labels, buttons, descriptions are lowercase
6. **Minimal color** — grayscale only, no accent colors. The dark theme uses zinc-based HSL values
7. **Thin borders** — 1px solid `border-border` for structure, dashed for drop zones
8. **Dense, information-rich** — small text (`text-xs`), tight spacing, no wasted space

### Typography
- **Font stack (mono)**: JetBrains Mono → Geist Mono → Fira Code → SF Mono → monospace
- **Font stack (sans)**: Geist → Inter → Fig Tree → system-ui (used on `<body>` only)
- **Almost all visible text** uses `font-mono text-xs`
- **Labels/descriptions**: `text-muted-foreground` (50% gray)
- **Primary text**: `text-foreground` (93% white in dark)
- **Titles**: uppercase, `tracking-wider`, `font-semibold`
- **The Title component**: `> disappear` with a blinking cursor block — terminal prompt style

### Colors (Dark Theme)
```
Background:       hsl(0 0% 3%)    — near-black
Foreground:       hsl(0 0% 93%)   — off-white
Card:             hsl(0 0% 5%)    — slightly lighter black
Border:           hsl(0 0% 14%)   — subtle dark gray
Muted foreground: hsl(0 0% 50%)   — mid gray for secondary text
```
All colors are achromatic (zero saturation). The only exception is `destructive` for error states.

### Components
- **Buttons**: `font-mono font-medium`, no rounded corners, no shadows. Ghost variant for navigation links
- **Inputs**: `font-mono`, no rounded corners, no shadow, `focus:border-foreground/30`
- **Progress bar**: 1px height, `bg-border` track, `bg-foreground` indicator, no rounded ends
- **Dialogs**: No rounded corners, no ring/glow on close button, uppercase mono tracking title
- **Borders**: Always `border-border` (1px). Use `divide-y divide-border` for sectioned cards
- **Checkboxes**: Custom square toggles (not native `<input>`), `bg-foreground` when checked with `Check` icon

### Layout
- **Home page**: `h-dvh` centered, `px-6 sm:px-8` horizontal padding
- **Content pages** (docs, terms, viewfile): `min-h-dvh`, `py-12`, `max-w-xl mx-auto`
- **Cards/sections**: `border border-border` with `divide-y divide-border` for rows
- **Key-value pairs**: `flex justify-between text-xs font-mono` with label as `text-muted-foreground`
- **Dialogs**: `w-[calc(100%-2rem)] max-w-lg`, `overflow-x-hidden`

### Icons
- Lucide React icons, sized `h-3 w-3` to `h-5 w-5`
- Always `text-muted-foreground` unless active/interactive
- Common: Upload, FileUp, Download, Lock, Shield, Check, Copy, ExternalLink, Link2, Code2, ScrollText

### Toast Notifications
- Sonner toaster, `position="bottom-center"`
- Dark background (`hsl(0 0% 5%)`), 1px border, 0px radius, mono font
- Short lowercase messages: "upload complete", "slug set: xyz", "wrong password — try again"

### What NOT to Do
- Do not add `rounded-*` classes to anything
- Do not add `shadow-*` or `ring-*` classes
- Do not use colors outside the grayscale palette
- Do not use uppercase except for section titles and the Title component
- Do not use large text — `text-xs` is the default, `text-sm` is the max for headings
- Do not add hover glow/highlight effects — use `border-foreground/20` or `text-foreground` transitions
- Do not add emojis to the UI
- Do not add animations except `animate-pulse` on loading indicators
