import json
p = r'C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\data-collection\group_b.json'
with open(p, 'r', encoding='utf-8') as f:
    d = json.load(f)
print('Valid JSON. Schools:', len(d['schools']))
for s in d['schools']:
    print('  id=%2d %s: %d majors, breakdown=%s' % (s['id'], s['name'], len(s['majors']), s['hasPerMajorBreakdown']))
