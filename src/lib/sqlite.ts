// SQLite client for local storage
import { Widget } from "@/components/dashboard/DashboardGrid";
import { WidgetData } from "@/services/widgetService";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Initialize SQLite database
let db: any = null;
let initialized = false;

// Database file path
const DB_FILE_PATH = '/db/dashboard.sqlite';

// Helper function to format widget data from DB
export function formatWidget(data: WidgetData): Widget {
  return {
    ...data,
    tags: Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === "string"
        ? JSON.parse(data.tags)
        : [],
    isProtected: Boolean(data.isProtected),
    customFields: data.customFields ? JSON.parse(data.customFields) : undefined,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  };
}

// Initialize the database
export async function initDatabase(): Promise<boolean> {
  if (!isBrowser) return false;
  if (initialized) return true;

  try {
    // Dynamically import SQL.js
    const SQL = await import("sql.js");
    const sqlPromise = SQL.default({
      locateFile: (file) => `/node_modules/sql.js/dist/${file}`,
    });

    // Try to load database from file
    let initialData = new ArrayBuffer(0);
    try {
      const response = await fetch(DB_FILE_PATH);
      if (response.ok) {
        initialData = await response.arrayBuffer();
      }
    } catch (e) {
      console.error("Failed to load database from file:", e);
    }

    const [SQL_js, buf] = await Promise.all([sqlPromise, Promise.resolve(initialData)]);

    // Create database from stored data or create new if none exists
    db = new SQL_js.Database(
      buf.byteLength > 0 ? new Uint8Array(buf) : undefined,
    );

    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS widgets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        type TEXT NOT NULL CHECK (type IN ('link', 'note', 'credential', 'tagged')),
        tags TEXT,
        url TEXT,
        isProtected INTEGER DEFAULT 0,
        credentialType TEXT,
        customFields TEXT,
        folder_id TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('link', 'note', 'credential', 'tagged', 'all')),
        parent_id TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vault_keys (
        id TEXT PRIMARY KEY,
        key_hash TEXT NOT NULL,
        hint TEXT,
        createdAt TEXT NOT NULL,
        lastUsed TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_widgets_type ON widgets(type);
      CREATE INDEX IF NOT EXISTS idx_widgets_folder ON widgets(folder_id);
      CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
    `);

    // Insert sample data if the database is empty
    let count = 0;
    try {
      const result = db.exec("SELECT COUNT(*) FROM widgets");
      if (result && result[0] && result[0].values && result[0].values[0]) {
        count = result[0].values[0][0];
      }
    } catch (e) {
      // Table doesn't exist yet, count remains 0
    }
    if (count === 0) {
      insertSampleData();
    }

    initialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize SQLite database:", error);
    return false;
  }
}

// Save the database to file
export async function saveDatabase(): Promise<Uint8Array | null> {
  if (!db || !isBrowser) return null;

  try {
    const data = db.export();
    
    // Save to file using API endpoint
    const response = await fetch('/api/save-db', {
      method: 'POST',
      body: data,
    });

    if (!response.ok) {
      throw new Error('Failed to save database to file');
    }

    return data;
  } catch (e) {
    console.error("Failed to save database to file:", e);
    return null;
  }
}

// Insert sample data
function insertSampleData() {
  const now = new Date().toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const sampleData = [
    [
      "widget-1",
      "Important Links",
      "Collection of frequently used websites and resources",
      "link",
      JSON.stringify(["work", "resources"]),
      "https://example.com",
      0,
      null,
      null,
      weekAgo,
      now,
    ],
    [
      "widget-2",
      "Project Notes",
      "Notes for the current dashboard project including requirements and deadlines",
      "note",
      JSON.stringify(["project", "work"]),
      null,
      0,
      null,
      null,
      monthAgo,
      weekAgo,
    ],
    [
      "widget-3",
      "Server Credentials",
      "Login information for the development server",
      "credential",
      JSON.stringify(["server", "security"]),
      null,
      1,
      "server",
      JSON.stringify({
        username: "admin",
        server: "dev.example.com",
        port: "22",
      }),
      monthAgo,
      weekAgo,
    ],
    [
      "widget-4",
      "Personal Tasks",
      "List of personal tasks and reminders",
      "tagged",
      JSON.stringify(["personal", "tasks"]),
      null,
      0,
      null,
      null,
      weekAgo,
      now,
    ],
  ];

  const stmt = db.prepare(`
    INSERT INTO widgets (id, title, content, type, tags, url, isProtected, credentialType, customFields, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleData.forEach((row) => {
    stmt.run(row);
  });

  stmt.free();

  // Insert sample vault key
  db.run(`
    INSERT INTO vault_keys (id, key_hash, hint, createdAt, lastUsed)
    VALUES ('default-key', 'hashed_master_password_would_go_here', 'Your favorite color', '${monthAgo}', '${now}')
  `);
}

// Query functions
export async function queryWidgets(
  query: string,
  params: any[] = [],
): Promise<WidgetData[]> {
  if (!initialized) {
    const success = await initDatabase();
    if (!success) throw new Error("Database not initialized");
  }

  try {
    const stmt = db.prepare(query);
    stmt.bind(params);

    const results: WidgetData[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row as WidgetData);
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error("SQLite query error:", error);
    throw new Error("Failed to query database");
  }
}

// Execute functions (for inserts, updates, deletes)
export async function executeWidgets(
  query: string,
  params: any[] = [],
): Promise<boolean> {
  if (!initialized) {
    const success = await initDatabase();
    if (!success) throw new Error("Database not initialized");
  }

  try {
    const stmt = db.prepare(query);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    return true;
  } catch (error) {
    console.error("SQLite execute error:", error);
    throw new Error("Failed to execute database operation");
  }
}
