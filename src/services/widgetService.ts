import { Widget } from "@/components/dashboard/DashboardGrid";
import {
  queryStorage,
  executeStorage,
  formatWidget as formatStorageWidget,
  initStorage,
} from "@/lib/storage";

export interface WidgetData
  extends Omit<Widget, "createdAt" | "updatedAt" | "customFields"> {
  createdAt?: string;
  updatedAt?: string;
  customFields?: string; // JSON string in DB
}

// Initialize storage and folders when module is loaded
initStorage().then(async () => {
  // Initialize folder structure
  const { initFolders, addFolderColumnToWidgets } = await import(
    "./folderService"
  );
  await initFolders();
  await addFolderColumnToWidgets();
});

export async function getAllWidgets(): Promise<Widget[]> {
  const response = await queryStorage<WidgetData>(
    `SELECT * FROM widgets ORDER BY updatedAt DESC`,
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch widgets");
  }

  return response.results.map(formatStorageWidget);
}

export async function getWidgetById(id: string): Promise<Widget | null> {
  const response = await queryStorage<WidgetData>(
    `SELECT * FROM widgets WHERE id = ?`,
    [id],
  );

  if (!response.success || !response.results || response.results.length === 0) {
    return null;
  }

  return formatStorageWidget(response.results[0]);
}

export async function createWidget(
  widget: Omit<Widget, "id" | "createdAt" | "updatedAt">,
): Promise<Widget> {
  const now = new Date().toISOString();
  const id = `widget-${Date.now()}`;

  const response = await executeStorage<{ id: string }>(
    `INSERT INTO widgets (id, title, content, type, tags, url, isProtected, credentialType, customFields, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING id`,
    [
      id,
      widget.title,
      widget.content,
      widget.type,
      JSON.stringify(widget.tags),
      widget.url || null,
      widget.isProtected ? 1 : 0,
      widget.credentialType || null,
      widget.customFields ? JSON.stringify(widget.customFields) : null,
      now,
      now,
    ],
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to create widget");
  }

  // Save database state after creating widget
  const { saveDatabase } = await import("@/lib/sqlite");
  saveDatabase();

  return {
    ...widget,
    id,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export async function updateWidget(widget: Widget): Promise<Widget> {
  const now = new Date().toISOString();

  const response = await executeStorage(
    `UPDATE widgets 
     SET title = ?, content = ?, type = ?, tags = ?, url = ?, isProtected = ?, 
     credentialType = ?, customFields = ?, updatedAt = ? 
     WHERE id = ?`,
    [
      widget.title,
      widget.content,
      widget.type,
      JSON.stringify(widget.tags),
      widget.url || null,
      widget.isProtected ? 1 : 0,
      widget.credentialType || null,
      widget.customFields ? JSON.stringify(widget.customFields) : null,
      now,
      widget.id,
    ],
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to update widget");
  }

  // Save database state after updating widget
  const { saveDatabase } = await import("@/lib/sqlite");
  saveDatabase();

  return {
    ...widget,
    updatedAt: new Date(now),
  };
}

export async function deleteWidget(id: string): Promise<boolean> {
  const response = await executeStorage(`DELETE FROM widgets WHERE id = ?`, [
    id,
  ]);

  if (response.success) {
    // Save database state after deleting widget
    const { saveDatabase } = await import("@/lib/sqlite");
    saveDatabase();
  }

  return response.success;
}

export async function searchWidgets(query: string): Promise<Widget[]> {
  const searchTerm = `%${query}%`;

  const response = await queryStorage<WidgetData>(
    `SELECT * FROM widgets 
     WHERE title LIKE ? OR content LIKE ? 
     ORDER BY updatedAt DESC`,
    [searchTerm, searchTerm],
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to search widgets");
  }

  return response.results.map(formatStorageWidget);
}

export async function getWidgetsByType(type: string): Promise<Widget[]> {
  const response = await queryStorage<WidgetData>(
    `SELECT * FROM widgets WHERE type = ? ORDER BY updatedAt DESC`,
    [type],
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch widgets by type");
  }

  return response.results.map(formatStorageWidget);
}

export async function getWidgetsByTag(tag: string): Promise<Widget[]> {
  const response = await queryStorage<WidgetData>(
    `SELECT * FROM widgets WHERE json_extract(tags, ') LIKE ? ORDER BY updatedAt DESC`,
    [`%${tag}%`],
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch widgets by tag");
  }

  return response.results.map(formatStorageWidget);
}

// Re-export the formatWidget function for use elsewhere
export { formatStorageWidget as formatWidget };
