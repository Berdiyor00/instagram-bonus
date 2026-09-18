const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  getUsersFromStore,
  addUserToStore,
  clearUsersFromStore,
} = require("./supabase");

const app = express();
const port = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Berdiyor0711";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Berdiyor0711@";
const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.json");

app.use(express.json({ limit: "1mb" }));

function requireAdminPassword(req, res, next) {
  const suppliedUsername =
    req.headers["x-admin-username"] ||
    req.query.username ||
    "";
  const suppliedPassword =
    req.headers["x-admin-password"] ||
    req.query.password ||
    "";

  if (suppliedUsername === ADMIN_USERNAME && suppliedPassword === ADMIN_PASSWORD) {
    return next();
  }

  return res.status(401).json({ error: "Admin access required." });
}

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

async function getUsersForApi() {
  try {
    const users = await getUsersFromStore();
    if (Array.isArray(users) && users.length) {
      return users;
    }
    return readUsers();
  } catch (error) {
    return readUsers();
  }
}

async function addUserForApi(record) {
  try {
    const inserted = await addUserToStore(record);
    if (Array.isArray(inserted) && inserted.length) {
      return inserted;
    }
  } catch (error) {
    // fall through to local file save
  }

  const users = readUsers();
  const saved = [{ ...record, id: record.id || Date.now(), createdAt: record.createdAt || new Date().toISOString() }].concat(users);
  writeUsers(saved);
  return saved;
}

async function clearUsersForApi() {
  try {
    const cleared = await clearUsersFromStore();
    if (Array.isArray(cleared)) {
      return cleared;
    }
  } catch (error) {
    // fall through to local file save
  }

  writeUsers([]);
  return [];
}

app.get("/api/users", requireAdminPassword, async (req, res) => {
  const users = await getUsersForApi();
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  const body = req.body || {};
  const record = {
    ...body,
    id: body.id || Date.now(),
    createdAt: body.createdAt || new Date().toISOString(),
  };

  const users = await addUserForApi(record);
  res.json(users);
});

app.delete("/api/users", requireAdminPassword, async (req, res) => {
  const users = await clearUsersForApi();
  res.json(users);
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
