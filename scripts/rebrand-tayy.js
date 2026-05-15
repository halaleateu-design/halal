const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const skip = new Set(["node_modules", "data", "rebrand-tayy.js", "rebrand-halal-herbs.js"]);
const exts = new Set([".html", ".js", ".json", ".md", ".toml", ".svg", ".xml"]);

const reps = [
  ["window.Halal HerbsSite", "window.TayySite"],
  ["HalalHerbsSite", "TayySite"],
  ["HalalHerbsApi", "TayyApi"],
  ["HalalHerbsI18n", "TayyI18n"],
  ["HalalHerbs_IMAGE_UTILS", "Tayy_IMAGE_UTILS"],
  ["halalherbs_auth_token", "tayy_auth_token"],
  ["halalherbs_image_cache", "tayy_image_cache"],
  ["halalherbs.db", "tayy.db"],
  ["eu.halalherbs.app", "eu.tayy.app"],
  ["halalherbs-api", "tayy-api"],
  ["halalherbs-minuta", "tayy-minuta"],
  ["applyHalalHerbsSiteConfig", "applyTayySiteConfig"],
  ["Halal Herbs · UE", "Halal · UE"],
  ["Halal Herbs · EU", "Halal · EU"],
  ["Halal Herbs EU", "Tayy EU"],
  ["Halal Herbs", "Tayy"],
  ["HalalHerbs", "Tayy"],
];

function walk(dir) {
  let n = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) n += walk(p);
    else if (exts.has(path.extname(ent.name)) && !p.includes("node_modules")) {
      let c = fs.readFileSync(p, "utf8");
      const o = c;
      for (const [a, b] of reps) c = c.split(a).join(b);
      if (c !== o) {
        fs.writeFileSync(p, c);
        n += 1;
      }
    }
  }
  return n;
}

const a = walk(root);
const b = walk(path.join(root, "mobile", "www"));
console.log("Tayy + Halal EU: updated", a + b, "files");
