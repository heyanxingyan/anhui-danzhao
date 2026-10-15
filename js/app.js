/* ============================================================
 * 安徽单招信息查询 - 全局逻辑
 * ============================================================ */

// ========== 工具函数 ==========
function getQuery(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 1800);
}

// 分数年份标签：优先2026官方真实分，其次2025最低分，最后回退2024
function scoreLabel(c) {
  if (c.minScore2026 != null) return '2026最低 ' + c.minScore2026 + ' 分';
  if (c.minScore2025 != null) return '2025最低 ' + c.minScore2025 + ' 分';
  return '分数待公布';
}

// ========== 底部 Tab 导航渲染 ==========
const TAB_ITEMS = [
  { key: 'index', name: '首页', icon: '🏠', href: 'index.html' },
  { key: 'college', name: '院校', icon: '🏫', href: 'college-list.html' },
  { key: 'major', name: '专业', icon: '📚', href: 'major-search.html' },
  { key: 'me', name: '我的', icon: '👤', href: 'about.html' }
];

function renderTabbar(activeKey) {
  const bar = document.querySelector('.tabbar');
  if (!bar) return;
  bar.innerHTML = TAB_ITEMS.map(item => `
    <a href="${item.href}" class="tabbar-item ${item.key === activeKey ? 'active' : ''}">
      <span class="icon">${item.icon}</span>
      <span>${item.name}</span>
    </a>
  `).join('');
}

// ========== 顶部导航栏 ==========
function renderNavbar(title, showBack = true) {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  nav.innerHTML = `
    ${showBack ? '<button class="back-btn" onclick="history.back()">‹</button>' : ''}
    <div class="title">${title}</div>
  `;
}

// ========== 收藏功能（localStorage） ==========
function getFavs() {
  try { return JSON.parse(localStorage.getItem('anhui_danzhao_favs') || '[]'); }
  catch { return []; }
}

function toggleFav(id) {
  let favs = getFavs();
  id = Number(id);
  if (favs.includes(id)) {
    favs = favs.filter(x => x !== id);
    toast('已取消收藏');
  } else {
    favs.push(id);
    toast('收藏成功');
  }
  localStorage.setItem('anhui_danzhao_favs', JSON.stringify(favs));
  return favs.includes(id);
}

function isFav(id) {
  return getFavs().includes(Number(id));
}

// ========== 院校对比（localStorage: compareList，最多4所） ==========
function getCompareList() {
  try { return JSON.parse(localStorage.getItem('anhui_danzhao_compare') || '[]'); }
  catch { return []; }
}

function inCompare(id) {
  return getCompareList().includes(Number(id));
}

// 返回操作后是否在对比列表中；超出4所返回 'full'
function toggleCompare(id) {
  id = Number(id);
  let list = getCompareList();
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    localStorage.setItem('anhui_danzhao_compare', JSON.stringify(list));
    return false;
  }
  if (list.length >= 4) return 'full';
  list.push(id);
  localStorage.setItem('anhui_danzhao_compare', JSON.stringify(list));
  return true;
}

function removeFromCompare(id) {
  let list = getCompareList().filter(x => Number(x) !== Number(id));
  localStorage.setItem('anhui_danzhao_compare', JSON.stringify(list));
}

/* ============================================================
 * 各页面渲染入口（DOMContentLoaded 后根据 body 的 data-page 判断）
 * ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (!page) return;

  const handlers = {
    'index': renderIndex,
    'college-list': renderCollegeList,
    'college-detail': renderCollegeDetail,
    'major-search': renderMajorSearch,
    'major-detail': renderMajorDetail,
    'score-trend': renderScoreTrend,
    'category': renderCategory,
    'gaozhong': renderGaozhong,
    'zhongzhi': renderZhongzhi,
    'zhuanxiang': renderZhuanxiang,
    'zhuanxiang-tuiyi': renderZhuanxiangTuiyi,
    'zhuanxiang-laoxiang': renderZhuanxiangLaoxiang,
    'zhuanxiang-xiangcun': renderZhuanxiangXiangcun,
    'ranking': renderRanking,
    'benke': renderBenke,
    'compare': renderCompare,
    'favorites': renderFavorites,
    'guide': renderGuide,
    'faq': renderFaq,
    'recommend': renderRecommend,
    'about': renderAbout
  };

  if (handlers[page]) handlers[page]();
  renderFooter();
});

// ========== 全站页脚：快捷导航 + 署名水印（低调灰色小字） ==========
function renderFooter() {
  const page = document.querySelector('.page');
  if (!page || document.querySelector('.site-footer')) return;

  // 页脚快捷导航（收藏/对比/指南/推荐/常见问题）
  const nav = document.createElement('div');
  nav.className = 'foot-nav';
  nav.innerHTML = `
    <a href="favorites.html">⭐ 收藏</a>
    <a href="compare.html">⚖️ 对比</a>
    <a href="guide.html">📖 指南</a>
    <a href="recommend.html">🎯 分数推荐</a>
    <a href="low-score.html">🆘 低分上公办</a>
    <a href="faq.html">❓ 常见问题</a>`;

  // 署名水印
  const foot = document.createElement('div');
  foot.className = 'site-footer';
  foot.textContent = '抖音@内向自卑小学生 · heyanxingyan520 整理制作';

  const bar = document.querySelector('.tabbar');
  if (bar) { page.insertBefore(nav, bar); page.insertBefore(foot, bar); }
  else { page.appendChild(nav); page.appendChild(foot); }
}

/* ============================================================
 * 1. 首页
 * ============================================================ */
function renderIndex() {
  renderTabbar('index');

  // Banner 轮播
  const bannerEl = document.getElementById('banner');
  if (bannerEl) {
    bannerEl.innerHTML = BANNERS.map((b, i) => `
      <a href="${b.link}" class="banner-slide ${i === 0 ? 'active' : ''}" style="background:${b.bg}">
        <div class="banner-title">${b.title}</div>
        <div class="banner-sub">${b.sub}</div>
      </a>
    `).join('') + `
      <div class="banner-dots">
        ${BANNERS.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
      </div>
      <div class="banner-watermark">抖音@内向自卑小学生</div>
    `;
    let cur = 0;
    setInterval(() => {
      cur = (cur + 1) % BANNERS.length;
      bannerEl.querySelectorAll('.banner-slide').forEach((s, i) => s.classList.toggle('active', i === cur));
      bannerEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === cur));
    }, 3500);
  }

  // 板块入口（三大板块各有独立页面；中职起点内含中职专科/对口本科子标签；专项计划内含三个子类别）
  const catEl = document.getElementById('category-grid');
  if (catEl) {
    catEl.innerHTML = Object.values(CATEGORIES).map(c => {
      const hrefMap = { gaozhong: 'gaozhong.html', zhongzhi: 'zhongzhi.html', zhuanxiang: 'zhuanxiang.html' };
      const href = hrefMap[c.key] || `college-list.html?category=${c.key}`;
      return `
      <a href="${href}" class="category-card" style="text-decoration:none">
        <div class="icon">${c.icon}</div>
        <div class="name">${c.name}</div>
      </a>`;
    }).join('');
  }

  // 热门院校（横向滚动）
  const hotEl = document.getElementById('hot-colleges');
  if (hotEl) {
    const hot = COLLEGES.filter(c => c.hot && !c.stoppedEnrollment).slice(0, 6);
    hotEl.innerHTML = hot.map(c => `
      <a href="college-detail.html?id=${c.id}" class="college-chip">
        <div class="name">${c.name}${c.stoppedEnrollment ? ' <span style="font-size:10px;background:#ff4d4f;color:#fff;padding:1px 5px;border-radius:8px">停招</span>' : ''}</div>
        <div class="meta">${c.city} · ${c.nature}</div>
        <div class="score" style="font-size:11px;color:var(--text-light)">查看取分规则 ›</div>
      </a>
    `).join('');
  }

  // 分数查询搜索框
  const scoreBtn = document.getElementById('score-search-btn');
  if (scoreBtn) {
    scoreBtn.addEventListener('click', () => {
      const kw = document.getElementById('score-search-input').value.trim();
      if (!kw) { toast('请输入院校名或专业名'); return; }
      location.href = `college-list.html?kw=${encodeURIComponent(kw)}`;
    });
  }
}

/* ============================================================
 * 2. 院校列表页
 * ============================================================ */
let listState = { filtered: [], page: 1, pageSize: 8, loading: false };

function renderCollegeList() {
  renderTabbar('college');
  const category = getQuery('category');
  const kw = getQuery('kw') || '';

  // 标题
  const titleMap = { gaozhong: '高中起点 · 院校列表', zhongzhi: '中职起点 · 院校列表', zhuanxiang: '专项计划 · 院校列表' };
  renderNavbar(titleMap[category] || '院校列表', true);

  // 搜索框预填
  const searchInput = document.getElementById('college-search');
  if (kw) searchInput.value = kw;

  // 城市筛选
  const cities = [...new Set(COLLEGES.map(c => c.city))];
  const cityFilter = document.getElementById('city-filter');
  cityFilter.innerHTML = '<button class="filter-chip active" data-city="">全部</button>' +
    cities.map(c => `<button class="filter-chip" data-city="${c}">${c}</button>`).join('');

  // 办学性质筛选
  const natureFilter = document.getElementById('nature-filter');
  natureFilter.innerHTML = `
    <button class="filter-chip active" data-nature="">全部</button>
    <button class="filter-chip" data-nature="公办">公办</button>
    <button class="filter-chip" data-nature="民办">民办</button>
  `;

  // 类型筛选
  const types = [...new Set(COLLEGES.map(c => c.type))];
  const typeFilter = document.getElementById('type-filter');
  typeFilter.innerHTML = '<button class="filter-chip active" data-type="">全部类型</button>' +
    types.map(t => `<button class="filter-chip" data-type="${t}">${t}</button>`).join('');

  // 学历层次筛选（本科/专科）
  const levelFilter = document.getElementById('level-filter');
  levelFilter.innerHTML = `
    <button class="filter-chip active" data-level="">全部层次</button>
    <button class="filter-chip" data-level="本科">🏫 对口本科</button>
    <button class="filter-chip" data-level="专科">高职专科</button>
  `;

  // 录取规则筛选
  const ruleFilter = document.getElementById('rule-filter');
  ruleFilter.innerHTML = `
    <button class="filter-chip active" data-rule="">全部规则</button>
    <button class="filter-chip" data-rule="分数优先">分数优先</button>
    <button class="filter-chip" data-rule="志愿优先">志愿优先</button>
  `;

  // 面试筛选
  const interviewFilter = document.getElementById('interview-filter');
  interviewFilter.innerHTML = `
    <button class="filter-chip active" data-interview="">全部</button>
    <button class="filter-chip" data-interview="yes">有面试/加试</button>
    <button class="filter-chip" data-interview="no">无面试</button>
  `;

  // 初始筛选
  applyFilters(category, kw);

  // 事件绑定
  [cityFilter, natureFilter, typeFilter, levelFilter, ruleFilter, interviewFilter].forEach(bar => {
    bar.addEventListener('click', e => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyFilters(category, searchInput.value.trim());
    });
  });

  searchInput.addEventListener('input', () => applyFilters(category, searchInput.value.trim()));

  // 下拉加载
  window.addEventListener('scroll', () => {
    if (listState.loading) return;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      loadMore(category, searchInput.value.trim());
    }
  });
}

