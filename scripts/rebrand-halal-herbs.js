const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const skipDirs = new Set(["node_modules", "data"]);
const exts = new Set([".html", ".js", ".css", ".json", ".md", ".toml", ".svg", ".xml", ".env"]);

const reps = [
  ["HalalHerbsSite", "HalalHerbsSite"],
  ["HalalHerbsApi", "HalalHerbsApi"],
  ["HalalHerbsI18n", "HalalHerbsI18n"],
  ["HalalHerbs_IMAGE_UTILS", "HalalHerbs_IMAGE_UTILS"],
  ["halalherbs_auth_token", "halalherbs_auth_token"],
  ["halalherbs_image_cache", "halalherbs_image_cache"],
  ["halalherbs.db", "halalherbs.db"],
  ["eu.halalherbs.app", "eu.halalherbs.app"],
  ["eu.halalherbs.app", "eu.halalherbs.app"],
  ["halalherbs-api", "halalherbs-api"],
  ["halalherbs-minuta", "halalherbs-minuta"],
  ["applyHalalHerbsSiteConfig", "applyHalalHerbsSiteConfig"],
  ["eathalaleu", "eathalaleu"],
  ["Halal Herbs EU", "Halal Herbs EU"],
  ["Halal Herbs", "Halal Herbs"],
  ["Halal Herbs EU", "Halal Herbs EU"],
  ["Halal Herbs", "Halal Herbs"],
  ["Halal Herbs EU", "Halal Herbs EU"],
  ["Halal Herbs · UE", "Halal Herbs · UE"],
  ["Halal Herbs · EU", "Halal Herbs · EU"],
  ['"Halal Herbs"', '"Halal Herbs"'],
  ["'Halal Herbs'", "'Halal Herbs'"],
  ["Halal Herbs —", "Halal Herbs —"],
  ["Halal Herbs,", "Halal Herbs,"],
  ["Halal Herbs ", "Halal Herbs "],
  [" Halal Herbs", " Halal Herbs"],
  ["Halal Herbs.", "Halal Herbs."],
  ["Halal Herbs?", "Halal Herbs?"],
  ["Halal Herbs'", "Halal Herbs'"],
  ["Halal Herbs", "Halal Herbs"],
];

let count = 0;

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p);
      continue;
    }
    if (!exts.has(path.extname(ent.name))) continue;
    let c = fs.readFileSync(p, "utf8");
    const orig = c;
    for (const [from, to] of reps) c = c.split(from).join(to);
    if (c !== orig) {
      fs.writeFileSync(p, c);
      count += 1;
    }
  }
}

walk(root);
walk(path.join(root, "mobile", "www"));
console.log("Halal Herbs rebrand: updated", count, "files");
