#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extract target colleges from data.js via node"""
import subprocess, json, sys, os

DATA_PATH = r"C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\js\data.js"
OUT_PATH = r"C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\data-collection\targets_raw.json"

# Build a node script that loads data.js then dumps targets
NODE_SCRIPT = r"""
const fs = require('fs');
// With `node -e script arg`, argv = [node_path, arg]
const path = process.argv[1];
const code = fs.readFileSync(path, 'utf8');
// Append export of COLLEGES (find the array const name)
const arrName = 'COLLEGES';
const targets = [5,8,18,20,37,40,41,50,54];
// Use indirect eval in global scope
const wrapped = code + `
;const __out = ${arrName}.filter(c => targets.includes(c.id)).map(c => ({
  id: c.id, name: c.name, website: c.website || c.url || c.link || '',
  city: c.city || '', nature: c.nature || '', type: c.type || '',
  majors: (c.majors||[]).map(m => ({name: m.name, code: m.code, category: m.category, fee: m.fee, plan2026: m.plan2026}))
}));
console.log(JSON.stringify(__out));
`;
// Write to temp file and require it
const tmp = path + '.tmp_eval.js';
fs.writeFileSync(tmp, wrapped);
try {
  require(tmp);
} catch(e) {
  console.error('EVAL ERR:', e.message);
  process.exit(1);
} finally {
  try { fs.unlinkSync(tmp); } catch(e){}
}
"""

r = subprocess.run(["node", "-e", NODE_SCRIPT, DATA_PATH], capture_output=True, text=True, timeout=60, encoding="utf-8")
if r.returncode != 0:
    print("STDERR:", r.stderr[:3000])
    sys.exit(1)

data = json.loads(r.stdout)
with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

for c in data:
    print(f"id={c['id']} name={c['name']} city={c.get('city','')} website={c['website']} majors={len(c['majors'])}")
