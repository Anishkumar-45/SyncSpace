import { Bot, Clock3, Download, RotateCcw, Save, Wifi, WifiOff } from "lucide-react";
import type { Collaborator, SyncState } from "../hooks/useCollaborativeNote";
import type { VersionSnapshot } from "../services/localStore";

type EditorProps = {
  title: string;
  content: string;
  syncState: SyncState;
  versions: VersionSnapshot[];
  collaborators: Collaborator[];
  onTitleChange: (title: string) => void;
  onContentChange: (content: string, cursorPosition: number) => void;
  onSaveVersion: () => void;
  onRestoreVersion: (snapshot: VersionSnapshot) => void;
};

function summarize(content: string) {
  const sentences = content
    .split(/[.!?]\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return "Start writing and SyncSpace will create a quick local summary.";
  }

  return sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "." : "");
}

export function Editor({
  title,
  content,
  syncState,
  versions,
  collaborators,
  onTitleChange,
  onContentChange,
  onSaveVersion,
  onRestoreVersion
}: EditorProps) {
  return (
    <main className="editor-shell">
      <header className="topbar">
        <div className="status-group">
          <span className={syncState.connected ? "status online" : "status offline"}>
            {syncState.connected ? <Wifi size={16} /> : <WifiOff size={16} />}
            {syncState.connected ? "Live sync" : "Offline mode"}
          </span>
          <span className="status saved">
            <Save size={16} />
            {syncState.persisted ? "IndexedDB saved" : "Preparing local cache"}
          </span>
        </div>
        <button className="icon-button" title="Save version" onClick={onSaveVersion}>
          <Download size={18} />
        </button>
      </header>

      <section className="editor-grid">
        <div className="document-panel">
          <input
            className="title-input"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            aria-label="Note title"
          />
          <textarea
            className="note-editor"
            value={content}
            onChange={(event) => onContentChange(event.target.value, event.target.selectionStart)}
            spellCheck="true"
          />
        </div>

        <aside className="inspector">
          <section className="panel">
            <h2>Presence</h2>
            <div className="presence-list">
              {collaborators.length === 0 ? (
                <p className="muted">No other users in this room.</p>
              ) : (
                collaborators.map((person) => (
                  <div className="presence-row" key={person.clientId}>
                    <span className="avatar" style={{ backgroundColor: person.color }}>
                      {person.name.slice(0, 1)}
                    </span>
                    <div>
                      <strong>{person.name}</strong>
                      <small>
                        {person.cursor === null ? "Viewing" : `Cursor at ${person.cursor}`}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="panel">
            <h2>
              <Bot size={17} />
              Local summary
            </h2>
            <p>{summarize(content)}</p>
          </section>

          <section className="panel">
            <h2>
              <Clock3 size={17} />
              Versions
            </h2>
            <div className="version-list">
              {versions.length === 0 ? (
                <p className="muted">Save a version to create restore points.</p>
              ) : (
                versions.map((version) => (
                  <button
                    className="version-row"
                    key={version.id}
                    onClick={() => onRestoreVersion(version)}
                  >
                    <span>{version.title}</span>
                    <small>{new Date(version.createdAt).toLocaleString()}</small>
                    <RotateCcw size={15} />
                  </button>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
