/**
 * Vercel serverless function — proxies recipe generation requests to Anthropic.
 * The API key never leaves the server.
 *
 * Set ANTHROPIC_API_KEY in your Vercel project environment variables
 * (or in a local .env file for `vercel dev`).
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server." });
  }

  const { model, messages, max_tokens, temperature } = req.body;

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, messages, max_tokens, temperature }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return res.status(upstream.status).json(data);
  }

  return res.status(200).json(data);
}
