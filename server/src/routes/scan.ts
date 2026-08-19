import { Router } from "express";
import { assertSafeUrl, UnsafeUrlError } from "../lib/urlSafety.js";
import { analyzeHeaders } from "../lib/analyzer.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL é obrigatória" });
    }

    const safeUrl = await assertSafeUrl(url);

    const response = await fetch(safeUrl, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    const analysis = analyzeHeaders(headers);

    res.json({
      url: safeUrl.toString(),
      status: response.status,
      headers,
      ...analysis,
    });
  } catch (err) {
    if (err instanceof UnsafeUrlError) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Não foi possível analisar essa URL" });
  }
});

export default router;
