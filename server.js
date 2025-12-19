import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// healthcheck
app.get("/test", (req, res) => {
  res.json({ ok: true });
});

// proxy hacia Mapsly
app.post("/proxy", async (req, res) => {
  try {
    const apiKey = process.env.MAPSLY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "MAPSLY_API_KEY not configured" });
    }

    // adapta esta parte a cómo llamabas a Mapsly en Vercel
    const mapslyResponse = await axios.post(
      "https://cloud.mapsly.com/api/xxxxx", // URL real de Mapsly
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey
        }
      }
    );

    res.status(mapslyResponse.status).json(mapslyResponse.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json({ error: "Mapsly proxy error", detail: err.response?.data || err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
