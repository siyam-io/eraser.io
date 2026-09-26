/**
 * End-to-end admin panel verification.
 *
 * Creates a temporary admin account, logs in through the real NextAuth flow,
 * loads every admin page in headless Chrome, asserts key UI markers, takes
 * screenshots, then cleans the temp accounts out of the database.
 *
 * Run with the production server up:  node verify-admin.mjs [baseUrl]
 */
import fs from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import mongoose from "mongoose";

try {
  const content = fs.readFileSync(".env", "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const BASE = process.argv[2] || "http://localhost:3100";
const ADMIN_EMAIL = "admin-test-e2e@example.com";
const VICTIM_EMAIL = "admin-victim-e2e@example.com";
const PASSWORD = "E2eVerify!2026";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9335;

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

/* ---------------------------------------------------- 1. seed temp admin */
console.log("== Setup: register + promote temp admin ==");
const reg = await fetch(`${BASE}/api/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "E2E Admin", email: ADMIN_EMAIL, password: PASSWORD }),
});
check("register temp admin", reg.status === 201 || reg.status === 409, `status ${reg.status}`);

const seed = spawnSync("node", ["scripts/admin-seed.mjs", ADMIN_EMAIL], {
  encoding: "utf8",
});
check("seed script promoted admin", /→ admin/.test(seed.stdout || ""), (seed.stdout || seed.stderr || "").trim().split("\n").slice(-2).join(" | "));

/* ---------------------------------------------------- 2. real NextAuth login */
const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
const setCookies = csrfRes.headers.getSetCookie?.() ?? [];
const csrfBody = await csrfRes.json();
const cookieJar = new Map();
for (const c of setCookies) {
  const [pair] = c.split(";");
  const idx = pair.indexOf("=");
  cookieJar.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
}
const jarHeader = () => [...cookieJar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
  method: "POST",
  redirect: "manual",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie: jarHeader(),
  },
  body: new URLSearchParams({
    csrfToken: csrfBody.csrfToken,
    email: ADMIN_EMAIL,
    password: PASSWORD,
    json: "true",
  }),
});
for (const c of loginRes.headers.getSetCookie?.() ?? []) {
  const [pair] = c.split(";");
  const idx = pair.indexOf("=");
  cookieJar.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
}
const sessionCookie = [...cookieJar.entries()].find(([k]) =>
  k.includes("session-token")
);
const loginBody = await loginRes.json().catch(() => null);
check(
  "next-auth credentials login",
  Boolean(sessionCookie) && !loginBody?.error,
  `status ${loginRes.status}${loginBody?.error ? ` error=${loginBody.error}` : ""}`
);
if (!sessionCookie) process.exit(1);

/* ---------------------------------------------------- 3. Chrome + CDP */
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.cwd()}\\.chrome-admin-profile`,
    "--no-first-run",
    "--disable-gpu",
    "--window-size=1440,900",
    "about:blank",
  ],
  { stdio: "ignore" }
);
const killChrome = () => {
  try {
    spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
  } catch {}
};

for (let i = 0; i < 50; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    if (r.ok) break;
  } catch {}
  await sleep(300);
}

