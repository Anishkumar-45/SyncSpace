export type NoteMeta = {
  id: string;
  title: string;
  workspaceId: string;
  updatedAt: string;
};

export type VersionSnapshot = {
  id: string;
  noteId: string;
  title: string;
  content: string;
  createdAt: string;
};

type StoreName = "notes" | "versions";

const DB_NAME = "syncspace-local";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("versions")) {
        const versions = db.createObjectStore("versions", { keyPath: "id" });
        versions.createIndex("noteId", "noteId", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = action(store);

    transaction.oncomplete = () => {
      db.close();
      resolve(request ? request.result : undefined);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function saveNoteMeta(note: NoteMeta): Promise<void> {
  await withStore("notes", "readwrite", (store) => store.put(note));
}

export async function listNoteMeta(): Promise<NoteMeta[]> {
  const result = await withStore<NoteMeta[]>("notes", "readonly", (store) => store.getAll());
  return result ?? [];
}

export async function saveVersion(snapshot: VersionSnapshot): Promise<void> {
  await withStore("versions", "readwrite", (store) => store.put(snapshot));
}

export async function listVersions(noteId: string): Promise<VersionSnapshot[]> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("versions", "readonly");
    const index = transaction.objectStore("versions").index("noteId");
    const request = index.getAll(noteId);

    transaction.oncomplete = () => {
      db.close();
      resolve((request.result ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}
