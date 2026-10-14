const fs = require('fs');
const src = fs.readFileSync('./js/low-score.js', 'utf8');
const vm = require('vm');
const sandbox = { window:{}, document:{addEventListener:()=>{}}, COLLEGES:[], console };
vm.createContext(sandbox);
vm.runInContext(src + `
;(function(){
  const others = {};
  for (const region of SECONDARY_REGIONS) {
    for (const c of region.colleges) {
      for (const sc of (c.secondaryColleges||[])) {
        const rule = lsCategorize(sc.name);
        if (rule.key === 'qita') {
          others[sc.name] = (others[sc.name]||0)+1;
        }
      }
    }
  }
  console.log('=== qita secondary college names ===');
  Object.entries(others).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(v, k));
})();
`, sandbox);
