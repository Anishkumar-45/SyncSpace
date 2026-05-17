import { useEffect, useMemo, useState } from "react";
import { Editor } from "./components/Editor";
import { Sidebar } from "./components/Sidebar";
import { TaskBoard } from "./components/TaskBoard";
import { useCollaborativeNote } from "./hooks/useCollaborativeNote";
import {
  listNoteMeta,
  listVersions,
  saveNoteMeta,
  saveVersion,
  type NoteMeta,
  type VersionSnapshot
} from "./services/localStore";

const STARTER_NOTES: NoteMeta[] = [
  {
    id: "workspace-vision",
    title: "Workspace vision",
    workspaceId: "demo-workspace",
    updatedAt: new Date().toISOString()
  },
  {
    id: "system-design",
    title: "System design",
    workspaceId: "demo-workspace",
    updatedAt: new Date().toISOString()
  }
];

const STARTER_CONTENT: Record<string, string> = {
  "workspace-vision":
    "SyncSpace is an offline-first collaborative workspace. Users can edit notes during network outages, persist changes locally, and merge updates automatically when the connection returns.",
  "system-design":
    "The client stores CRDT updates in IndexedDB and sends them to a WebSocket sync server. PostgreSQL can persist snapshots and update logs for recovery, history, and multi-device sync."
};

function createNote(): NoteMeta {
  return {
    id: crypto.randomUUID(),
    title: "Untitled note",
    workspaceId: "demo-workspace",
    updatedAt: new Date().toISOString()
  };
}

export default function App() {
  const [notes, setNotes] = useState<NoteMeta[]>(STARTER_NOTES);
  const [activeNoteId, setActiveNoteId] = useState(STARTER_NOTES[0].id);
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId) ?? notes[0],
    [activeNoteId, notes]
  );

  const { content, syncState, updateContent, restoreContent } = useCollaborativeNote(
    activeNote.id,
    STARTER_CONTENT[activeNote.id] ?? ""
  );

  useEffect(() => {
    listNoteMeta().then((storedNotes) => {
      if (storedNotes.length > 0) {
        setNotes(storedNotes);
        setActiveNoteId(storedNotes[0].id);
      } else {
        STARTER_NOTES.forEach((note) => void saveNoteMeta(note));
      }
    });
  }, []);

  useEffect(() => {
    listVersions(activeNote.id).then(setVersions);
  }, [activeNote.id]);

  const updateTitle = (title: string) => {
    const updated = notes.map((note) =>
      note.id === activeNote.id ? { ...note, title, updatedAt: new Date().toISOString() } : note
    );
    setNotes(updated);
    void saveNoteMeta(updated.find((note) => note.id === activeNote.id)!);
  };

  const addNote = () => {
    const nextNote = createNote();
    setNotes((current) => [nextNote, ...current]);
    setActiveNoteId(nextNote.id);
    void saveNoteMeta(nextNote);
  };

  const captureVersion = async () => {
    const snapshot: VersionSnapshot = {
      id: crypto.randomUUID(),
      noteId: activeNote.id,
      title: activeNote.title,
      content,
      createdAt: new Date().toISOString()
    };
    await saveVersion(snapshot);
    setVersions(await listVersions(activeNote.id));
  };

  const restoreVersion = (snapshot: VersionSnapshot) => {
    restoreContent(snapshot.content);
  };

  const handleContentChange = (nextContent: string, cursorPosition: number) => {
    updateContent(nextContent, cursorPosition);
    const updatedNote = { ...activeNote, updatedAt: new Date().toISOString() };
    void saveNoteMeta(updatedNote);
    setNotes((current) => current.map((note) => (note.id === activeNote.id ? updatedNote : note)));
  };

  return (
    <div className="app-shell">
      <Sidebar
        notes={notes}
        activeNoteId={activeNote.id}
        onSelectNote={setActiveNoteId}
        onCreateNote={addNote}
      />
      <div className="workspace">
        <TaskBoard />
        <Editor
          title={activeNote.title}
          content={content}
          syncState={syncState}
          versions={versions}
          collaborators={syncState.collaborators}
          onTitleChange={updateTitle}
          onContentChange={handleContentChange}
          onSaveVersion={captureVersion}
          onRestoreVersion={restoreVersion}
        />
      </div>
    </div>
  );
}
