const fs = require('fs');
const path = require('path');
const dir = __dirname;
let code = fs.readFileSync(path.join(dir, 'js', 'data.js'), 'utf8');
code += '\n;globalThis.__C = COLLEGES;';
eval(code);
const C = globalThis.__C;

// Real plan2026 = does NOT contain 参考/预测/待院校公布/未采集到
const realPlan = C.filter(c => c.plan2026 && !/参考|预测|待院校公布|未采集到|待公布/.test(c.plan2026));
// Real score2026 = has realScore2026 set
const realScore = C.filter(c => c.realScore2026);

console.log('院校总数:', C.length);
console.log('--- 真实plan2026 (' + realPlan.length + '所) ---');
realPlan.forEach(c => console.log('  id=' + c.id, c.name, '→', c.plan2026));
console.log('--- 真实score2026 (' + realScore.length + '所) ---');
realScore.forEach(c => console.log('  id=' + c.id, c.name, '→', c.score2026));

// Verify specific
const c6 = C.find(c=>c.id===6);
const c9 = C.find(c=>c.id===9);
console.log('--- 关键校验 ---');
console.log('安徽第二医学院 plan2026:', c6.plan2026);
console.log('安徽财贸 plan2026:', c9.plan2026);
