const fs = require('fs');
let code = fs.readFileSync(__dirname + '/js/data.js', 'utf8');
// eslint-disable-next-line no-eval
eval(code + '; globalThis.C = COLLEGES;');
const COLLEGES = globalThis.C;
function predLine(c){ return parseFloat(c.score2026) || (c.scores['2025'] ? c.scores['2025'].min : c.minScore2024); }
function buckets(s){
  const chong=[],wen=[],bao=[];
  COLLEGES.forEach(c=>{const d=predLine(c)-s; if(d>=5&&d<=15)chong.push(c.name); else if(Math.abs(d)<=5)wen.push(c.name); else if(d<=-5&&d>=-15)bao.push(c.name);});
  return {chong,wen,bao};
}
[200,230,260,300].forEach(s=>{
  const b=buckets(s);
  console.log(`分数${s}: 冲=${b.chong.length} 稳=${b.wen.length} 保=${b.bao.length}`);
});
console.log('样例 230 冲:', buckets(230).chong.slice(0,5).join(' / '));
console.log('样例 230 稳:', buckets(230).wen.slice(0,5).join(' / '));
console.log('样例 230 保:', buckets(230).bao.slice(0,5).join(' / '));
