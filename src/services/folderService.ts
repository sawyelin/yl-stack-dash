import { executeStorage, queryStorage } from "@/lib/storage";

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderData {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Initialize folders table
export async function initFolders(): Promise<boolean> {
  try {
    await executeStorage(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parentId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Check if we need to add default folders
    const response = await queryStorage<{ count: number }>(
      "SELECT COUNT(*) as count FROM folders",
    );

    if (
      response.success &&
      response.results &&
      response.results[0].count === 0
    ) {
      await createDefaultFolders();
    }

    return true;
  } catch (error) {
    console.error("Failed to initialize folders:", error);
    return false;
  }
}

// Create default folders
async function createDefaultFolders() {
  const now = new Date().toISOString();
  const defaultFolders = [
    { id: "folder-links", name: "Links", parentId: null },
    { id: "folder-notes", name: "Notes", parentId: null },
    { id: "folder-credentials", name: "Credentials", parentId: null },
    { id: "folder-personal", name: "Personal", parentId: null },
    { id: "folder-work", name: "Work", parentId: null },
  ];

  for (const folder of defaultFolders) {
    await executeStorage(
      `INSERT INTO folders (id, name, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      [folder.id, folder.name, folder.parentId, now, now],
    );
  }

  // Save database after creating folders
  const { saveDatabase } = await import("@/lib/sqlite");
  saveDatabase();
}

// Get all folders
export async function getAllFolders(): Promise<Folder[]> {
  const response = await queryStorage<FolderData>(
    `SELECT * FROM folders ORDER BY name ASC`,
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch folders");
  }

  return response.results.map(formatFolder);
}

// Create a new folder
export async function createFolder(
  name: string,
  parentId: string | null = null,
): Promise<Folder> {
  const now = new Date().toISOString();
  const id = `folder-${Date.now()}`;

  const response = await executeStorage(
    `INSERT INTO folders (id, name, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
    [id, name, parentId, now, now],
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to create folder");
  }

  // Save database after creating folder
  const { saveDatabase } = await import("@/lib/sqlite");
  saveDatabase();

  return {
    id,
    name,
    parentId,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

// Update a folder
export async function updateFolder(folder: Folder): Promise<Folder> {
  const now = new Date().toISOString();

  const response = await executeStorage(
    `UPDATE folders SET name = ?, parentId = ?, updatedAt = ? WHERE id = ?`,
    [folder.name, folder.parentId, now, folder.id],
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to update folder");
  }

  // Save database after updating folder
  const { saveDatabase } = await import("@/lib/sqlite");
  saveDatabase();

  return {
    ...folder,
    updatedAt: new Date(now),
  };
}

// Delete a folder
export async function deleteFolder(id: string): Promise<boolean> {
  const response = await executeStorage(`DELETE FROM folders WHERE id = ?`, [
    id,
  ]);

  if (response.success) {
    // Save database after deleting folder
    const { saveDatabase } = await import("@/lib/sqlite");
    saveDatabase();
  }

  return response.success;
}

// Helper function to format folder data
function formatFolder(data: FolderData): Folder {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
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

// Get widgets by folder
export async function getWidgetsByFolder(folderId: string): Promise<any[]> {
  const response = await queryStorage<any>(
    `SELECT * FROM widgets WHERE folder_id = ? ORDER BY updatedAt DESC`,
    [folderId],
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch widgets by folder");
  }

  const { formatWidget } = await import("@/lib/storage");
  return response.results.map(formatWidget);
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