function applyFilters(category, kw) {
  let list = COLLEGES.slice();
  if (category) {
    list = list.filter(c => c.tags.includes(category));
    // 根据类别过滤招生计划为0的学校
    if (category === 'gaozhong') {
      list = list.filter(c => (c.plan2026Gaozhong || 0) > 0);
    } else if (category === 'zhongzhi') {
      list = list.filter(c => (c.plan2026Zhongzhi || 0) > 0);
    } else if (category === 'zhuanxiang') {
      list = list.filter(c => (c.plan2026Zhuanxiang || 0) > 0);
    }
  }
  if (kw) {
    list = list.filter(c =>
      c.name.includes(kw) ||
      c.majors.some(m => m.name.includes(kw))
    );
  }
  const city = document.querySelector('#city-filter .filter-chip.active')?.dataset.city || '';
  const nature = document.querySelector('#nature-filter .filter-chip.active')?.dataset.nature || '';
  const type = document.querySelector('#type-filter .filter-chip.active')?.dataset.type || '';
  const level = document.querySelector('#level-filter .filter-chip.active')?.dataset.level || '';
  const rule = document.querySelector('#rule-filter .filter-chip.active')?.dataset.rule || '';
  const interview = document.querySelector('#interview-filter .filter-chip.active')?.dataset.interview || '';
  if (city) list = list.filter(c => c.city === city);
  if (nature) list = list.filter(c => c.nature === nature);
  if (type) list = list.filter(c => c.type === type);
  if (level === '本科') list = list.filter(c => c.isUndergraduate);
  if (level === '专科') list = list.filter(c => !c.isUndergraduate);
  if (rule) list = list.filter(c => (c.admissionRule2026 || '').indexOf(rule) === 0);
  if (interview === 'yes') list = list.filter(c => c.interview && c.interview.hasInterview);
  if (interview === 'no') list = list.filter(c => !c.interview || !c.interview.hasInterview);

  listState.filtered = list;
  listState.page = 1;
  renderCollegeListItems(true);
}

function renderCollegeListItems(reset) {
  const container = document.getElementById('college-list');
  if (reset) container.innerHTML = '';
  const start = 0;
  const end = listState.page * listState.pageSize;
  const slice = listState.filtered.slice(start, end);

  if (listState.filtered.length === 0) {
    container.innerHTML = `<div class="empty"><div class="icon">🔍</div><div>未找到符合条件的院校</div></div>`;
    document.getElementById('load-more').style.display = 'none';
    return;
  }

  container.innerHTML = slice.map(c => {
    // 根据当前板块显示对应类别的2026计划数
    const curCat = getQuery('category') || '';
    let planText = '';
    if (curCat === 'gaozhong' && c.plan2026Gaozhong) {
      planText = `普高计划 ${c.plan2026Gaozhong} 人`;
    } else if (curCat === 'zhongzhi' && c.plan2026Zhongzhi) {
      planText = `中职计划 ${c.plan2026Zhongzhi} 人`;
    } else if (curCat === 'zhuanxiang' && c.plan2026Zhuanxiang) {
      planText = `专项计划 ${c.plan2026Zhuanxiang} 人`;
    } else if (c.plan2026) {
      // 提取总计划数
      const totalMatch = String(c.plan2026).match(/(\d+)\s*人/);
      planText = totalMatch ? `计划 ${totalMatch[1]} 人` : `计划 ${c.planCount2024} 人`;
    } else {
      planText = `计划 ${c.planCount2024} 人`;
    }
    return `
    <a href="college-detail.html?id=${c.id}" class="college-card">
      <div class="head">
        <div class="name">${c.name}</div>
      </div>
      <div class="tags">
        <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
        <span class="tag tag-type">${c.type}</span>
        ${c.isUndergraduate ? '<span class="tag" style="background:#f9f0ff;color:#531dab;border:1px solid #d3adf7">🏫 对口本科</span>' : ''}
        ${c.stoppedEnrollment ? '<span class="tag" style="background:#fff1f0;color:#ff4d4f;border:1px solid #ffa39e">⚠️ 已停招</span>' : ''}
        ${c.interview && c.interview.hasInterview ? '<span class="tag" style="background:#fff7e6;color:#ad6800;border:1px solid #ffd591">有面试</span>' : ''}
        ${c.hot ? '<span class="tag tag-hot">热门</span>' : ''}
      </div>
      <div class="meta-row">
        <span>${c.city} · ${planText}</span>
      </div>
    </a>
  `}).join('');

  const loadMoreEl = document.getElementById('load-more');
  if (end >= listState.filtered.length) {
    loadMoreEl.textContent = '— 已加载全部 —';
  } else {
    loadMoreEl.textContent = '下拉加载更多';
  }
}

function loadMore() {
  if (listState.page * listState.pageSize >= listState.filtered.length) return;
  listState.loading = true;
  document.getElementById('load-more').textContent = '加载中...';
  setTimeout(() => {
    listState.page++;
    listState.loading = false;
    renderCollegeListItems(false);
  }, 400);
}

/* ============================================================
 * 3. 院校详情页
 * ============================================================ */
