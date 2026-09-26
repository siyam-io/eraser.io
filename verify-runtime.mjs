/**
 * Runtime verification for the Minimalist Monochrome rollout.
 * Spawns headless Chrome, checks computed styles on every page via CDP,
 * writes screenshots to ./verify-shots/. No dependencies (Node 24 WebSocket).
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME =
  process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : "google-chrome";
const PORT = 9333;
const BASE = process.env.VERIFY_BASE || "http://localhost:3100";
const PAGES = [
  "/", "/about", "/blog", "/careers", "/history", "/projects",
  "/services", "/pricing", "/login", "/register", "/dashboard",
];

mkdirSync("verify-shots", { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.cwd()}\\.chrome-verify-profile`,
    "--no-first-run",
    "--disable-gpu",
    "--window-size=1440,900",
    "about:blank",
  ],
  { stdio: "ignore" }
);

const kill = (pid) => {
  try {
    if (process.platform === "win32")
      spawn("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    else process.kill(-pid);
  } catch {}
};

async function waitForChrome() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return;
    } catch {}
    await sleep(300);
  }
  throw new Error("Chrome CDP never came up");
}

const CHECK = `
(() => {
  const out = { badColors: [], rounded: [], fonts: {}, sizes: {}, overflowX: false };
  const isGray = (c) => {
    const m = c.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
    if (!m) return true;
    if (m[4] !== undefined && parseFloat(m[4]) === 0) return true;
    const [r, g, b] = [+m[1], +m[2], +m[3]];
    return r === g && g === b;
  };
  const els = document.querySelectorAll("body *");
  let n = 0;
  for (const el of els) {
    if (++n > 4000) break;
    const cs = getComputedStyle(el);
    for (const prop of ["color", "backgroundColor"]) {
      const v = cs[prop];
      if (v && !isGray(v)) {
        out.badColors.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 50), prop, v });
        if (out.badColors.length > 6) return out;
      }
    }
    const br = cs.borderTopLeftRadius;
    if (br && br !== "0px" && !el.closest("[data-sonner-toast]") && el.tagName !== "PATH") {
      out.rounded.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 50), br });
      if (out.rounded.length > 6) return out;
    }
  }
  const body = getComputedStyle(document.body);
  out.fonts.body = body.fontFamily;
  out.sizes.bodyBg = body.backgroundColor;
  const h1 = document.querySelector("h1, h2");
  if (h1) {
    out.fonts.h1 = getComputedStyle(h1).fontFamily;
    out.sizes.h1 = getComputedStyle(h1).fontSize;
  }
  out.sizes.docHeight = document.documentElement.scrollHeight;
  out.overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
  return out;
})()
`;

async function main() {
  await waitForChrome();

  const t = await fetch(
    `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE + "/")}`,
    { method: "PUT" }
  ).then((r) => r.json());

  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let id = 0;
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
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  await new Promise((res) => (ws.onopen = res));
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  const evaluate = async (expression) => {
    const m = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return m.result?.result?.value;
  };

  const failures = [];

  for (const route of PAGES) {
    consoleErrors.length = 0;
    await send("Page.navigate", { url: BASE + route });
    await sleep(3000);

    const r = await evaluate(CHECK);
    const name = route.strip?.("/") || route.replace(/^\//, "") || "home";
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      `verify-shots/${name || "home"}.png`,
      Buffer.from(shot.result.data, "base64")
    );

    const ok = r && r.badColors.length === 0 && r.rounded.length === 0 && !r.overflowX;
    if (!ok) failures.push(route);
    if (route === "/" && r) {
      if (!/Playfair/i.test(r.fonts.h1 || "")) {
        failures.push("h1 font not Playfair");
        console.log("FAIL h1 font:", r.fonts.h1);
      }
      if (!/Source Serif/i.test(r.fonts.body || "")) {
        failures.push("body font not Source Serif");
        console.log("FAIL body font:", r.fonts.body);
      }
    }
    console.log(
      `[${ok ? "PASS" : "FAIL"}] ${route.padEnd(12)} h1:${r?.sizes?.h1 || "-"} ` +
        `doc:${r?.sizes?.docHeight || "-"}px colors_bad:${r?.badColors.length ?? "?"} ` +
        `rounded:${r?.rounded.length ?? "?"} overflowX:${r?.overflowX ?? "?"}`
    );
    if (r?.badColors.length)
      console.log("   non-mono:", JSON.stringify(r.badColors.slice(0, 3)));
    if (r?.rounded.length)
      console.log("   rounded:", JSON.stringify(r.rounded.slice(0, 3)));
    if (consoleErrors.length)
      console.log("   console errors:", consoleErrors.slice(0, 2));
  }

  // Mobile viewport check on home
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
  });
  await send("Page.navigate", { url: BASE + "/" });
  await sleep(2500);
  const mob = await evaluate(`document.documentElement.scrollWidth > document.documentElement.clientWidth + 2`);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync("verify-shots/mobile-home.png", Buffer.from(shot.result.data, "base64"));
  console.log(`[${mob ? "FAIL" : "PASS"}] mobile overflow on home: ${mob}`);
  if (mob) failures.push("mobile overflow");

  ws.close();
  kill(chrome.pid);

  console.log();
  if (failures.length) {
    console.log("VERIFICATION FAILED:", failures.join(", "));
    process.exit(1);
  }
  console.log("ALL RUNTIME CHECKS PASSED — screenshots in ./verify-shots/");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  kill(chrome.pid);
  process.exit(1);
});
