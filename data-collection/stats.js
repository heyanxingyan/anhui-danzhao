const fs = require('fs');
const content = fs.readFileSync('C:/Users/Admin（无密码）/DoubaoWork/chats/2026-10-13/new-chat/anhui-danzhao-site/js/data.js', 'utf8');

const schoolBlocks = content.match(/\n\s*id:\d+,[\s\S]*?(?=\n\s*id:\d+,|\n\];)/g) || [];

console.log('乡村医生定向培养计划分布（仅专业级别，非零院校）:');
let ruralDoctorSchools = [];
for (const block of schoolBlocks) {
  const idMatch = block.match(/id:(\d+)/);
  const nameMatch = block.match(/name:"([^"]+)"/);
  const sid = idMatch ? parseInt(idMatch[1]) : 0;
  const sname = nameMatch ? nameMatch[1] : '?';
  if (sid === 11) continue;
  
  // 只统计专业对象中的ruralDoctor（排除院校级别）
  const majors = block.match(/\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g) || [];
  let total = 0;
  let ruralMajors = [];
  for (const m of majors) {
    const rdMatch = m.match(/plan2026RuralDoctor:(\d+)/);
    if (rdMatch) {
      const rd = parseInt(rdMatch[1]);
      total += rd;
      if (rd > 0) {
        const mn = m.match(/name:"([^"]+)"/);
        ruralMajors.push(`${mn ? mn[1] : '?'}(${rd})`);
      }
    }
  }
  if (total > 0) ruralDoctorSchools.push({ id: sid, name: sname, total, majors: ruralMajors });
}

ruralDoctorSchools.sort((a, b) => b.total - a.total);
let grandTotal = 0;
ruralDoctorSchools.forEach(s => {
  console.log(`  ${s.name}(id=${s.id}): ${s.total}人 - ${s.majors.join(', ')}`);
  grandTotal += s.total;
});
console.log(`\n全省乡村医生定向培养合计: ${grandTotal}人`);

// 退役军人计划分布（前10）
console.log('\n退役军人计划分布（前10院校）:');
let retiredSchools = [];
for (const block of schoolBlocks) {
  const idMatch = block.match(/id:(\d+)/);
  const nameMatch = block.match(/name:"([^"]+)"/);
  const sid = idMatch ? parseInt(idMatch[1]) : 0;
  const sname = nameMatch ? nameMatch[1] : '?';
  if (sid === 11) continue;
  const majors = block.match(/\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g) || [];
  let total = 0;
  for (const m of majors) {
    const rMatch = m.match(/plan2026RetiredMilitary:(\d+)/);
    if (rMatch) total += parseInt(rMatch[1]);
  }
  if (total > 0) retiredSchools.push({ id: sid, name: sname, total });
}
retiredSchools.sort((a, b) => b.total - a.total);
retiredSchools.slice(0, 10).forEach(s => console.log(`  ${s.name}(id=${s.id}): ${s.total}人`));
let retiredTotal = retiredSchools.reduce((sum, s) => sum + s.total, 0);
console.log(`  ... 全省退役军人合计: ${retiredTotal}人`);

// 革命老区计划分布（前10）
console.log('\n革命老区计划分布（前10院校）:');
let revSchools = [];
for (const block of schoolBlocks) {
  const idMatch = block.match(/id:(\d+)/);
  const nameMatch = block.match(/name:"([^"]+)"/);
  const sid = idMatch ? parseInt(idMatch[1]) : 0;
  const sname = nameMatch ? nameMatch[1] : '?';
  if (sid === 11) continue;
  const majors = block.match(/\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g) || [];
  let total = 0;
  for (const m of majors) {
    const rMatch = m.match(/plan2026RevolutionaryArea:(\d+)/);
    if (rMatch) total += parseInt(rMatch[1]);
  }
  if (total > 0) revSchools.push({ id: sid, name: sname, total });
}
revSchools.sort((a, b) => b.total - a.total);
revSchools.slice(0, 10).forEach(s => console.log(`  ${s.name}(id=${s.id}): ${s.total}人`));
let revTotal = revSchools.reduce((sum, s) => sum + s.total, 0);
console.log(`  ... 全省革命老区合计: ${revTotal}人`);