function renderCollegeDetail() {
  const id = getQuery('id');
  const c = getCollegeById(id);
  if (!c) {
    document.querySelector('.page').innerHTML = '<div class="empty"><div class="icon">⚠️</div><div>未找到该院校</div></div>';
    return;
  }

  renderNavbar('院校详情', true);
  renderTabbar('college');
  document.title = c.name + ' - 安徽单招';

  // 头部
  const head = document.getElementById('detail-head');
  head.innerHTML = `
    <div class="name">${c.name}${c.isUndergraduate ? ' <span style="font-size:12px;background:#722ed1;color:#fff;padding:2px 8px;border-radius:10px;margin-left:6px">🏫 对口本科</span>' : ''}${c.stoppedEnrollment ? ' <span style="font-size:12px;background:#ff4d4f;color:#fff;padding:2px 8px;border-radius:10px;margin-left:6px">⚠️ 2026年已停招</span>' : ''}${(c.secondCutoff && c.secondCutoff.enabled) ? ' <span style="font-size:12px;background:#faad14;color:#fff;padding:2px 8px;border-radius:10px;margin-left:6px">⚠️ 校考入围</span>' : ''}</div>
    <div class="sub">
      <span>📍 ${c.city}</span>
      <span>${c.nature}</span>
      <span>${c.type}</span>
    </div>
    <button class="cmp-btn ${inCompare(c.id) ? 'active' : ''}" id="cmp-btn">${inCompare(c.id) ? '✓ 已对比' : '⚖️ 加入对比'}</button>
    <button class="fav-btn ${isFav(c.id) ? 'active' : ''}" id="fav-btn">${isFav(c.id) ? '★' : '☆'}</button>
  `;
  document.getElementById('fav-btn').addEventListener('click', () => {
    const active = toggleFav(c.id);
    document.getElementById('fav-btn').textContent = active ? '★' : '☆';
    document.getElementById('fav-btn').classList.toggle('active', active);
  });
  document.getElementById('cmp-btn').addEventListener('click', () => {
    const r = toggleCompare(c.id);
    if (r === 'full') { toast('最多对比4所院校，请先移除'); return; }
    document.getElementById('cmp-btn').textContent = r ? '✓ 已对比' : '⚖️ 加入对比';
    document.getElementById('cmp-btn').classList.toggle('active', r);
    toast(r ? '已加入对比，点底部"对比"查看' : '已移出对比');
  });

  // 基本信息
  document.getElementById('basic-info').innerHTML = `
    <div class="row"><div class="label">所在城市</div><div class="value">${c.city}</div></div>
    <div class="row"><div class="label">学校地址</div><div class="value">${c.address}</div></div>
    <div class="row"><div class="label">办学性质</div><div class="value">${c.nature}</div></div>
    <div class="row"><div class="label">院校类型</div><div class="value">${c.type}${c.type.indexOf('本科')>=0 ? '（本科层次）' : ''}</div></div>
    <div class="row"><div class="label">在校生规模</div><div class="value">${c.scale || '—'}</div></div>
    <div class="row"><div class="label">招生办电话</div><div class="value">${c.phone || '—'}</div></div>
    <div class="row"><div class="label">就业率</div><div class="value">${c.employmentRate || '—'}</div></div>
    <div class="row"><div class="label">专升本率</div><div class="value">${c.upgradeRate || '—'}</div></div>
    <div class="row"><div class="label">官方网站</div><div class="value"><a href="${c.website}" target="_blank" rel="noopener">${c.website.replace('https://','')}</a></div></div>
  `;

  // Tab 切换
  document.querySelectorAll('.tab-switch .tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-switch .tab-item').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
      if (tab.dataset.tab === 'score') renderScoreChart(c);
    });
  });

  // 判断2026计划是否为真实数据
  const isRealPlan = c.plan2026 && !c.plan2026.includes('参考') && !c.plan2026.includes('预估') && !c.plan2026.includes('未采集') && !c.plan2026.includes('待公布') && !c.plan2026.includes('2025');
  const planLabel = isRealPlan ? '2026年' : '2026参考';
  const isRealRule = c.admissionRule2026 && !c.admissionRule2026.includes('参考') && !c.admissionRule2026.includes('预估');
  const ruleLabel = isRealRule ? '2026年' : '2026参考';

  // 招生计划
  const fromCat = getQuery('category');
  const planDetail = [];
  if (c.plan2026Gaozhong) planDetail.push(`普高 ${c.plan2026Gaozhong} 人`);
  if (c.plan2026Zhongzhi) planDetail.push(`中职 ${c.plan2026Zhongzhi} 人`);
  if (fromCat === 'zhuanxiang-tuiyi' && c.plan2026RetiredMilitary) planDetail.push(`退役军人 ${c.plan2026RetiredMilitary} 人`);
  else if (fromCat === 'zhuanxiang-laoxiang' && c.plan2026RevolutionaryArea) planDetail.push(`革命老区 ${c.plan2026RevolutionaryArea} 人`);
  else if (fromCat === 'zhuanxiang-xiangcun' && c.plan2026RuralDoctor) planDetail.push(`乡村医生 ${c.plan2026RuralDoctor} 人`);
  else if (c.plan2026Zhuanxiang) planDetail.push(`专项计划 ${c.plan2026Zhuanxiang} 人`);
  const planDetailHtml = planDetail.length > 0 
    ? `<div style="margin-top:8px;padding:8px 12px;background:#f6f0ff;border-radius:8px;font-size:13px;color:#531dab">
         <b>分类计划：</b>${planDetail.join(' ｜ ')}</div>` 
    : '';
  // 分专业计划：根据来源板块只显示对应列
  const catColMap = {
    gaozhong: { label: '普高计划', field: 'plan2026Gaozhong' },
    zhongzhi: { label: '中职计划', field: 'plan2026Zhongzhi' },
    zhuanxiang: { label: '专项计划', field: 'plan2026Zhuanxiang' },
    'zhuanxiang-tuiyi': { label: '退役军人计划', field: 'plan2026RetiredMilitary' },
    'zhuanxiang-laoxiang': { label: '革命老区计划', field: 'plan2026RevolutionaryArea' },
    'zhuanxiang-xiangcun': { label: '乡村医生计划', field: 'plan2026RuralDoctor' }
  };
  const showCols = fromCat && catColMap[fromCat] ? [catColMap[fromCat]] : [
    { label: '普高计划', field: 'plan2026Gaozhong' },
    { label: '中职计划', field: 'plan2026Zhongzhi' },
    { label: '专项计划', field: 'plan2026Zhuanxiang' }
  ];
  const majorTableHeader = `<tr><th>专业名称</th><th>专业代码</th><th>所属大类</th>${showCols.map(col => `<th>${col.label}</th>`).join('')}<th>学费(元/年)</th></tr>`;
  const majorTableBody = c.majors.map(m => {
    const cells = showCols.map(col => {
      const val = m[col.field];
      return `<td>${c.stoppedEnrollment ? '<span style="color:#ff4d4f">停招</span>' : (val ? val + ' 人' : '—')}</td>`;
    }).join('');
    return `<tr>
      <td><a href="major-detail.html?name=${encodeURIComponent(m.name)}" style="color:var(--primary)">${m.name}</a></td>
      <td>${m.code || '—'}</td>
      <td>${getMajorCategoryName(m.category)}</td>
      ${cells}
      <td>${m.fee ? m.fee + ' 元' : '—'}</td>
    </tr>`;
  }).join('');

  // 2026合计已删去，仅显示分类计划明细；无明细字段时回退显示plan2026
  const planTotalHtml = planDetail.length > 0 ? '' : `<p style="font-size:16px;font-weight:600;color:var(--primary)">${c.plan2026 || '待院校公布'}</p>`;
  document.getElementById('panel-plan').innerHTML = `
    <div class="about-section" style="margin:8px 12px">
      <h3>📋 招生计划（${planLabel}）</h3>
      ${c.stoppedEnrollment ? '<div style="background:#fff1f0;border:2px solid #ff4d4f;border-radius:8px;padding:16px;margin:12px 0;text-align:center"><div style="font-size:24px;margin-bottom:8px">⚠️</div><div style="font-size:18px;font-weight:700;color:#ff4d4f;margin-bottom:8px">2026年已停止分类考试招生</div><div style="font-size:13px;color:#666">该校2026年未在安徽省教育招生考试院分类考试招生章程名单中，2025年为最后一届分类招生。2027年是否恢复招生请关注院校官网及省考试院公告。</div></div>' : ''}
      ${planTotalHtml}
      ${planDetailHtml}
    </div>
    ${c.stoppedEnrollment ? '<div style="background:#fff1f0;border:2px solid #ff4d4f;border-radius:8px;padding:12px;margin:8px 12px;text-align:center"><div style="font-size:16px;font-weight:700;color:#ff4d4f">⚠️ 2026年已停招，以下专业2026年均无招生计划</div><div style="font-size:12px;color:#666;margin-top:4px">2024-2025年计划数为历史数据，供参考</div></div>' : ''}
    <div class="about-section" style="margin:8px 12px">
      <h3>📚 分专业招生计划（${planLabel}）${fromCat && catColMap[fromCat] ? ' · ' + catColMap[fromCat].label : ''}</h3>
    </div>
    <div class="table-wrap" style="margin:0 12px">
      <table>
        <thead>${majorTableHeader}</thead>
        <tbody>${majorTableBody}</tbody>
      </table>
    </div>
    <div style="padding:8px 12px;font-size:12px;color:var(--text-light)">注：2026年分专业计划数据来源为各院校2026年分类考试招生章程（73所院校为官方公布真实数据，安徽电气工程职业技术学院2026年已停招），实际以省教育厅下达为准</div>
  `;

  // 2026录取规则
  const scoreCompHtml = c.scoreComposition ? `
    <div style="background:linear-gradient(135deg,#fff7e6,#ffe7ba);border:2px solid #fa8c16;border-radius:12px;padding:14px 16px;margin:10px 0">
      <div style="font-size:13px;color:#ad6800;font-weight:600;margin-bottom:6px">📐 取分规则（2026年院校章程）</div>
      <div style="font-size:15px;color:#5c3a00;font-weight:600;line-height:1.6">${c.scoreComposition}</div>
    </div>` : '';
  // 退役军人专项计划应录尽录显眼展示
  const hasYinglu = c.retiredMilitaryPolicy && (c.retiredMilitaryPolicy.indexOf('应录尽录') >= 0 || c.retiredMilitaryPolicy.indexOf('参加测试即录取') >= 0 || c.retiredMilitaryPolicy.indexOf('全部录取') >= 0);
  const yingluHtml = hasYinglu ? `
    <div style="background:linear-gradient(135deg,#f6ffed,#d9f7be);border:2px solid #52c41a;border-radius:12px;padding:14px 16px;margin:10px 0">
      <div style="font-size:13px;color:#389e0d;font-weight:700;margin-bottom:6px">⭐ 退役军人专项计划 · 应录尽录</div>
      <div style="font-size:16px;color:#135200;font-weight:700;line-height:1.6">${c.retiredMilitaryPolicy}</div>
    </div>` : (c.retiredMilitaryPolicy ? `
    <div style="background:#f5f5f5;border:1px solid #d9d9d9;border-radius:8px;padding:10px 14px;margin:10px 0">
      <div style="font-size:13px;color:#595959;font-weight:600;margin-bottom:4px">退役军人专项计划录取政策</div>
      <div style="font-size:14px;color:#262626;line-height:1.5">${c.retiredMilitaryPolicy}</div>
    </div>` : '');
  // 校考入围（二次划线）机制提示
  const secondCutoffHtml = (c.secondCutoff && c.secondCutoff.enabled) ? `
    <div style="background:linear-gradient(135deg,#fffbe6,#fff1b8);border:2px solid #faad14;border-radius:12px;padding:14px 16px;margin:10px 0">
      <div style="font-size:14px;color:#ad6800;font-weight:700;margin-bottom:8px">⚠️ 校考入围（二次划线）机制</div>
      <div style="font-size:14px;color:#614700;line-height:1.7;margin-bottom:6px"><b>入围比例：</b>${c.secondCutoff.ratio}</div>
      <div style="font-size:13px;color:#874d00;line-height:1.7">${c.secondCutoff.note}</div>
      <div style="font-size:12px;color:#d46b08;margin-top:8px;line-height:1.6">提示：文化统考未达入围线将无法参加校考，志愿直接作废；建议先用下方"录取概率测算"查看自己的文化分是否稳妥。</div>
    </div>` : '';
  document.getElementById('panel-rule').innerHTML = `
    <div class="about-section" style="margin:8px 12px">
      <h3>📌 录取规则（${ruleLabel}）</h3>
      ${secondCutoffHtml}
      ${yingluHtml}
      ${scoreCompHtml}
      <p><b>录取规则：</b>${c.admissionRule2026 || '参考院校章程'}</p>
      <p><b>学历层次：</b>${c.isUndergraduate ? '应用型本科（对口本科）' : (c.type && c.type.indexOf('本科')>=0 ? c.type : '高职（专科）')}</p>
      <p><b>2026录取参考分：</b><span style="color:#722ed1;font-weight:600">${c.score2026 || '—'}</span></p>
    </div>
    <div class="about-section" style="margin:8px 12px">
      <h3>📊 院校概况</h3>
      <p><b>就业率：</b>${c.employmentRate || '—'}</p>
      <p><b>专升本率：</b>${c.upgradeRate || '—'}</p>
      <p><b>2026招生计划（${planLabel}）：</b>${c.plan2026 || '待院校公布'}</p>
    </div>
    <div class="about-section" style="margin:8px 12px">
      <h3>🎤 面试/技能加试信息</h3>
      <p><b>是否有面试：</b>${c.interview && c.interview.hasInterview ? '是' : '否'}</p>
      ${c.interview ? `
        <p><b>面试形式：</b>${c.interview.form}</p>
        <p><b>面试占比：</b>${c.interview.ratio}</p>
        <p><b>面试内容：</b>${c.interview.content}</p>
      ` : ''}
    </div>
    <div class="note" style="margin:8px 12px">
      ⚠️ 以上录取规则、成绩构成、面试信息为2026年数据，供2027考生参考；部分为参考估算值（已标注）。2027年实际规则以院校公布的最新招生章程及安徽省教育招生考试院为准。
    </div>
  `;

  // 学校简介
  document.getElementById('panel-intro').innerHTML = `
    <div class="about-section" style="margin:0">
      <p>${c.intro}</p>
    </div>
  `;
}

