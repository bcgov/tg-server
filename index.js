require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

// CORS options to allow only requests from 'localhost:3000'
const corsOptions = {
  origin: "http://localhost:3000",
};

// Middleware for logging incoming requests and their status
app.use((req, res, next) => {
  const start = Date.now();

  // Log basic request info
  console.log(`[INFO] Incoming request: ${req.method} ${req.originalUrl}`);

  // Hook into the response `finish` event to log the status code and response time
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[INFO] Request completed: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${duration}ms`
    );
  });

  next(); // Pass control to the next middleware
});

app.use(cors(corsOptions));
app.use(express.json());

app.post("/token", async (req, res) => {
  try {
    const response = await axios.post(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        scope: process.env.SCOPE,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json({ token: response.data.access_token });
  } catch (error) {
    console.error("Error fetching token:", error.response.data);
    res.status(500).json({ message: "Failed to retrieve token" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
