const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const skip = new Set(["node_modules", "data", "rebrand-go.js", "rebrand-tayy.js", "rebrand-halal-herbs.js"]);
const exts = new Set([".html", ".js", ".json", ".md", ".toml", ".svg", ".xml", ".bat"]);

const reps = [
  ["TayySite", "GOSite"],
  ["TayyApi", "GOApi"],
  ["TayyI18n", "GOI18n"],
  ["Tayy_IMAGE_UTILS", "GO_IMAGE_UTILS"],
  ["applyTayySiteConfig", "applyGOSiteConfig"],
  ["tayy_auth_token", "go_auth_token"],
  ["tayy_image_cache", "go_image_cache"],
  ["tayy.db", "go.db"],
  ["tayy-api", "go-api"],
  ["tayy-minuta", "go-minuta"],
  ["eu.tayy.app", "eu.halaleat.go.app"],
  ["Halal · UE", "Halal eat EU"],
  ["Halal · EU", "Halal eat EU"],
  ["Tayy EU", "HalalEat EU"],
  ["Tayy —", "GO —"],
  ["Tayy,", "GO,"],
  ["Tayy ", "GO "],
  [" Tayy", " GO"],
  ["\"Tayy\"", "\"GO\""],
  ["'Tayy'", "'GO'"],
  ["Tayy.", "GO."],
  ["Tayy?", "GO?"],
  ["Tayy", "GO"],
  ["tayy-api", "go-api"],
  ["tayy-halal", "go-halaleat"],
  ["TAYY", "GO"],
];

function walk(dir) {
  let n = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) n += walk(p);
    else if (exts.has(path.extname(ent.name))) {
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
const b = fs.existsSync(path.join(root, "mobile", "www")) ? walk(path.join(root, "mobile", "www")) : 0;
console.log("GO + Halal eat EU: updated", a + b, "files");
