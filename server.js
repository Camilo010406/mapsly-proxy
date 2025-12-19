import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// URL base de Mapsly para deals (sin apikey)
const MAPSLY_URL =
  "https://api.mapsly.com/v1/record?entity=deals&async=false";

app.use(cors());
app.use(express.text({ type: "*/*" })); // para parsear cualquier tipo de contenido como texto

// healthcheck
app.get("/test", (req, res) => {
  res.json({ ok: true });
});

// proxy hacia Mapsly
app.post("/proxy", async (req, res) => {
  try {
    // req.body es un string tipo "[{...}]"
    console.log("Raw body from HubSpot:", req.body);

    let parsedBody;
    try {
      parsedBody = JSON.parse(req.body);
    } catch (e) {
      console.error("Error parsing incoming JSON:", e);
      return res.status(400).send("Bad Request");
    }

    const apiKey = process.env.MAPSLY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "MAPSLY_API_KEY not configured" });
    }

    const urlConApiKey = `${MAPSLY_URL}&apikey=${apiKey}`;

    const mapslyResponse = await axios.post(urlConApiKey, parsedBody, {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
    });

    res.status(mapslyResponse.status).json(mapslyResponse.data);
  } catch (err) {
    console.error("Mapsly error status:", err.response?.status);
    console.error("Mapsly error data:", err.response?.data);
    res
      .status(err.response?.status || 500)
      .json({
        error: "Mapsly proxy error",
        detail: err.response?.data || err.message,
      });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
