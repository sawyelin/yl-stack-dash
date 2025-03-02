# Dashboard Management System

## Cloudflare D1 Integration

This project uses Cloudflare D1 as its database. Follow these steps to set up the database:

### 1. Create a D1 Database

If you have Cloudflare Wrangler CLI installed:

```bash
wrangler d1 create dashboard-db
```

Or create a database through the Cloudflare Dashboard.

### 2. Initialize the Schema

Use the provided schema.sql file to initialize your database:

```bash
wrangler d1 execute dashboard-db --file=./schema.sql
```

### 3. Configure Environment Variables

Copy the .env.example file to .env.local and fill in your Cloudflare credentials:

```
VITE_CF_API_URL=https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID
VITE_CF_API_TOKEN=YOUR_API_TOKEN
VITE_CF_DATABASE_ID=YOUR_D1_DATABASE_ID
```

- `YOUR_ACCOUNT_ID`: Your Cloudflare account ID
- `YOUR_API_TOKEN`: A Cloudflare API token with D1 permissions
- `YOUR_D1_DATABASE_ID`: The ID of your D1 database

### 4. Run the Application

```bash
npm run dev
```

## API Documentation

The application uses the following Cloudflare D1 endpoints:

- `GET /d1/query` - For read operations
- `POST /d1/execute` - For write operations

These are wrapped in service functions in `src/services/widgetService.ts`.
