# SyncSpace

SyncSpace is an offline-first collaborative workspace built for real-time notes, team presence, local persistence, and conflict-free sync.

## What It Demonstrates

- Real-time collaboration with WebSockets and Yjs CRDT updates
- Offline-first editing with IndexedDB persistence
- Automatic merge after reconnect without last-write-wins data loss
- Workspace, notes, tasks, presence, and version history UI
- Backend-ready persistence model for PostgreSQL

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, TypeScript |
| Styling | CSS modules-style global CSS |
| Collaboration | Yjs, y-websocket, y-indexeddb |
| Backend | Node.js, Express, ws |
| Database Design | PostgreSQL schema in `database/schema.sql` |

## Run Locally

```bash
npm.cmd install
npm.cmd run dev
```

Then open:

- Client: `http://localhost:5173`
- Server health: `http://localhost:4000/health`
- WebSocket sync endpoint: `ws://localhost:4000/sync`

## Offline Demo Flow

1. Open the app in two browser tabs.
2. Edit the same note in both tabs.
3. Turn off network for one tab using DevTools.
4. Continue editing offline.
5. Restore network and watch the text merge through CRDT sync.

## Project Structure

```text
syncspace/
├── client/       React offline-first collaborative workspace
├── server/       Express + WebSocket Yjs sync server
├── shared/       CRDT helper notes and merge utilities
├── database/     PostgreSQL schema
└── docs/         Architecture and resume notes
```

## Resume Line

Developed an offline-first collaborative workspace using CRDTs, WebSockets, IndexedDB, and PostgreSQL-ready persistence, supporting conflict-free real-time synchronization and local editing during network outages.
