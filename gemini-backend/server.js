const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.json({ status: "online", service: "ProxyUser Gemini backend" });
});

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

const port = process.env.PORT || 10000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
