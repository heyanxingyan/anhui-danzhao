import re, json, os

base = r'C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site'
with open(os.path.join(base, 'js', 'data.js'), 'r', encoding='utf-8') as f:
    content = f.read()

results = {}
for sid in range(33, 48):
    pattern = r'\{\s*id:' + str(sid) + r',\s*name:"([^"]+)"'
    m = re.search(pattern, content)
    if not m:
        print(f"id {sid} not found")
        continue
    name = m.group(1)
    start = m.start()
    if sid < 47:
        next_pattern = r'\n\s*\{\s*id:' + str(sid+1) + r','
        nm = re.search(next_pattern, content[start+10:])
        end = start + 10 + nm.start() if nm else len(content)
    else:
        next_pattern = r'\n\s*\{\s*id:48,'
        nm = re.search(next_pattern, content[start+10:])
        end = start + 10 + nm.start() if nm else len(content)
    block = content[start:end]
    majors = []
    for mm in re.finditer(r'\{name:"([^"]+)"[^}]*?plan2026Zhuanxiang:(\d+)', block):
        majors.append({"name": mm.group(1), "plan2026Zhuanxiang": int(mm.group(2))})
    results[str(sid)] = {"name": name, "majors": majors}
    total_zx = sum(m["plan2026Zhuanxiang"] for m in majors)
    print(f"id={sid} name={name} majors={len(majors)} sumZhuanxiang={total_zx}")

out_dir = os.path.join(base, 'data-collection')
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, '_group_c_input.json'), 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("Saved input file")
