import { app } from "./app.js";

const port = Number(process.env.PORT || process.env.API_PORT || 4000);
const host = "0.0.0.0";

app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});
