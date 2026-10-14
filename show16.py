import json
p = r"C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\data-collection\_wannan_raw.json"
with open(p, "r", encoding="utf-8") as f:
    d = json.load(f)
print("ids:", sorted(int(k) for k in d.keys()))
o = d["16"]
print(o["name"], o["website"])
for mj in o["majors"]:
    print(" -", mj.get("name"), "|", mj.get("code"), "|", mj.get("category"))
