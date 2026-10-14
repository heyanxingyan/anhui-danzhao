const fs = require('fs');
const content = fs.readFileSync('C:/Users/Admin（无密码）/DoubaoWork/chats/2026-10-13/new-chat/anhui-danzhao-site/js/data.js', 'utf8');

// 2. 字段完整性
const schoolBlocks = content.match(/\n\s*id:\d+,[\s\S]*?(?=\n\s*id:\d+,|\n\];)/g) || [];
let totalMajors = 0;
let withFields = 0;
let schoolsReport = [];

for (const block of schoolBlocks) {
  const idMatch = block.match(/id:(\d+)/);
  const nameMatch = block.match(/name:"([^"]+)"/);
  const sid = idMatch ? parseInt(idMatch[1]) : 0;
  const sname = nameMatch ? nameMatch[1] : '?';
  const majors = block.match(/\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g) || [];
  const wf = majors.filter(m => m.includes('plan2026RetiredMilitary') && m.includes('plan2026RevolutionaryArea') && m.includes('plan2026RuralDoctor')).length;
  totalMajors += majors.length;
  withFields += wf;
  if (sid !== 11 && wf < majors.length) {
    schoolsReport.push(`  警告: id=${sid} ${sname}: ${wf}/${majors.length}`);
  }
}

console.log(`2. 字段完整性:`);
console.log(`   院校总数: ${schoolBlocks.length}`);
console.log(`   专业总数: ${totalMajors}`);
console.log(`   含三字段专业: ${withFields}`);
console.log(`   缺字段专业(仅id=11停招): ${totalMajors - withFields}`);
if (schoolsReport.length > 0) {
  console.log('   非停招院校缺字段:');
  schoolsReport.forEach(s => console.log(s));
} else {
  console.log('   除id=11停招外，所有专业均含三字段 ✓');
}

// 3. 抽样数据核对 - 检查几所有细分数据的院校
console.log('\n3. 抽样数据核对:');
const samples = [
  { id: 7, name: '安徽中医药高等专科学校' },
  { id: 31, name: '安徽卫生健康职业学院' },
  { id: 48, name: '黄山职业技术学院' },
  { id: 53, name: '皖北卫生职业学院' },
  { id: 65, name: '合肥科技职业学院' },
];

for (const s of samples) {
  const blockMatch = content.match(new RegExp(`\\n\\s*id:${s.id},[\\s\\S]*?(?=\\n\\s*id:\\d+,|\\n\\];)`));
  if (!blockMatch) continue;
  const block = blockMatch[0];
  const majors = block.match(/\{name:"[^"]*"[^}]*plan2026Zhuanxiang:\d+[^}]*\}/g) || [];
  let totalRetired = 0, totalRev = 0, totalRural = 0, totalZhuanxiang = 0;
  let nonZeroMajors = 0;
  for (const m of majors) {
    const r = parseInt((m.match(/plan2026RetiredMilitary:(\d+)/) || [0,0])[1]);
    const rv = parseInt((m.match(/plan2026RevolutionaryArea:(\d+)/) || [0,0])[1]);
    const rd = parseInt((m.match(/plan2026RuralDoctor:(\d+)/) || [0,0])[1]);
    const zx = parseInt((m.match(/plan2026Zhuanxiang:(\d+)/) || [0,0])[1]);
    totalRetired += r; totalRev += rv; totalRural += rd; totalZhuanxiang += zx;
    if (r + rv + rd > 0) nonZeroMajors++;
  }
  console.log(`   ${s.name}(id=${s.id}): ${majors.length}专业, 非零专项专业${nonZeroMajors}个`);
  console.log(`     退役=${totalRetired} 老区=${totalRev} 村医=${totalRural} 合计=${totalRetired+totalRev+totalRural} (原专项总数=${totalZhuanxiang})`);
}

// 4. 乡村医生计划分布
console.log('\n4. 乡村医生定向培养计划分布:');
let ruralDoctorSchools = [];
for (const block of schoolBlocks) {
  const idMatch = block.match(/id:(\d+)/);
  const nameMatch = block.match(/name:"([^"]+)"/);
  const sid = idMatch ? parseInt(idMatch[1]) : 0;
  const sname = nameMatch ? nameMatch[1] : '?';
  const ruralMatch = block.match(/plan2026RuralDoctor:(\d+)/g);
  if (ruralMatch) {
    const total = ruralMatch.reduce((sum, m) => sum + parseInt(m.match(/\d+/)[0]), 0);
    if (total > 0) ruralDoctorSchools.push({ id: sid, name: sname, total });
  }
}
ruralDoctorSchools.sort((a, b) => b.total - a.total);
ruralDoctorSchools.forEach(s => console.log(`   ${s.name}(id=${s.id}): ${s.total}人`));
