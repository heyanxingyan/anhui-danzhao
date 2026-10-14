/**
 * 合并5组采集结果到data.js
 * 用法: node merge.js
 */
const fs = require('fs');
const path = require('path');

const DATA_JS = path.join(__dirname, '..', 'js', 'data.js');
const GROUPS = ['group_a.json', 'group_b.json', 'group_c.json', 'group_d.json', 'group_e.json'];

// 读取所有分组数据
const allData = { schools: {} };
for (const f of GROUPS) {
  const fp = path.join(__dirname, f);
  if (!fs.existsSync(fp)) {
    console.warn(`[WARN] ${f} 不存在，跳过`);
    continue;
  }
  const raw = JSON.parse(fs.readFileSync(fp, 'utf8'));
  for (const s of raw.schools) {
    allData.schools[s.id] = s;
  }
  console.log(`[OK] 读取 ${f}: ${raw.schools.length} 所院校`);
}

console.log(`\n合计加载 ${Object.keys(allData.schools).length} 所院校数据`);

// 读取data.js
let content = fs.readFileSync(DATA_JS, 'utf8');

// 统计
let stats = { schoolsProcessed: 0, majorsUpdated: 0, schoolsNotFound: [], majorsNotFound: [], mismatch: [] };

// 对每所院校进行处理
for (const [sid, schoolData] of Object.entries(allData.schools)) {
  const id = parseInt(sid);
  // 找到院校块：从 id:X, 到下一个 id:Y 或文件结束
  // 使用正则匹配院校块
  const schoolPattern = new RegExp(`(\\n\\s*id:${id},[\\s\\S]*?)(?=\\n\\s*id:\\d+,|\\n\\];)`, 'm');
  const schoolMatch = content.match(schoolPattern);
  
  if (!schoolMatch) {
    stats.schoolsNotFound.push(id);
    console.warn(`[WARN] 未在data.js中找到院校 id=${id} ${schoolData.name}`);
    continue;
  }
  
  let schoolBlock = schoolMatch[1];
  let schoolUpdated = false;
  
  // 对每个专业进行处理
  for (const majorData of schoolData.majors) {
    // 匹配专业对象: {name:"专业名",...plan2026Zhuanxiang:XX,...}
    // 需要精确匹配专业名
    const majorName = majorData.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const majorPattern = new RegExp(`(\\{name:"${majorName}"[^}]*?plan2026Zhuanxiang:(\\d+)[^}]*?\\})`);
    const majorMatch = schoolBlock.match(majorPattern);
    
    if (!majorMatch) {
      stats.majorsNotFound.push(`${schoolData.name}/${majorData.name}`);
      console.warn(`[WARN] 未找到专业: ${schoolData.name} / ${majorData.name}`);
      continue;
    }
    
    let majorObj = majorMatch[1];
    const zhuanxiang = parseInt(majorMatch[2]);
    const sum = majorData.retiredMilitary + majorData.revolutionaryArea + majorData.ruralDoctor;
    
    // 检查三项之和与专项总数的匹配
    if (schoolData.hasPerMajorBreakdown && Math.abs(sum - zhuanxiang) > 2 && zhuanxiang > 0) {
      stats.mismatch.push(`${schoolData.name}/${majorData.name}: 三项和=${sum}, 专项总数=${zhuanxiang}`);
    }
    
    // 在plan2026Zhuanxiang后插入三个新字段
    // 格式: plan2026Zhuanxiang:XX,plan2026RetiredMilitary:XX,plan2026RevolutionaryArea:XX,plan2026RuralDoctor:XX
    if (majorObj.includes('plan2026RetiredMilitary')) {
      // 已存在，更新值
      majorObj = majorObj.replace(
        /plan2026RetiredMilitary:\d+/,
        `plan2026RetiredMilitary:${majorData.retiredMilitary}`
      );
      majorObj = majorObj.replace(
        /plan2026RevolutionaryArea:\d+/,
        `plan2026RevolutionaryArea:${majorData.revolutionaryArea}`
      );
      majorObj = majorObj.replace(
        /plan2026RuralDoctor:\d+/,
        `plan2026RuralDoctor:${majorData.ruralDoctor}`
      );
    } else {
      // 不存在，在plan2026Zhuanxiang后插入
      majorObj = majorObj.replace(
        /(plan2026Zhuanxiang:\d+)/,
        `$1,plan2026RetiredMilitary:${majorData.retiredMilitary},plan2026RevolutionaryArea:${majorData.revolutionaryArea},plan2026RuralDoctor:${majorData.ruralDoctor}`
      );
    }
    
    schoolBlock = schoolBlock.replace(majorMatch[1], majorObj);
    stats.majorsUpdated++;
    schoolUpdated = true;
  }
  
  if (schoolUpdated) {
    content = content.replace(schoolMatch[1], schoolBlock);
    stats.schoolsProcessed++;
  }
}

// 写入文件
fs.writeFileSync(DATA_JS, content, 'utf8');
console.log(`\n========== 合并完成 ==========`);
console.log(`处理院校: ${stats.schoolsProcessed}`);
console.log(`更新专业: ${stats.majorsUpdated}`);
console.log(`未找到院校: ${stats.schoolsNotFound.length}`);
console.log(`未找到专业: ${stats.majorsNotFound.length}`);
console.log(`数据不匹配: ${stats.mismatch.length}`);

if (stats.schoolsNotFound.length > 0) {
  console.log('\n未找到的院校:', stats.schoolsNotFound);
}
if (stats.majorsNotFound.length > 0) {
  console.log('\n未找到的专业:');
  stats.majorsNotFound.forEach(m => console.log(`  - ${m}`));
}
if (stats.mismatch.length > 0) {
  console.log('\n三项之和与专项总数不匹配(>2):');
  stats.mismatch.forEach(m => console.log(`  - ${m}`));
}

// 输出统计到文件
fs.writeFileSync(path.join(__dirname, 'merge_stats.json'), JSON.stringify(stats, null, 2), 'utf8');