const t = await fetch(
  `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE + "/")}`,
  { method: "PUT" }
).then((r) => r.json());
const ws = new WebSocket(t.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
const consoleErrors = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method === "Runtime.exceptionThrown") {
    consoleErrors.push(m.params.exceptionDetails?.text || "exception");
  } else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    consoleErrors.push(
      m.params.args?.map((a) => a.value || a.description || "").join(" ") || "console.error"
    );
  }
};
const send = (method, params = {}) =>
  new Promise((res) => {
    const i = ++msgId;
    pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
await new Promise((res) => (ws.onopen = res));
await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");

await send("Network.setCookie", {
  name: sessionCookie[0],
  value: decodeURIComponent(sessionCookie[1]),
  url: BASE,
  path: "/",
});

const evaluate = async (expr) => {
  const m = await send("Runtime.evaluate", {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
  });
  return m.result?.result?.value;
};

fs.mkdirSync("verify-shots", { recursive: true });

async function visit(path, markerExpr, shotName) {
  consoleErrors.length = 0;
  await send("Page.navigate", { url: BASE + path });
  // Poll for the marker — heavy endpoints (Stripe) can take a few seconds.
  let state = null;
  for (let i = 0; i < 15; i++) {
    await sleep(900);
    state = await evaluate(`(() => ({
      path: location.pathname,
      marker: ${markerExpr},
      bodyText: document.body.innerText.slice(0, 4000),
    }))()`);
    if (state?.marker) break;
  }
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`verify-shots/${shotName}.png`, Buffer.from(shot.result.data, "base64"));
  const ok = state?.path === path && state?.marker;
  check(
    `renders ${path}`,
    ok,
    `path=${state?.path}${ok ? "" : ` | got: ${(state?.bodyText || "").replace(/\s+/g, " ").slice(0, 140)}`}${consoleErrors.length ? ` console:${consoleErrors[0]}` : ""}`
  );
  return state;
}

/* ---------------------------------------------------- 4. walk every page */
await visit("/admin", `document.body.innerText.toLowerCase().includes("registered users") && !!document.querySelector("svg")`, "admin-dashboard");
const usersState = await visit(
  "/admin/users",
  `document.body.innerText.toLowerCase().includes("search users") && !!document.querySelector("table")`,
  "admin-users"
);
await visit(
  "/admin/subscriptions",
  `document.body.innerText.toLowerCase().includes("customers") && !!document.querySelector("table")`,
  "admin-subscriptions"
);
await visit(
  "/admin/settings",
  `document.body.innerText.toLowerCase().includes("global settings")`,
  "admin-settings"
);

/* ---------------------------------------------------- 5. user detail page */
const listRes = await fetch(`${BASE}/api/admin/users?pageSize=5`, {
  headers: { Cookie: jarHeader() },
});
const list = await listRes.json();
check("admin users API returns data", listRes.ok && list.total >= 1, `total=${list.total}`);

if (list.users?.length) {
  await visit(
    `/admin/users/${list.users[0]._id}`,
    `document.body.innerText.includes("Access") && document.body.innerText.includes("Subscription")`,
    "admin-user-detail"
  );
}

/* ---------------------------------------------------- 6. self-protection */
const selfId = list.users?.find((u) => u.email === ADMIN_EMAIL)?._id;
if (selfId) {
  const demote = await fetch(`${BASE}/api/admin/users/${selfId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: jarHeader() },
    body: JSON.stringify({ role: "user" }),
  });
  check("self-demotion blocked (400)", demote.status === 400, `status ${demote.status}`);

  const del = await fetch(`${BASE}/api/admin/users/${selfId}`, {
    method: "DELETE",
    headers: { Cookie: jarHeader() },
  });
  check("self-deletion blocked (400)", del.status === 400, `status ${del.status}`);
}

/* ---------------------------------- 7. DELETE endpoint (second temp user) */
const victimReg = await fetch(`${BASE}/api/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "E2E Victim", email: VICTIM_EMAIL, password: PASSWORD }),
});
const victimList = await (
  await fetch(`${BASE}/api/admin/users?search=${VICTIM_EMAIL}`, {
    headers: { Cookie: jarHeader() },
  })
).json();
const victim = victimList.users?.find((u) => u.email === VICTIM_EMAIL);
if (victim) {
  const delRes = await fetch(`${BASE}/api/admin/users/${victim._id}`, {
    method: "DELETE",
    headers: { Cookie: jarHeader() },
  });
  const delBody = await delRes.json().catch(() => null);
  check(
    "admin DELETE endpoint works",
    delRes.ok && delBody?.deleted?.user === 1,
    `status ${delRes.status}`
  );
} else {
  check("victim user findable", false, `register status ${victimReg.status}`);
}

ws.close();
killChrome();

/* ---------------------------------------------------- 8. cleanup temp admin */
await mongoose.connect(process.env.MONGODB_URI);
const users = mongoose.connection.collection("users");
for (const email of [ADMIN_EMAIL, VICTIM_EMAIL]) {
  const res = await users.deleteOne({ email });
  console.log(`cleanup ${email}: ${res.deletedCount} deleted`);
}
await mongoose.disconnect();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} admin E2E checks passed`);
console.log("Screenshots: verify-shots/admin-*.png");
process.exit(failed.length ? 1 : 0);
