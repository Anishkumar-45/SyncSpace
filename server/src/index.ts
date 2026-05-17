import "dotenv/config";
import http from "node:http";
import cors from "cors";
import express from "express";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

const PORT = Number(process.env.PORT ?? 4000);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "syncspace-server",
    syncEndpoint: "ws://localhost:4000/sync"
  });
});

app.get("/api/workspaces/demo", (_request, response) => {
  response.json({
    id: "demo-workspace",
    title: "Product Team",
    members: ["You", "User 204", "User 731"]
  });
});

const server = http.createServer(app);
const websocketServer = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const host = request.headers.host ?? `localhost:${PORT}`;
  const url = new URL(request.url ?? "/", `http://${host}`);

  if (!url.pathname.startsWith("/sync")) {
    socket.destroy();
    return;
  }

  websocketServer.handleUpgrade(request, socket, head, (connection) => {
    const roomName = decodeURIComponent(url.pathname.replace(/^\/sync\/?/, "")) || "default-room";
    setupWSConnection(connection, request, { docName: roomName });
  });
});

server.listen(PORT, () => {
  console.log(`SyncSpace API running on http://localhost:${PORT}`);
  console.log(`Yjs sync server listening on ws://localhost:${PORT}/sync`);
});
