import json
with open(r'C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\data-collection\_group_c_input.json','r',encoding='utf-8') as f:
    d = json.load(f)
for sid in ['33','36','46','37','35','34']:
    print(f'=== id={sid} {d[sid]["name"]} ({len(d[sid]["majors"])} majors) ===')
    for m in d[sid]['majors']:
        print(f'  {m["name"]} (zx={m["plan2026Zhuanxiang"]})')
