/**
 * Vercel serverless function — proxies recipe generation requests to Google Gemini.
 * The API key never leaves the server.
 *
 * Set GEMINI_API_KEY in your Vercel project environment variables
 * (or in a local .env file for `vercel dev`).
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  const { model, contents, generationConfig } = req.body;

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
