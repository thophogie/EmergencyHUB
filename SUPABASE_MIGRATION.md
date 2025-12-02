# Supabase Migration Complete ✅

## What Changed

Your database has been successfully migrated from **Neon** to **Supabase**:

### Dependencies
- ❌ Removed: `@neondatabase/serverless`
- ✅ Added: `postgres` (^3.4.4) - database driver
- ✅ Added: `@supabase/supabase-js` (^2.45.4) - optional, for auth/realtime

### Configuration Files
1. **server/db.ts** - Now uses `postgres` driver with Drizzle ORM
2. **drizzle.config.ts** - Updated error messages for Supabase
3. **.env.local** - Updated with Supabase connection template

## Setup Instructions

### Step 1: Get Your Supabase Connection String

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings → Database → Connection string**
4. Copy the PostgreSQL connection string (should start with `postgresql://`)

### Step 2: Update .env.local

Replace the placeholder in `.env.local` with your actual Supabase connection string:

```bash
DATABASE_URL=postgresql://postgres:[your-password]@db.[project-id].supabase.co:5432/postgres?sslmode=require
```

**Find these values from Supabase:**
- `[your-password]` - Your database password (shown when you first created the project)
- `[project-id]` - Your project ID (visible in the URL: supabase.com/project/`[project-id]`)
- Full string format: `postgresql://postgres.XXXX:[PASSWORD]@db.XXXX.supabase.co:5432/postgres?sslmode=require`

### Step 3: Run Database Migrations

Push your schema to Supabase:

```bash
npm run db:push
```

### Step 4: Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000` with Vite hot reloading.

## Important Notes

### Connection Requirements
- Supabase uses SSL by default (required parameter: `sslmode=require`)
- The connection uses PostgreSQL's standard TCP connection
- No special client library needed beyond `postgres-js`

### Database Pool (Optional)
If you need connection pooling, Supabase recommends using their PgBouncer connection string (available in the Connection String dropdown).

### Environment Variables
You can optionally set these Supabase-specific variables (currently in .env.local):
```
PGDATABASE=postgres
PGHOST=db.[project-id].supabase.co
PGPORT=5432
PGUSER=postgres
PGPASSWORD=[your-password]
```

But the main `DATABASE_URL` is all that's required.

## Troubleshooting

### "Failed to connect to database"
- ✓ Check DATABASE_URL is correctly set
- ✓ Verify password is correct (check Supabase settings)
- ✓ Ensure `?sslmode=require` is in the URL
- ✓ Try connecting from Supabase's SQL Editor first to test the connection

### "Column/table does not exist"
- Run `npm run db:push` to migrate your schema to Supabase

### TypeScript errors about postgres module
- Already fixed! The import is now compatible with ESModuleInterop

## Testing the Connection

Once configured, you can test the connection:

```bash
# Start the server
npm run dev

# In another terminal, check if it connects
curl http://localhost:5000/api/incidents
```

If you see a response (even if it's an empty array), the database connection is working!

## Rollback to Neon (if needed)

If you need to go back to Neon:

1. Restore `@neondatabase/serverless` to package.json
2. Update server/db.ts to use neon-http
3. Update DATABASE_URL to your Neon connection string
4. Run `npm install` and restart

## Next Steps

1. ✅ Update `.env.local` with your Supabase credentials
2. ✅ Run `npm run db:push` to push schema
3. ✅ Run `npm run dev` to start development
4. Test your API endpoints to confirm everything works
