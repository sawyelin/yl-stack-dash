-- Cloudflare D1 Schema for Dashboard Management System

-- Folders table (created first since it's referenced by widgets)
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('link', 'note', 'credential', 'tagged', 'all')),
  parent_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Widgets table
CREATE TABLE IF NOT EXISTS widgets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL CHECK (type IN ('link', 'note', 'credential', 'tagged')),
  tags TEXT, -- Stored as JSON array
  url TEXT,
  isProtected INTEGER DEFAULT 0,
  credentialType TEXT,
  customFields TEXT,
  folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Vault Keys table for master passwords
CREATE TABLE IF NOT EXISTS vault_keys (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL,
  hint TEXT,
  createdAt TEXT NOT NULL,
  lastUsed TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_widgets_type ON widgets(type);
CREATE INDEX IF NOT EXISTS idx_widgets_updated ON widgets(updatedAt);
CREATE INDEX IF NOT EXISTS idx_widgets_folder ON widgets(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);

-- Sample data: First insert folders
INSERT OR IGNORE INTO folders (id, name, type, parent_id, createdAt, updatedAt)
VALUES
('folder-1', 'Work Links', 'link', NULL, '2023-06-01T10:00:00Z', '2023-06-05T14:30:00Z'),
('folder-2', 'Project Notes', 'note', NULL, '2023-05-15T09:20:00Z', '2023-06-07T11:45:00Z'),
('folder-3', 'Credentials', 'credential', NULL, '2023-05-01T08:15:00Z', '2023-05-20T16:10:00Z');

-- Then insert widgets with folder references
INSERT OR IGNORE INTO widgets (id, title, content, type, tags, url, isProtected, credentialType, customFields, folder_id, createdAt, updatedAt)
VALUES
('widget-1', 'Important Links', 'Collection of frequently used websites and resources', 'link', '["work","resources"]', 'https://example.com', 0, NULL, NULL, 'folder-1', '2023-06-01T10:00:00Z', '2023-06-05T14:30:00Z'),
('widget-2', 'Project Notes', 'Notes for the current dashboard project including requirements and deadlines', 'note', '["project","work"]', NULL, 0, NULL, NULL, 'folder-2', '2023-05-15T09:20:00Z', '2023-06-07T11:45:00Z'),
('widget-3', 'Server Credentials', 'Login information for the development server', 'credential', '["server","security"]', NULL, 1, 'server', '{"username":"admin","server":"dev.example.com","port":"22"}', 'folder-3', '2023-05-01T08:15:00Z', '2023-05-20T16:10:00Z'),
('widget-4', 'Personal Tasks', 'List of personal tasks and reminders', 'tagged', '["personal","tasks"]', NULL, 0, NULL, NULL, NULL, '2023-06-03T17:30:00Z', '2023-06-07T09:20:00Z');

-- Insert sample vault key
INSERT OR IGNORE INTO vault_keys (id, key_hash, hint, createdAt, lastUsed)
VALUES
('default-key', 'hashed_master_password_would_go_here', 'Your favorite color', '2023-04-01T09:00:00Z', '2023-06-07T15:30:00Z');