function renderScoreChart(c) {
  const el = document.getElementById('score-chart');
  if (!el) return;
  // 更新分数图标题
  const titleEl = el.closest('.chart-box') ? el.closest('.chart-box').querySelector('.chart-title') : null;
  // 退役军人专项计划应录尽录：替换线状图为应录尽录提示
  const hasYinglu = c.retiredMilitaryPolicy && (c.retiredMilitaryPolicy.indexOf('应录尽录') >= 0 || c.retiredMilitaryPolicy.indexOf('参加测试即录取') >= 0 || c.retiredMilitaryPolicy.indexOf('全部录取') >= 0);
  if (hasYinglu) {
    if (titleEl) titleEl.innerHTML = '🎖️ 退役军人专项计划 · <strong>应录尽录</strong>';
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;min-height:280px">
        <div style="font-size:56px;margin-bottom:16px">🎖️</div>
        <div style="font-size:22px;font-weight:700;color:#389e0d;margin-bottom:12px">退役军人专项计划 · 应录尽录</div>
        <div style="font-size:15px;color:#595959;line-height:1.8;max-width:320px">${c.retiredMilitaryPolicy}</div>
        <div style="font-size:13px;color:#8c8c8c;margin-top:16px">该院校退役军人专项计划不设分数门槛，符合条件即可录取</div>
      </div>`;
    el.style.background = 'linear-gradient(135deg,#f6ffed,#d9f7be)';
    el.style.borderRadius = '12px';
    el.style.border = '2px solid #52c41a';
    return;
  }
  // 正常渲染线状图
  if (titleEl) titleEl.innerHTML = '2021-2025 录取<strong>参考分数</strong>走势';
  el.style.background = '';
  el.style.borderRadius = '';
  el.style.border = '';
  if (el._rendered) return;
  el._rendered = true;
  const years = Object.keys(c.scores).sort();
  const mins = years.map(y => c.scores[y].min);
  const avgs = years.map(y => c.scores[y].avg);
  const maxs = years.map(y => c.scores[y].max);

  const chart = echarts.init(el);
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['最低分', '平均分', '最高分'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 40, right: 16, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: years, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', min: v => Math.floor(v.min - 10), axisLabel: { fontSize: 11 } },
    series: [
      { name: '最低分', type: 'line', data: mins, smooth: true, itemStyle: { color: '#ff4d4f' }, label: { show: true, fontSize: 10 } },
      { name: '平均分', type: 'line', data: avgs, smooth: true, itemStyle: { color: '#1677ff' }, label: { show: true, fontSize: 10 } },
      { name: '最高分', type: 'line', data: maxs, smooth: true, itemStyle: { color: '#52c41a' }, label: { show: true, fontSize: 10 } }
    ]
  });
  window.addEventListener('resize', () => chart.resize());
}

/* ============================================================
 * 4. 专业查询/反查页
 * ============================================================ */
function renderMajorSearch() {
  renderTabbar('major');
  renderNavbar('专业查询', false);

  // 大类筛选
  const catFilter = document.getElementById('major-cat-filter');
  catFilter.innerHTML = '<button class="filter-chip active" data-cat="">全部</button>' +
    MAJOR_CATEGORIES.map(c => `<button class="filter-chip" data-cat="${c.key}">${c.name.replace('大类','')}</button>`).join('');

  renderMajorList('', '');

  catFilter.addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    catFilter.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const kw = document.getElementById('major-search').value.trim();
    renderMajorList(kw, chip.dataset.cat);
  });

  document.getElementById('major-search').addEventListener('input', e => {
    const cat = document.querySelector('#major-cat-filter .filter-chip.active')?.dataset.cat || '';
    renderMajorList(e.target.value.trim(), cat);
  });
}

function renderMajorList(kw, cat) {
  const all = getAllMajors();
  let list = all;
  if (cat) list = list.filter(m => m.category === cat);
  if (kw) list = list.filter(m => m.name.includes(kw));

  const container = document.getElementById('major-list');
  if (list.length === 0) {
    container.innerHTML = `<div class="empty"><div class="icon">📚</div><div>未找到相关专业</div></div>`;
    return;
  }

  container.innerHTML = list.map(m => `
    <div class="major-item">
      <div class="top">
        <div>
          <div class="m-name">${m.name}</div>
          <div class="m-code">代码：${m.code}</div>
        </div>
        <span class="m-cat">${getMajorCategoryName(m.category)}</span>
      </div>
      <div class="schools-toggle" onclick="toggleSchools(this)">
        <span>开设院校 ${m.schools.length} 所 ▾</span>
      </div>
      <div class="schools-list">
        ${m.schools.map(s => `
          <a href="college-detail.html?id=${s.collegeId}" class="school-row">
            <span class="s-name">${s.collegeName}（${s.city}）</span>
            <span>学费 ${s.fee}元/年</span>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function toggleSchools(el) {
  const list = el.nextElementSibling;
  list.classList.toggle('open');
  el.querySelector('span').innerHTML = list.classList.contains('open')
    ? `收起院校列表 ▴`
    : `开设院校 ${list.children.length} 所 ▾`;
}

/* ============================================================
 * 5. 专业详情页
 * ============================================================ */
function renderMajorDetail() {
  const name = decodeURIComponent(getQuery('name') || '');
  renderNavbar('专业详情', true);
  document.title = name + ' - 安徽单招';

  const all = getAllMajors();
  const m = all.find(x => x.name === name);
  if (!m) {
    document.getElementById('major-detail-body').innerHTML = `<div class="empty"><div class="icon">⚠️</div><div>未找到该专业</div></div>`;
    return;
  }

  document.getElementById('major-detail-body').innerHTML = `
    <div class="detail-header" style="border-radius:0">
      <div class="name">${m.name}</div>
      <div class="sub">
        <span>代码：${m.code}</span>
        <span>大类：${getMajorCategoryName(m.category)}</span>
      </div>
    </div>
    <div class="section-title">开设院校（${m.schools.length}）</div>
    ${m.schools.map(s => `
      <a href="college-detail.html?id=${s.collegeId}" class="college-card" style="display:block">
        <div class="head">
          <div class="name">${s.collegeName}</div>
          <span class="score" style="color:var(--danger);font-weight:600">${s.minScore2024} 分</span>
        </div>
        <div class="tags">
          <span class="tag ${s.nature === '公办' ? 'tag-public' : 'tag-private'}">${s.nature}</span>
          <span class="tag tag-type">${s.city}</span>
        </div>
        <div class="meta-row">
          <span>学费：${s.fee} 元/年</span>
        </div>
      </a>
    `).join('')}
  `;
}

/* ============================================================
 * 6. 分数走势页
 * ============================================================ */
function renderScoreTrend() {
  renderTabbar('index');
  renderNavbar('分数走势查询', true);

  const select = document.getElementById('score-college-select');
  select.innerHTML = COLLEGES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  function renderCharts() {
    const c = getCollegeById(select.value);
    if (!c) return;
    renderTrendChart(c);
    renderCompareChart(c);
  }

  select.addEventListener('change', renderCharts);
  renderCharts();
}

function renderTrendChart(c) {
  const el = document.getElementById('trend-chart');
  if (el._chart) el._chart.dispose();
  el.innerHTML = '';
  el.style.background = '';
  el.style.borderRadius = '';
  el.style.border = '';
  // 退役军人专项计划应录尽录：替换线状图为应录尽录提示
  const hasYinglu = c.retiredMilitaryPolicy && (c.retiredMilitaryPolicy.indexOf('应录尽录') >= 0 || c.retiredMilitaryPolicy.indexOf('参加测试即录取') >= 0 || c.retiredMilitaryPolicy.indexOf('全部录取') >= 0);
  if (hasYinglu) {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;min-height:280px">
        <div style="font-size:56px;margin-bottom:16px">🎖️</div>
        <div style="font-size:22px;font-weight:700;color:#389e0d;margin-bottom:12px">${c.name} · 应录尽录</div>
        <div style="font-size:15px;color:#595959;line-height:1.8;max-width:320px">${c.retiredMilitaryPolicy}</div>
        <div style="font-size:13px;color:#8c8c8c;margin-top:16px">退役军人专项计划不设分数门槛，符合条件即可录取</div>
      </div>`;
    el.style.background = 'linear-gradient(135deg,#f6ffed,#d9f7be)';
    el.style.borderRadius = '12px';
    el.style.border = '2px solid #52c41a';
    return;
  }
  const years = Object.keys(c.scores).sort();
  const chart = echarts.init(el);
  el._chart = chart;
  chart.setOption({
    title: { text: c.name + ' · 五年录取分走势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { data: ['最低分', '平均分', '最高分'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 40, right: 16, top: 50, bottom: 40 },
    xAxis: { type: 'category', data: years },
    yAxis: { type: 'value', min: v => Math.floor(v.min - 10) },
    series: [
      { name: '最低分', type: 'line', data: years.map(y => c.scores[y].min), smooth: true, itemStyle: { color: '#ff4d4f' }, areaStyle: { opacity: 0.1 } },
      { name: '平均分', type: 'line', data: years.map(y => c.scores[y].avg), smooth: true, itemStyle: { color: '#1677ff' } },
      { name: '最高分', type: 'line', data: years.map(y => c.scores[y].max), smooth: true, itemStyle: { color: '#52c41a' } }
    ]
  });
  window.addEventListener('resize', () => chart.resize());
}

function renderCompareChart(c) {
  const el = document.getElementById('compare-chart');
  if (el._chart) el._chart.dispose();
  el.innerHTML = '';
  // 同城市院校平均分对比
  const sameCity = COLLEGES.filter(x => x.city === c.city);
  const chart = echarts.init(el);
  el._chart = chart;
  chart.setOption({
    title: { text: c.city + '地区院校 2024 平均分对比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 50, bottom: 60 },
    xAxis: {
      type: 'category',
      data: sameCity.map(x => x.name.length > 8 ? x.name.slice(0, 8) + '…' : x.name),
      axisLabel: { fontSize: 10, rotate: 30 }
    },
    yAxis: { type: 'value', min: v => Math.floor(v.min - 10) },
    series: [{
      type: 'bar',
      data: sameCity.map(x => x.scores[2024].avg),
      itemStyle: {
        color: params => params.name === (c.name.length > 8 ? c.name.slice(0, 8) + '…' : c.name) ? '#1677ff' : '#91caff'
      },
      label: { show: true, position: 'top', fontSize: 10 }
    }]
  });
  window.addEventListener('resize', () => chart.resize());
}

/* ============================================================
 * 7. 板块说明页
 * ============================================================ */
function renderCategory() {
  renderTabbar('college');
  renderNavbar('招生板块说明', true);

  const body = document.getElementById('category-body');
  body.innerHTML = Object.values(CATEGORIES).map(c => `
    <div class="category-detail">
      <div class="cat-head">
        <div class="icon">${c.icon}</div>
        <div class="name">${c.name}</div>
      </div>
      <div class="info-block">
        <div class="info-label">板块介绍</div>
        <div class="info-content">${c.desc}</div>
      </div>
      <div class="info-block">
        <div class="info-label">报考条件</div>
        <div class="info-content">${c.condition}</div>
      </div>
      <div class="info-block">
        <div class="info-label">考试科目</div>
        <div class="info-content">${c.subjects}</div>
      </div>
      <div class="info-block">
        <div class="info-label">录取规则</div>
        <div class="info-content">${c.rule}</div>
      </div>
      <a href="${c.key === 'zhongzhi' ? 'zhongzhi.html' : `college-list.html?category=${c.key}`}" class="btn-primary" style="margin:12px 0 0">${c.key === 'zhongzhi' ? '进入中职起点板块 →' : `查看${c.name}院校 →`}</a>
    </div>
  `).join('');
}

/* ============================================================
 * 8. 关于页
 * ============================================================ */
function renderAbout() {
  renderTabbar('me');
  renderNavbar('关于本站', false);
}

/* ============================================================
 * 9. 对口本科页
 * ============================================================ */
function renderBenke() {
  renderTabbar('college');

  // 本站名单内的对口本科院校
  const inList = COLLEGES.filter(c => c.isUndergraduate);
  const inEl = document.getElementById('benke-in-list');
  if (inEl) {
    inEl.innerHTML = inList.map(c => `
      <a href="college-detail.html?id=${c.id}" class="college-card">
        <div class="head">
          <div class="name">🏫 ${c.name}</div>
          <span class="score" style="color:#722ed1;font-weight:600">${c.city}</span>
        </div>
        <div class="tags">
          <span class="tag tag-public">${c.nature}</span>
          <span class="tag tag-type">${c.type}</span>
          <span class="tag" style="background:#f9f0ff;color:#531dab;border:1px solid #d3adf7">对口本科</span>
        </div>
        <div class="meta-row">
          <span>${c.scoreComposition || '文化+技能'}</span>
        </div>
      </a>
    `).join('') || '<div class="empty"><div class="icon">📭</div><div>本站74所名单内暂无对口本科院校</div></div>';
  }

  // 其他对口本科参考院校
  const otherEl = document.getElementById('benke-other');
  if (otherEl && typeof BENKE_SCHOOLS !== 'undefined') {
    otherEl.innerHTML = BENKE_SCHOOLS.map(s => `
      <a href="${s.link}" target="_blank" rel="noopener" class="college-card" style="display:block;margin-bottom:10px">
        <div class="head">
          <div class="name">${s.name}</div>
          <span class="score" style="color:${s.nature==='公办'?'#1677ff':'#fa541c'};font-weight:600">${s.nature}</span>
        </div>
        <div class="tags">
          <span class="tag tag-type">${s.city}</span>
          <span class="tag" style="background:#f6ffed;color:#389e0d;border:1px solid #b7eb8f">对口本科</span>
        </div>
        <div class="meta-row">
          <span style="font-size:12px">${s.note}</span>
        </div>
      </a>
    `).join('');
  }
}

/* ============================================================
 * 10. 中职起点板块页（中职专科 / 对口本科 子标签）
 * ============================================================ */
function renderZhongzhi() {
  renderTabbar('college');

  // 板块介绍
  const zc = CATEGORIES.zhongzhi;
  document.getElementById('zz-desc').textContent = zc.desc;
  document.getElementById('zz-condition').textContent = zc.condition;
  document.getElementById('zz-subjects').textContent = zc.subjects;
  document.getElementById('zz-rule').textContent = zc.rule;

  // 中职专科：招收中职生的高职专科院校（过滤招生计划为0）
  const allZhuanke = COLLEGES.filter(c => c.tags.includes('zhongzhi') && !c.isUndergraduate && !c.stoppedEnrollment && (c.plan2026Zhongzhi || 0) > 0);
  const zkEl = document.getElementById('zz-zhuanke-list');
  
  function renderZhuankeList(keyword) {
    let list = allZhuanke;
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(kw));
    }
    zkEl.innerHTML = list.map(c => {
      const plan = c.plan2026Zhongzhi || 0;
      return `
      <a href="college-detail.html?id=${c.id}&category=zhongzhi" class="college-card" style="display:block">
        <div class="head">
          <div class="name">${c.name}</div>
        </div>
        <div class="tags">
          <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
          <span class="tag tag-type">${c.city}</span>
          <span class="tag tag-type">${c.type}</span>
          ${c.interview && c.interview.hasInterview ? '<span class="tag" style="background:#fff7e6;color:#ad6800;border:1px solid #ffd591">有面试</span>' : ''}
        </div>
        <div class="meta-row"><span>中职计划 ${plan} 人</span><span style="font-size:12px;color:var(--text-light)">2026年</span></div>
      </a>
    `}).join('');
    
    if (list.length === 0) {
      zkEl.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#999;font-size:14px">未找到相关院校</div>';
    }
  }
  renderZhuankeList('');
  
  // 中职专科搜索
  const zkSearchInput = document.getElementById('zz-zk-search-input');
  const zkClearBtn = document.getElementById('zz-zk-search-clear');
  if (zkSearchInput) {
    zkSearchInput.addEventListener('input', function() {
      renderZhuankeList(this.value.trim());
    });
  }
  if (zkClearBtn) {
    zkClearBtn.addEventListener('click', function() {
      zkSearchInput.value = '';
      renderZhuankeList('');
    });
  }

  // 对口本科：本站名单内招收中职的本科院校 + 全部10所对口本科招生院校
  const benke = COLLEGES.filter(c => c.tags.includes('zhongzhi') && c.isUndergraduate);
  const bkEl = document.getElementById('zz-benke-list');
  
  function renderBenkeList(keyword) {
    let bkList = benke;
    let bkHtml = bkList.map(c => `
      <a href="college-detail.html?id=${c.id}" class="college-card" style="display:block;border:1px solid #d3adf7">
        <div class="head">
          <div class="name">🎓 ${c.name}</div>
          <span class="score" style="color:#722ed1;font-weight:600">${c.city}</span>
        </div>
        <div class="tags">
          <span class="tag tag-public">${c.nature}</span>
          <span class="tag" style="background:#f9f0ff;color:#531dab;border:1px solid #d3adf7">对口本科</span>
        </div>
        <div class="meta-row"><span>${c.scoreComposition || '文化测试+职业技能测试'}</span><span class="score">${c.minScore2024} 分</span></div>
      </a>
    `).join('');
    // 追加BENKE_SCHOOLS中不在本站COLLEGES里的对口本科院校
    if (typeof BENKE_SCHOOLS !== 'undefined') {
      const inListNames = bkList.map(c => c.name);
      let extraSchools = BENKE_SCHOOLS.filter(s => !inListNames.includes(s.name));
      if (keyword) {
        const kw = keyword.toLowerCase();
        extraSchools = extraSchools.filter(s => s.name.toLowerCase().includes(kw));
      }
      bkHtml += extraSchools.map(s => `
        <a href="${s.link}" target="_blank" rel="noopener" class="college-card" style="display:block;border:1px solid #d3adf7">
          <div class="head">
            <div class="name">🎓 ${s.name}</div>
            <span class="score" style="color:#722ed1;font-weight:600">${s.city}</span>
          </div>
          <div class="tags">
            <span class="tag tag-public">${s.nature}</span>
            <span class="tag" style="background:#f9f0ff;color:#531dab;border:1px solid #d3adf7">对口本科</span>
          </div>
          <div class="meta-row"><span style="font-size:12px">${s.note}</span></div>
        </a>
      `).join('');
    }
    bkEl.innerHTML = bkHtml || '<div class="empty" style="padding:30px 20px"><div class="icon">🎓</div><div>暂无对口本科院校信息</div></div>';
  }
  renderBenkeList('');
  
  // 对口本科搜索
  const bkSearchInput = document.getElementById('zz-bk-search-input');
  const bkClearBtn = document.getElementById('zz-bk-search-clear');
  if (bkSearchInput) {
    bkSearchInput.addEventListener('input', function() {
      renderBenkeList(this.value.trim());
    });
  }
  if (bkClearBtn) {
    bkClearBtn.addEventListener('click', function() {
      bkSearchInput.value = '';
      renderBenkeList('');
    });
  }

  // 子标签切换（支持 ?tab=benke 深链）
  const tabs = document.querySelectorAll('#zz-tabs .subtab');
  const panelZhuanke = document.getElementById('panel-zhuanke');
  const panelBenke = document.getElementById('panel-benke');
  function activate(tab) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    panelZhuanke.style.display = tab === 'zhuanke' ? 'block' : 'none';
    panelBenke.style.display = tab === 'benke' ? 'block' : 'none';
  }
  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab)));
  activate(getQuery('tab') === 'benke' ? 'benke' : 'zhuanke');
}

