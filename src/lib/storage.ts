// Storage utility to determine which database to use
import { Widget } from "@/components/dashboard/DashboardGrid";
import { WidgetData } from "@/services/widgetService";
import * as sqliteDB from "./sqlite";

// Environment variables
const USE_LOCAL_STORAGE = import.meta.env.VITE_USE_LOCAL_STORAGE === "true";
const CF_API_URL = import.meta.env.VITE_CF_API_URL;

// Determine if we should use local storage
let useLocalStorage = USE_LOCAL_STORAGE;

// If API URL is not configured, force local storage
if (!CF_API_URL) {
  useLocalStorage = true;
}

// Initialize the database
export async function initStorage(): Promise<void> {
  if (useLocalStorage) {
    await sqliteDB.initDatabase();
  }
}

// Query function that routes to the appropriate database
export async function queryStorage<T>(
  query: string,
  params: any[] = [],
): Promise<{ success: boolean; results?: T[]; error?: string }> {
  try {
    if (useLocalStorage) {
      const results = await sqliteDB.queryWidgets(query, params);
      return { success: true, results: results as unknown as T[] };
    } else {
      // Cloudflare D1 API call
      const response = await fetch(`${CF_API_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, params }),
      });

      if (!response.ok) {
        throw new Error('Failed to query D1 database');
      }

      const data = await response.json();
      return { success: true, results: data.results };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Execute function that routes to the appropriate database
export async function executeStorage<T>(
  query: string,
  params: any[] = [],
): Promise<{ success: boolean; results?: T[]; error?: string }> {
  try {
    if (useLocalStorage) {
      const success = await sqliteDB.executeWidgets(query, params);
      return { success };
    } else {
      // Cloudflare D1 API call
      const response = await fetch(`${CF_API_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, params }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute D1 database operation');
      }

      const data = await response.json();
      return { success: true, results: data.results };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Helper function to format widget data from DB
export function formatWidget(data: WidgetData): Widget {
  return sqliteDB.formatWidget(data);
}

// Get storage type for UI display
export function getStorageType(): string {
  return useLocalStorage ? "Local SQLite" : "Cloudflare D1";
}

// Toggle storage type (for development/testing)
export function toggleStorageType(): void {
  useLocalStorage = !useLocalStorage;
}
