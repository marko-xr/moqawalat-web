import "./config/runtime-env.js";
import { app } from "./app.js";
import { ensurePrismaConnection } from "./services/prisma.js";

const port = Number(process.env.PORT || process.env.API_PORT || 4000);
const host = "0.0.0.0";

async function bootstrap() {
  await ensurePrismaConnection();

  app.listen(port, host, () => {
    console.log(`API listening on http://${host}:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("API startup failed:", error);
  process.exit(1);
});
