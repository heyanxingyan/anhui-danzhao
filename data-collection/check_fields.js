const fs = require('fs');
const content = fs.readFileSync('C:/Users/Admin（无密码）/DoubaoWork/chats/2026-10-13/new-chat/anhui-danzhao-site/js/data.js', 'utf8');

// 统计专业对象
const majorObjs = content.match(/\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g) || [];
console.log('专业对象数:', majorObjs.length);

const withAllThree = majorObjs.filter(m => 
  m.includes('plan2026RetiredMilitary') && 
  m.includes('plan2026RevolutionaryArea') && 
  m.includes('plan2026RuralDoctor')
);
console.log('含全部三字段:', withAllThree.length);

const missing = majorObjs.filter(m => !m.includes('plan2026RetiredMilitary'));
console.log('缺RetiredMilitary:', missing.length);
missing.slice(0, 10).forEach(m => console.log('  缺字段:', m.substring(0, 100)));

// 统计文件中所有字段出现
const allRetired = (content.match(/plan2026RetiredMilitary:/g) || []).length;
const allZhuanxiang = (content.match(/plan2026Zhuanxiang:/g) || []).length;
console.log('\n文件中plan2026Zhuanxiang总出现:', allZhuanxiang);
console.log('文件中plan2026RetiredMilitary总出现:', allRetired);
console.log('差异:', allRetired - majorObjs.length);

// 按院校统计
const schoolBlocks = content.match(/\n\s*id:\d+,[\s\S]*?(?=\n\s*id:\d+,|\n\];)/g) || [];
console.log('\n院校块数:', schoolBlocks.length);
let totalMajors = 0;
let totalWithFields = 0;
let schoolsMissing = [];
for (const block of schoolBlocks) {
  const idMatch = block.match(/id:(\d+)/);
  const nameMatch = block.match(/name:"([^"]+)"/);
  const sid = idMatch ? idMatch[1] : '?';
  const sname = nameMatch ? nameMatch[1] : '?';
  const majors = block.match(/\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g) || [];
  const withF = majors.filter(m => m.includes('plan2026RetiredMilitary')).length;
  totalMajors += majors.length;
  totalWithFields += withF;
  if (withF < majors.length && sid !== '11') {
    schoolsMissing.push(`${sid}:${sname} (${withF}/${majors.length})`);
  }
}
console.log('院校块内专业总数:', totalMajors);
console.log('院校块内含字段专业数:', totalWithFields);
console.log('缺字段的院校(非id=11):', schoolsMissing.length);
schoolsMissing.forEach(s => console.log('  ', s));
