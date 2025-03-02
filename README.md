# Dashboard Management System

## Storage Options

This project supports two storage options:

1. **Local SQLite Storage** - Data is stored in the browser using SQL.js
2. **Cloudflare D1** - Data is stored in Cloudflare's D1 database service

## Local SQLite Setup

By default, the application uses local SQLite storage. No additional setup is required.

## Cloudflare D1 Integration

To use Cloudflare D1 as your database, follow these steps:

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

Copy the .env.example file to .env.local and update the configuration:

```
# Set to "false" to use Cloudflare D1 instead of local storage
VITE_USE_LOCAL_STORAGE=false

# Cloudflare D1 Configuration
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

## Switching Storage Types

You can switch between storage types in the application:

1. Open the settings panel in the sidebar
2. Find the "Storage" section
3. Click the "Toggle" button to switch between local SQLite and Cloudflare D1

Note: When switching storage types, your data will not be transferred between storage systems.

## API Documentation

The application uses a unified storage API that abstracts the underlying storage mechanism:

- For Cloudflare D1: Uses the Cloudflare API endpoints
- For Local SQLite: Uses SQL.js to store data in the browser

All database operations are wrapped in service functions in `src/services/widgetService.ts`.
