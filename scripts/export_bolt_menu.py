import csv
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
text = (root / "menu-data.js").read_text(encoding="utf-8")

m = re.search(r"items:\s*\{", text)
if not m:
    raise SystemExit("Could not find items: {")
start = m.end() - 1

depth = 0
i = start
body_start = None
while i < len(text):
    c = text[i]
    if c == "{":
        depth += 1
        if depth == 1:
            body_start = i + 1
    elif c == "}":
        depth -= 1
        if depth == 0:
            items_body = text[body_start:i]
            break
    i += 1
else:
    raise SystemExit("Unclosed items object")

item_starts = list(re.finditer(r'\n    "([^"]+)": \{', items_body))
items: dict[str, dict] = {}

for match in item_starts:
    name = match.group(1)
    block_start = match.end() - 1
    depth = 0
    k = block_start
    while k < len(items_body):
        if items_body[k] == "{":
            depth += 1
        elif items_body[k] == "}":
            depth -= 1
            if depth == 0:
                block = items_body[block_start + 1 : k]
                break
        k += 1
    else:
        raise SystemExit(f"Unclosed block for {name}")

    pm = re.search(r"price:\s*([\d.]+)", block)
    price = pm.group(1) if pm else ""

    pts: list[str] = []
    if "points:" in block:
        pa = block.split("points:", 1)[1]
        pa = pa.split("]", 1)[0] + "]"
        pts = re.findall(r'"((?:\\.|[^"\\])*)"', pa)

    first_cat = ""
    gm = re.search(r"groups:\s*\[(.*?)\]", block, re.DOTALL)
    if gm:
        fm = re.search(r'"((?:\\.|[^"\\])*)"', gm.group(1))
        first_cat = fm.group(1) if fm else ""
    cm = re.search(r'category:\s*"([^"]*)"', block)
    cat = first_cat or (cm.group(1) if cm else "")
    desc = ". ".join(pts) + ("." if pts else "")
    items[name] = {"category": cat, "description": desc, "price": price}

out_csv = root / "bolt-food-menu.csv"
with out_csv.open("w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["Category", "Item name", "Description", "Price (EUR)"])
    for name, d in items.items():
        w.writerow([d["category"], name, d["description"], d["price"]])

lines = [
    "Bolt: image file name (without extension) must match the item name exactly.",
    "Use JPG or PNG. Windows forbids these in filenames: \\ / : * ? \" < > |",
    "",
]
for name in items:
    safe = re.sub(r'[\\/:*?"<>|]', "-", name)
    lines.append(f"{name}  ->  {safe}.jpg")

(root / "bolt-photo-filenames.txt").write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {out_csv.name} and bolt-photo-filenames.txt ({len(items)} items)")
