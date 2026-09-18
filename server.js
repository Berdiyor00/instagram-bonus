const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.json");

app.use(express.json({ limit: "1mb" }));

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]", "utf8");
  }
}

function readUsers() {
  ensureDataFile();
  const raw = fs.readFileSync(usersFile, "utf8");
  try {
    return JSON.parse(raw) || [];
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  ensureDataFile();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
}

app.get("/api/users", (req, res) => {
  res.json(readUsers());
});

app.post("/api/users", (req, res) => {
  const body = req.body || {};
  const users = readUsers();
  const record = {
    ...body,
    id: body.id || Date.now(),
    createdAt: body.createdAt || new Date().toISOString(),
  };

  users.unshift(record);
  writeUsers(users);
  res.json(users);
});

app.delete("/api/users", (req, res) => {
  writeUsers([]);
  res.json([]);
});

app.use(express.static(__dirname));

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "index.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.listen(port, () => {
  console.log(`Instagram bonus app running on http://localhost:${port}`);
});
