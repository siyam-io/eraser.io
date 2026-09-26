/**
 * Admin seeding: elevate (or demote) users to the `admin` role.
 *
 * Usage:
 *   node scripts/admin-seed.mjs admin@example.com another@example.com  # promote
 *   node scripts/admin-seed.mjs --demote admin@example.com            # demote
 *   node scripts/admin-seed.mjs                                       # promote the FIRST user
 *   node scripts/admin-seed.mjs --list                                 # show admins
 *
 * ADMIN_EMAILS="a@x.com,b@y.com" node scripts/admin-seed.mjs           # promote via env
 */
import fs from "node:fs";
import mongoose from "mongoose";

// Load .env the same way the other ops scripts do.
try {
  const content = fs.readFileSync(".env", "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // No .env — rely on the ambient environment.
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

const argv = process.argv.slice(2);
const demote = argv.includes("--demote");
const listOnly = argv.includes("--list");
const positional = argv.filter((a) => !a.startsWith("--"));
const envEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const emails = [...new Set([...positional, ...envEmails])];

await mongoose.connect(uri);
const users = mongoose.connection.collection("users");

if (listOnly) {
  const admins = await users
    .find({ role: "admin" }, { projection: { email: 1, name: 1, createdAt: 1 } })
    .toArray();
  if (!admins.length) {
    console.log("No admins yet. Run: node scripts/admin-seed.mjs you@example.com");
  } else {
    console.log(`Admins (${admins.length}):`);
    for (const a of admins) console.log(`  - ${a.email} (${a.name ?? "no name"})`);
  }
  await mongoose.disconnect();
  process.exit(0);
}

let targets = emails;

if (targets.length === 0) {
  // No addresses given: fall back to the very first account, as the plan calls for.
  const first = await users
    .find({}, { projection: { email: 1, name: 1 } })
    .sort({ createdAt: 1 })
    .limit(1)
    .toArray();
  if (!first.length) {
    console.error("No users found — register an account first.");
    await mongoose.disconnect();
    process.exit(1);
  }
  targets = [first[0].email];
  console.log(`No emails given → using the first user: ${targets[0]}`);
}

const role = demote ? "user" : "admin";
let ok = 0;

for (const email of targets) {
  const normalized = email.trim().toLowerCase();
  const res = await users.updateOne(
    { $expr: { $eq: [{ $toLower: "$email" }, normalized] } },
    { $set: { role } }
  );
  if (res.matchedCount === 0) {
    console.warn(`  ✗ no user with email ${normalized}`);
  } else {
    console.log(`  ✓ ${normalized} → ${role}`);
    ok += 1;
  }
}

const admins = await users
  .find({ role: "admin" }, { projection: { email: 1 } })
  .toArray();
console.log(`\n✓ ${ok} user(s) updated. Current admins (${admins.length}):`);
for (const a of admins) console.log(`  - ${a.email}`);

await mongoose.disconnect();
console.log("\nDone. Affected users must sign out and back in to refresh their session.");
