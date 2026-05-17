import { FileText, Plus, Users } from "lucide-react";
import type { NoteMeta } from "../services/localStore";

type SidebarProps = {
  notes: NoteMeta[];
  activeNoteId: string;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
};

export function Sidebar({ notes, activeNoteId, onSelectNote, onCreateNote }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div>
          <strong>SyncSpace</strong>
          <span>Offline workspace</span>
        </div>
      </div>

      <button className="new-note" onClick={onCreateNote}>
        <Plus size={17} />
        New note
      </button>

      <section className="nav-section">
        <div className="section-label">
          <FileText size={15} />
          Notes
        </div>
        <div className="note-list">
          {notes.map((note) => (
            <button
              className={note.id === activeNoteId ? "note-link active" : "note-link"}
              key={note.id}
              onClick={() => onSelectNote(note.id)}
            >
              <span>{note.title}</span>
              <small>{new Date(note.updatedAt).toLocaleDateString()}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="workspace-card">
        <div className="section-label">
          <Users size={15} />
          Team room
        </div>
        <p>Invite teammates by sharing this local project and using the same note room.</p>
      </section>
    </aside>
  );
}
