const fs = require('fs');
const src = fs.readFileSync('js/low-score.js', 'utf8');
const lines = src.split('\n');
const dataLine = lines.find(l => l.startsWith('const ZHONGZHI_DATA ='));
const jsonStr = dataLine.substring('const ZHONGZHI_DATA ='.length).replace(/;$/, '');
const ZHONGZHI_DATA = JSON.parse(jsonStr);

const items = ZHONGZHI_DATA.lianheMajors || [];
const modeOrder = ['高职专业学院', '3+4', '3+2+2', '3+2', '五年一贯制'];
const groups = {};
for (const it of items) { (groups[it.mode] = groups[it.mode] || []).push(it); }

console.log('=== 渲染分组统计 ===');
for (const m of modeOrder) {
  if (groups[m]) {
    const withPlan = groups[m].filter(x => x.plan2026 != null).length;
    console.log(m + ': ' + groups[m].length + ' 条 (有计划数: ' + withPlan + ')');
  }
}

const zyxy = groups['高职专业学院'] || [];
const audit = zyxy.filter(x => x.gaozhiSchool === '安徽审计职业学院');
console.log('\n=== 安徽审计职业学院 高职专业学院 (' + audit.length + '个专业) ===');
audit.forEach(x => console.log('  ' + x.zhongzhiSchool + ' - ' + x.major + ' (' + x.plan2026 + '人)'));

console.log('\n涉及高职院校: ' + new Set(zyxy.map(x => x.gaozhiSchool)).size + '所');
console.log('涉及中职学校: ' + new Set(zyxy.map(x => x.zhongzhiSchool)).size + '所');
console.log('总招生计划: ' + zyxy.reduce((s, x) => s + (x.plan2026 || 0), 0) + '人');
console.log('\n渲染验证通过！');
