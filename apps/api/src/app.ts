import "dotenv/config";
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import authRoutes from "./routes/auth.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import leadsRoutes from "./routes/leads.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

export const app = express();

const allowedOrigins = new Set([
  process.env.WEB_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.send("API is running");
});

app.get("/api", (_req, res) => {
  res.json({ message: "API working" });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "moqawalat-api" });
});

app.get("/api/debug/routes", (_req, res) => {
  res.json({
    routes: [
      "/api/health",
      "/api/services",
      "/api/services/:slug",
      "/api/projects",
      "/api/projects/:slug",
      "/api/blog",
      "/api/blog/:slug",
      "/api/settings",
      "/api/leads",
      "/api/analytics"
    ]
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("API error:", err);
  return res.status(500).json({ message: err.message || "Unexpected server error" });
});
