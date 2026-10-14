import re, json, os

src = r'C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\js\data.js'
with open(src, 'r', encoding='utf-8') as f:
    text = f.read()

# Find each school block by id:NUMBER
# We'll parse schools array. Look for pattern id:NN, name:'...'
# Better approach: split by school entries.
# Find positions of "id:" followed by number in range 17..32.

target_ids = list(range(17, 33))  # 17..32

# Find all "id:NN" occurrences and extract surrounding school block
# School object likely starts with {id:NN, ... name:'...' ... majors:[...]}
# Let's use regex to find each school object.

# Strategy: find indices of "id:NN" for NN in target_ids, then extract a chunk around it and try to find majors array.

results = {}

for sid in target_ids:
    # match id:NN (with word boundary)
    pat = re.compile(r'id:\s*' + str(sid) + r'\b')
    m = pat.search(text)
    if not m:
        print(f"id {sid} NOT FOUND")
        continue
    start = m.start()
    # Find the opening brace of this object - search backwards for '{'
    brace_start = text.rfind('{', 0, start)
    # Now find matching closing brace by counting
    depth = 0
    i = brace_start
    in_str = False
    str_char = None
    while i < len(text):
        c = text[i]
        if in_str:
            if c == '\\':
                i += 2
                continue
            if c == str_char:
                in_str = False
        else:
            if c in ('"', "'"):
                in_str = True
                str_char = c
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    break
        i += 1
    block = text[brace_start:i+1]
    # Extract name
    name_m = re.search(r'name:\s*"([^"]+)"', block)
    name = name_m.group(1) if name_m else 'UNKNOWN'
    # Extract majors array - find "majors:[...]"
    majors_m = re.search(r'majors:\s*\[', block)
    if not majors_m:
        print(f"id {sid} {name}: no majors array")
        results[sid] = {'name': name, 'majors': []}
        continue
    # extract majors list
    mstart = majors_m.end() - 1  # at '['
    depth = 0
    j = mstart
    in_str = False
    str_char = None
    while j < len(block):
        c = block[j]
        if in_str:
            if c == '\\':
                j += 2
                continue
            if c == str_char:
                in_str = False
        else:
            if c in ('"', "'"):
                in_str = True
                str_char = c
            elif c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
                if depth == 0:
                    break
        j += 1
    majors_block = block[mstart+1:j]
    # Parse each major object - extract name and plan2026Zhuanxiang
    # Split by top-level commas
    major_objs = []
    depth = 0
    k = 0
    in_str = False
    str_char = None
    cur_start = 0
    while k < len(majors_block):
        c = majors_block[k]
        if in_str:
            if c == '\\':
                k += 2
                continue
            if c == str_char:
                in_str = False
        else:
            if c in ('"', "'"):
                in_str = True
                str_char = c
            elif c == '{':
                if depth == 0:
                    cur_start = k
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    major_objs.append(majors_block[cur_start:k+1])
        k += 1
    majors_list = []
    for mo in major_objs:
        nm = re.search(r'name:\s*"([^"]+)"', mo)
        px = re.search(r'plan2026Zhuanxiang:\s*(\d+)', mo)
        p2026 = re.search(r'plan2026:\s*(\d+)', mo)
        majors_list.append({
            'name': nm.group(1) if nm else '?',
            'plan2026Zhuanxiang': int(px.group(1)) if px else 0,
            'plan2026': int(p2026.group(1)) if p2026 else 0,
        })
    results[sid] = {'name': name, 'majors': majors_list}
    print(f"id {sid} {name}: {len(majors_list)} majors, zhuanxiang sum={sum(m['plan2026Zhuanxiang'] for m in majors_list)}")

out_dir = r'C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\data-collection'
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, '_group_b_input.json'), 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("Saved.")
