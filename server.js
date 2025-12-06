// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
console.log("Loaded key prefix:", (process.env.GEMINI_API_KEY || "").slice(0, 10));

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: allow GitHub Pages and local dev with whitelist + preflight
const allowedOrigins = [
  "https://sowzz-005.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:5500"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight

app.use(express.json({ limit: "10mb" }));

app.post("/api/chat", async (req, res) => {
  try {
    const { message, file } = req.body;

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

// simple health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
