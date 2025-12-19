import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// URL base de Mapsly para deals (sin apikey)
const MAPSLY_URL =
  "https://api.mapsly.com/v1/record?entity=deals&async=false";

app.use(cors());
app.use(express.json());

// healthcheck
app.get("/test", (req, res) => {
  res.json({ ok: true });
});

// proxy hacia Mapsly
app.post("/proxy", async (req, res) => {
    console.log("Incoming headers from HubSpot:", req.headers);
  try {
    const apiKey = process.env.MAPSLY_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "MAPSLY_API_KEY not configured" });
    }

    const urlConApiKey = `${MAPSLY_URL}&apikey=${apiKey}`;

    const mapslyResponse = await axios.post(
      urlConApiKey,
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          // Si la doc de Mapsly requiere este header, déjalo;
          // si no lo mencionan, puedes quitarlo sin problema.
          "X-Api-Key": apiKey
        }
      }
    );

    res.status(mapslyResponse.status).json(mapslyResponse.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json({
        error: "Mapsly proxy error",
        detail: err.response?.data || err.message
      });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
