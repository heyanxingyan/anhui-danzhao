const fs = require('fs');
const DATA_JS = 'C:/Users/Admin（无密码）/DoubaoWork/chats/2026-10-13/new-chat/anhui-danzhao-site/js/data.js';
let content = fs.readFileSync(DATA_JS, 'utf8');

// 找出所有缺少plan2026RetiredMilitary的专业对象（id=11除外）
// 先按院校块处理
const schoolBlocks = content.match(/\n\s*id:\d+,[\s\S]*?(?=\n\s*id:\d+,|\n\];)/g) || [];
let fixed = 0;

for (const block of schoolBlocks) {
  const idMatch = block.match(/id:(\d+)/);
  const sid = idMatch ? parseInt(idMatch[1]) : 0;
  if (sid === 11) continue; // 停招院校跳过
  
  // 找该块中缺少字段的专业
  const majorPattern = /\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g;
  let blockFixed = block;
  let match;
  const replacements = [];
  
  while ((match = majorPattern.exec(block)) !== null) {
    const majorObj = match[0];
    if (!majorObj.includes('plan2026RetiredMilitary')) {
      // 在plan2026Zhuanxiang后插入三个0字段
      const newObj = majorObj.replace(
        /(plan2026Zhuanxiang:\d+)/,
        '$1,plan2026RetiredMilitary:0,plan2026RevolutionaryArea:0,plan2026RuralDoctor:0'
      );
      replacements.push({ old: majorObj, new: newObj });
      const nameMatch = majorObj.match(/name:"([^"]+)"/);
      console.log(`  修复 id=${sid}: ${nameMatch ? nameMatch[1] : '?'}`);
    }
  }
  
  for (const r of replacements) {
    blockFixed = blockFixed.replace(r.old, r.new);
    fixed++;
  }
  
  if (replacements.length > 0) {
    content = content.replace(block, blockFixed);
  }
}

fs.writeFileSync(DATA_JS, content, 'utf8');
console.log(`\n共修复 ${fixed} 个专业`);

// 验证
const majorObjs = content.match(/\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g) || [];
const missing = majorObjs.filter(m => !m.includes('plan2026RetiredMilitary'));
console.log(`修复后专业总数: ${majorObjs.length}`);
console.log(`仍缺字段: ${missing.length}（应为id=11的专业）`);
