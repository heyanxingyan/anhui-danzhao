const fs = require('fs');
const path = require('path');

const DATA_JS = String.raw`C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\js\data.js`;
const OUT_DIR = String.raw`C:\Users\Admin（无密码）\DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\data-collection`;

const code = fs.readFileSync(DATA_JS, 'utf-8');
// Append a return-style export
const wrapped = code + '\nthis.__COLLEGES = (typeof COLLEGES !== "undefined") ? COLLEGES : null;';
const sandbox = {};
const vm = require('vm');
vm.createContext(sandbox);
vm.runInContext(wrapped, sandbox);
const colleges = sandbox.__COLLEGES;
if (!colleges) {
  console.error('COLLEGES not found');
  process.exit(1);
}
console.log('Total colleges:', colleges.length);
const mine = colleges.filter(c => c.id >= 48 && c.id <= 62);
console.log('My schools:', mine.length);

const summary = mine.map(s => {
  const majors = s.majors || [];
  const sumZx = majors.reduce((a, m) => a + (m.plan2026Zhuanxiang || 0), 0);
  return {
    id: s.id,
    name: s.name,
    city: s.city,
    type: s.type,
    nature: s.nature,
    major_count: majors.length,
    sum_plan2026Zhuanxiang: sumZx,
    majors: majors.map(m => ({name: m.name, plan2026Zhuanxiang: m.plan2026Zhuanxiang || 0}))
  };
});

fs.writeFileSync(path.join(OUT_DIR, '_my_schools_full.json'), JSON.stringify(summary, null, 2), 'utf-8');
for (const s of summary) {
  console.log(`[${s.id}] ${s.name} (${s.city}, ${s.nature}) majors=${s.major_count} sumZx=${s.sum_plan2026Zhuanxiang}`);
}