// ========== 高中起点页面 ==========
function renderGaozhong() {
  renderTabbar('college');

  const gc = CATEGORIES.gaozhong;
  document.getElementById('gz-desc').textContent = gc.desc;
  document.getElementById('gz-condition').textContent = gc.condition;
  document.getElementById('gz-subjects').textContent = gc.subjects;
  document.getElementById('gz-rule').textContent = gc.rule;

  // 招收普高生的院校（排除对口本科、停招、招生计划为0）
  let allList = COLLEGES.filter(c => c.tags.includes('gaozhong') && !c.isUndergraduate && !c.stoppedEnrollment && (c.plan2026Gaozhong || 0) > 0);
  const el = document.getElementById('gz-list');
  
  function renderList(keyword) {
    let list = allList;
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(kw));
    }
    el.innerHTML = list.map(c => {
      const plan = c.plan2026Gaozhong || 0;
      return `
      <a href="college-detail.html?id=${c.id}&category=gaozhong" class="college-card" style="display:block">
        <div class="head">
          <div class="name">${c.name}</div>
        </div>
        <div class="tags">
          <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
          <span class="tag tag-type">${c.city}</span>
          <span class="tag tag-type">${c.type}</span>
          ${c.interview && c.interview.hasInterview ? '<span class="tag" style="background:#fff7e6;color:#ad6800;border:1px solid #ffd591">有面试</span>' : ''}
        </div>
        <div class="meta-row"><span>普高计划 ${plan} 人</span><span style="font-size:12px;color:var(--text-light)">2026年</span></div>
      </a>
    `}).join('');
    
    if (list.length === 0) {
      el.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#999;font-size:14px">未找到相关院校</div>';
    }
  }
  
  renderList('');
  
  // 搜索功能
  const searchInput = document.getElementById('gz-search-input');
  const clearBtn = document.getElementById('gz-search-clear');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      renderList(this.value.trim());
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      searchInput.value = '';
      renderList('');
    });
  }
}

// ========== 专项计划页面 ==========
function renderZhuanxiang() {
  renderTabbar('college');

  const zc = CATEGORIES.zhuanxiang;
  document.getElementById('zx-desc').textContent = zc.desc;
  document.getElementById('zx-condition').textContent = zc.condition;
  document.getElementById('zx-subjects').textContent = zc.subjects;
  document.getElementById('zx-rule').textContent = zc.rule;

  let currentSub = 'all';
  let currentKeyword = '';

  function renderList() {
    let list = [];
    let tipText = '';
    let planField = '';
    let planLabel = '';
    let catParam = 'zhuanxiang';

    if (currentSub === 'all') {
      list = COLLEGES.filter(c => c.tags.includes('zhuanxiang') && c.plan2026Zhuanxiang > 0 && !c.stoppedEnrollment);
      tipText = '面向退役士兵、革命老区考生等专项群体，下列院校招收专项计划生。';
      planField = 'plan2026Zhuanxiang';
      planLabel = '专项计划';
      catParam = 'zhuanxiang';
    } else if (currentSub === 'tuiyi') {
      list = COLLEGES.filter(c => c.plan2026RetiredMilitary > 0 && !c.stoppedEnrollment);
      tipText = '下列院校2026年招收退役军人专项计划生，免文化素质测试。';
      planField = 'plan2026RetiredMilitary';
      planLabel = '退役军人';
      catParam = 'zhuanxiang-tuiyi';
    } else if (currentSub === 'laoxiang') {
      list = COLLEGES.filter(c => c.plan2026RevolutionaryArea > 0 && !c.stoppedEnrollment);
      tipText = '下列院校2026年招收革命老区建档立卡专项计划生。';
      planField = 'plan2026RevolutionaryArea';
      planLabel = '革命老区';
      catParam = 'zhuanxiang-laoxiang';
    } else if (currentSub === 'xiangcun') {
      list = COLLEGES.filter(c => c.plan2026RuralDoctor > 0 && !c.stoppedEnrollment);
      tipText = '下列院校2026年招收乡村医生定向培养计划生，签订定向协议。';
      planField = 'plan2026RuralDoctor';
      planLabel = '乡村医生';
      catParam = 'zhuanxiang-xiangcun';
    }
    
    // 搜索过滤
    if (currentKeyword) {
      const kw = currentKeyword.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(kw));
    }

    document.getElementById('zx-tip').textContent = tipText;
    const el = document.getElementById('zx-list');
    el.innerHTML = list.map(c => {
      const plan = c[planField] || 0;
      const hasYinglu = currentSub === 'tuiyi' && c.retiredMilitaryPolicy && c.retiredMilitaryPolicy.indexOf('应录尽录') >= 0;
      const yingluBadge = hasYinglu ? '<span class="tag" style="background:#f6ffed;color:#389e0d;border:1px solid #b7eb8f;font-weight:700">⭐ 应录尽录</span>' : '';
      const yingluNote = hasYinglu ? `<div style="margin-top:6px;padding:6px 10px;background:#f6ffed;border-radius:6px;font-size:12px;color:#389e0d;font-weight:600;line-height:1.4">🎖️ ${c.retiredMilitaryPolicy}</div>` : '';
      return `
      <a href="college-detail.html?id=${c.id}&category=${catParam}" class="college-card" style="display:block">
        <div class="head">
          <div class="name">${c.name}</div>
        </div>
        <div class="tags">
          <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
          <span class="tag tag-type">${c.city}</span>
          <span class="tag tag-type">${c.type}</span>
          ${yingluBadge}
        </div>
        <div class="meta-row"><span>${planLabel} ${plan} 人</span><span style="font-size:12px;color:var(--text-light)">2026年</span></div>
        ${yingluNote}
      </a>
    `}).join('');
    
    if (list.length === 0) {
      el.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#999;font-size:14px">未找到相关院校</div>';
    }
  }

  // 子标签切换
  document.querySelectorAll('.sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sub-tab').forEach(t => {
        t.style.background = '#fff';
        t.style.color = '#666';
        t.style.border = '2px solid #e8e8e8';
      });
      tab.style.background = 'var(--primary)';
      tab.style.color = '#fff';
      tab.style.border = '2px solid var(--primary)';
      currentSub = tab.dataset.sub;
      renderList();
    });
  });
  
  // 搜索功能
  const searchInput = document.getElementById('zx-search-input');
  const clearBtn = document.getElementById('zx-search-clear');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      currentKeyword = this.value.trim();
      renderList();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      searchInput.value = '';
      currentKeyword = '';
      renderList();
    });
  }

  renderList();
}

