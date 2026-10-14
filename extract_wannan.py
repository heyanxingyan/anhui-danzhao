import re, json, os

path = r"C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\js\data.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

m = re.search(r'COLLEGES\s*=\s*\[', content)
arr_start = m.end()-1
i = arr_start
depth = 0
in_str = None
escape = False
while i < len(content):
    c = content[i]
    if in_str:
        if escape: escape = False
        elif c == "\\": escape = True
        elif c == in_str: in_str = None
    else:
        if c in ('"', "'", '`'): in_str = c
        elif c == '[': depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                arr_end = i; break
    i += 1

arr_text = content[arr_start:arr_end+1]

# Extract top-level objects
objects = []
i = 0; depth = 0; in_str = None; escape = False; obj_start = None
while i < len(arr_text):
    c = arr_text[i]
    if in_str:
        if escape: escape = False
        elif c == "\\": escape = True
        elif c == in_str: in_str = None
    else:
        if c in ('"', "'", '`'): in_str = c
        elif c == '{':
            if depth == 0: obj_start = i
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: objects.append(arr_text[obj_start:i+1])
    i += 1

print("colleges:", len(objects))

# Convert JS object literal to JSON by quoting unquoted keys, respecting strings.
def quote_keys(s):
    out = []
    i = 0; n = len(s)
    in_str = None; escape = False
    while i < n:
        c = s[i]
        if in_str:
            out.append(c)
            if escape: escape = False
            elif c == "\\": escape = True
            elif c == in_str: in_str = None
            i += 1; continue
        if c in ('"', "'", '`'):
            in_str = c; out.append(c); i += 1; continue
        # detect key: unquoted identifier or number followed by optional whitespace then :
        if re.match(r'[A-Za-z_$0-9]', c):
            j = i
            while j < n and re.match(r'[A-Za-z0-9_$]', s[j]): j += 1
            ident = s[i:j]
            # skip whitespace
            k = j
            while k < n and s[k] in ' \t\n\r': k += 1
            if k < n and s[k] == ':':
                # this is a key; quote it if not already quoted
                out.append('"' + ident + '"')
                i = j
                continue
        out.append(c); i += 1
    return ''.join(out)

target_ids = {3, 7, 16, 21, 31, 39, 48, 51, 52, 55, 57}
out = {}
fail = []
for obj in objects:
    jt = quote_keys(obj)
    # remove trailing commas before } or ]
    jt = re.sub(r',(\s*[}\]])', r'\1', jt)
    try:
        o = json.loads(jt)
    except Exception as e:
        m2 = re.search(r'"id"\s*:\s*(\d+)', jt)
        oid = int(m2.group(1)) if m2 else -1
        if oid in target_ids:
            fail.append((oid, str(e), jt))
        continue
    oid = o.get("id")
    if oid in target_ids:
        out[oid] = o

print("parsed target:", sorted(out.keys()))
for f in fail:
    print("FAIL", f[0], f[1])
    print(f[2][:800])

out_dir = r"C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\data-collection"
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, "_wannan_raw.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

# Print summary
for oid in sorted(out.keys()):
    o = out[oid]
    print("===", oid, o.get("name"), "|", o.get("website"))
    majors = o.get("majors", [])
    print("  majors:", len(majors))
    for mj in majors:
        if isinstance(mj, dict):
            print("   -", mj.get("name"), "|", mj.get("code"), "|", mj.get("category"))
        else:
            print("   -", mj)
