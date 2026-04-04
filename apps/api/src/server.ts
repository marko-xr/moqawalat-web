import { app } from "./app.js";

const port = Number(process.env.API_PORT || 4000);

app.listen(port, "127.0.0.1", () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});