// 退役军人专项页面
function renderZhuanxiangTuiyi() {
  renderTabbar('college');
  const list = COLLEGES.filter(c => c.plan2026RetiredMilitary > 0 && !c.stoppedEnrollment);
  const el = document.getElementById('zx-list');
  el.innerHTML = list.map(c => {
    const plan = c.plan2026RetiredMilitary || 0;
    const hasYinglu = c.retiredMilitaryPolicy && c.retiredMilitaryPolicy.indexOf('应录尽录') >= 0;
    const yingluBadge = hasYinglu ? '<span class="tag" style="background:#f6ffed;color:#389e0d;border:1px solid #b7eb8f;font-weight:700">⭐ 应录尽录</span>' : '';
    return `
    <a href="college-detail.html?id=${c.id}&category=zhuanxiang-tuiyi" class="college-card" style="display:block">
      <div class="head">
        <div class="name">${c.name}</div>
      </div>
      <div class="tags">
        <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
        <span class="tag tag-type">${c.city}</span>
        <span class="tag tag-type">${c.type}</span>
        ${yingluBadge}
      </div>
      <div class="meta-row"><span>退役军人 ${plan} 人</span><span style="font-size:12px;color:var(--text-light)">2026年</span></div>
    </a>
  `}).join('');
}

// 革命老区建档立卡专项页面
function renderZhuanxiangLaoxiang() {
  renderTabbar('college');
  const list = COLLEGES.filter(c => c.plan2026RevolutionaryArea > 0 && !c.stoppedEnrollment);
  const el = document.getElementById('zx-list');
  el.innerHTML = list.map(c => {
    const plan = c.plan2026RevolutionaryArea || 0;
    return `
    <a href="college-detail.html?id=${c.id}&category=zhuanxiang-laoxiang" class="college-card" style="display:block">
      <div class="head">
        <div class="name">${c.name}</div>
      </div>
      <div class="tags">
        <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
        <span class="tag tag-type">${c.city}</span>
        <span class="tag tag-type">${c.type}</span>
      </div>
      <div class="meta-row"><span>革命老区 ${plan} 人</span><span style="font-size:12px;color:var(--text-light)">2026年</span></div>
    </a>
  `}).join('');
}

// 乡村医生定向培养页面
function renderZhuanxiangXiangcun() {
  renderTabbar('college');
  const list = COLLEGES.filter(c => c.plan2026RuralDoctor > 0 && !c.stoppedEnrollment);
  const el = document.getElementById('zx-list');
  el.innerHTML = list.map(c => {
    const plan = c.plan2026RuralDoctor || 0;
    return `
    <a href="college-detail.html?id=${c.id}&category=zhuanxiang-xiangcun" class="college-card" style="display:block">
      <div class="head">
        <div class="name">${c.name}</div>
      </div>
      <div class="tags">
        <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
        <span class="tag tag-type">${c.city}</span>
        <span class="tag tag-type">${c.type}</span>
      </div>
      <div class="meta-row"><span>乡村医生 ${plan} 人</span><span style="font-size:12px;color:var(--text-light)">2026年</span></div>
    </a>
  `}).join('');
}

/* ============================================================
 * 报考人数排行榜
 * ============================================================ */
const RANKING_DATA = {
  2026: {
    province: { total: '22.7万', note: '实际缴费报名人数（抖音多博主交叉验证，标注官方确认），缺考约1万人；普高约14.8万，中职约8万；较2025年23.4万减少7000人' },
    list: [
      { name: '淮南联合大学', count: 22000, plan: 3785, source: '网络整理（抖音多博主交叉验证）；计划官方公布', ratio: '5.8:1' },
      { name: '安徽城市管理职业学院', count: 20000, plan: 5000, source: '网络整理（抖音多博主交叉验证）', ratio: '4:1' },
      { name: '安徽粮食工程职业学院', count: 20000, plan: 2400, source: '网络整理（抖音，2万多，近9人抢1名额）', ratio: '8.3:1' },
      { name: '安徽财贸职业学院', count: 15000, plan: 3412, source: '网络整理（抖音多博主交叉验证）；计划官方章程', ratio: '4.4:1' },
      { name: '安徽林业职业技术学院', count: 15000, plan: 1485, source: '网络整理（抖音，总报名1.5万+，报录比10:1）', ratio: '10:1' },
      { name: '安徽职业技术大学', count: 14000, plan: 3000, source: '网络整理（抖音，1万+）', ratio: '4.7:1' },
      { name: '安徽电子信息职业技术学院', count: 13000, plan: 1999, source: '网络整理（抖音两账号估算12000-13000）；计划官方章程', ratio: '6.5:1' },
      { name: '安庆职业技术学院', count: 12202, plan: 3150, source: '官方公布（院校官网，报考12202人，到校校考9980余）', ratio: '3.9:1' },
      { name: '安徽工商职业学院', count: 12000, plan: 4300, source: '网络整理（抖音多博主交叉验证）', ratio: '2.8:1' },
      { name: '淮南职业技术学院', count: 12000, plan: 2600, source: '官方公布（院校官网，超1.2万名考生）', ratio: '4.6:1' },
      { name: '安徽中澳科技职业学院', count: 12000, plan: 2700, source: '网络整理（抖音多博主交叉验证）', ratio: '4.4:1' },
      { name: '宣城职业技术学院', count: 11764, plan: 2492, source: '官方公布（院校官网，11764名考生参加校考）', ratio: '4.7:1' },
      { name: '安徽交通职业技术学院', count: 11000, plan: 2632, source: '网络整理（抖音多源1.1万；另有1.6万说法存疑）', ratio: '4.2:1' },
      { name: '安徽国防科技职业学院', count: 11000, plan: 2200, source: '网络整理（抖音，1.1w）；官方未公布', ratio: '5:1' },
      { name: '安徽审计职业学院', count: 11000, plan: 3123, source: '网络整理（抖音，报考约11000，录取3123）', ratio: '3.7:1' },
      { name: '六安职业技术学院', count: 10309, plan: 3000, source: '官方公布（院校官网，10309名考生参加）', ratio: '3.4:1' },
      { name: '安徽国际商务职业学院', count: 10000, plan: 3500, source: '官方公布（院校官网，一万余名考生，创历史新高）', ratio: '2.9:1' },
      { name: '安徽水利水电职业技术学院', count: 10000, plan: 2600, source: '官方公布（省教育厅，近万名考生，创历史新高）', ratio: '3.8:1' },
      { name: '安徽工业职业技术学院', count: 10000, plan: 2100, source: '网络整理（抖音1万+）；官方到校校考8571人', ratio: '4.8:1' },
      { name: '安徽扬子职业技术学院', count: 10000, plan: 4000, source: '官方公布（院校官网/中国网，万余名学子奔赴校园）', ratio: '2.5:1' },
      { name: '宿州职业技术学院', count: 10000, plan: 2760, source: '官方公布（院校党政办，万余名考生）+抖音互证', ratio: '3.6:1' },
      { name: '安徽机电职业技术学院', count: 10000, plan: 3800, source: '网络整理（抖音，1万+；2026年与安徽商贸合并为安徽应用技术职业大学，仍分别招生）', ratio: '2.6:1' },
      { name: '安徽商贸职业技术学院', count: 6000, plan: 2250, source: '网络整理（抖音；2026年与安徽机电合并为安徽应用技术职业大学，仍分别招生）', ratio: '2.7:1' },
      { name: '安徽工业经济职业技术学院', count: 9700, plan: 2650, source: '官方公布（院校官网，9700多名考生）', ratio: '3.7:1' },
      { name: '合肥职业技术学院', count: 8800, plan: 2050, source: '官方公布计划+网络整理人数（官网"数千名"；抖音8800）', ratio: '4.3:1' },
      { name: '安徽体育运动职业技术学院', count: 8000, plan: 1200, source: '官方公布（院校官网，近8000名考生报名，缴费6200余人次）', ratio: '6.7:1' },
      { name: '滁州城市职业学院', count: 8000, plan: 3450, source: '官方公布（院校官网，报名人数超8000人）', ratio: '2.3:1' },
      { name: '黄山职业技术学院', count: 7224, plan: 1525, source: '官方公布（黄山市政府，7224名考生踊跃报考，再创新高）', ratio: '4.7:1' },
      { name: '安徽新闻出版职业技术学院', count: 7000, plan: 1500, source: '网络整理（抖音）；官方通稿未披露具体人数', ratio: '4.7:1' },
      { name: '淮北职业技术学院', count: 6380, plan: null, source: '官方公布（院校官网，6380名考生参加；较2025年10124下降）', ratio: null },
      { name: '马鞍山职业技术学院', count: 5500, plan: 1900, source: '网络整理（抖音）；计划官方章程', ratio: '2.9:1' },
      { name: '芜湖职业技术大学', count: 5000, plan: 2500, source: '网络整理（抖音两源一致，5000+）；计划官方章程', ratio: '2:1' },
      { name: '桐城师范高等专科学校', count: 4508, plan: 1500, source: '官方公布（省教育厅，报名考试人数达4508人次）', ratio: '3:1' },
      { name: '阜阳幼儿师范高等专科学校', count: 4500, plan: 1400, source: '网络整理（抖音，4000-5000+）；计划官方章程', ratio: '3.2:1' },
      { name: '安徽邮电职业技术学院', count: 4000, plan: 755, source: '网络整理（抖音，4000+）；计划官方章程', ratio: '5.3:1' },
      { name: '皖西卫生职业学院', count: 3128, plan: null, source: '官方公布（院校保卫处，3128名学生参考）', ratio: null },
      { name: '安徽中医药高等专科学校', count: 1356, plan: 678, source: '官方公布（按1:2划线推算校考入围约1356人）', ratio: '2:1' }
    ]
  },
  2025: {
    province: { total: '23.4万', note: '全省分类考试+对口招生文化素质测试参考人数（省考试院官方公布）' },
    list: [
      { name: '芜湖职业技术大学', count: 23000, plan: 4026, source: '网络整理（抖音多博主交叉验证，招生四千报两万三）', ratio: '5.7:1' },
      { name: '安徽职业技术大学', count: 20000, plan: 3660, source: '网络整理（抖音多博主交叉验证）', ratio: '5.5:1' },
      { name: '铜陵职业技术学院', count: 20000, plan: 3696, source: '网络整理（抖音）；官方未核实，在校生13500人存疑', ratio: '5.4:1' },
      { name: '安徽城市管理职业学院', count: 17000, plan: 4500, source: '网络整理（抖音，1.7万）；官方计划4500/录取4131', ratio: '3.8:1' },
      { name: '安徽工商职业学院', count: 16000, plan: 4300, source: '网络整理（抖音多博主交叉验证，招生4300报1.6万）', ratio: '3.7:1' },
      { name: '宣城职业技术学院', count: 15000, plan: 2900, source: '网络整理（抖音，招生计划两千九报了一万五）', ratio: '5.2:1' },
      { name: '六安职业技术学院', count: 14203, plan: null, source: '官方公布（院校官网，14203名考生参加）', ratio: null },
      { name: '合肥职业技术学院', count: 14000, plan: 2027, source: '网络整理（抖音，1.4万-1.48万）', ratio: '6.9:1' },
      { name: '安徽中澳科技职业学院', count: 14000, plan: 2700, source: '网络整理（抖音多博主交叉验证）', ratio: '5.2:1' },
      { name: '安徽粮食工程职业学院', count: 13000, plan: 2100, source: '网络整理（抖音，招生2100报1.3万）', ratio: '6.2:1' },
      { name: '安徽财贸职业学院', count: 13000, plan: 3700, source: '网络整理（抖音，招生计划3700报考1w3）', ratio: '3.5:1' },
      { name: '安徽工业经济职业技术学院', count: 12000, plan: 2700, source: '官方公布（院校官网，12000余名考生参加考试）', ratio: '4.4:1' },
      { name: '淮南职业技术学院', count: 12000, plan: null, source: '官方公布（院校官网，全省共计1.2万余名考生参加）', ratio: null },
      { name: '安庆职业技术学院', count: 11914, plan: 3450, source: '官方公布（省教育厅，报考人数创历史新高）', ratio: '3.5:1' },
      { name: '淮北职业技术学院', count: 10124, plan: 3200, source: '官方公布（院校官网，10124名考生参加，计划3200人）', ratio: '3.2:1' },
      { name: '淮南联合大学', count: 10000, plan: 3200, source: '官方公布（院校官网，10000余名考生）', ratio: '3.1:1' },
      { name: '安徽扬子职业技术学院', count: 10000, plan: 3000, source: '官方公布（省教育厅/院校官网，近万名考生踏进扬子校园）', ratio: '3.3:1' },
      { name: '马鞍山职业技术学院', count: 10000, plan: 1800, source: '网络整理（抖音，招生计划1800人报了1万人）', ratio: '5.6:1' },
      { name: '安徽工贸职业技术学院', count: 9717, plan: 3000, source: '官方公布（省教育厅，9717名考生选择校考，实际参加9483人）', ratio: '3.2:1' },
      { name: '安徽交通职业技术学院', count: 8000, plan: 2632, source: '官方公布（院校官网，来自全省近8000余名考生；录取2632人）', ratio: '3:1' },
      { name: '安徽汽车职业技术学院', count: 8000, plan: 1800, source: '网络整理（抖音，25年招生计划1800报了8000多）', ratio: '4.4:1' },
      { name: '徽商职业学院', count: 8000, plan: null, source: '官方公布（院校官网，来自全省八千余名考生齐聚徽院）', ratio: null },
      { name: '亳州职业技术学院', count: 7000, plan: 1764, source: '官方公布（院校官网，来自各地的7000余名学子）', ratio: '4:1' },
      { name: '安徽林业职业技术学院', count: 7000, plan: 2000, source: '官方公布（省教育厅，近7000人）', ratio: '3.5:1' },
      { name: '滁州城市职业学院', count: 6900, plan: null, source: '官方公布（院校官网，六千九百余名/七千余名考生）', ratio: null },
      { name: '安徽审计职业学院', count: 6500, plan: 2300, source: '官方公布（省教育厅，6500余人）', ratio: '2.8:1' },
      { name: '安徽新闻出版职业技术学院', count: 5000, plan: null, source: '官方公布（院校官网，5000余名考生参加34个专业招生考试）', ratio: null },
      { name: '黄山职业技术学院', count: 4551, plan: 1829, source: '官方公布（院校官网，4551名考生参加，计划1829人）', ratio: '2.5:1' },
      { name: '安徽机电职业技术学院', count: 4100, plan: 1530, source: '网络整理（抖音，招生1530报了4100；2025年尚未合并）', ratio: '2.7:1' },
      { name: '安徽商贸职业技术学院', count: 5000, plan: 2000, source: '网络整理（参考2026年6000人估算，2025年未找到确切数据；2025年尚未合并）', ratio: '2.5:1' },
      { name: '安徽警官职业学院', count: 4000, plan: 2000, source: '网络整理（抖音，计划2000人报考4000人；另一源称不到3000，存疑）', ratio: '2:1' },
      { name: '皖西卫生职业学院', count: 3967, plan: null, source: '官方公布（院校保卫处，3967名考生参加）', ratio: null },
      { name: '安徽体育运动职业技术学院', count: 3800, plan: null, source: '官方公布（院校官网，3800名考生顺利完成考试）', ratio: null },
      { name: '桐城师范高等专科学校', count: 3092, plan: 1580, source: '官方公布（院校官网，报名考试人数达3092人，创历史新高）', ratio: '2:1' },
      { name: '安徽冶金科技职业学院', count: 3038, plan: 720, source: '官方公布（院校官网，3038名考生参加，计划录取720人）', ratio: '4.2:1' },
      { name: '安徽中医药高等专科学校', count: 2400, plan: 1306, source: '网络整理（抖音，招生1306报了2400）；官方校考入围约1604人', ratio: '1.8:1' },
      { name: '安徽黄梅戏艺术职业学院', count: 800, plan: null, source: '官方公布（院校官网，近800名考生齐聚考场，为到校校考人数）', ratio: null }
    ]
  }
};

