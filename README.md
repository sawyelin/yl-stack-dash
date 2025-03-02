# SecureVault - Personal Dashboard Management System

## Overview

SecureVault is a comprehensive personal dashboard for organizing and managing digital assets with a clean, modern interface. It allows you to store and organize links, notes, credentials, and tagged items in a secure, user-friendly environment.

## Features

- **Card-based Dashboard**: Organize your digital assets in a visually appealing grid layout
- **Multiple Item Types**: Store links, notes, credentials, and tagged items
- **Secure Credential Storage**: Password-protect sensitive information
- **Drag & Drop Organization**: Easily rearrange your dashboard items
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred theme
- **Custom Color Themes**: Personalize your dashboard appearance
- **Tag-based Organization**: Filter items by tags for quick access
- **Search Functionality**: Find items quickly with the search feature

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
npm run preview
```

## Storage Options

SecureVault supports two storage options:

### 1. Local SQLite Storage (Default)

By default, the application uses SQL.js to store data in the browser. This requires no additional setup and works entirely client-side.

**Benefits:**
- No server required
- Works offline
- Data stays on the user's device

### 2. Cloudflare D1 Integration

For persistent cloud storage, you can connect to Cloudflare D1.

#### Setup Steps:

1. **Create a D1 Database**
   ```bash
   wrangler d1 create securevault-db
   ```

2. **Initialize the Schema**
   ```bash
   wrangler d1 execute securevault-db --file=./schema.sql
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file with:
   ```
   VITE_USE_LOCAL_STORAGE=false
   VITE_CF_API_URL=https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID
   VITE_CF_API_TOKEN=YOUR_API_TOKEN
   VITE_CF_DATABASE_ID=YOUR_D1_DATABASE_ID
   ```

## Usage Guide

### Adding Items

1. Click the "+" button in the bottom right corner
2. Select the item type (Link, Note, Credential, or Tagged Item)
3. Fill in the required information
4. Add tags for organization
5. Click "Add Item"

### Managing Credentials

1. Toggle "Password Protected" when creating credential items
2. When accessing protected credentials, enter the vault key
3. View and copy the decrypted information

### Organizing Your Dashboard

1. Drag and drop items to rearrange them
2. Use the sidebar to filter by type or tag
3. Use the search bar to find specific items

### Customizing Appearance

1. Toggle between dark and light mode using the theme switch
2. Select a color theme from the settings panel

## Mobile Support

SecureVault is fully responsive and optimized for mobile devices:

- Bottom navigation bar for quick access to categories
- Slide-out sidebar for additional options
- Optimized modals and forms for touch input
- Floating action button for adding new items

## Switching Storage Types

You can toggle between storage options within the application:

1. Open the settings panel in the sidebar
2. Find the "Storage" section
3. Click the "Toggle" button to switch between Local SQLite and Cloudflare D1

**Note:** When switching storage types, your data will not be transferred between systems.

## Technical Details

- Built with React, TypeScript, and Vite
- Uses Tailwind CSS for styling
- Implements shadcn/ui components
- Drag and drop powered by dnd-kit
- Storage abstraction layer for multiple backends

## License

MIT
