// 极简 DOM 桩，跑 low-score.js 的初始化逻辑，验证不抛异常且关键容器被填充
const fs = require('fs');

function makeEl(id) {
  return {
    id, innerHTML: '', style: {}, dataset: {},
    classList: { add(){}, remove(){}, toggle(){} },
    addEventListener(){},
    textContent: ''
  };
}
const els = {};
const ids = ['ls-pros','ls-cons','ls-category-list','ls-college-search','ls-city-chips','ls-zhongzhi-list','ls-lianhe-list','ls-cat-0','ls-arrow-0'];
ids.forEach(id => els[id] = makeEl(id));

global.document = {
  getElementById: id => els[id] || null,
  querySelectorAll: sel => [],
  addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') global.__init = fn; },
  createElement: () => makeEl('tmp'),
  querySelector: () => null,
  body: { dataset: {} }
};
global.window = {};
// stub app.js globals
global.renderTabbar = () => {};
global.renderFooter = () => {};

// 加载 data.js 拿 COLLEGES（真实数据）
const dataSrc = fs.readFileSync('./js/data.js', 'utf8');
const vm = require('vm');
const sandbox = global;
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
// data.js 用 const 声明，不会挂到 global；手动造一个 COLLEGES 供 feeMap 用
sandbox.COLLEGES = [{ id: 2, majors: [{ name: '护理', fee: 3900 }] }];
console.log('COLLEGES stubbed =', sandbox.COLLEGES.length);

// 加载 low-score.js
const lsSrc = fs.readFileSync('./js/low-score.js', 'utf8');
vm.runInContext(lsSrc, sandbox);

// 触发 DOMContentLoaded
try {
  global.__init();
  console.log('INIT OK');
  console.log('ls-pros length =', els['ls-pros'].innerHTML.length);
  console.log('ls-cons length =', els['ls-cons'].innerHTML.length);
  console.log('ls-category-list length =', els['ls-category-list'].innerHTML.length);
  console.log('ls-zhongzhi-list length =', els['ls-zhongzhi-list'].innerHTML.length);
  console.log('ls-lianhe-list length =', els['ls-lianhe-list'].innerHTML.length);
  console.log('ls-city-chips length =', els['ls-city-chips'].innerHTML.length);
} catch (e) {
  console.error('INIT FAILED:', e);
  process.exit(1);
}
