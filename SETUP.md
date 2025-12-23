# Setup Guide

## Prerequisites

1. **Database Setup**: Your Supabase database tables are already created.
2. **Environment Variables**: Create a `.env` file in the root directory:

```env
DATABASE_URL="your_supabase_connection_string"
DIRECT_URL="your_supabase_direct_connection_string"
VITE_API_BASE="http://localhost:3001/api"
```

## Installation Steps

1. **Install Dependencies**:
```bash
npm install
```

2. **Generate Prisma Client**:
```bash
npx prisma generate
```

3. **Start the API Server** (in one terminal):
```bash
npm run dev:server
```

4. **Start the Vite Dev Server** (in another terminal):
```bash
npm run dev
```

Or run both together:
```bash
npm run dev:all
```

## Project Structure

- `actions/` - Server actions (Prisma database operations)
- `components/` - React components (now fetch data from API)
- `lib/` - Utilities (Prisma client, API client)
- `server/` - Express API server
- `prisma/` - Prisma schema

## Notes

- All components now fetch data from the database via the API
- User ID is hardcoded to `"user_01"` (update in `actions/*.ts` when auth is added)
- The API server runs on port 3001 by default
- The Vite dev server runs on port 3000

## Migration to Next.js

When ready to migrate to Next.js:
1. Add `"use server"` directive to all files in `actions/`
2. Remove the Express server (`server/` folder)
3. Update imports to use direct server action calls instead of API client
4. The structure is already set up for easy migration!

