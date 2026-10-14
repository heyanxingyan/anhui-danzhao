const fs = require('fs');

// 检查group_b.json中id=21的专业数
const groupB = JSON.parse(fs.readFileSync('C:/Users/Admin（无密码）/DoubaoWork/chats/2026-10-13/new-chat/anhui-danzhao-site/data-collection/group_b.json', 'utf8'));
const school21 = groupB.schools.find(s => s.id === 21);
console.log('group_b.json中id=21专业数:', school21 ? school21.majors.length : '未找到');
if (school21) {
  console.log('hasPerMajorBreakdown:', school21.hasPerMajorBreakdown);
  console.log('note:', school21.note);
}

// 检查data.js中id=21的专业
const content = fs.readFileSync('C:/Users/Admin（无密码）/DoubaoWork/chats/2026-10-13/new-chat/anhui-danzhao-site/js/data.js', 'utf8');
const school21Match = content.match(/\n\s*id:21,[\s\S]*?(?=\n\s*id:\d+,|\n\];)/);
if (school21Match) {
  const block = school21Match[0];
  const majors = block.match(/\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g) || [];
  console.log('\ndata.js中id=21专业数:', majors.length);
  const missing = majors.filter(m => !m.includes('plan2026RetiredMilitary'));
  console.log('缺字段专业:', missing.length);
}
