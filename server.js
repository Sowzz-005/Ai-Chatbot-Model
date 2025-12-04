// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config(); // loads .env
console.log("Loaded key prefix:", (process.env.GEMINI_API_KEY || "").slice(0, 10));

const app = express();
const PORT = process.env.PORT || 3000;

// allow your front‑end (GitHub Pages or local) to call this API
app.use(cors());
app.use(express.json({ limit: "10mb" })); // parse JSON, allow base64 image

app.post("/api/chat", async (req, res) => {
  try {
    const { message, file } = req.body; // { message, file: { mime_type, data } }

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: message || "" },
            ...(file && file.data
              ? [{
                  inlineData: {
                    mimeType: file.mime_type,
                    data: file.data
                  }
                }]
              : [])
          ]
        }
      ]
    };

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", data);
    res.json(data);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
