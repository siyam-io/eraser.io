/**
 * Access-control tests for the admin panel.
 * Run with the production server up:  node test-admin-access.mjs [baseUrl]
 */
import fs from "node:fs";
import { encode } from "next-auth/jwt";

// Load .env like the other scripts do.
try {
  const content = fs.readFileSync(".env", "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const BASE = process.argv[2] || "http://localhost:3100";
const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  console.error("NEXTAUTH_SECRET missing");
  process.exit(1);
}

// A valid session for a NON-admin user.
const userToken = await encode({
  token: {
    sub: "000000000000000000000001",
    email: "not-an-admin@example.com",
    name: "Regular User",
    role: "user",
  },
  secret,
});
const cookie = `next-auth.session-token=${userToken}`;

const results = [];
const check = (name, cond, detail) => {
  results.push({ name, ok: cond, detail });
  console.log(`[${cond ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

async function hit(path, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: "manual",
    headers,
  });
  const body = res.status >= 400 || res.status === 200 ? await res.text() : "";
  return { res, body };
}

// 1. Anonymous → /admin pages redirect to /login
{
  const { res } = await hit("/admin");
  const loc = res.headers.get("location") || "";
  check(
    "anon /admin → /login",
    res.status >= 300 && res.status < 400 && loc.includes("/login"),
    `${res.status} ${loc}`
  );
}
{
  const { res } = await hit("/admin/users");
  const loc = res.headers.get("location") || "";
  check(
    "anon /admin/users → /login",
    res.status >= 300 && res.status < 400 && loc.includes("/login"),
    `${res.status} ${loc}`
  );
}

// 2. Non-admin session → /admin pages redirect to /unauthorized
{
  const { res } = await hit("/admin", { cookie });
  const loc = res.headers.get("location") || "";
  check(
    "user-session /admin → /unauthorized",
    res.status >= 300 && res.status < 400 && loc.includes("/unauthorized"),
    `${res.status} ${loc}`
  );
}

// 3. Admin APIs reject anonymous with 401
for (const path of [
  "/api/admin/stats",
  "/api/admin/users",
  "/api/admin/subscriptions",
  "/api/admin/settings",
]) {
  const { res } = await hit(path);
  check(`anon ${path} → 401`, res.status === 401, `got ${res.status}`);
}

// 4. Admin APIs reject a non-admin session with 401/403
for (const path of ["/api/admin/stats", "/api/admin/users"]) {
  const { res } = await hit(path, { cookie });
  check(
    `non-admin ${path} → 401/403`,
    res.status === 401 || res.status === 403,
    `got ${res.status}`
  );
}

// 5. The unauthorized page itself renders
{
  const { res, body } = await hit("/unauthorized");
  check(
    "/unauthorized renders 200",
    res.status === 200 && /Not Authorized/i.test(body),
    `got ${res.status}`
  );
}

// 6. Regular app behavior untouched
for (const path of ["/", "/pricing", "/login"]) {
  const { res } = await hit(path);
  check(`${path} still 200`, res.status === 200, `got ${res.status}`);
}

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} access checks passed`
);
process.exit(failed.length ? 1 : 0);