function renderRanking() {
  renderTabbar('college');
  let currentYear = '2026';

  function render() {
    const data = RANKING_DATA[currentYear];
    // 全省概览
    document.getElementById('province-overview').innerHTML = `
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:12px;padding:16px;text-align:center">
        <div style="font-size:13px;opacity:0.9">${currentYear}年安徽单招全省报名人数</div>
        <div style="font-size:32px;font-weight:800;margin:8px 0">${data.province.total}</div>
        <div style="font-size:11px;opacity:0.8">${data.province.note}</div>
      </div>
    `;
    // 排行榜
    const list = data.list.sort((a, b) => b.count - a.count);
    document.getElementById('ranking-list').innerHTML = list.map((item, idx) => {
      const rankBadge = idx < 3 
        ? `<div style="width:32px;height:32px;border-radius:50%;background:${idx===0?'#ffd700':idx===1?'#c0c0c0':'#cd7f32'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0">${idx+1}</div>`
        : `<div style="width:32px;height:32px;border-radius:50%;background:#f0f0f0;color:#666;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0">${idx+1}</div>`;
      const barWidth = Math.min(100, (item.count / list[0].count) * 100);
      const isOfficial = item.source.indexOf('官方') >= 0;
      return `
      <div style="margin:0 12px 8px;background:#fff;border-radius:12px;padding:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
        <div style="display:flex;align-items:center;gap:10px">
          ${rankBadge}
          <div style="flex:1;min-width:0">
            <div style="font-size:15px;font-weight:700;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</div>
            <div style="font-size:11px;color:${isOfficial?'#389e0d':'#fa8c16'};margin-top:2px">${isOfficial?'✅ ':'📱 '}${item.source}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:20px;font-weight:800;color:var(--primary)">${item.count >= 10000 ? (item.count/10000).toFixed(1)+'万' : item.count.toLocaleString()}</div>
            <div style="font-size:10px;color:#999">报录比 ${item.ratio}</div>
          </div>
        </div>
        <div style="margin-top:8px;height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden">
          <div style="width:${barWidth}%;height:100%;background:linear-gradient(90deg,#667eea,#764ba2);border-radius:3px"></div>
        </div>
        <div style="font-size:11px;color:#999;margin-top:4px">招生计划 ${item.plan} 人</div>
      </div>`;
    }).join('');
  }

  // 年份切换
  document.querySelectorAll('.year-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.year-tab').forEach(t => {
        t.style.background = '#fff';
        t.style.color = '#666';
        t.style.border = '2px solid #e8e8e8';
      });
      tab.style.background = 'var(--primary)';
      tab.style.color = '#fff';
      tab.style.border = '2px solid var(--primary)';
      currentYear = tab.dataset.year;
      render();
    });
  });

  render();
}

/* ============================================================
 * 11. 院校对比页
 * ============================================================ */
/* 把 score2026 那段"说明性长文"压成一个能在手机上看的短结论。
 * 该字段全站 74 所都是段落（无一是纯数字），直接塞进表格会让一行高到 1000px 以上。
 * 返回值: { text: 主显示, tag: 来源标签, full: 原文(用于 title 提示) }
 */
function compactScore2026(c) {
  const raw = String(c.score2026 || '').trim();
  if (!raw) return { text: '待公布', tag: '', full: '' };
  // 来源标签
  let tag = '';
  const tagMatch = raw.match(/^【([^】]+)】/);
  if (tagMatch) {
    const t = tagMatch[1];
    tag = /未公布|待核|估算/.test(t) ? '未公布' : t.slice(0, 8);
  }
  // 优先取"校考合格线"这类明确数值
  const xiao = raw.match(/校考合格线[^。；]*?(\d{2,3})\s*分/);
  if (xiao) return { text: xiao[1] + ' 分', tag: '校考线', full: raw };
  // 其次任意"普高/中职…N分"
  const any = raw.match(/(?:普高|中职|职业适应性|职业技能)[^。；0-9]{0,10}?(\d{2,3})\s*分/);
  if (any) return { text: any[1] + ' 分', tag: tag || '参考', full: raw };
  // 没有数字就只给短标签，绝不放长文
  return { text: tag || '未公布', tag: '', full: raw };
}

/* 对比页表头用的短校名：去掉办学层次后缀，保证在手机窄列里能一行放下。
 * 完整校名放在 title 里，点进去仍是完整名称。 */
function shortCollegeName(name) {
  const s = String(name || '');
  const short = s
    .replace(/职业技术学院$/, '')
    .replace(/职业学院$/, '')
    .replace(/高等专科学校$/, '')
    .replace(/职业技术大学$/, '')
    .replace(/职业大学$/, '');
  // 太短会歧义（如"安徽"），短于 3 字就不缩
  return short.length >= 3 ? short : s;
}

