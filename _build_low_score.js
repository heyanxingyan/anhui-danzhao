// 构建脚本：把 4 个二级学院 JSON 与 zhongzhi_lianhe.json 内嵌到 js/low-score.js
// 兼容首次构建（占位符）和重复构建（已注入数据）两种状态
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DC = path.join(ROOT, 'data-collection');

const regions = [
  'secondary_colleges_hefei.json',
  'secondary_colleges_wannan.json',
  'secondary_colleges_wanbei.json',
  'secondary_colleges_wanzhong.json'
].map(f => JSON.parse(fs.readFileSync(path.join(DC, f), 'utf8')));

const zhongzhi = JSON.parse(fs.readFileSync(path.join(DC, 'zhongzhi_lianhe.json'), 'utf8'));

const file = path.join(ROOT, 'js', 'low-score.js');
let lines = fs.readFileSync(file, 'utf8').split('\n');

// 按行替换：找到以 const SECONDARY_REGIONS = 开头的行，整行替换
let replacedSecondary = false;
let replacedZhongzhi = false;
lines = lines.map(line => {
  if (line.startsWith('const SECONDARY_REGIONS =')) {
    replacedSecondary = true;
    return 'const SECONDARY_REGIONS = ' + JSON.stringify(regions) + ';';
  }
  if (line.startsWith('const ZHONGZHI_DATA =')) {
    replacedZhongzhi = true;
    return 'const ZHONGZHI_DATA = ' + JSON.stringify(zhongzhi) + ';';
  }
  return line;
});

if (!replacedSecondary) console.error('WARNING: 未找到 const SECONDARY_REGIONS 行');
if (!replacedZhongzhi) console.error('WARNING: 未找到 const ZHONGZHI_DATA 行');

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('OK, size=', fs.statSync(file).size);
console.log('regions colleges =', regions.reduce((a, r) => a + r.colleges.length, 0));
console.log('zhongzhi schools =', zhongzhi.zhongzhiSchools.length, 'lianhe majors =', zhongzhi.lianheMajors.length);
const zyxy = zhongzhi.lianheMajors.filter(m => m.mode === '高职专业学院');
console.log('  其中高职专业学院 =', zyxy.length, '条');
