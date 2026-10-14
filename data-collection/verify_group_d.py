# -*- coding: utf-8 -*-
import json, os

BASE = r'C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\data-collection'
with open(os.path.join(BASE, '_my_schools_full.json'), 'r', encoding='utf-8') as f:
    ref = json.load(f)
with open(os.path.join(BASE, 'group_d.json'), 'r', encoding='utf-8') as f:
    out = json.load(f)

ref_by_id = {s['id']: s for s in ref}
print(f"{'ID':>3} {'学校':<14} {'专业数(out/ref)':>16} {'sumZX(out/ref)':>16}  偏差专业")
all_ok = True
for s in out['schools']:
    sid = s['id']
    r = ref_by_id[sid]
    out_names = [m['name'] for m in s['majors']]
    ref_names = [m['name'] for m in r['majors']]
    # name match
    name_ok = out_names == ref_names
    sum_out = sum(m['retiredMilitary']+m['revolutionaryArea']+m['ruralDoctor'] for m in s['majors'])
    sum_ref = r['sum_plan2026Zhuanxiang']
    diffs = []
    out_by_name = {m['name']: m for m in s['majors']}
    for rm in r['majors']:
        om = out_by_name.get(rm['name'])
        if om is None:
            diffs.append(f"缺:{rm['name']}")
            continue
        total = om['retiredMilitary']+om['revolutionaryArea']+om['ruralDoctor']
        if abs(total - rm['plan2026Zhuanxiang']) > 2:
            diffs.append(f"{rm['name']}={total}(ref{rm['plan2026Zhuanxiang']})")
    flag = '' if name_ok and not diffs else '  <<<'
    if flag: all_ok = False
    print(f"{sid:>3} {s['name']:<14} {len(out_names)}/{len(ref_names):>8}   {sum_out}/{sum_ref:>5}   {'; '.join(diffs)}{flag}")

print()
print("ALL OK" if all_ok else "CHECK ABOVE")
# Validate JSON
print("JSON valid. Schools:", len(out['schools']))
