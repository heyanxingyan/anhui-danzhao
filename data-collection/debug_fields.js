const fs = require('fs');
const content = fs.readFileSync('C:/Users/Admin（无密码）/DoubaoWork/chats/2026-10-13/new-chat/anhui-danzhao-site/js/data.js', 'utf8');

// 1. 检查专业对象内是否有重复字段（跨行）
const majorObjs = content.match(/\{name:"[^"]*"[\s\S]*?plan2026Zhuanxiang:\d+[\s\S]*?\}/g) || [];
console.log('宽松匹配专业对象数:', majorObjs.length);

let dupCount = 0;
const dupExamples = [];
for (const m of majorObjs) {
  const retiredCount = (m.match(/plan2026RetiredMilitary:/g) || []).length;
  if (retiredCount > 1) {
    dupCount++;
    if (dupExamples.length < 3) dupExamples.push(m.substring(0, 150));
  }
}
console.log('含重复RetiredMilitary的专业对象:', dupCount);
dupExamples.forEach(e => console.log('  ', e));

// 2. 检查id=21的专业情况
const school21Match = content.match(/\n\s*id:21,[\s\S]*?(?=\n\s*id:\d+,|\n\];)/);
if (school21Match) {
  const block = school21Match[0];
  const majors = block.match(/\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g) || [];
  console.log('\nid=21专业总数:', majors.length);
  const missing = majors.filter(m => !m.includes('plan2026RetiredMilitary'));
  console.log('id=21缺字段专业数:', missing.length);
  missing.forEach(m => {
    const nameMatch = m.match(/name:"([^"]+)"/);
    console.log('  缺:', nameMatch ? nameMatch[1] : m.substring(0, 50));
  });
}

// 3. 统计字段在专业对象外的出现
// 找出所有plan2026RetiredMilitary的位置，检查是否在专业对象内
const fieldPositions = [];
let pos = 0;
while ((pos = content.indexOf('plan2026RetiredMilitary:', pos)) !== -1) {
  fieldPositions.push(pos);
  pos += 10;
}
console.log('\nplan2026RetiredMilitary总位置数:', fieldPositions.length);

// 对每个位置，向前找最近的{name:，向后找最近的}
let outsideCount = 0;
const outsideExamples = [];
for (const fp of fieldPositions) {
  // 向前找最近的{name:"
  const before = content.lastIndexOf('{name:"', fp);
  // 向后找最近的}
  const after = content.indexOf('}', fp);
  if (before === -1 || after === -1) {
    outsideCount++;
    continue;
  }
  // 检查在before和fp之间是否有}（如果有，说明不在同一个对象内）
  const between = content.substring(before, fp);
  if (between.includes('}')) {
    outsideCount++;
    if (outsideExamples.length < 5) {
      outsideExamples.push(content.substring(Math.max(0, fp - 50), fp + 30));
    }
  }
}
console.log('在专业对象外的字段数:', outsideCount);
outsideExamples.forEach(e => console.log('  上下文:', e.replace(/\n/g, '\\n')));
