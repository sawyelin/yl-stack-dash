-- Cloudflare D1 Schema for Dashboard Management System

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('link', 'note', 'credential', 'tagged', 'all')),
  parent_id TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
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
  credentialType TEXT, -- New field for credential type
  customFields TEXT, -- New field for custom fields (JSON)
  folder_id TEXT, -- New field for folder organization
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_widgets_type ON widgets(type);
CREATE INDEX IF NOT EXISTS idx_widgets_updated ON widgets(updatedAt);
CREATE INDEX IF NOT EXISTS idx_widgets_folder ON widgets(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);

-- Vault Keys table for master passwords
CREATE TABLE IF NOT EXISTS vault_keys (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL, -- Hashed master password
  hint TEXT, -- Optional password hint
  createdAt TEXT NOT NULL,
  lastUsed TEXT
);

-- Sample data
INSERT OR IGNORE INTO widgets (id, title, content, type, tags, url, isProtected, credentialType, customFields, createdAt, updatedAt)
VALUES
('widget-1', 'Important Links', 'Collection of frequently used websites and resources', 'link', '["work","resources"]', 'https://example.com', 0, NULL, NULL, '2023-06-01T10:00:00Z', '2023-06-05T14:30:00Z'),
('widget-2', 'Project Notes', 'Notes for the current dashboard project including requirements and deadlines', 'note', '["project","work"]', NULL, 0, NULL, NULL, '2023-05-15T09:20:00Z', '2023-06-07T11:45:00Z'),
('widget-3', 'Server Credentials', 'Login information for the development server', 'credential', '["server","security"]', NULL, 1, 'server', '{"username":"admin","server":"dev.example.com","port":"22"}', '2023-05-01T08:15:00Z', '2023-05-20T16:10:00Z'),
('widget-4', 'Personal Tasks', 'List of personal tasks and reminders', 'tagged', '["personal","tasks"]', NULL, 0, NULL, NULL, '2023-06-03T17:30:00Z', '2023-06-07T09:20:00Z'),
('widget-5', 'Documentation', 'Links to project documentation and API references', 'link', '["docs","reference"]', 'https://docs.example.com', 0, NULL, NULL, '2023-04-10T13:45:00Z', '2023-05-15T10:30:00Z'),
('widget-6', 'Meeting Notes', 'Notes from the last team meeting including action items', 'note', '["meetings","team"]', NULL, 0, NULL, NULL, '2023-06-06T15:00:00Z', '2023-06-07T08:45:00Z'),
('widget-7', 'Banking Credentials', 'Online banking login information', 'credential', '["finance","banking"]', 'https://bank.example.com', 1, 'banking', '{"accountNumber":"XXXX-XXXX-1234","branch":"Main Street"}', '2023-05-10T11:20:00Z', '2023-06-01T09:15:00Z'),
('widget-8', 'Email Account', 'Work email credentials', 'credential', '["work","email"]', 'https://mail.example.com', 1, 'email', '{"recoveryEmail":"personal@example.com"}', '2023-04-20T14:30:00Z', '2023-05-25T16:40:00Z');

-- Insert sample vault key
INSERT OR IGNORE INTO vault_keys (id, key_hash, hint, createdAt, lastUsed)
VALUES
('default-key', 'hashed_master_password_would_go_here', 'Your favorite color', '2023-04-01T09:00:00Z', '2023-06-07T15:30:00Z');
