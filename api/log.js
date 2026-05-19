export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, surname, group, event, detail } = req.body;

  const SHEET_WEBHOOK = process.env.LOG_WEBHOOK_URL;
  if (!SHEET_WEBHOOK) {
    // Silently skip logging if not configured — never block the user
    return res.status(200).json({ ok: true });
  }

  try {
    const timestamp = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
    await fetch(SHEET_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp, firstName, surname, group, event, detail })
    });
  } catch (e) {
    // Log silently — never surface tracking errors to the user
  }

  return res.status(200).json({ ok: true });
}
