import re, json, os

DATA_JS = r'C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\js\data.js'
OUT_DIR = r'C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\data-collection'

with open(DATA_JS, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the schools array - likely starts with something like "const schools = [" or "var schools = ["
# Let's find school objects by id field
# We need to extract the JSON for schools with id 48..62

# Strategy: locate COLLEGES assignment
m = re.search(r'(?:const|let|var)\s+COLLEGES\s*=\s*\[', content)
print('COLLEGES assignment found at:', m.start() if m else None)

# Try to parse the whole array by bracket matching
if m:
    start = content.index('[', m.start())
    depth = 0
    i = start
    in_str = False
    str_ch = ''
    esc = False
    while i < len(content):
        c = content[i]
        if in_str:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == str_ch:
                in_str = False
        else:
            if c == '"' or c == "'" or c == '`':
                in_str = True
                str_ch = c
            elif c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
                if depth == 0:
                    end = i
                    break
        i += 1
    arr_text = content[start:end+1]
    print('Array text length:', len(arr_text))
    # Write to temp file for inspection
    with open(os.path.join(OUT_DIR, '_schools_array.json'), 'w', encoding='utf-8') as f:
        f.write(arr_text)
    # Try to eval as JS object - it might use unquoted keys. Let's try JSON parse first.
    try:
        schools = json.loads(arr_text)
        print('Parsed with JSON, count:', len(schools))
    except Exception as e:
        print('JSON parse failed:', e)
        # Use a more lenient approach - python eval won't work due to unquoted keys
        # Try using node if available
        schools = None

    if schools:
        mine = [s for s in schools if s.get('id') in range(48, 63)]
        print('My schools count:', len(mine))
        summary = []
        for s in mine:
            majors = s.get('majors', [])
            total_zx = sum(m.get('plan2026Zhuanxiang', 0) or 0 for m in majors)
            summary.append({
                'id': s.get('id'),
                'name': s.get('name'),
                'major_count': len(majors),
                'sum_plan2026Zhuanxiang': total_zx,
            })
        with open(os.path.join(OUT_DIR, '_my_schools_summary.json'), 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        for row in summary:
            print(row)
