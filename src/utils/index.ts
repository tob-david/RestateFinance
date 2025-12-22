import express from "express";

import { initializePool } from "../database/database";
import { executeQuery } from "../database/config";

const app = express();
app.use(express.json());

app.get("/sendsoaautomation", async (_req, res) => {
  try {
    const result = await executeQuery(
      "SELECT 'Hello Oracle from TypeScript!' AS message FROM dual"
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

(async () => {
  await initializePool();

  app.listen(3000, () =>
    console.log("🚀 Server running on http://localhost:3000")
  );
})();
