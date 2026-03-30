# Disappear

Temporary file hosting — files vanish after 24 hours.

Live at [dspr.lol](https://dspr.lol)

## Stack

- Next.js 16 (Turbopack)
- React 19
- PostgreSQL + Drizzle ORM
- S3-compatible storage (Cloudflare R2, AWS S3, MinIO, etc.)
- Cloudflare Turnstile (captcha for large uploads)
- Tailwind CSS + shadcn/ui

## Setup

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL database
- S3-compatible bucket (files should be private)

### 1. Clone and install

```bash
git clone https://github.com/imalfect/disappear-file-hosting
cd disappear-file-hosting
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Database (required)
DATABASE_URL=postgresql://user:password@localhost:5432/disappear

# S3 storage (required)
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# Cloudflare Turnstile (optional — captcha for uploads >100MB)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# Branding (optional)
NEXT_PUBLIC_SERVICE_NAME=disappear
```

#### Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `S3_ENDPOINT` | Yes | S3-compatible endpoint URL |
| `S3_ACCESS_KEY_ID` | Yes | S3 access key |
| `S3_SECRET_ACCESS_KEY` | Yes | S3 secret key |
| `S3_BUCKET` | Yes | Bucket name for file storage |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No | Cloudflare Turnstile site key (enables captcha for files >100MB) |
| `TURNSTILE_SECRET_KEY` | No | Cloudflare Turnstile secret key (server-side verification) |
| `NEXT_PUBLIC_SERVICE_NAME` | No | Service name shown in the UI and page title (default: `disappear`) |

### 3. Set up the database

Push the schema to your database:

```bash
npm run db:push
```

Or use migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Build and start

```bash
npm run build
npm start
```

The app runs on port 5010 by default.

## Development

```bash
npm run dev
```

### Database commands

| Command | Description |
|---|---|
| `npm run db:push` | Push schema changes directly to the database |
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

## How it works

- Files are uploaded via XHR with real-time progress tracking
- Stored in an S3-compatible bucket with private ACL
- Downloads use presigned URLs (1 hour expiry) — the server generates a temporary link and redirects, so files are served directly from S3
- Uploads over 100MB require Turnstile captcha verification (if configured)
- Client-side rate limiting: 5 uploads per 10 minutes
- Maximum file size: 2GB
- Files expire after 24 hours

## License

See [LICENSE](LICENSE).
