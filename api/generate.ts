interface VercelReq {
  method?: string;
  body: {
    model?:            string;
    contents?:         unknown;
    generationConfig?: unknown;
  };
}

interface VercelRes {
  status(code: number): VercelRes;
  json(data: unknown):  void;
}

export default async function handler(req: VercelReq, res: VercelRes): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  const { model, contents, generationConfig } = req.body;

  const ALLOWED_MODELS = new Set(["gemini-2.5-flash", "gemini-3-flash-preview"]);
  if (!model || !ALLOWED_MODELS.has(model)) {
    return res.status(400).json({ error: "Invalid model." });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents, generationConfig }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return res.status(upstream.status).json(data);
  }

  return res.status(200).json(data);
}
