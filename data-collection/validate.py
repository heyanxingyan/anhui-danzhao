#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Validate the output JSON: ensure every major from targets_raw.json is placed in some secondary college."""
import json, sys, os

BASE = r"C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\data-collection"
with open(os.path.join(BASE, "targets_raw.json"), "r", encoding="utf-8") as f:
    targets = json.load(f)
with open(os.path.join(BASE, "secondary_colleges_wanzhong.json"), "r", encoding="utf-8") as f:
    out = json.load(f)

# Index output by id
out_by_id = {c["id"]: c for c in out["colleges"]}

errors = []
total_majors_in = 0
total_majors_out = 0

for t in targets:
    cid = t["id"]
    expected = [m["name"] for m in t["majors"]]
    total_majors_in += len(expected)
    placed = []
    if cid not in out_by_id:
        errors.append(f"id={cid} {t['name']}: missing in output")
        continue
    for sc in out_by_id[cid]["secondaryColleges"]:
        placed.extend(sc["majors"])
    total_majors_out += len(placed)
    # Check coverage
    missing = [m for m in expected if m not in placed]
    extra = [m for m in placed if m not in expected]
    if missing:
        errors.append(f"id={cid} {t['name']}: MISSING majors: {missing}")
    if extra:
        errors.append(f"id={cid} {t['name']}: EXTRA majors (not in data.js): {extra}")

print(f"Total colleges in targets: {len(targets)}")
print(f"Total colleges in output: {len(out['colleges'])}")
print(f"Total majors in targets: {total_majors_in}")
print(f"Total majors placed in output: {total_majors_out}")
if errors:
    print("\nERRORS:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
else:
    print("\nOK: all majors covered exactly once.")
