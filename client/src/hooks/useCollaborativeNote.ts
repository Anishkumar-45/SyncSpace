import { useCallback, useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

export type Collaborator = {
  clientId: number;
  name: string;
  color: string;
  cursor: number | null;
};

export type SyncState = {
  connected: boolean;
  persisted: boolean;
  collaborators: Collaborator[];
};

type AwarenessUserState = {
  user?: {
    name?: string;
    color?: string;
    cursor?: number | null;
  };
};

const COLORS = ["#2563eb", "#059669", "#dc2626", "#9333ea", "#ea580c", "#0891b2"];

function createUser() {
  const existing = localStorage.getItem("syncspace-user");
  if (existing) {
    return JSON.parse(existing) as { name: string; color: string };
  }

  const user = {
    name: `User ${Math.floor(Math.random() * 900 + 100)}`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  };
  localStorage.setItem("syncspace-user", JSON.stringify(user));
  return user;
}

function applyTextChange(yText: Y.Text, nextText: string) {
  const currentText = yText.toString();
  if (currentText === nextText) {
    return;
  }

  let start = 0;
  while (
    start < currentText.length &&
    start < nextText.length &&
    currentText[start] === nextText[start]
  ) {
    start += 1;
  }

  let currentEnd = currentText.length - 1;
  let nextEnd = nextText.length - 1;
  while (
    currentEnd >= start &&
    nextEnd >= start &&
    currentText[currentEnd] === nextText[nextEnd]
  ) {
    currentEnd -= 1;
    nextEnd -= 1;
  }

  yText.doc?.transact(() => {
    if (currentEnd >= start) {
      yText.delete(start, currentEnd - start + 1);
    }
    if (nextEnd >= start) {
      yText.insert(start, nextText.slice(start, nextEnd + 1));
    }
  });
}

export function useCollaborativeNote(noteId: string, initialText: string) {
  const [content, setContent] = useState(initialText);
  const [syncState, setSyncState] = useState<SyncState>({
    connected: false,
    persisted: false,
    collaborators: []
  });

  const roomName = `note-${noteId}`;
  const user = useMemo(createUser, []);

  const documentBundle = useMemo(() => {
    const doc = new Y.Doc();
    const text = doc.getText("content");
    const provider = new WebsocketProvider("ws://localhost:4000/sync", roomName, doc, {
      connect: true
    });
    const persistence = new IndexeddbPersistence(roomName, doc);

    return { doc, text, provider, persistence };
  }, [roomName]);

  useEffect(() => {
    const { text, provider, persistence } = documentBundle;

    if (text.length === 0 && initialText.length > 0) {
      text.insert(0, initialText);
    }

    provider.awareness.setLocalStateField("user", {
      name: user.name,
      color: user.color,
      cursor: null
    });

    const updateContent = () => setContent(text.toString());

    const updateCollaborators = () => {
      const awarenessStates = provider.awareness.getStates() as Map<number, AwarenessUserState>;
      const collaborators = Array.from(awarenessStates.entries())
        .filter(([clientId]) => clientId !== documentBundle.doc.clientID)
        .map(([clientId, state]) => ({
          clientId,
          name: state.user?.name ?? "Anonymous",
          color: state.user?.color ?? "#64748b",
          cursor: state.user?.cursor ?? null
        }));

      setSyncState((current) => ({ ...current, collaborators }));
    };

    text.observe(updateContent);
    provider.awareness.on("change", updateCollaborators);
    provider.on("status", ({ status }: { status: "connected" | "disconnected" | "connecting" }) => {
      setSyncState((current) => ({ ...current, connected: status === "connected" }));
    });
    persistence.on("synced", () => {
      setSyncState((current) => ({ ...current, persisted: true }));
      updateContent();
    });

    updateContent();
    updateCollaborators();

    return () => {
      text.unobserve(updateContent);
      provider.awareness.off("change", updateCollaborators);
      provider.destroy();
      persistence.destroy();
      documentBundle.doc.destroy();
    };
  }, [documentBundle, initialText, user.color, user.name]);

  const updateContent = useCallback(
    (nextText: string, cursorPosition?: number) => {
      applyTextChange(documentBundle.text, nextText);
      documentBundle.provider.awareness.setLocalStateField("user", {
        name: user.name,
        color: user.color,
        cursor: cursorPosition ?? null
      });
    },
    [documentBundle, user.color, user.name]
  );

  const restoreContent = useCallback(
    (nextText: string) => {
      documentBundle.text.delete(0, documentBundle.text.length);
      documentBundle.text.insert(0, nextText);
    },
    [documentBundle]
  );

  return {
    content,
    syncState,
    updateContent,
    restoreContent,
    localUser: user
  };
}
