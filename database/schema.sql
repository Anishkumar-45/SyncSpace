CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workspaces (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workspace_members (
    workspace_id INT REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(30) DEFAULT 'editor',
    PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE notes (
    id UUID PRIMARY KEY,
    workspace_id INT REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_snapshot TEXT DEFAULT '',
    crdt_update BYTEA,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE note_versions (
    id UUID PRIMARY KEY,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_snapshot TEXT NOT NULL,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_workspace_id ON notes(workspace_id);
CREATE INDEX idx_note_versions_note_id ON note_versions(note_id);
