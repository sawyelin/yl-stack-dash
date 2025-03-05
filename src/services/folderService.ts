import { executeStorage, queryStorage } from "@/lib/storage";

export interface Folder {
  id: string;
  name: string;
  type: "link" | "note" | "credential" | "tagged" | "all";
  parent_id: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FolderData extends Omit<Folder, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

// Create schema
async function createSchema(): Promise<boolean> {
  try {
    // Check if table exists
    const tableInfo = await queryStorage<any>("SELECT name FROM sqlite_master WHERE type='table' AND name='folders'");
    
    if (tableInfo.success && tableInfo.results && tableInfo.results.length > 0) {
      // Table exists, no need to create
      return true;
    }

    // Create new table
    await executeStorage(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('link', 'note', 'credential', 'tagged', 'all')),
        parent_id TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Save changes
    const { saveDatabase } = await import("@/lib/sqlite");
    await saveDatabase();

    return true;
  } catch (error) {
    console.error("Failed to create schema:", error);
    return false;
  }
}

// Check and upgrade database schema
async function checkAndUpgradeSchema(): Promise<boolean> {
  try {
    // Check if the folders table exists and has the correct schema
    const tableInfo = await queryStorage<any>("PRAGMA table_info(folders)");
    
    if (!tableInfo.success || !tableInfo.results) {
      // Table doesn't exist or can't be queried, create it
      return createSchema();
    }

    // Check if all required columns exist
    const columns = new Set(tableInfo.results.map((col: any) => col.name));
    const requiredColumns = ['id', 'name', 'type', 'parent_id', 'createdAt', 'updatedAt'];
    const missingColumns = requiredColumns.filter(col => !columns.has(col));

    if (missingColumns.length > 0) {
      // Drop and recreate the table if schema is outdated
      await executeStorage("DROP TABLE IF EXISTS folders");
      return createSchema();
    }

    return true;
  } catch (error) {
    console.error("Failed to check/upgrade schema:", error);
    return false;
  }
}

// Initialize folders table
export async function initFolders(): Promise<boolean> {
  try {
    // Create schema if needed
    const schemaCreated = await createSchema();
    if (!schemaCreated) {
      throw new Error("Failed to create schema");
    }

    // Check if default folders exist
    const existingFolders = await queryStorage<any>("SELECT COUNT(*) as count FROM folders");
    if (existingFolders.success && existingFolders.results && existingFolders.results[0].count > 0) {
      return true; // Default folders already exist
    }

    // Add default folders
    const now = new Date().toISOString();
    const defaultFolders = [
      { id: "folder-all", name: "All Items", type: "all", parent_id: null },
      { id: "folder-links", name: "Links", type: "link", parent_id: null },
      { id: "folder-notes", name: "Notes", type: "note", parent_id: null },
      { id: "folder-credentials", name: "Credentials", type: "credential", parent_id: null },
      { id: "folder-tagged", name: "Tagged Items", type: "tagged", parent_id: null }
    ];

    for (const folder of defaultFolders) {
      await executeStorage(
        `INSERT OR REPLACE INTO folders (id, name, type, parent_id, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [folder.id, folder.name, folder.type, folder.parent_id, now, now]
      );
    }

    // Save changes
    const { saveDatabase } = await import("@/lib/sqlite");
    await saveDatabase();

    return true;
  } catch (error) {
    console.error("Failed to initialize folders:", error);
    return false;
  }
}

// Helper function to format folder data
function formatFolder(data: FolderData): Folder {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

// Get all folders
export async function getAllFolders(): Promise<Folder[]> {
  const response = await queryStorage<FolderData>(
    `SELECT * FROM folders ORDER BY updatedAt DESC`
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch folders");
  }

  return response.results.map(formatFolder);
}

// Get folders by type
export async function getFoldersByType(type: string): Promise<Folder[]> {
  const response = await queryStorage<FolderData>(
    `SELECT * FROM folders WHERE type = ? ORDER BY updatedAt DESC`,
    [type]
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch folders by type");
  }

  return response.results.map(formatFolder);
}

// Get folder by ID
export async function getFolderById(id: string): Promise<Folder | null> {
  const response = await queryStorage<FolderData>(
    `SELECT * FROM folders WHERE id = ?`,
    [id]
  );

  if (!response.success || !response.results || response.results.length === 0) {
    return null;
  }

  return formatFolder(response.results[0]);
}

// Create folder
export async function createFolder(folder: Omit<Folder, "id" | "createdAt" | "updatedAt">): Promise<Folder> {
  try {
    const now = new Date().toISOString();
    const id = `folder-${Date.now()}`;

    await executeStorage(
      `INSERT INTO folders (id, name, type, parent_id, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, folder.name, folder.type, folder.parent_id, now, now]
    );

    // Save changes
    const { saveDatabase } = await import("@/lib/sqlite");
    await saveDatabase();

    return {
      ...folder,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  } catch (error) {
    console.error("Error creating folder:", error);
    throw new Error("Failed to create folder");
  }
}

// Update folder
export async function updateFolder(folder: Folder): Promise<Folder> {
  const now = new Date().toISOString();

  const response = await executeStorage(
    `UPDATE folders 
     SET name = ?, type = ?, parent_id = ?, updatedAt = ?
     WHERE id = ?`,
    [folder.name, folder.type, folder.parent_id, now, folder.id]
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to update folder");
  }

  // Save database state after updating folder
  const { saveDatabase } = await import("@/lib/sqlite");
  saveDatabase();

  return {
    ...folder,
    updatedAt: new Date(now),
  };
}

// Delete folder
export async function deleteFolder(id: string): Promise<boolean> {
  const response = await executeStorage(
    `DELETE FROM folders WHERE id = ?`,
    [id]
  );

  if (response.success) {
    // Save database state after deleting folder
    const { saveDatabase } = await import("@/lib/sqlite");
    saveDatabase();
  }

  return response.success;
}

// Get folder hierarchy
export async function getFolderHierarchy(): Promise<Folder[]> {
  const response = await queryStorage<FolderData>(
    `WITH RECURSIVE folder_tree AS (
      -- Base case: get root folders
      SELECT *, 0 as level
      FROM folders
      WHERE parent_id IS NULL
      
      UNION ALL
      
      -- Recursive case: get child folders
      SELECT f.*, ft.level + 1
      FROM folders f
      JOIN folder_tree ft ON f.parent_id = ft.id
    )
    SELECT * FROM folder_tree
    ORDER BY level, updatedAt DESC`
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch folder hierarchy");
  }

  return response.results.map(formatFolder);
}

// Get widgets in folder
export async function getWidgetsByFolder(folderId: string): Promise<any[]> {
  const response = await queryStorage<any>(
    `SELECT * FROM widgets WHERE folder_id = ? ORDER BY updatedAt DESC`,
    [folderId]
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch widgets by folder");
  }

  const { formatWidget } = await import("@/lib/storage");
  return response.results.map(formatWidget);
}

// Move widget to folder
export async function moveWidgetToFolder(widgetId: string, folderId: string | null): Promise<boolean> {
  const response = await executeStorage(
    `UPDATE widgets SET folder_id = ?, updatedAt = ? WHERE id = ?`,
    [folderId, new Date().toISOString(), widgetId]
  );

  if (response.success) {
    // Save database state after moving widget
    const { saveDatabase } = await import("@/lib/sqlite");
    saveDatabase();
  }

  return response.success;
}

// Move folder (update parent)
export async function moveFolder(folderId: string, newParentId: string | null): Promise<boolean> {
  const response = await executeStorage(
    `UPDATE folders SET parent_id = ?, updatedAt = ? WHERE id = ?`,
    [newParentId, new Date().toISOString(), folderId]
  );

  if (response.success) {
    // Save database state after moving folder
    const { saveDatabase } = await import("@/lib/sqlite");
    saveDatabase();
  }

  return response.success;
}

// Add folder_id column to widgets table
export async function addFolderColumnToWidgets(): Promise<boolean> {
  try {
    // Check if column exists
    const response = await queryStorage<any>("PRAGMA table_info(widgets)");

    if (!response.success || !response.results) {
      throw new Error("Failed to get table info");
    }

    // Check if folder_id column already exists
    const hasColumn = response.results.some((col) => col.name === "folder_id");

    if (!hasColumn) {
      // Add the column
      await executeStorage("ALTER TABLE widgets ADD COLUMN folder_id TEXT");

      // Save database after schema change
      const { saveDatabase } = await import("@/lib/sqlite");
      saveDatabase();
    }

    return true;
  } catch (error) {
    console.error("Failed to add folder column:", error);
    return false;
  }
}

// Update widget folder
export async function updateWidgetFolder(
  widgetId: string,
  folderId: string | null,
): Promise<boolean> {
  const response = await executeStorage(
    `UPDATE widgets SET folder_id = ? WHERE id = ?`,
    [folderId, widgetId],
  );

  if (response.success) {
    // Save database after updating widget folder
    const { saveDatabase } = await import("@/lib/sqlite");
    saveDatabase();
  }

  return response.success;
}
