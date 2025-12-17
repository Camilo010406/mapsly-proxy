// api/mapsly-appointment.js
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      id,
      address,
      city,
      state,
      postal_code_new,
      appointment_date_time,
      van,
    } = req.body || {};

    if (!id || !appointment_date_time || !van) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const payload = [
      {
        id,
        address,
        city,
        state,
        postal_code_new,
        appointment_date_time,
        van,
      },
    ];

    const url =
      "https://api.mapsly.com/v1/record?entity=deals&async=false&apikey=" +
      process.env.MAPSLY_API_KEY;

    const mapslyRes = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await mapslyRes.text();
    let body = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch (_) {}

    if (!mapslyRes.ok) {
      return res
        .status(mapslyRes.status)
        .json({ ok: false, source: "mapsly", body });
    }

    return res.status(200).json({ ok: true, body });
  } catch (e) {
    console.error("Mapsly proxy error:", e);
    return res.status(500).json({ ok: false, error: "Internal error" });
  }
};