function renderCompare() {
  renderTabbar('college');
  const body = document.getElementById('compare-body');

  // 读取对比列表：优先 URL ?ids=1,2,3，否则 localStorage
  let ids = [];
  const q = getQuery('ids');
  if (q) ids = q.split(',').map(x => Number(x.trim())).filter(Boolean);
  else ids = getCompareList();

  const list = ids.map(id => getCollegeById(id)).filter(Boolean);

  if (list.length === 0) {
    body.innerHTML = `
      <div class="empty"><div class="icon">⚖️</div><div>暂未选择对比院校</div></div>
      <a href="college-list.html" class="btn-primary">去院校列表选择 ›</a>`;
    return;
  }

  function row(label, fn) {
    return `<tr><td class="dim">${label}</td>` + list.map(c => `<td>${fn(c)}</td>`).join('') + '</tr>';
  }
  // 长文本单元格：单行截断，完整内容放 title 提示，避免把行撑高
  function clip(text, max = 14) {
    const s = String(text === undefined || text === null || text === '' ? '—' : text);
    const short = s.length > max ? s.slice(0, max) + '…' : s;
    return `<span class="cmp-clip" title="${s.replace(/"/g, '&quot;')}">${short}</span>`;
  }

  const scoreCell = (c) => {
    const s = compactScore2026(c);
    const tag = s.tag ? `<span class="cmp-tag">${s.tag}</span>` : '';
    return `<span class="cmp-scorebox" title="${s.full.replace(/"/g, '&quot;')}"><span class="cmp-score">${s.text}</span>${tag}</span>`;
  };

  body.innerHTML = `
    <div class="cmp-hint">已选 ${list.length}/4 所 · 表格可上下滑动，未公布项显示标签</div>
    <div class="table-wrap cmp-wrap">
      <table class="compare-table cmp-compact">
        <thead><tr><th class="dim">对比项</th>${list.map(c => `
          <th>
            <a href="college-detail.html?id=${c.id}" class="cmp-name" title="${c.name}">${shortCollegeName(c.name)}</a>
            <span class="cmp-remove" data-id="${c.id}" title="移除 ${c.name}">✕</span>
          </th>`).join('')}</tr></thead>
        <tbody>
          ${row('城市', c => c.city)}
          ${row('性质', c => c.nature)}
          ${row('类型', c => c.type)}
          ${row('2026分数', scoreCell)}
          ${row('2025最低', c => c.scores['2025'] ? c.scores['2025'].min : '—')}
          ${row('2024最低', c => c.scores['2024'] ? c.scores['2024'].min : '—')}
          ${row('2023最低', c => c.scores['2023'] ? c.scores['2023'].min : '—')}
          ${row('校考占比', c => clip(c.examRatio, 12))}
          ${row('面试', c => (c.interview && c.interview.hasInterview) ? '有' : '无')}
          ${row('录取规则', c => clip(c.admissionRule2026 || '参考2025', 12))}
          ${row('2026计划', c => clip(c.plan2026 || '待公布', 12))}
          <tr class="cmp-more-toggle" id="cmp-more-btn">
            <td class="dim">更多</td>
            <td colspan="${list.length}" class="cmp-more-cell">联系电话 / 规模 / 就业率 / 专升本率 ▾</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="table-wrap cmp-wrap" id="cmp-more" style="display:none">
      <table class="compare-table cmp-compact">
        <tbody>
          ${row('招生办电话', c => clip(c.phone, 14))}
          ${row('在校生规模', c => clip(c.scale, 8))}
          ${row('就业率', c => c.employmentRate || '—')}
          ${row('专升本率', c => c.upgradeRate || '—')}
        </tbody>
      </table>
    </div>`;

  const moreBtn = document.getElementById('cmp-more-btn');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      const el = document.getElementById('cmp-more');
      const open = el.style.display !== 'none';
      el.style.display = open ? 'none' : 'block';
      moreBtn.querySelector('.cmp-more-cell').textContent =
        (open ? '联系电话 / 规模 / 就业率 / 专升本率 ▾' : '收起 ▴');
    });
  }

  body.querySelectorAll('.cmp-remove').forEach(el => {
    el.addEventListener('click', () => {
      removeFromCompare(el.dataset.id);
      renderCompare();
    });
  });
}

/* ============================================================
 * 12. 我的收藏页
 * ============================================================ */
function renderFavorites() {
  renderTabbar('me');
  const body = document.getElementById('fav-body');
  const favs = getFavs();
  const list = favs.map(id => getCollegeById(id)).filter(Boolean);

  if (list.length === 0) {
    body.innerHTML = `
      <div class="empty"><div class="icon">⭐</div><div>还没有收藏院校</div></div>
      <a href="college-list.html" class="btn-primary">去院校列表逛逛 ›</a>`;
    return;
  }

  body.innerHTML = list.map(c => `
    <div class="college-card" style="position:relative">
      <div class="head">
        <div class="name">${c.name}</div>
        <span class="score" style="color:var(--danger);font-weight:600">${c.minScore2024} 分</span>
      </div>
      <div class="tags">
        <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
        <span class="tag tag-type">${c.city}</span>
        <span class="tag tag-type">${c.type}</span>
      </div>
      <div class="meta-row">
        <a href="college-detail.html?id=${c.id}" style="color:var(--primary)">查看详情 ›</a>
        <span class="fav-remove" data-id="${c.id}" style="color:#ff4d4f;font-size:13px">✕ 取消收藏</span>
      </div>
    </div>
  `).join('');

  body.querySelectorAll('.fav-remove').forEach(el => {
    el.addEventListener('click', () => {
      localStorage.setItem('anhui_danzhao_favs', JSON.stringify(getFavs().filter(x => Number(x) !== Number(el.dataset.id))));
      renderFavorites();
      toast('已取消收藏');
    });
  });
}

/* ============================================================
 * 13. 报考指南页（内容为静态HTML，此处仅渲染导航/页脚）
 * ============================================================ */
function renderGuide() {
  renderTabbar('me');
}

/* ============================================================
 * 14. 常见问题页
 * ============================================================ */
const FAQ_LIST = [
  { q: '高职单招（分类考试）和普通高考有什么区别？', a: '单招由安徽省统一文化测试 + 院校职业适应性/技能测试组成，考试时间早于高考；被单招录取后不再参加普通高考，入学后与高考录取学生待遇完全相同（同一专业、同一毕业证、同一学费）。' },
  { q: '可以同时报几所院校？', a: '填报志愿时可选报多所院校，但最终只能被一所院校录取。建议结合分数与意向梯度填报。' },
  { q: '文化素质测试考什么？难吗？', a: '文化素质测试面向高中/中职毕业生，考查语文、数学、英语基础，难度低于普通高考；安徽省2024-2025年文化素质合格线为82分。' },
  { q: '职业适应性测试 / 职业技能测试考什么？', a: '面向高中毕业生为"职业适应性测试"，面向中职毕业生为"职业技能测试"，由招生院校按专业类别自行组织，内容与报考专业相关，具体以院校最新招生章程为准。' },
  { q: '录取规则里的"分数优先"和"专业志愿优先"有什么不同？', a: '"分数优先（分数清）"按考生总分从高到低排序，依次满足专业志愿；"专业志愿优先（专业清）"先按第一专业志愿分组，组内按分数录取，第一志愿录不满才看后续志愿。安徽单招以这两种为主，各校不同。' },
  { q: '被单招录取后还能专升本吗？', a: '可以。单招录取的专科生在大三可参加安徽省普通专升本考试，本站已为每所院校标注预估专升本率，供参考。' },
  { q: '中职生可以报普通高考的专科专业吗？', a: '可以。中职起点含"中职专科"通道（高职分类考试），也有"对口本科"通道（应用型本科对口招生），两条通道可按需选择。' },
  { q: '对口本科和普通本科一样吗？', a: '对口本科面向中职毕业生招生，录取后进入应用型本科院校全日制学习，毕业颁发全日制本科毕业证书，与普通本科文凭效力相同。' },
  { q: '退役军人、脱贫家庭考生有什么政策？', a: '可报考"专项计划"，单独划线、单独排队录取，不占用普通计划名额，具体资格条件以安徽省教育招生考试院公布为准。' },
  { q: '本站的分数线是官方公布的吗？', a: '本站分数线为2026年录取参考数据（供2027考生参考），部分为基于院校类型、城市及公办/民办性质的估算值并已标注，实际录取分以安徽省教育招生考试院及院校官方公布为准。' },
  { q: '单招没被录取怎么办？', a: '单招未录取不影响后续普通高考，考生可继续参加6月普通高考及志愿填报。' },
  { q: '在哪里报名？什么时候报名？', a: '高考报名网站为 gkbm.ahzsks.cn，2027年高考报名时间为2026年10月17日10:00至21日17:00（官方已公布）。单招报名预计2027年1月下旬，文化测试预计2027年3月上旬，具体以安徽省教育招生考试院最新通知为准。' },
  { q: '民办院校和公办院校文凭一样吗？', a: '文凭均为国家承认的全日制学历，区别主要在学费（民办较高）与办学性质，毕业证效力相同。' },
  { q: '如何选择适合自己的院校？', a: '建议综合参考：历年分数线（用本站分数走势）、就业/专升本率、校考占比、有无面试、所在城市与专业，并用"分数推荐"按冲/稳/保梯度搭配。' }
];

function renderFaq() {
  renderTabbar('me');
  const body = document.getElementById('faq-body');
  body.innerHTML = FAQ_LIST.map((f, i) => `
    <div class="faq-item">
      <div class="faq-q" data-i="${i}">
        <span>${i + 1}. ${f.q}</span>
        <span class="faq-arrow">▸</span>
      </div>
      <div class="faq-a">${f.a}</div>
    </div>
  `).join('');

  body.querySelectorAll('.faq-q').forEach(el => {
    el.addEventListener('click', () => {
      const item = el.parentElement;
      item.classList.toggle('open');
    });
  });
}

/* ============================================================
 * 15. 分数推荐页（冲/稳/保）
 * ============================================================ */
function predLine(c) {
  return parseFloat(c.score2026) || (c.scores['2025'] ? c.scores['2025'].min : c.minScore2024);
}

function renderRecommend() {
  renderTabbar('index');
  const body = document.getElementById('rec-body');
  const btn = document.getElementById('rec-btn');
  const input = document.getElementById('rec-score');

  function run() {
    const s = Number(input.value);
    if (!s || s < 0) { toast('请输入有效分数'); return; }

    const chong = [], wen = [], bao = [];
    COLLEGES.forEach(c => {
      const line = predLine(c);
      const diff = line - s; // 正：院校线高于考生分
      if (diff >= 5 && diff <= 15) chong.push({ c, diff });
      else if (Math.abs(diff) <= 5) wen.push({ c, diff });
      else if (diff <= -5 && diff >= -15) bao.push({ c, diff });
    });

    function card(item, tone) {
      const { c, diff } = item;
      return `
      <a href="college-detail.html?id=${c.id}" class="college-card" style="display:block">
        <div class="head">
          <div class="name">${c.name}</div>
          <span class="score" style="color:${tone.color};font-weight:600">${c.score2026}</span>
        </div>
        <div class="tags">
          <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
          <span class="tag tag-type">${c.city}</span>
        </div>
        <div class="meta-row"><span>${tone.label}（线差 ${Math.abs(diff)} 分）</span></div>
      </a>`;
    }

    body.innerHTML = `
      <div class="rec-group"><div class="rec-title" style="color:#ff4d4f">🔥 冲一冲（${chong.length}）</div>
        ${chong.length ? chong.map(x => card(x, { color:'#ff4d4f', label:'冲刺' })).join('') : '<div class="note">本档暂无匹配院校</div>'}</div>
      <div class="rec-group"><div class="rec-title" style="color:#1677ff">🎯 稳一稳（${wen.length}）</div>
        ${wen.length ? wen.map(x => card(x, { color:'#1677ff', label:'稳妥' })).join('') : '<div class="note">本档暂无匹配院校</div>'}</div>
      <div class="rec-group"><div class="rec-title" style="color:#52c41a">🛡️ 保一保（${bao.length}）</div>
        ${bao.length ? bao.map(x => card(x, { color:'#52c41a', label:'保底' })).join('') : '<div class="note">本档暂无匹配院校</div>'}</div>
      <div class="note" style="text-align:center">分数为2026预测（估算），梯度区间为±5/5-15分，仅供参考</div>`;
  }

  btn.addEventListener('click', run);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
}
