// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";

import rateLimit from "express-rate-limit";
import scanRoutes from "./routes/scan.js";

const app = express();
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Muitas requisições, tente novamente mais tarde" },
});

app.use(cors());
app.use(express.json());
app.use("/api/scan", scanLimiter, scanRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Header Scanner API rodando" });
});

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});