#!/usr/bin/env node
// vantedge-gp — SessionStart update nudge.
// Once/day, fail-silent: compares the installed plugin version against the repo's
// latest and, if behind, emits a one-line nudge telling the user how to update.
// Never blocks startup, never errors out, no dependencies (Node stdlib only).

const fs = require("fs");
const path = require("path");
const https = require("https");

const root =
  process.env.CLAUDE_PLUGIN_ROOT || __dirname.replace(/[\\/]hooks$/, "");
const cfg =
  process.env.CLAUDE_CONFIG_DIR ||
  path.join(process.env.HOME || process.env.USERPROFILE || ".", ".claude");
const RAW =
  "https://raw.githubusercontent.com/8vdx1/vantedge-gp-skills/main/.claude-plugin/plugin.json";
const STAMP = path.join(cfg, ".vantedge-gp-update-check");

// SessionStart context emitter (the model relays additionalContext to the user).
function emit(ctx) {
  process.stdout.write(
    JSON.stringify(
      ctx
        ? { hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: ctx } }
        : {},
    ),
  );
}

function cmp(a, b) {
  const A = String(a).split(".").map((n) => parseInt(n, 10) || 0);
  const B = String(b).split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((A[i] || 0) > (B[i] || 0)) return 1;
    if ((A[i] || 0) < (B[i] || 0)) return -1;
  }
  return 0;
}

try {
  const installed =
    JSON.parse(fs.readFileSync(path.join(root, ".claude-plugin", "plugin.json"), "utf8"))
      .version || "0.0.0";

  // throttle: at most one network check per 24h
  let last = 0;
  try { last = parseInt(fs.readFileSync(STAMP, "utf8"), 10) || 0; } catch {}
  const now = Date.now();
  if (now - last < 24 * 3600 * 1000) { emit(""); return; }
  try { fs.writeFileSync(STAMP, String(now)); } catch {}

  const req = https.get(RAW, { timeout: 3000 }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      try {
        const latest = JSON.parse(d).version || "0.0.0";
        if (cmp(latest, installed) > 0) {
          emit(
            `A newer version of the vantedge-gp plugin is available (${installed} → ${latest}). ` +
              `Tell the user in one line that they can update with: ` +
              `\`/plugin marketplace update vantedge-gp-skills\` then ` +
              `\`/plugin install vantedge-gp@vantedge-gp-skills\`.`,
          );
        } else emit("");
      } catch { emit(""); }
    });
  });
  req.on("error", () => emit(""));
  req.on("timeout", () => { req.destroy(); emit(""); });
} catch {
  emit("");
}
