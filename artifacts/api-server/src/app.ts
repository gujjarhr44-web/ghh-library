import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { createRequire } from "module";
const _require = createRequire(import.meta.url);
const wsLib = _require("ws");
const WebSocketServer = wsLib.WebSocketServer || wsLib.Server;
type WsClient = InstanceType<typeof wsLib.WebSocket>;
import { createServer } from "http";
import router from "./routes";
import { logger } from "./lib/logger";
import { registerBroadcast } from "./lib/cms-store";

const app: Express = express();

// ── CORS Configuration ────────────────────────────────────────────────────────
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
app.use(
  cors({
    origin: corsOrigin === "*" ? "*" : corsOrigin.split(",").map((o) => o.trim()),
    credentials: true,
  }),
);

// ── HTTP Request Logging ──────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// ── Static assets + publicPath ────────────────────────────────────────────────
const publicPath =
  process.env.ADMIN_DIST_PATH ||
  path.resolve(__dirname, "../../admin-dashboard/dist/public");

// ── /api/health → Render.com health check ────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ghh-library", timestamp: new Date().toISOString() });
});

// ── /download → APK Download Page ────────────────────────────────────────────
app.get("/download", (_req, res) => {
  const downloadPage = path.resolve(publicPath, "download.html");
  res.sendFile(downloadPage, (err) => {
    if (err) {
      res.status(404).send("Download page not found. Please build admin-dashboard.");
    }
  });
});

// Serve static assets of admin-dashboard (includes APK file)
app.use(express.static(publicPath));

// Wildcard client route fallback to index.html (SPA routing)
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/ws")) {
    next();
    return;
  }
  res.sendFile(path.resolve(publicPath, "index.html"), (err) => {
    if (err) {
      res.status(404).send("Admin dashboard assets not built yet. Please build admin-dashboard.");
    }
  });
});

// ── HTTP + WebSocket Server ───────────────────────────────────────────────────
export const httpServer = createServer(app);

const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

const clients = new Set<WsClient>();

wss.on("connection", (ws: WsClient) => {
  clients.add(ws);
  logger.info({ total: clients.size }, "WebSocket client connected");

  // Send all current settings on connect
  import("./lib/cms-store").then(({ getAllSettings }) => {
    ws.send(JSON.stringify({ event: "settings:init", data: getAllSettings() }));
  });

  ws.on("close", () => {
    clients.delete(ws);
    logger.info({ total: clients.size }, "WebSocket client disconnected");
  });

  ws.on("error", (err) => {
    logger.error({ err }, "WebSocket error");
    clients.delete(ws);
  });
});

// Register broadcast function so cms-store can push updates
registerBroadcast((event, data) => {
  const message = JSON.stringify({ event, data });
  let sent = 0;
  clients.forEach((client) => {
    if (client.readyState === wsLib.WebSocket.OPEN) {
      client.send(message);
      sent++;
    }
  });
  logger.info({ event, clients: sent }, "WebSocket broadcast sent");
});

export default app;
