import "dotenv/config";
import express from "express";
import path from "path";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  // Serve static web client files
  const webPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/dist/web'
    : 'dist/web';
  
  try {
    app.use(express.static(webPath));
  } catch (e) {
    console.log('[web] Static files not available, using fallback');
  }

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // SPA fallback: serve index.html for all non-API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      const indexPath = process.env.NODE_ENV === 'production'
        ? '/opt/render/project/src/dist/web/index.html'
        : 'dist/web/index.html';
      
      try {
        res.sendFile(indexPath);
      } catch (e) {
        // Fallback: serve a simple HTML page
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>StarQuest</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0a0e1a; color: #e2e8f0; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; text-align: center; }
              h1 { font-size: 2.5em; margin: 20px 0; }
              p { font-size: 1.1em; margin: 10px 0; }
              a { color: #f5c842; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⭐ StarQuest</h1>
              <p>별자리처럼 성취를 기록하고 추적하세요</p>
              <p style="margin-top: 40px; color: #718096;">앱을 로드하는 중입니다...</p>
              <p><a href="/">새로고침</a></p>
            </div>
          </body>
          </html>
        `);
      }
    }
  });

  console.log('[web] Server initialized - ready to serve');
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
