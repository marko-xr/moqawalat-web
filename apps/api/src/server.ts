import "./config/runtime-env.js";
import { app } from "./app.js";
import { ensurePrismaConnection } from "./services/prisma.js";

const port = Number(process.env.PORT || process.env.API_PORT || 4000);
const host = "0.0.0.0";

async function bootstrap() {
  console.log("=== API STARTUP ===");
  console.log("APP_VERSION:", process.env.APP_VERSION || "no-version");
  console.log("CLOUDINARY_CONFIGURED:", !!process.env.CLOUDINARY_CLOUD_NAME);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("=== END STARTUP ===");

  await ensurePrismaConnection();

  app.listen(port, host, () => {
    console.log(`API listening on http://${host}:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("API startup failed:", error);
  process.exit(1);
});
