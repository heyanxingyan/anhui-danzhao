const fs = require('fs');
const p = 'C:/Users/Admin（无密码）/DoubaoWork/chats/2026-10-13/new-chat/anhui-danzhao-site/js/data.js';
let s = fs.readFileSync(p, 'utf8');
// Standardize estimate annotations for plan2026
s = s.split('2026以院校章程公布为准').join('2026官方数据未采集到，参考2025年');
s = s.split('，2026待院校公布').join('（2026官方数据未采集到，参考2025年）');
fs.writeFileSync(p, s, 'utf8');
console.log('标准化完成');
