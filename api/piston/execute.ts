import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const base = process.env.PISTON_URL; 
  if (!base) {
    return res.status(500).json({ error: "PISTON_URL is not set" });
  }

  const upstream = await fetch(`${base}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });

  const text = await upstream.text();
  res.status(upstream.status).send(text);
}
