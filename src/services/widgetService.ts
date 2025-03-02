import { queryD1, executeD1 } from "@/lib/cloudflare";
import { Widget } from "@/components/dashboard/DashboardGrid";

export interface WidgetData
  extends Omit<Widget, "createdAt" | "updatedAt" | "customFields"> {
  createdAt?: string;
  updatedAt?: string;
  customFields?: string; // JSON string in DB
}

export async function getAllWidgets(): Promise<Widget[]> {
  const response = await queryD1<WidgetData>(
    `SELECT * FROM widgets ORDER BY updatedAt DESC`,
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch widgets");
  }

  return response.results.map(formatWidget);
}

export async function getWidgetById(id: string): Promise<Widget | null> {
  const response = await queryD1<WidgetData>(
    `SELECT * FROM widgets WHERE id = ?`,
    [id],
  );

  if (!response.success || !response.results || response.results.length === 0) {
    return null;
  }

  return formatWidget(response.results[0]);
}

export async function createWidget(
  widget: Omit<Widget, "id" | "createdAt" | "updatedAt">,
): Promise<Widget> {
  const now = new Date().toISOString();
  const id = `widget-${Date.now()}`;

  const response = await executeD1<{ id: string }>(
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

  return {
    ...widget,
    id,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export async function updateWidget(widget: Widget): Promise<Widget> {
  const now = new Date().toISOString();

  const response = await executeD1(
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

  return {
    ...widget,
    updatedAt: new Date(now),
  };
}

export async function deleteWidget(id: string): Promise<boolean> {
  const response = await executeD1(`DELETE FROM widgets WHERE id = ?`, [id]);

  return response.success;
}

export async function searchWidgets(query: string): Promise<Widget[]> {
  const searchTerm = `%${query}%`;

  const response = await queryD1<WidgetData>(
    `SELECT * FROM widgets 
     WHERE title LIKE ? OR content LIKE ? 
     ORDER BY updatedAt DESC`,
    [searchTerm, searchTerm],
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to search widgets");
  }

  return response.results.map(formatWidget);
}

export async function getWidgetsByType(type: string): Promise<Widget[]> {
  const response = await queryD1<WidgetData>(
    `SELECT * FROM widgets WHERE type = ? ORDER BY updatedAt DESC`,
    [type],
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch widgets by type");
  }

  return response.results.map(formatWidget);
}

export async function getWidgetsByTag(tag: string): Promise<Widget[]> {
  const response = await queryD1<WidgetData>(
    `SELECT * FROM widgets WHERE json_extract(tags, '$') LIKE ? ORDER BY updatedAt DESC`,
    [`%${tag}%`],
  );

  if (!response.success || !response.results) {
    throw new Error(response.error || "Failed to fetch widgets by tag");
  }

  return response.results.map(formatWidget);
}

// Helper function to format widget data from DB
function formatWidget(data: WidgetData): Widget {
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
