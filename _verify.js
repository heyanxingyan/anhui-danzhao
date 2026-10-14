const fs = require('fs');
const path = require('path');
let code = fs.readFileSync(path.join(__dirname, 'js/data.js'), 'utf8');
// eslint-disable-next-line no-eval
eval(code + '; globalThis.__COLLEGES = COLLEGES;');
const COLLEGES = globalThis.__COLLEGES;
const need = ['examRatio','employmentRate','upgradeRate','score2026','phone','scale'];
let bad = [];
COLLEGES.forEach(c => need.forEach(f => { if (c[f] === undefined || c[f] === null || c[f] === '') bad.push(c.id + ':' + f); }));
console.log('院校总数:', COLLEGES.length);
console.log('缺失字段数:', bad.length);
if (bad.length) console.log(bad.slice(0,30).join('\n'));
console.log('示例(id=1 宿州学院):', JSON.stringify({examRatio:COLLEGES[0].examRatio,employmentRate:COLLEGES[0].employmentRate,upgradeRate:COLLEGES[0].upgradeRate,score2026:COLLEGES[0].score2026,phone:COLLEGES[0].phone,scale:COLLEGES[0].scale}));
const c10 = COLLEGES.find(c=>c.id===10);
console.log('示例(id=10):', JSON.stringify({name:c10.name,city:c10.city,nature:c10.nature,examRatio:c10.examRatio,employmentRate:c10.employmentRate,upgradeRate:c10.upgradeRate,score2026:c10.score2026,phone:c10.phone,scale:c10.scale}));
