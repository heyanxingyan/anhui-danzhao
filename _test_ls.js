// 冒烟测试：加载 low-score.js 的数据与聚合逻辑（不碰 DOM）
global.window = {};
global.document = { addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [] };
global.COLLEGES = []; // 空数据也能跑

require('./js/low-score.js');

// 此时顶层 const 在 module 作用域，拿不到；改用 eval 整段执行再取值
const fs = require('fs');
const src = fs.readFileSync('./js/low-score.js', 'utf8');
const sandbox = { window: {}, document: global.document, COLLEGES: [], console: console };
const vm = require('vm');
vm.createContext(sandbox);
vm.runInContext(src + `
;(function(){
  const cats = lsBuildCategories();
  console.log('categories =', cats.length);
  cats.forEach(c => console.log('  -', c.label, '| colleges=', c.collegeCount, '| star=', c.star, '| rep=', c.repMajors.slice(0,3).join(',')));
  console.log('zhongzhi cities =', [...new Set(ZHONGZHI_DATA.zhongzhiSchools.map(s=>s.city))].join(','));
  const modes = {};
  ZHONGZHI_DATA.lianheMajors.forEach(m => modes[m.mode]=(modes[m.mode]||0)+1);
  console.log('lianhe modes =', JSON.stringify(modes));
})();
`, sandbox);
