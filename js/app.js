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

/* ========== ECharts 按需加载 ==========
 * 为什么不在 <head> 里同步引入：echarts.min.js 有 1.03MB（gzip 约 338KB），
 * 而全站只有「院校详情页的分数走势图」和「分数走势页」两个地方真正需要它。
 * 原先 college-detail.html 在 <head> 第 8 行从 unpkg CDN 同步加载，
 * 结果①阻塞整页渲染 ②每次打开都要多一次跨域请求（DNS+TLS+下载）③CDN 在国内不稳。
 * 现在改为：先把页面渲染出来，等真要画图时再加载本地 js/echarts.min.js，
 * 并且同一个页面的多次请求会复用同一个 Promise（不会重复下载）。
 */
let _echartsLoading = null;
function withECharts(cb) {
  if (typeof echarts !== 'undefined') { cb(echarts); return; }
  if (!_echartsLoading) {
    _echartsLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      // 用相对路径，兼容 GitHub Pages 子目录部署
      s.src = 'js/echarts.min.js';
      s.async = true;
      s.onload = () => (typeof echarts !== 'undefined' ? resolve(echarts) : reject(new Error('echarts 已加载但未挂载到全局')));
      s.onerror = () => reject(new Error('echarts 加载失败'));
      document.head.appendChild(s);
    }).catch((err) => {
      _echartsLoading = null;   // 失败后允许重试
      throw err;
    });
  }
  _echartsLoading.then(cb).catch((err) => {
    console.warn('[echarts] ' + err.message);
    const tip = document.createElement('div');
    tip.style.cssText = 'padding:24px 12px;text-align:center;color:#999;font-size:13px';
    tip.textContent = '图表组件加载失败，请检查网络后刷新重试';
    const host = document.querySelector('.chart-box') || document.getElementById('score-chart') || document.getElementById('trend-score');
    if (host) { host.innerHTML = ''; host.appendChild(tip); }
  });
}

// 分数年份标签：只认 2026 官方最低分；没有就如实显示「分数待查证」。
// 说明：2026-10 起剔除了早期估算生成的 minScore2024/minScore2025（与官方分全面冲突），
// 所以这里不再回退到那两个字段——查不到就如实说「待查证」，不猜。
function scoreLabel(c) {
  if (c.minScore2026 != null) return '2026最低 ' + c.minScore2026 + ' 分';
  return '分数待查证';
}

// ========== 底部 Tab 导航渲染 ==========
// 2026 视觉改版：Emoji 图标统一更换为 24px 线性 SVG（stroke 1.8 / currentColor），
// 与 css/style.css 的 .tabbar-item .icon 尺寸规则配套
const TAB_ITEMS = [
  { key: 'index', name: '首页', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.8V20h13V9.8"/><path d="M9.8 20v-5.5h4.4V20"/></svg>', href: 'index.html' },
  { key: 'college', name: '院校', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 3 9h18z"/><path d="M5 9v9M9.3 9v9M14.7 9v9M19 9v9"/><path d="M3.5 18h17M4 21h16"/></svg>', href: 'college-list.html' },
  { key: 'major', name: '专业', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2z"/><path d="M12 6.5v14"/></svg>', href: 'major-search.html' },
  { key: 'me', name: '我的', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 20.5v-1.8a4.2 4.2 0 0 0-4.2-4.2H8.7a4.2 4.2 0 0 0-4.2 4.2v1.8"/><circle cx="12" cy="7.2" r="4"/></svg>', href: 'about.html' }
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
/* 返回键兜底：从微信分享/扫码/新标签直接打开时没有可回退的历史，
 * 单纯 history.back() 会「点了没反应」。这里没历史就回首页，保证一定有反馈。 */
function backOrHome() {
  if (window.history && window.history.length > 1) {
    window.history.back();
    return;
  }
  location.href = 'index.html';
}
window.backOrHome = backOrHome;

function renderNavbar(title, showBack = true) {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  nav.innerHTML = `
    ${showBack ? '<button class="back-btn" onclick="backOrHome()">‹</button>' : ''}
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
    'campus': renderCampus,
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
    'timeline': renderTimeline,
    'about': renderAbout
  };

  if (handlers[page]) handlers[page]();
  applyPrepStatus();
  renderFooter();
});

/* ============================================================
 * 高考报名状态 · 按当前时间自动判断
 *
 * 报名窗口是省考试院公布的固定时段：
 *   2026-10-17 10:00 ~ 2026-10-21 17:00
 *   （安徽省教育厅 2026-10-14《金寨县启动2027年普通高考报名工作》
 *     「我省2027年普通高考网上报名时段为2026年10月17日10:00至10月21日17:00」）
 *
 * 本站是纯静态站，如果把「报名进行中」写死进 HTML，10月21日一过就变成错信息。
 * 所以状态一律由这里按浏览器时间算，自动在
 *   即将开始 → 报名进行中（剩 N 天/小时） → 报名已截止
 * 之间切换；页面只留空容器和 data-* 标记，不再手写状态文字。
 * ============================================================ */
const PREP_REG_START = Date.parse('2026-10-17T10:00:00+08:00');
const PREP_REG_END = Date.parse('2026-10-21T17:00:00+08:00');

function prepRegState(now) {
  const t = now == null ? Date.now() : now;
  // 天数用 floor（向下取整）：10月18日距 21 日 17:00 截止是「3 天多」，
  // 写成 ceil 会显示「剩余 4 天」，比实际多算一天，容易让考生误判。
  if (t < PREP_REG_START) {
    const days = Math.floor((PREP_REG_START - t) / 86400000);
    const hours = Math.max(1, Math.ceil((PREP_REG_START - t) / 3600000));
    return { key: 'before', label: '即将开始', hint: days >= 1 ? `距开始 ${days} 天` : `距开始 ${hours} 小时` };
  }
  if (t <= PREP_REG_END) {
    const ms = PREP_REG_END - t;
    const days = Math.floor(ms / 86400000);
    const hours = Math.max(1, Math.ceil(ms / 3600000));
    return { key: 'open', label: '报名进行中', hint: days >= 1 ? `剩余 ${days} 天` : `剩余 ${hours} 小时` };
  }
  return { key: 'closed', label: '报名已截止', hint: '已结束' };
}

function applyPrepStatus() {
  const st = prepRegState();
  document.querySelectorAll('[data-prep-badge]').forEach((el) => {
    el.textContent = st.key === 'open' ? '高考报名进行中' : (st.key === 'before' ? '备考已启动' : '高考报名已截止');
    el.classList.toggle('is-live', st.key === 'open');
    el.classList.toggle('is-closed', st.key === 'closed');
  });
  document.querySelectorAll('[data-prep-reg-flag]').forEach((el) => {
    el.textContent = st.label;
    el.classList.toggle('is-live', st.key === 'open');
    el.classList.toggle('is-closed', st.key === 'closed');
  });
  document.querySelectorAll('[data-prep-reg-hint]').forEach((el) => {
    el.textContent = st.hint;
  });
}

// ========== 首页备考时间轴折叠 ==========
function initPrepCollapse() {
  const tl = document.querySelector('.prep-timeline');
  const btn = document.getElementById('prep-toggle');
  if (!tl || !btn) return;

  // 幂等保护：renderIndex() 与 DOMContentLoaded 都会调用本函数，
  // 若重复绑定，一次点击会触发两次 setState（展开又立刻收起），
  // 表现就是「点了没反应」——手机端尤其容易踩到。
  if (btn.dataset.collapseBound === '1') return;
  btn.dataset.collapseBound = '1';

  const extra = tl.querySelectorAll('.prep-item.is-extra').length;
  const label = btn.querySelector('.prep-toggle-text');
  const KEY = 'anhui_danzhao_prep_open';

  const setState = (open) => {
    tl.classList.toggle('prep-collapsed', !open);
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    label.textContent = open ? '收起时间轴' : `展开后续 ${extra} 个节点`;
    try { localStorage.setItem(KEY, open ? '1' : '0'); } catch { }
  };

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { }
  setState(saved === '1');

  btn.addEventListener('click', () => {
    setState(tl.classList.contains('prep-collapsed'));
  });
}

// ========== 备考时间轴收纳页 ==========
function renderTimeline() {
  renderTabbar('');
}

// ========== 全站页脚：快捷导航 + 非盈利标识 + 署名水印 ==========
function renderFooter() {
  const page = document.querySelector('.page');
  if (!page || document.querySelector('.site-footer')) return;

  // 页脚快捷导航（收藏/对比/指南/推荐/常见问题）
  const nav = document.createElement('div');
  nav.className = 'foot-nav';
  nav.innerHTML = `
    <a href="favorites.html">收藏</a>
    <a href="compare.html">对比</a>
    <a href="guide.html">指南</a>
    <a href="recommend.html">分数推荐</a>
    <a href="low-score.html">低分上公办</a>
    <a href="faq.html">常见问题</a>`;

  // 非盈利 / 永久免费 标识（全站每页可见）
  const free = document.createElement('div');
  free.className = 'free-flag';
  free.textContent = '本站为非盈利性质 · 永久免费';

  // 署名水印
  const foot = document.createElement('div');
  foot.className = 'site-footer';
  foot.textContent = '抖音@星焉 整理制作';

  const bar = document.querySelector('.tabbar');
  if (bar) { page.insertBefore(nav, bar); page.insertBefore(free, bar); page.insertBefore(foot, bar); }
  else { page.appendChild(nav); page.appendChild(free); page.appendChild(foot); }
}

/* ============================================================
 * 1. 首页
 * ============================================================ */
function renderIndex() {
  renderTabbar('index');

  // 备考时间轴折叠（默认收起后续节点，展开状态本地记忆）
  initPrepCollapse();

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
      <div class="banner-watermark">抖音@星焉</div>
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
        <div class="desc">${c.desc}</div>
      </a>`;
    }).join('');
  }

  // 热门院校（横向滚动）
  const hotEl = document.getElementById('hot-colleges');
  if (hotEl) {
    const hot = COLLEGES.filter(c => c.hot && !c.stoppedEnrollment).slice(0, 6);
    hotEl.innerHTML = hot.map(c => `
      <a href="college-detail.html?id=${c.id}" class="college-chip">
        <div class="chip-top">
          <span class="chip-avatar">${c.name.charAt(0)}</span>
          <div class="chip-body">
            <div class="name">${c.name}${c.stoppedEnrollment ? ' <span style="font-size:10px;background:#ff4d4f;color:#fff;padding:1px 5px;border-radius:8px">停招</span>' : ''}</div>
            <div class="meta">${c.city} · ${c.nature}</div>
          </div>
        </div>
        <div class="score">查看取分规则 ›</div>
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
let listState = { filtered: [], page: 1, pageSize: 20, loading: false };

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
    // 匹配【校名】【城市】+【专业名】，但专业名要先剥掉「（高职专业学院…）」这段。
    //
    // 原因：数据里有 23 条「高职专业学院」专业（高职与中职联办），专业名格式为
    //   「航海技术（高职专业学院·铜陵理工学校）」        ← 安徽交通职业技术学院（合肥）
    //   「大数据与会计（高职专业学院·铜陵理工学校）」    ← 安徽审计职业学院（合肥）
    // 括号里是**联办中职校**的名字。学生搜「铜陵」本意是找铜陵的学校，
    // 却会把这两所合肥的学校搜出来，真正在铜陵的安徽工业职业技术学院反被淹没 —— 明显误命中。
    // 因此匹配专业名时只取「（」之前的专业本体：
    //   · 搜「铜陵」→ 不再命中安徽交通/安徽审计，正常返回 铜陵学院/铜陵职业技术学院/安徽工业职业技术学院
    //   · 搜「审计」→ 仍能命中安徽审计职业学院（校名）与开设大数据与审计的学校（专业本体）
    //   · 搜「电子商务」→ 仍能命中开设该专业的学校（含上述联办专业）
    // 若确实想按联办中职校名找，用「专业」页或直接搜高职校名。
    const majorBase = (name) => {
      const s = String(name || '');
      const i = s.indexOf('（高职专业学院');
      const j = s.indexOf('(高职专业学院');
      const cut = [i, j].filter((x) => x >= 0);
      return cut.length ? s.slice(0, Math.min(...cut)) : s;
    };
    list = list.filter(c =>
      c.name.includes(kw) ||
      (c.city || '').includes(kw) ||
      (c.majors || []).some(m => majorBase(m.name).includes(kw)) ||
      // 院校列表页用的是 js/data-list.js（不含完整 majors），
      // 它带一个紧凑的 majorNames 字段（专业名去重后空格连接，已剥掉「高职专业学院」后缀），
      // 这里做回落，保证瘦身数据下「按专业搜学校」能力不变。
      String(c.majorNames || '').includes(kw)
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
      planText = `普高招 ${c.plan2026Gaozhong} 人`;
    } else if (curCat === 'zhongzhi' && c.plan2026Zhongzhi) {
      planText = `中职招 ${c.plan2026Zhongzhi} 人`;
    } else if (curCat === 'zhuanxiang' && c.plan2026Zhuanxiang) {
      planText = `专项招 ${c.plan2026Zhuanxiang} 人`;
    } else if (c.plan2026) {
      // 提取总计划数
      const totalMatch = String(c.plan2026).match(/(\d+)\s*人/);
      planText = totalMatch ? `招 ${totalMatch[1]} 人` : `招 ${c.planCount2024} 人`;
    } else {
      planText = `招 ${c.planCount2024} 人`;
    }
    return `
    <a href="college-detail.html?id=${c.id}" class="college-card">
      <div class="head">
        <div class="name">${c.name}</div>
      </div>
      <div class="tags">
        <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
        <span class="tag tag-type">${c.type}</span>
        ${c.isUndergraduate
          ? '<span class="tag" style="color:#722ed1">🏫 对口本科</span>'
          : (c._track === 'fenlei' ? '<span class="tag" style="color:#1677ff">📝 分类考试</span>' : '')}
        ${c.stoppedEnrollment ? '<span class="tag" style="color:#ff4d4f">⚠️ 已停招</span>' : ''}
        ${c.interview && c.interview.hasInterview ? '<span class="tag" style="color:#ad6800">有面试</span>' : ''}
        ${c.hot ? '<span class="tag tag-hot">热门</span>' : ''}
      </div>
      <div class="meta-row">
        <span>${c.city} · ${planText}${c._track === 'fenlei' ? '（高职专科）' : (c.isUndergraduate ? '（对口本科）' : '')}</span>
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
    <div class="name">${c.name}${c.isUndergraduate ? ' <span style="font-size:12px;background:#722ed1;color:#fff;padding:2px 8px;border-radius:10px;margin-left:6px">🏫 对口本科</span>' : (c._track === 'fenlei' ? ' <span style="font-size:12px;background:#1677ff;color:#fff;padding:2px 8px;border-radius:10px;margin-left:6px">📝 分类考试</span>' : '')}${c.stoppedEnrollment ? ' <span style="font-size:12px;background:#ff4d4f;color:#fff;padding:2px 8px;border-radius:10px;margin-left:6px">⚠️ 2026年已停招</span>' : ''}${(c.secondCutoff && c.secondCutoff.enabled) ? ' <span style="font-size:12px;background:#faad14;color:#fff;padding:2px 8px;border-radius:10px;margin-left:6px">⚠️ 校考入围</span>' : ''}</div>
    ${c._sameSchoolAs ? `<div style="font-size:11.5px;color:#8c8c8c;margin-top:2px">该校同时以另一条招生通道收录（<a href="college-detail.html?id=${c._sameSchoolAs}" style="color:var(--primary)">查看另一条 ›</a>）</div>` : ''}
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
  // 对口本科新增院校缺地址/电话/规模等资料时，如实显示「待补」而不是空白，
  // 也不显示站内估算层按公式拼出来的占位号码（那种号码打不通）。
  const bkPh = c._bkPlaceholder || {};
  // 双轨院校：对口本科条目（如 id=94）把「院校本身属性」留空，指向同校的分类考试条目
  // （_sameSchoolAs）。这些属性对同一所学校是同一个值，所以缺值时回退到原条目取，
  // 否则页面会显示「待补」，让人误以为这所学校完全没有数据。
  const twin = c._sameSchoolAs ? COLLEGES.find((x) => x.id === c._sameSchoolAs) : null;
  const tv = (field) => {
    if (c[field] != null && c[field] !== '') return c[field];
    if (twin && twin[field] != null && twin[field] !== '') return twin[field];
    return null;
  };
  // dash：缺值时优先显示原因注释（如「首届学生尚未毕业」），其次显示「待补」，最后才是「—」
  const dash = (v, todo, field) => {
    if (v) return v;
    // 「专升本率」对对口本科条目不适用（本科层次没有专升本这一说），这是由
    // isDuikouBenke 决定的规则，不写成数据字段 —— 写成 note 会被下面的 twin 继承逻辑
    // 反向泄漏给同校的高职条目：芜湖职业技术大学 id=55 是分类考试（专科）通道，
    // 它的学生当然可以专升本，绝不能跟着显示「不适用」。
    if (field === 'upgradeRate' && c.isDuikouBenke) {
      return '<span style="color:#8c8c8c">不适用（本科院校，无专升本口径）</span>';
    }
    // ⚠️ note 只认本条自己的 c[field+'Note']，不回退到 twin。
    //    回退会让方向反了：对口本科条目的说明会盖到高职条目上（见上）。
    const note = field ? c[field + 'Note'] : null;
    if (note) return `<span style="color:#8c8c8c">${note}</span>`;
    return todo ? '<span style="color:#bbb">待补</span>' : '—';
  };
  document.getElementById('basic-info').innerHTML = `
    <div class="row"><div class="label">所在城市</div><div class="value">${c.city || '—'}</div></div>
    <div class="row"><div class="label">学校地址</div><div class="value">${dash(tv('address'), bkPh.address, 'address')}</div></div>
    <div class="row"><div class="label">办学性质</div><div class="value">${c.nature || '—'}</div></div>
    <div class="row"><div class="label">院校类型</div><div class="value">${c.type || '—'}${c.type && c.type.indexOf('本科')>=0 ? '（本科层次）' : ''}</div></div>
    <div class="row"><div class="label">在校生规模</div><div class="value">${dash(tv('scale'), bkPh.scale, 'scale')}</div></div>
    <div class="row"><div class="label">招生办电话</div><div class="value">${dash(tv('phone'), bkPh.phone, 'phone')}</div></div>
    <div class="row"><div class="label">就业率</div><div class="value">${dash(tv('employmentRate'), bkPh.employmentRate, 'employmentRate')}</div></div>
    <div class="row"><div class="label">专升本率</div><div class="value">${dash(tv('upgradeRate'), bkPh.upgradeRate, 'upgradeRate')}</div></div>
    <div class="row"><div class="label">官方网站</div><div class="value">${c.website ? `<a href="${c.website}" target="_blank" rel="noopener">${c.website.replace('https://','')}</a>` : (c.websiteNote ? `<span style="color:#8c8c8c">${c.websiteNote}</span>` : '—')}</div></div>
    ${twin ? `<div class="row"><div class="label">招生通道</div><div class="value" style="font-size:12.5px">本校同时以两条通道收录：本页为对口本科（应用型本科对口招生）<a href="college-detail.html?id=${twin.id}" style="color:var(--primary)"> · 查看分类考试口径 ›</a></div></div>` : ''}
  `;

  // Tab 切换
  document.querySelectorAll('.tab-switch .tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-switch .tab-item').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
      if (tab.dataset.tab === 'score') renderScore2026(c, entryTrack);
    });
  });

  // 判断2026计划是否为真实数据
  const isRealPlan = c.plan2026 && !c.plan2026.includes('参考') && !c.plan2026.includes('预估') && !c.plan2026.includes('未采集') && !c.plan2026.includes('待公布') && !c.plan2026.includes('2025');
  const planLabel = isRealPlan ? '2026年' : '2026参考';
  const isRealRule = c.admissionRule2026 && !c.admissionRule2026.includes('参考') && !c.admissionRule2026.includes('预估');
  const ruleLabel = isRealRule ? '2026年' : '2026参考';

  // 招生计划
  const fromCat = getQuery('category');
  // 入口赛道：从「中职起点」板块进来只看中职口径，从「高中起点」进来只看普高口径；
  // 默认入口（首页/搜索/收藏/对比等）不受限，两边都显示。
  const entryTrack = fromCat === 'zhongzhi' ? 'zhongzhi' : (fromCat === 'gaozhong' ? 'gaozhong' : null);
  const planDetail = [];
  if (entryTrack !== 'zhongzhi' && c.plan2026Gaozhong) planDetail.push(`普高 ${c.plan2026Gaozhong} 人`);
  if (entryTrack !== 'gaozhong' && c.plan2026Zhongzhi) planDetail.push(`中职 ${c.plan2026Zhongzhi} 人`);
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
  const majorTableHeader = `<tr><th>专业名称</th><th>专业代码</th>${showCols.map(col => `<th>${col.label}</th>`).join('')}<th>学费(元/年)</th></tr>`;

  const majorRowHtml = (m, groupId, open) => {
    const cells = showCols.map(col => {
      const val = m[col.field];
      return `<td>${c.stoppedEnrollment ? '<span style="color:#ff4d4f">停招</span>' : (val ? val + ' 人' : '—')}</td>`;
    }).join('');
    return `<tr${groupId ? ` class="mcg-item" data-group="${groupId}"` : ''}${open === false ? ' style="display:none"' : ''}>
      <td><a href="major-detail.html?name=${encodeURIComponent(m.name)}" style="color:var(--primary)">${m.name}</a></td>
      <td>${m.code || '—'}</td>
      ${cells}
      <td>${m.fee ? m.fee + ' 元' : '—'}</td>
    </tr>`;
  };

  // ===== 校考考纲区（独立于专业表，按入口赛道过滤，可折叠看原文）=====
  const egAll = (typeof EXAM_GROUPS !== 'undefined') ? EXAM_GROUPS[c.id] : null;
  const examSyllabusHtml = (() => {
    if (!egAll) return '';
    const mkTrack = (track, label) => {
      const set = egAll[track];
      if (!set || !Array.isArray(set.groups) || !set.groups.length) return '';
      const rows = set.groups.map((g, gi) => {
        const detailId = `exs-${track}-${gi}`;
        const form = g.form ? ` · ${g.form}` : '';
        const cnt = (g.majors && g.majors.length) ? ` · 覆盖 ${g.majors.length} 个专业` : ' · 覆盖全部专业';
        return `
        <div class="exg2-item" data-target="${detailId}">
          <div class="exg2-head">
            <span class="exg-title">🎯 ${g.name}</span>
            <span class="exg-form">${form}${cnt}</span>
            <span class="exg-toggle">考纲 ▾</span>
          </div>
          <div class="exg2-body" id="${detailId}" style="display:none">
            <div class="exg-content">${g.content || '该校未单独公布该类别考纲，详见上方「录取规则」标签页。'}</div>
            ${g.source ? `<div class="exg-src">来源：<a href="${g.source}" target="_blank" rel="noopener">${String(g.source).replace(/^https?:\/\//, '').slice(0, 60)}</a></div>` : ''}
          </div>
        </div>`;
      }).join('');
      return `<div class="exg2-track">${label}</div>${rows}`;
    };
    // 高中板块只看普高考纲，中职板块只看中职考纲；默认入口两侧都列
    const gz = entryTrack === 'zhongzhi' ? '' : mkTrack('gaozhong', '【普高类校考】');
    const zz = entryTrack === 'gaozhong' ? '' : mkTrack('zhongzhi', '【中职类校考】');
    if (!gz && !zz) return '';
    return `
    <div class="about-section" style="margin:8px 12px">
      <h3>🎯 校考考纲（${planLabel}）</h3>
      ${gz}${zz}
    </div>`;
  })();

  // ===== 分专业计划表：固定按「专业大类」折叠分组 =====
  // 专业多的学校一张平铺表要滑很久，且看不出结构；按大类折叠后一屏即可浏览全貌。
  const displayMajors = dedupeByMajorName(c.majors);
  const catGroups = groupMajorsByCategory(displayMajors);
  const byName = new Map(displayMajors.map((m) => [normMajorName(m.name), m]));
  const colCount = 2 + showCols.length + 1;

  // 大类标题行：显示该大类的专业数与各列计划合计，点击展开/收起
  const catRowHtml = (g, gi, open) => {
    const ms = (g.majors || []).map((n) => byName.get(normMajorName(n))).filter(Boolean);
    const sums = showCols.map((col) => {
      const s = ms.reduce((acc, m) => acc + (m[col.field] || 0), 0);
      return s > 0 ? `${col.label.replace('计划', '')} ${s} 人` : '';
    }).filter(Boolean).join(' · ');
    return `
      <tr class="exam-group-row mcg-row${gi === 0 ? ' open' : ''}" data-target="mcg-${gi}">
        <td colspan="${colCount}">
          <div class="exg-head">
            <span class="exg-title">📂 ${g.name}</span>
            <span class="exg-form">${ms.length} 个专业${sums ? ' · ' + sums : ''}</span>
            <span class="exg-toggle">${gi === 0 ? '收起 ▴' : '展开 ▾'}</span>
          </div>
        </td>
      </tr>`;
  };

  // 默认只展开第一个大类，其余折叠
  const majorTableBody = catGroups.map((g, gi) => {
    const ms = (g.majors || []).map((n) => byName.get(normMajorName(n))).filter(Boolean);
    return catRowHtml(g, gi, gi === 0) + ms.map((m) => majorRowHtml(m, `mcg-${gi}`, gi === 0)).join('');
  }).join('');

  const planNote = `<div style="padding:8px 12px;font-size:12px;color:var(--text-light)">📂 已按「专业大类」折叠分组，点大类行展开查看该类专业明细；上方「校考考纲」区可查看普高/中职各类别的考试科目与形式。</div>`;

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
    ${examSyllabusHtml}
    <div class="about-section" style="margin:8px 12px">
      <h3>📚 分专业招生计划（${planLabel}）${fromCat && catColMap[fromCat] ? ' · ' + catColMap[fromCat].label : ''}</h3>
    </div>
    <div class="table-wrap" style="margin:0 12px">
      <table>
        <thead>${majorTableHeader}</thead>
        <tbody>${majorTableBody}</tbody>
      </table>
    </div>
    ${planNote}
    <div style="padding:8px 12px;font-size:12px;color:var(--text-light)">注：2026年分专业计划数据来源为各院校2026年分类考试招生章程（71 所高职院校为官方公布真实数据，安徽电气工程职业技术学院2026年已停招），实际以省教育厅下达为准</div>
  `;

  // 专业大类行：点击展开/收起该大类的专业明细
  document.querySelectorAll('#panel-plan .mcg-row').forEach((rowEl) => {
    rowEl.addEventListener('click', () => {
      const gid = rowEl.dataset.target;
      const items = document.querySelectorAll(`#panel-plan .mcg-item[data-group="${gid}"]`);
      const open = rowEl.classList.toggle('open');
      items.forEach((it) => { it.style.display = open ? '' : 'none'; });
      const toggle = rowEl.querySelector('.exg-toggle');
      if (toggle) toggle.textContent = open ? '收起 ▴' : '展开 ▾';
    });
  });
  // 考纲条目：点击展开/收起考纲原文
  document.querySelectorAll('#panel-plan .exg2-item').forEach((item) => {
    item.querySelector('.exg2-head').addEventListener('click', () => {
      const body = item.querySelector('.exg2-body');
      if (!body) return;
      const open = body.style.display === 'none';
      body.style.display = open ? '' : 'none';
      const toggle = item.querySelector('.exg-toggle');
      if (toggle) toggle.textContent = open ? '收起 ▴' : '考纲 ▾';
    });
  });

  // ===== 对口本科院校：标签为 招生计划 / 录取规则 / 录取分数 / 学校简介 =====
  // 「2026 分数」是分类考试口径（普高类最低录取分），对口本科不适用 → 改名为「录取分数」
  // （展示 2026 年对口招生各专业录取线）；
  // 原「普高/中职/专项」三列的分专业计划表也不适用（对口本科没有这三类计划），
  // 所以「招生计划」标签改为展示 招生规模 + 专业清单。
  // 「学校简介」保留：18 所对口本科的简介已按官方资料补全。
  if (c.isDuikouBenke) {
    document.querySelectorAll('.tab-switch .tab-item').forEach((t) => {
      if (t.dataset.tab === 'score') t.textContent = '录取分数';
    });
    renderDuikouBenkePlanPanel(c);
    renderDuikouBenkeScorePanel(c);
  }

  // ===== 专项计划模块：把「2026 分数」板块换成专项政策 =====
  // 从专项计划页进来时（?category=zhuanxiang-*），学生关心的是"这个专项怎么录"，
  // 而不是该校 2026 分数；因此「2026 分数」整体替换为政策说明。
  //   · 从「全部专项」进入（category=zhuanxiang）→ 三个专项的招生说明一并展示
  //   · 从某个专项子板块进入（category=zhuanxiang-xxx）→ 只展示那一个专项
  if (fromCat === 'zhuanxiang') {
    renderAllSpecialPolicyPanel(c);
  } else {
    const specialKind = fromCat === 'zhuanxiang-tuiyi' ? 'tuiyi'
      : (fromCat === 'zhuanxiang-laoxiang' ? 'laoxiang'
        : (fromCat === 'zhuanxiang-xiangcun' ? 'xiangcun' : null));
    if (specialKind) {
      renderSpecialPolicyPanel(c, specialKind);
    }
  }

  // ===== 没有 2026 官方分数的院校：隐藏「2026 分数」标签 =====
  // 只有 招生计划 / 录取规则 / 学校简介 三个标签，避免点进去是一片「暂未查到」。
  // 例外：对口本科的「录取分数」标签（数据源是 bkScores2026，不是分类考试分数）、
  //       以及从专项计划页进入时被改写为「专项政策」的标签，都必须保留。
  const _specialTabActive = fromCat === 'zhuanxiang' || fromCat === 'zhuanxiang-tuiyi'
    || fromCat === 'zhuanxiang-laoxiang' || fromCat === 'zhuanxiang-xiangcun';
  if (!c.isDuikouBenke && !_specialTabActive && score2026State(c) !== 'official') {
    const _scoreTab = document.querySelector('.tab-switch .tab-item[data-tab="score"]');
    const _scorePanel = document.getElementById('panel-score');
    const _wasActive = _scoreTab && _scoreTab.classList.contains('active');
    if (_scoreTab) _scoreTab.remove();
    if (_scorePanel) _scorePanel.remove();
    if (_wasActive) {
      const _planTab = document.querySelector('.tab-switch .tab-item[data-tab="plan"]');
      const _planPanel = document.getElementById('panel-plan');
      if (_planTab) _planTab.classList.add('active');
      if (_planPanel) _planPanel.classList.add('active');
    }
  }

  // 2026录取规则
  const scoreCompHtml = c.scoreComposition ? `
    <div style="background:linear-gradient(135deg,#fff7e6,#ffe7ba);border:2px solid #fa8c16;border-radius:12px;padding:14px 16px;margin:10px 0">
      <div style="font-size:13px;color:#ad6800;font-weight:600;margin-bottom:6px">📐 取分规则（2026年院校章程）</div>
      <div style="font-size:15px;color:#5c3a00;font-weight:600;line-height:1.6">${c.scoreComposition}</div>
    </div>` : '';
  // 退役军人专项计划录取政策：**仅**在"从专项计划页进入"时显示。
  // 普通浏览（普高/中职/对口等入口）不展示退役军人政策，避免误导非专项考生。
  const showTuiyiPolicy = fromCat === 'zhuanxiang-tuiyi';
  const hasYinglu = showTuiyiPolicy && c.retiredMilitaryPolicy &&
    (c.retiredMilitaryPolicy.indexOf('应录尽录') >= 0 ||
     c.retiredMilitaryPolicy.indexOf('参加测试即录取') >= 0 ||
     c.retiredMilitaryPolicy.indexOf('全部录取') >= 0);
  const yingluHtml = !showTuiyiPolicy ? '' : (hasYinglu ? `
    <div style="background:linear-gradient(135deg,#f6ffed,#d9f7be);border:2px solid #52c41a;border-radius:12px;padding:14px 16px;margin:10px 0">
      <div style="font-size:13px;color:#389e0d;font-weight:700;margin-bottom:6px">⭐ 退役军人专项计划 · 应录尽录</div>
      <div style="font-size:16px;color:#135200;font-weight:700;line-height:1.6">${c.retiredMilitaryPolicy}</div>
    </div>` : (c.retiredMilitaryPolicy ? `
    <div style="background:#f5f5f5;border:1px solid #d9d9d9;border-radius:8px;padding:10px 14px;margin:10px 0">
      <div style="font-size:13px;color:#595959;font-weight:600;margin-bottom:4px">退役军人专项计划录取政策</div>
      <div style="font-size:14px;color:#262626;line-height:1.5">${c.retiredMilitaryPolicy}</div>
    </div>` : ''));
  // 校考入围（二次划线）机制提示
  const secondCutoffHtml = (c.secondCutoff && c.secondCutoff.enabled) ? `
    <div style="background:linear-gradient(135deg,#fffbe6,#fff1b8);border:2px solid #faad14;border-radius:12px;padding:14px 16px;margin:10px 0">
      <div style="font-size:14px;color:#ad6800;font-weight:700;margin-bottom:8px">⚠️ 校考入围（二次划线）机制</div>
      <div style="font-size:14px;color:#614700;line-height:1.7;margin-bottom:6px"><b>入围比例：</b>${c.secondCutoff.ratio}</div>
      <div style="font-size:13px;color:#874d00;line-height:1.7">${c.secondCutoff.note}</div>
      <div style="font-size:12px;color:#d46b08;margin-top:8px;line-height:1.6">提示：文化统考未达入围线将无法参加校考，志愿直接作废；建议先用下方"录取概率测算"查看自己的文化分是否稳妥。</div>
    </div>` : '';
  // 「待补」渲染：字段缺失且已标记待补时显示灰字提示，避免显示成空白或假的估算值。
  // 另外区分三种「没有值」的情况，语义不同不能都写成「待补」：
  //   ① 不适用（本科院校无专升本率）→ 显示「不适用（本科院校）」
  //   ② 有明确原因（新建院校尚无毕业生、校方明示不公开）→ 显示该原因
  //   ③ 单纯还没查到 → 显示「待补」
  const pend = (v, field) => {
    if (v) return v;
    // 与 dash() 保持一致：对口本科的专升本率属于「规则上不适用」，不依赖数据 note
    if (field === 'upgradeRate' && c.isDuikouBenke) {
      return '<span style="color:#8c8c8c">不适用（本科院校，无专升本口径）</span>';
    }
    const note = c[field + 'Note'];
    if (note) return `<span style="color:#8c8c8c">${note}</span>`;
    const todo = (c._bkPlaceholder || {})[field];
    return todo ? '<span style="color:#bbb">待补</span>' : '—';
  };
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
      <p><b>就业率：</b>${pend(c.employmentRate, 'employmentRate')}</p>
      <p><b>专升本率：</b>${pend(c.upgradeRate, 'upgradeRate')}</p>
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
  // 对口本科院校原先被整块去掉（这些院校当时没有 intro 内容）。现已按官方资料补全，
  // 因此保留该标签，并把学校属性一并列出，方便考生快速了解。
  document.getElementById('panel-intro').innerHTML = `
    <div class="about-section" style="margin:0 12px">
      <h3>🏫 ${c.name}</h3>
      <p style="line-height:1.8">${c.intro || '<span style="color:#bbb">待补</span>'}</p>
    </div>
    <div class="about-section" style="margin:8px 12px">
      <h3>📋 学校属性</h3>
      <p><b>所在城市：</b>${c.city || '—'}</p>
      <p><b>办学性质：</b>${c.nature || '—'}</p>
      <p><b>院校类型：</b>${c.type || '—'}</p>
      <p><b>学历层次：</b>${c.isUndergraduate ? '本科（应用型本科对口招生）' : '高职（专科）'}</p>
      <p><b>在校生规模：</b>${dash(tv('scale'), bkPh.scale)}</p>
      <p><b>官方网站：</b>${c.website ? `<a href="${c.website}" target="_blank" rel="noopener" style="color:var(--primary)">${c.website}</a>` : '—'}</p>
    </div>
  `;
}

/**
 * 从 COLLEGES 提取所有专业，按「专业名+代码」去重，附带开设院校列表。
 * 返回 [{ name, code, category, fee, schools: [{ collegeId, collegeName, city, fee }] }]
 */
function getAllMajors() {
  const map = new Map();
  COLLEGES.forEach(c => {
    (c.majors || []).forEach(m => {
      const key = m.name + '|' + (m.code || '');
      if (!map.has(key)) {
        map.set(key, {
          name: m.name,
          code: m.code || '',
          category: m.category || '',
          fee: m.fee || 0,
          schools: [],
        });
      }
      map.get(key).schools.push({
        collegeId: c.id,
        collegeName: c.name,
        city: c.city || '',
        fee: m.fee || c.fee || 0,
      });
    });
  });
  return [...map.values()];
}

function getMajorCategoryName(key) {
  if (!key || typeof MAJOR_CATEGORIES === 'undefined') return '';
  const found = MAJOR_CATEGORIES.find(c => c.key === key);
  return found ? found.name : '';
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
    window._majorPage = 1;
    const kw = document.getElementById('major-search').value.trim();
    renderMajorList(kw, chip.dataset.cat);
  });

  document.getElementById('major-search').addEventListener('input', e => {
    window._majorPage = 1;
    const cat = document.querySelector('#major-cat-filter .filter-chip.active')?.dataset.cat || '';
    renderMajorList(e.target.value.trim(), cat);
  });
}

// 中职类校考分组里「出现过某个大类」的院校集合，用于回答「中职学这个能考哪些学校」
let _zhCatCache = null;
function zhongzhiCollegesByCategory() {
  if (_zhCatCache) return _zhCatCache;
  const map = {};
  if (typeof EXAM_GROUPS !== 'undefined') {
    for (const c of COLLEGES) {
      const eg = EXAM_GROUPS[c.id] && EXAM_GROUPS[c.id].zhongzhi;
      if (!eg || !Array.isArray(eg.groups)) continue;
      const byCat = {};
      for (const m of (c.majors || [])) {
        const k = m.category || 'other';
        (byCat[k] = byCat[k] || []).push(normMajorName(m.name));
      }
      const seen = new Set();
      for (const g of eg.groups) {
        const gname = normMajorName(g.name);
        const gmajors = (g.majors || []).map(normMajorName);
        for (const k of Object.keys(byCat)) {
          if (seen.has(k)) continue;
          const hit = (g.categories || []).includes(k)
            || byCat[k].some((n) => gmajors.includes(n))
            || gname.includes(String(getMajorCategoryName(k) || '').replace('大类', ''));
          if (hit) {
            seen.add(k);
            (map[k] = map[k] || new Set()).add(c.id);
          }
        }
      }
    }
  }
  _zhCatCache = map;
  return map;
}

// 搜索命中「专业大类」时的联想卡
function renderMajorCatCards(kw, cat, all) {
  const box = document.getElementById('major-cat-cards');
  if (!box) return;
  const stat = {};
  for (const m of all) {
    const k = m.category || 'other';
    const s = stat[k] || (stat[k] = { majors: 0, colleges: new Set(), names: [] });
    s.majors += 1;
    (m.schools || []).forEach((x) => s.colleges.add(x.collegeId));
    s.names.push(m.name);
  }
  if (!kw) { box.innerHTML = ''; return; }
  const kk = kw.toLowerCase();
  let keys = Object.keys(stat);
  if (cat) keys = keys.filter((k) => k === cat);
  const hits = keys.filter((k) => {
    const cn = String(getMajorCategoryName(k) || '');
    const nameHit = stat[k].names.some((n) => n.toLowerCase().includes(kk));
    // 大类名命中：允许「计算机」这类行业词不完全等于官方大类名，
    // 所以大类名包含关键词或关键词包含大类名核心词都算
    return cn.includes(kw) || (cn && kw.length >= 2 && cn.replace('大类', '').includes(kw)) || nameHit;
  });
  if (!hits.length) { box.innerHTML = ''; return; }

  const zh = zhongzhiCollegesByCategory();
  hits.sort((a, b) => stat[b].majors - stat[a].majors);
  box.innerHTML = `
    <div class="mcat-tip">🎯 匹配到的专业大类（点一下只看该大类）</div>
    <div class="mcat-cards">
      ${hits.map((k) => {
        const s = stat[k];
        const zhN = zh[k] ? zh[k].size : 0;
        const rel = s.names.filter((n) => n.toLowerCase().includes(kk));
        const sample = rel.slice(0, 3).join('、');
        return `<button class="mcat-card" data-cat="${k}">
          <div class="mcat-name">${getMajorCategoryName(k)}</div>
          <div class="mcat-meta">${s.majors} 个专业 · ${s.colleges.size} 所院校${zhN ? ` · 中职可报 ${zhN} 所` : ''}</div>
          ${sample ? `<div class="mcat-sample">含 ${sample}${rel.length > 3 ? ' 等' : ''}</div>` : ''}
        </button>`;
      }).join('')}
    </div>`;
  box.querySelectorAll('.mcat-card').forEach((el) => {
    el.addEventListener('click', () => {
      const chip = document.querySelector(`#major-cat-filter .filter-chip[data-cat="${el.dataset.cat}"]`);
      if (chip) chip.click();
    });
  });
}

function renderMajorList(kw, cat) {
  const all = getAllMajors();
  let list = all;
  if (cat) list = list.filter(m => m.category === cat);
  // 关键词同时匹配：专业名 / 专业大类名 / 专业代码
  // —— 中职学生常按「我学的计算机」来搜，命中的是大类而不是专业名
  if (kw) {
    const k = kw.toLowerCase();
    list = list.filter(m => {
      const catName = getMajorCategoryName(m.category) || '';
      return m.name.toLowerCase().includes(k)
        || catName.includes(kw)
        || String(m.code || '').includes(kw);
    });
  }

  // 大类联想卡：告诉用户「这个方向属于哪个专业大类、能报哪些院校」
  renderMajorCatCards(kw, cat, all);

  const container = document.getElementById('major-list');
  if (list.length === 0) {
    container.innerHTML = `<div class="empty"><div class="icon">📚</div><div>未找到相关专业</div></div>`;
    return;
  }

  // 分页：默认显示前 20 条，点「加载更多」再显示 20 条
  const PAGE = 20;
  if (!window._majorPage) window._majorPage = 1;
  const showCount = Math.min(window._majorPage * PAGE, list.length);
  const slice = list.slice(0, showCount);

  container.innerHTML = slice.map(m => `
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

  // 加载更多按钮
  if (showCount < list.length) {
    container.innerHTML += `<div style="text-align:center;padding:12px"><button id="major-load-more" style="padding:8px 24px;border:1px solid var(--primary);border-radius:6px;background:#fff;color:var(--primary);font-size:13px;cursor:pointer">加载更多（还剩 ${list.length - showCount} 条）</button></div>`;
    document.getElementById('major-load-more').addEventListener('click', () => {
      window._majorPage++;
      renderMajorList(kw, cat);
    });
  } else {
    window._majorPage = 1; // 重置
  }
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
    <div class="section-title"><span>开设院校（${m.schools.length}）</span></div>
    ${m.schools.map(s => `
      <a href="college-detail.html?id=${s.collegeId}" class="college-card" style="display:block">
        <div class="head">
          <div class="name">${s.collegeName}</div>
          <span class="score" style="color:var(--danger);font-weight:600">${scoreLabel(s)}</span>
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
 * 6. 2026 分数页（详情面板 + 全站列表）
 * ============================================================ */
/* ===== 2026 分数 · 公共渲染 ===== */
/** 分数状态标签：官方公布 / 来源待核 / 公网未公布 / 待查证 */
function score2026State(c) {
  if (c.minScore2026 != null || c.minScore2026Zhongzhi != null || (Array.isArray(c.majorScores2026) && c.majorScores2026.length)) return 'official';
  const t = String(c.score2026 || '');
  if (t.indexOf('来源待核') >= 0) return 'unverified';
  if (t.indexOf('公网未公布') >= 0) return 'absent';
  return 'unknown';
}

function score2026Sources(c) {
  const a = Array.isArray(c.scoreSources2026) ? c.scoreSources2026 : [];
  return a.filter(u => typeof u === 'string' && /^https?:\/\//.test(u));
}

const SC_TAG_STYLE = {
  '官方': 'background:#e8f7ee;color:#389e0d;border-color:#b7e4c7',
  '待核': 'background:#fff7e6;color:#d46b08;border-color:#ffd591',
  '存疑': 'background:#fff1f0;color:#cf1322;border-color:#ffa39e',
  '未公布': 'background:#f5f5f5;color:#8c8c8c;border-color:#e8e8e8'
};
function scoreTagHTML(tag) {
  if (!tag) return '';
  const css = SC_TAG_STYLE[tag] || SC_TAG_STYLE['未公布'];
  return `<span class="tag" style="${css}">${tag}</span>`;
}

/** 分专业分数表：高中（普高类）/ 中职类 分列 */
function majorScoresHTML(c, track) {
  const rows = Array.isArray(c.majorScores2026) ? c.majorScores2026 : [];
  if (!rows.length) return '';
  const showG = track !== 'zhongzhi';
  const showZ = track !== 'gaozhong';
  const cell = (v, cls) => (v == null ? '<span class="dash">—</span>' : `<span class="${cls}">${v}</span>`);
  const body = rows.map(m => `<tr>
      <td class="sn">${m.n}</td>
      ${showG ? `<td>${cell(m.g, 'g')}</td>` : ''}
      ${showZ ? `<td>${cell(m.z, 'z')}</td>` : ''}
      <td>${m.p == null ? '<span class="dash">—</span>' : m.p}</td>
      <td><a href="${m.src}" target="_blank" rel="noopener">来源</a></td>
    </tr>`).join('');
  const scoreNote = showG && showZ
    ? '高中类满分 600，中职类满分 750，两者不可直接比较。'
    : (showG ? '高中（普高类）满分 600。' : '中职类满分 750。');
  return `
    <div style="margin-top:16px">
      <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
        <div style="font-size:13px;font-weight:700;color:#434343">分专业最低分</div>
        <div style="font-size:11.5px;color:#8c8c8c">共 ${rows.length} 个专业 · 逐条附该校官网来源</div>
      </div>
      <table class="sc-table">
        <thead><tr><th style="text-align:left">专业</th>${showG ? '<th>高中（普高类）</th>' : ''}${showZ ? '<th>中职类</th>' : ''}<th>2026 计划</th><th>来源</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
      <div style="font-size:11.5px;color:#8c8c8c;line-height:1.8;margin-top:6px">
        专业名沿用该校公布口径；「—」表示该校未公布该专业此类别的最低分。${scoreNote}
      </div>
    </div>`;
}

/** 普高 / 中职 两个数字块；track='gaozhong'|'zhongzhi' 时只显示对应一侧 */
function scoreSumHTML(c, track) {
  const boxes = [];
  if (track !== 'zhongzhi' && c.minScore2026 != null) boxes.push(`<div class="box"><div class="lab">高中（普高类）最低分</div><div class="val g">${c.minScore2026}<span class="u"> 分</span></div></div>`);
  if (track !== 'gaozhong' && c.minScore2026Zhongzhi != null) boxes.push(`<div class="box"><div class="lab">中职类最低分</div><div class="val z">${c.minScore2026Zhongzhi}<span class="u"> 分</span></div></div>`);
  return boxes.length ? `<div class="sc-sum">${boxes.join('')}</div>` : '';
}

/** 详情页「2026 分数」面板：只展示 2026 年、只展示官网能查到的数字；track 限定只显示一侧 */
function renderScore2026(c, track) {
  const el = document.getElementById('score-2026-panel');
  if (!el) return;
  const srcs = score2026Sources(c);
  const srcHTML = srcs.length
    ? '<div style="margin-top:14px"><div style="font-size:12px;color:#8c8c8c;margin-bottom:6px">来源</div>' +
      srcs.map((u, i) => `<a href="${u}" target="_blank" rel="noopener" style="display:block;font-size:12px;color:var(--primary);word-break:break-all;line-height:1.8">${i + 1}. ${u}</a>`).join('') +
      '</div>'
    : '';
  const noteHTML = c.scoreSourceNote2026
    ? `<div style="margin-top:12px;font-size:12px;color:#8c8c8c;line-height:1.85">${c.scoreSourceNote2026}</div>`
    : '';
  const rawHTML = c.score2026
    ? `<div style="margin-top:14px;padding:12px 14px;background:#fafafa;border-radius:8px;font-size:12.5px;color:#595959;line-height:1.9">${c.score2026}</div>`
    : '';
  const majorHTML = majorScoresHTML(c, track);

  if (score2026State(c) === 'official') {
    const gran = c.scoreGranularity2026 === 'by_major'
      ? '分专业公布 · 取全校最低'
      : (c.scoreGranularity2026 === 'by_college' ? '院校级公布' : '');
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div style="font-size:13px;color:#434343;font-weight:600">2026 年最低录取分</div>
        <div style="margin-left:auto">${scoreTagHTML(c.score2026Tag || '官方')}</div>
      </div>
      ${gran ? `<div style="margin-top:8px;font-size:12px;color:#8c8c8c">${gran}</div>` : ''}
      ${scoreSumHTML(c, track)}
      ${majorHTML}
      ${rawHTML}${noteHTML}${srcHTML}`;
    return;
  }

  const st = score2026State(c);
  const head = st === 'unverified'
    ? '该校 2026 年分数<b>待核实</b>'
    : (st === 'absent' ? '该校未在官网公布 2026 年最低录取分' : '该校 2026 年最低录取分<b>暂未查到</b>');
  el.innerHTML = `
    <div class="empty" style="padding:32px 20px;text-align:center;background:none">
      <div style="font-size:34px;opacity:.45;margin-bottom:10px">🔍</div>
      <div style="font-size:15px;font-weight:700;color:#434343;margin-bottom:10px">${head}</div>
      <div style="font-size:12.5px;color:#8c8c8c;line-height:1.9;max-width:420px;margin:0 auto">
        多数院校只公示「预录取名单 PDF」，正文不列最低分；<br>
        本站只收录官网可查证的分数，<b>不提供估算值</b>。
      </div>
    </div>
    ${rawHTML}${noteHTML}${srcHTML}`;
}

/* ===== 2026 分数 · 列表页（各校各专业 高中/中职） ===== */
let SC_Q = '';
let SC_MODE = 'all';

function scHasData(c) {
  return c.minScore2026 != null || c.minScore2026Zhongzhi != null ||
    (Array.isArray(c.majorScores2026) && c.majorScores2026.length);
}

function renderScoreTrend() {
  renderTabbar('index');
  renderNavbar('2026 各校各专业分数', true);

  const host = document.getElementById('score2026-body');
  if (!host) return;

  const all = COLLEGES.filter(scHasData);
  const withMajor = all.filter(c => Array.isArray(c.majorScores2026) && c.majorScores2026.length);
  const noMajor = all.filter(c => !(Array.isArray(c.majorScores2026) && c.majorScores2026.length));
  const rest = COLLEGES.filter(c => !scHasData(c));
  const majorRows = withMajor.reduce((n, c) => n + c.majorScores2026.length, 0);

  host.innerHTML = `
    <div class="note" style="margin:12px 0 12px">
      ✅ 只收 <b>2026 年</b>、只收<b>院校官网能查到</b>的分数：目前 <b>${withMajor.length} 所</b>公布了分专业分数线（共 <b>${majorRows} 条</b>），
      另有 <b>${noMajor.length} 所</b>只公布了全校最低分。<br>
      高中（普高类）与中职类<b>分开计分</b>（高中满分 600、中职满分 750），不混排、不换算。<br>
      合格线（文化素质测试、校考合格线）<b>不等于</b>录取最低分，故不混入；本站<b>不提供任何估算分数</b>。
    </div>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
      <input id="sc-q" type="search" placeholder="搜院校或专业，如：护理" autocomplete="off"
        style="flex:1;height:38px;border:1px solid #e8e8e8;border-radius:10px;padding:0 12px;font-size:13px;background:#fff;outline:none">
    </div>
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap" id="sc-chips">
      <button class="sc-chip is-on" data-mode="all">全部 ${all.length}</button>
      <button class="sc-chip" data-mode="major">有分专业线 ${withMajor.length}</button>
      <button class="sc-chip" data-mode="college">仅全校分 ${noMajor.length}</button>
    </div>
    <div id="sc-list"></div>
    <div style="margin-top:20px">
      <div style="font-size:13px;font-weight:700;color:#434343;margin-bottom:8px">暂未查到分数的院校（${rest.length} 所）</div>
      <div style="font-size:12.5px;color:#8c8c8c;line-height:2">${rest.map(c => c.name).join('、')}</div>
    </div>
    <div class="note" style="margin-top:16px">
      点院校名进详情页可看该校「2026 分数」完整面板（含官网原文摘录与全部来源链接）。
    </div>`;

  const listEl = document.getElementById('sc-list');
  const qEl = document.getElementById('sc-q');
  const chipsEl = document.getElementById('sc-chips');

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  const cardHTML = (c) => {
    const majors = Array.isArray(c.majorScores2026) ? c.majorScores2026 : [];
    const g = c.minScore2026, z = c.minScore2026Zhongzhi;
    const inline = [
      g != null ? `<span class="g">${g}</span><span class="u">分</span>` : '',
      z != null ? `<span class="z">${z}</span><span class="u">分(中职)</span>` : ''
    ].filter(Boolean).join('<span class="sep">/</span>');
    return `
      <details class="sc-wrap">
        <summary>
          <div style="flex:1;min-width:0">
            <div class="sc-name">${esc(c.name)} ${scoreTagHTML(c.score2026Tag || '官方')}</div>
            <div class="sc-meta">${esc(c.city)} · ${esc(c.nature)}${majors.length ? ` · 分专业 ${majors.length} 个` : ' · 仅全校最低分'}</div>
          </div>
          <div class="sc-num">${inline || '<span class="u">—</span>'}</div>
          <div class="sc-arrow">›</div>
        </summary>
        <div class="inner">
          ${scoreSumHTML(c)}
          ${majors.length ? majorScoresHTML(c) : '<div style="font-size:12.5px;color:#8c8c8c;line-height:1.9">该校只公布了全校最低分，未公布分专业分数线。</div>'}
          <div style="margin-top:12px"><a href="college-detail.html?id=${c.id}" style="font-size:12.5px;color:var(--primary);font-weight:600">查看该校详情 ›</a></div>
        </div>
      </details>`;
  };

  const paint = () => {
    const kw = SC_Q.trim();
    let pool = all;
    if (SC_MODE === 'major') pool = withMajor;
    else if (SC_MODE === 'college') pool = noMajor;
    if (kw) {
      pool = pool.filter(c => c.name.indexOf(kw) >= 0 || c.city.indexOf(kw) >= 0 ||
        (Array.isArray(c.majorScores2026) && c.majorScores2026.some(m => m.n.indexOf(kw) >= 0)));
    }
    const sorted = pool.slice().sort((a, b) => (b.minScore2026 == null ? -1 : b.minScore2026) - (a.minScore2026 == null ? -1 : a.minScore2026));
    listEl.innerHTML = sorted.length
      ? sorted.map(cardHTML).join('')
      : `<div class="empty" style="padding:36px 10px;text-align:center;color:#8c8c8c;font-size:13px">没有匹配的院校或专业</div>`;
  };

  if (qEl) qEl.addEventListener('input', () => { SC_Q = qEl.value; paint(); });
  if (chipsEl) chipsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.sc-chip');
    if (!b) return;
    SC_MODE = b.dataset.mode;
    [...chipsEl.children].forEach(x => x.classList.toggle('is-on', x === b));
    paint();
  });
  paint();
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
/**
 * 构建对口本科院校卡片列表（benke.html 与中职起点「对口本科」子标签共用）。
 *
 * 数据来源：js/benke-schools.js 的 BENKE_SCHOOLS（从各校官网/省考试院章程采集）。
 * 采集字段可能缺项，这里一律**优雅降级**：缺就省略那一行，不显示 undefined/空标签。
 */
function buildBenkeCards(keyword) {
  const kw = (keyword || '').trim().toLowerCase();
  const esc = (s) => String(s == null ? '' : s);
  const localByName = new Map(COLLEGES.map((c) => [c.name, c]));
  const schools = (typeof BENKE_SCHOOLS !== 'undefined' && BENKE_SCHOOLS.length) ? BENKE_SCHOOLS : [];

  // 按关键词筛选（校名 / 城市 / 专业名 / 大类都能搜到）
  const list = kw ? schools.filter((s) => {
    if ((s.name || '').toLowerCase().includes(kw)) return true;
    if ((s.city || '').toLowerCase().includes(kw)) return true;
    if ((s.categoryText || '').toLowerCase().includes(kw)) return true;
    return (s.majors || []).some((m) =>
      (m.name || '').toLowerCase().includes(kw) || (m.categoryText || '').toLowerCase().includes(kw));
  }) : schools;

  if (!list.length) {
    return '<div class="empty" style="padding:30px 20px"><div class="icon">🎓</div><div>未找到匹配的对口本科院校</div></div>';
  }

  return list.map((s) => {
    const local = localByName.get(s.name);
    // 校名/整卡指向：本站已收录 → 站内详情页（与高职院校一致）；否则 → 官网
    const nameHref = local ? `college-detail.html?id=${local.id}`
      : (s.zhaoshengSite || s.schoolSite || s.charterUrl || '');
    const nameExt = !local && nameHref;

    // 卡片**完全对齐**「分类考试」的高职院校卡片，不多挂任何额外信息：
    //   高职：a.college-card > .head > .name + .tags（性质/类型/批次标记） + .meta-row（城市 · 计划 N 人）
    //   对口本科：同结构；meta 行同样写作「计划 N 人」，批次由标签行的「🏫 对口本科」表达。
    // 曾多出来的「已收录分数」「数据置信度中」标签、「· N 个专业」、「看招生计划与分数 ›」
    // 以及卡片下方的分数线块、专业表、考试办法折叠块，**全部移除** ——
    // 列表里只留与高职卡片一样的信息；分数线/专业/考试办法一律进院校详情页看。
    const planText = s.planTotal ? `招 ${s.planTotal} 人` : '招生计划待公布';
    // 标签改为**无底色无边框的纯文字**（仅用颜色区分），去掉商品化的小色块观感。
    // 用行内样式而非全局 .tag 覆盖，避免影响高职院校卡片与其它页面。
    const plainTag = (color, text) => `<span style="font-size:11.5px;color:${color}">${text}</span>`;
    return `
      <a href="${esc(nameHref || '#')}"${nameExt ? ' target="_blank" rel="noopener"' : ''} class="college-card">
        <div class="head">
          <div class="name">${esc(s.name)}</div>
        </div>
        <div class="tags" style="gap:10px">
          ${plainTag('#1677ff', esc(s.nature || ''))}
          ${s.type ? plainTag('#52c41a', esc(s.type)) : ''}
          ${plainTag('#722ed1', '🏫 对口本科')}
        </div>
        <div class="meta-row">
          <span>${esc(s.city || '')} · ${planText}（对口本科）</span>
        </div>
      </a>`;
  }).join('');
}

function renderBenke() {
  renderTabbar('college');

  // 速览卡 + 目录（与中职起点页共用 js/benke-content.js 的同一份内容）
  const introEl = document.getElementById('bk-intro');
  if (introEl && typeof renderBenkeIntro === 'function') {
    introEl.innerHTML = renderBenkeIntro({ listId: 'bk-schools', nav: true });
  }
  const otherEl = document.getElementById('benke-other');
  if (otherEl) otherEl.innerHTML = buildBenkeCards('');

  const blocksEl = document.getElementById('bk-blocks');
  if (blocksEl && typeof renderBenkeBlocks === 'function') {
    blocksEl.innerHTML = renderBenkeBlocks();
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
          ${c.interview && c.interview.hasInterview ? '<span class="tag" style="color:#ad6800">有面试</span>' : ''}
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

  // ===== 对口本科 =====
  // 与独立页 benke.html 用同一份内容与同一套卡片构建函数（js/benke-content.js + buildBenkeCards），
  // 避免两处各写一份导致不一致（卡片撑爆、宿州学院重复都是双份内容造成的）。
  const bkEl = document.getElementById('zz-benke-list');
  if (bkEl && typeof renderBenkeIntro === 'function') {
    bkEl.innerHTML =
      renderBenkeIntro({
        listId: 'zz-benke-schools',
        nav: true,
        tip: '中职生也可升入全日制本科（应用型本科对口招生），单独划线、单独录取。',
      }) +
      '<div class="section-title" id="zz-benke-schools" style="margin:14px 12px 8px"><span>对口本科招生院校（' +
        ((typeof BENKE_SCHOOLS !== 'undefined' && BENKE_SCHOOLS.length) ? BENKE_SCHOOLS.length : 0) + ' 所）</span></div>' +
      '<div style="padding:0 12px" id="zz-benke-cards"></div>' +
      '<div class="bk-block" style="margin-top:10px">' +
        '<p style="font-size:12px;color:#666">📌 名单依据安徽省教育招生考试院「应用型本科对口招生章程」栏目。其中' +
        '<b>宿州学院、芜湖职业技术大学、安徽职业技术大学、安徽艺术学院已收录在本站</b>，可直接查看 2026 分数；' +
        '其余院校点击进入官网查询最新章程。<b>分专业计划与选考类别以各院校当年对口招生章程为准。</b></p>' +
      '</div>' +
      renderBenkeBlocks();
  }

  function renderBenkeList(keyword) {
    const cardsEl = document.getElementById('zz-benke-cards');
    if (cardsEl) cardsEl.innerHTML = buildBenkeCards(keyword);
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
          ${c.interview && c.interview.hasInterview ? '<span class="tag" style="color:#ad6800">有面试</span>' : ''}
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

/**
 * 专项子页面（退役军人 / 革命老区 / 乡村医生）：把政策说明渲染进 #zx-policy。
 * 文案来自 js/special-policy.js，未收录时显示占位提示而不是空白。
 */
function renderSpecialPolicyPage(kind) {
  const el = document.getElementById('zx-policy');
  if (!el) return;
  if (typeof SPECIAL_POLICY === 'undefined') {
    el.innerHTML = '<div style="color:#d46b08">政策数据未加载（special-policy.js 缺失）。</div>';
    return;
  }
  el.innerHTML = specialPolicyBlocksHtml(kind);
}

/**
 * 专项政策醒目提示卡片（如革命老区「可多报 3 所院校」）。
 * 放在每块政策内容最上方，用金色高亮，便于学生一眼看到关键报考优势。
 */
function specialHighlightHtml(P, esc) {
  const e = esc || ((s) => String(s == null ? '' : s));
  if (!P || !P.highlight) return '';
  const h = P.highlight;
  return `
    <div style="background:linear-gradient(135deg,#fffbe6,#ffe58f);border:2px solid #faad14;border-radius:10px;padding:10px 12px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="font-size:20px">🎯</span>
        <span style="font-size:17px;font-weight:800;color:#ad4e00">${e(h.title)}</span>
        ${h.big ? `<span style="background:#fa8c16;color:#fff;font-size:13px;font-weight:800;padding:2px 9px;border-radius:20px;letter-spacing:.5px">${e(h.big)}</span>` : ''}
      </div>
      ${h.desc ? `<div style="font-size:13px;color:#613400;line-height:1.7;margin-top:6px">${e(h.desc)}</div>` : ''}
      ${h.note ? `<div style="font-size:11px;color:#ad6800;line-height:1.5;margin-top:5px">${e(h.note)}</div>` : ''}
    </div>`;
}


/**
 * 专项计划页：生成各子板块的政策说明 HTML。
 *
 * · currentSub === 'all'     → 三个专项（退役军人/革命老区/乡村医生）的政策各写一段
 * · 其余（tuiyi/laoxiang/xiangcun） → 只写对应那一项的政策
 *
 * 政策文案来自 js/special-policy.js（官方来源，见各条 sources）。
 */
function specialPolicyBlocksHtml(currentSub) {
  const kinds = currentSub === 'all' ? ['tuiyi', 'laoxiang', 'xiangcun'] : [currentSub];
  const esc = (s) => String(s == null ? '' : s);

  // 运行时统计：各专项 2026 年实际招生院校数
  const countOf = (k) => {
    const field = k === 'tuiyi' ? 'plan2026RetiredMilitary'
      : k === 'laoxiang' ? 'plan2026RevolutionaryArea' : 'plan2026RuralDoctor';
    return COLLEGES.filter((c) => c[field] > 0 && !c.stoppedEnrollment).length;
  };
  const yingluCountOf = () =>
    COLLEGES.filter((c) => c.retiredMilitaryPolicy &&
      (c.retiredMilitaryPolicy.indexOf('应录尽录') >= 0 ||
       c.retiredMilitaryPolicy.indexOf('参加测试即录取') >= 0 ||
       c.retiredMilitaryPolicy.indexOf('全部录取') >= 0)).length;

  const block = (P) => {
    if (!P) return '';
    const rows = [];
    if (P.condition) rows.push(['报考条件', esc(P.condition)]);
    if (P.regions && P.regions.list && P.regions.list.length) {
      rows.push([
        '适用地区',
        (P.regions.batchNote ? `<div style="margin-bottom:4px">${esc(P.regions.batchNote)}</div>` : '') +
          `<div style="background:#f6f8ff;border:1px solid #d6e4ff;border-radius:8px;padding:8px 10px;line-height:1.9">${P.regions.list.map(esc).join('、')}</div>` +
          `<div style="font-size:12px;color:var(--text-light);margin-top:3px">共 ${P.regions.list.length} 个</div>`,
      ]);
    } else if (P.regions && P.regions.note) {
      rows.push(['适用地区', esc(P.regions.note)]);
    }
    if (P.exam) rows.push(['考试办法', esc(P.exam)]);
    if (P.admission) rows.push(['录取政策', esc(P.admission)]);
    if (P.agreement) rows.push(['定向协议与毕业去向', esc(P.agreement)]);

    return `
      <div style="border-left:4px solid var(--primary);background:#fafafa;border-radius:8px;padding:10px 12px;margin-bottom:10px">
        <div style="font-size:15px;font-weight:700;margin-bottom:2px">${esc(P.icon)} ${esc(P.fullName || P.name)}</div>
        <div style="font-size:12px;color:var(--text-light);margin-bottom:6px">2026年招收院校 ${countOf(P.key)} 所${P.key === 'tuiyi' ? `，其中 ${yingluCountOf()} 所明确「应录尽录」` : ''}</div>
        ${specialHighlightHtml(P, esc)}
        ${P.intro ? `<div style="font-size:13px;color:#595959;line-height:1.7;margin-bottom:8px">${esc(P.intro)}</div>` : ''}
        ${(P.yinglu && (P.yinglu.text || P.yinglu.scaleNote)) ? (P.yinglu.has
          ? `<div style="background:linear-gradient(135deg,#f6ffed,#d9f7be);border:1px solid #52c41a;border-radius:8px;padding:8px 10px;margin-bottom:8px">
               <div style="font-size:12px;font-weight:700;color:#389e0d;margin-bottom:3px">⭐ 应录尽录</div>
               ${P.yinglu.text ? `<div style="font-size:13px;color:#135200;line-height:1.7">${esc(P.yinglu.text)}</div>` : ''}
               ${P.yinglu.scaleNote ? `<div style="font-size:12px;color:#237804;line-height:1.7;margin-top:6px;padding-top:6px;border-top:1px dashed #95de64">${esc(P.yinglu.scaleNote)}</div>` : ''}
             </div>`
          : `<div style="background:#f6ffed;border:1px solid #b7eb8f;border-left:4px solid #52c41a;border-radius:8px;padding:8px 10px;margin-bottom:8px">
               <div style="font-size:12px;font-weight:700;color:#389e0d;margin-bottom:3px">📉 ${esc(P.yinglu.label || '录取情况')}</div>
               ${P.yinglu.text ? `<div style="font-size:13px;color:#135200;line-height:1.7">${esc(P.yinglu.text)}</div>` : ''}
               ${P.yinglu.scaleNote ? `<div style="font-size:12px;color:#237804;line-height:1.7;margin-top:6px;padding-top:6px;border-top:1px dashed #95de64">${esc(P.yinglu.scaleNote)}</div>` : ''}
             </div>`) : ''}
        ${rows.map(([k, v]) => `<div style="margin-bottom:6px"><span style="font-size:12px;font-weight:700;color:var(--primary)">${k}：</span><span style="font-size:13px;color:#262626;line-height:1.7">${v}</span></div>`).join('')}
        ${(P.sources && P.sources.length) ? `<div style="font-size:11px;color:var(--text-light);margin-top:6px;line-height:1.5">来源：${P.sources.map((s) => `<a href="${esc(s)}" target="_blank" rel="noopener" style="color:var(--primary);word-break:break-all">${esc(s)}</a>`).join('<br>')}</div>` : ''}
      </div>`;
  };

  // 每个专项的关键报考优势（如革命老区「可多报 3 所院校」）都会在各自区块顶部显示；
  // 「全部专项」并列三个专项时同样显示——学生正需要看到这个优势。
  return kinds.map((k) => block(SPECIAL_POLICY[k])).join('');
}

// ========== 专项计划页面 ==========
function renderZhuanxiang() {
  renderTabbar('college');

  // 折叠块标题随子板块变化（招生说明收纳在 <details> 里，默认收起）
  const foldTitleEl = document.querySelector('.zx-fold > summary > span');
  const FOLD_TITLES = {
    all: '⭐ 专项计划招生说明',
    tuiyi: '🎖️ 退役军人专项计划招生说明',
    laoxiang: '🏔️ 革命老区专项计划招生说明',
    xiangcun: '🏥 乡村医生专项计划招生说明',
  };

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

    // ===== 顶部招生说明（保留）+ 每张院校卡片内的「专项政策」 =====
    // 顶部：全部专项→三个专项各一段；其余子板块→写自己那一项。
    if (foldTitleEl) foldTitleEl.textContent = FOLD_TITLES[currentSub] || FOLD_TITLES.all;
    const descEl = document.getElementById('zx-desc');
    if (descEl) {
      descEl.innerHTML = (typeof SPECIAL_POLICY !== 'undefined')
        ? specialPolicyBlocksHtml(currentSub)
        : '';
    }
    const el = document.getElementById('zx-list');
    el.innerHTML = list.map(c => {
      const plan = c[planField] || 0;
      const hasYinglu = currentSub === 'tuiyi' && c.retiredMilitaryPolicy && c.retiredMilitaryPolicy.indexOf('应录尽录') >= 0;
      const yingluBadge = hasYinglu ? '<span class="tag" style="color:#389e0d">⭐ 应录尽录</span>' : '';
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
  renderSpecialPolicyPage('tuiyi');
  const list = COLLEGES.filter(c => c.plan2026RetiredMilitary > 0 && !c.stoppedEnrollment);
  const el = document.getElementById('zx-list');
  el.innerHTML = list.map(c => {
    const plan = c.plan2026RetiredMilitary || 0;
    const hasYinglu = c.retiredMilitaryPolicy && c.retiredMilitaryPolicy.indexOf('应录尽录') >= 0;
    const yingluBadge = hasYinglu ? '<span class="tag" style="color:#389e0d">⭐ 应录尽录</span>' : '';
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
  renderSpecialPolicyPage('laoxiang');
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
  renderSpecialPolicyPage('xiangcun');
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
      { name: '皖西卫生职业学院', count: 3128, plan: 1155, source: '官方公布（院校保卫处3128名学生参考；计划见院校招生网《2026年分类考试招生计划》合计1155人）', ratio: '2.7:1' },
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
      { name: '皖西卫生职业学院', count: 3967, plan: 1155, source: '官方公布（院校保卫处3967名考生参加；计划见院校招生网《2025年安徽省分类招生计划》合计1155人）', ratio: '3.4:1' },
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
 * 该字段全站 94 条都是段落（无一是纯数字），直接塞进表格会让一行高到 1000px 以上。
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

/* ============================================================
 * 校考考试类别（专业组）与考纲
 *
 * 数据来自 EXAM_GROUPS（js/data.js）：每所院校一组「考试类别」，
 * 每个类别说明考什么、包含哪些专业。院校详情页的分专业表按这个分组渲染，
 * 同一个专业组的考纲只写一次（否则 78 个专业会把同一段话重复 78 遍）。
 * ============================================================ */

// 取某校某考生类别的分组定义
function getExamGroups(college, type) {
  if (typeof EXAM_GROUPS === 'undefined' || !college || !college.id) return null;
  const g = EXAM_GROUPS[college.id];
  if (!g || !g[type] || !Array.isArray(g[type].groups) || !g[type].groups.length) return null;
  return g[type];
}

// 归一化：去空格、全角括号统一，便于跨来源匹配专业名
function normMajorName(s) {
  return String(s || '')
    .replace(/[\s（）()·・]/g, '')
    .trim();
}

// 判断某专业是否属于某个考试类别
function majorInGroup(major, group) {
  const norm = (arr) => (arr || []).map(normMajorName);
  const mj = normMajorName(major.name);
  const groupMajors = norm(group.majors);
  // 1) 直接同名
  if (groupMajors.includes(mj)) return true;
  // 2) 包含匹配（如分组写「护理」而专业写「护理（中外合作）」）
  if (groupMajors.some((g) => g && (mj.includes(g) || g.includes(mj)))) return true;
  // 3) 退到专业大类（数据里有 major.category，与分组声明的 categories 对照）
  if (group.categories && group.categories.includes(major.category)) return true;
  return false;
}

// 把专业列表按考试类别分组；未命中的放最后
function groupMajorsByExamGroup(majors, groups) {
  const buckets = groups.map((g) => ({ group: g, majors: [] }));
  const rest = [];
  for (const m of majors) {
    let hit = false;
    for (const b of buckets) {
      if (majorInGroup(m, b.group)) {
        b.majors.push(m);
        hit = true;
        break;
      }
    }
    if (!hit) rest.push(m);
  }
  return { grouped: buckets.filter((b) => b.majors.length), rest };
}

/**
 * 没有考纲/考试类别数据时的兜底：按「专业大类」归并。
 *
 * 说明：一所学校 30-70 个专业平铺出来，用户看不出哪些专业考同一套题；
 * 而同一专业大类通常考相同或相近科目，按大类折叠比平铺有用得多。
 * 这里只做「归类」，不编造任何具体考试科目——科目仍要求用户看学校考纲。
 */
function groupMajorsByCategory(majors) {
  const order = (typeof MAJOR_CATEGORIES !== 'undefined' && Array.isArray(MAJOR_CATEGORIES))
    ? MAJOR_CATEGORIES.map((x) => x.key) : [];
  const map = new Map();
  for (const m of majors) {
    const k = m.category || 'other';
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(m);
  }
  return [...map.entries()]
    .sort((a, b) => {
      const ia = order.indexOf(a[0]); const ib = order.indexOf(b[0]);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    })
    .map(([k, ms]) => ({
      kind: 'category',
      name: getMajorCategoryName(k),
      categories: [k],
      majors: ms.map((m) => m.name),
      content: '',
      source: '',
    }));
}

// 同一院校里"归一化后完全相同"的专业名只显示一行。
// 注意：不能用包含匹配 —— "护理" 与 "护理（日语方向）" 是不同招生方向，必须都保留。
function dedupeByMajorName(rows) {
  const seen = new Set();
  return rows.filter((m) => {
    // 去掉方向括注后再比，这样"护理（日语方向）"不会与"护理"互相抵消，
    // 但真正的重复（同校同名同方向）会被合掉
    const key = normMajorName(m.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * 专项计划模块：把院校详情页的「2026 分数」板块替换为该专项的政策说明。
 *
 * @param {object} c   院校对象
 * @param {string} kind 'tuiyi' | 'laoxiang' | 'xiangcun'
 */
function renderSpecialPolicyPanel(c, kind) {
  const panel = document.getElementById('panel-score');
  if (!panel) return;
  const P = (typeof SPECIAL_POLICY !== 'undefined') ? SPECIAL_POLICY[kind] : null;

  // tab 文案也换掉，避免"2026 分数"下面却是政策
  const tabEl = document.querySelector('.tab-switch .tab-item[data-tab="score"]');
  if (tabEl) tabEl.textContent = (P && P.icon ? P.icon + ' ' : '') + '专项政策';

  const esc = (s) => String(s == null ? '' : s);
  const sec = (title, body) => body
    ? `<div style="margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:4px">${title}</div>
       <div style="font-size:14px;color:#262626;line-height:1.7">${body}</div></div>`
    : '';

  // 逐校政策：退役军人有 per-school 文本；其余专项暂无逐校字段
  const schoolPolicy = (kind === 'tuiyi' && c.retiredMilitaryPolicy) ? c.retiredMilitaryPolicy : '';
  const schoolYinglu = schoolPolicy && schoolPolicy.indexOf('应录尽录') >= 0;
  const schoolYinglu2 = schoolPolicy &&
    (schoolPolicy.indexOf('参加测试即录取') >= 0 || schoolPolicy.indexOf('全部录取') >= 0);

  // 地区名单（革命老区）
  let regionHtml = '';
  if (P && P.regions && ((P.regions.list && P.regions.list.length) || P.regions.note)) {
    const list = (P.regions.list || []);
    regionHtml = sec('适用地区（仅这些地方的考生可报考）',
      (P.regions.batchNote ? `<div style="margin-bottom:6px">${esc(P.regions.batchNote)}</div>` : '') +
      (list.length
        ? `<div style="background:#f6f8ff;border:1px solid #d6e4ff;border-radius:8px;padding:10px 12px;line-height:1.9">${list.map(esc).join('、')}</div>
           <div style="font-size:12px;color:var(--text-light);margin-top:4px">共 ${list.length} 个</div>`
        : `<div style="color:#d46b08">${esc(P.regions.note)}</div>`));
  }

  const header = P
    ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
         <span style="font-size:26px">${esc(P.icon)}</span>
         <div>
           <div style="font-size:17px;font-weight:700">${esc(P.fullName || P.name)}</div>
           ${P.fullName && P.fullName !== P.name ? `<div style="font-size:12px;color:var(--text-light)">简称「${esc(P.name)}」</div>` : ''}
         </div>
       </div>`
    : `<div style="font-size:15px;color:#d46b08">该专项政策暂未收录。</div>`;

  // 「应录尽录」标签只给退役军人专项；其余专项按实际效果表述（如革命老区「滑档极少」）
  const yingluBlock = (P && P.yinglu && (P.yinglu.text || P.yinglu.scaleNote))
    ? (P.yinglu.has
      ? `<div style="background:linear-gradient(135deg,#f6ffed,#d9f7be);border:2px solid #52c41a;border-radius:12px;padding:12px 14px;margin-bottom:12px">
           <div style="font-size:13px;font-weight:700;color:#389e0d;margin-bottom:6px">⭐ 应录尽录</div>
           ${P.yinglu.text ? `<div style="font-size:14px;color:#135200;line-height:1.7">${esc(P.yinglu.text)}</div>` : ''}
           ${P.yinglu.scaleNote ? `<div style="font-size:12px;color:#237804;line-height:1.7;margin-top:8px;padding-top:8px;border-top:1px dashed #95de64">${esc(P.yinglu.scaleNote)}</div>` : ''}
         </div>`
      : `<div style="background:#f6ffed;border:1px solid #b7eb8f;border-left:4px solid #52c41a;border-radius:12px;padding:12px 14px;margin-bottom:12px">
           <div style="font-size:13px;font-weight:700;color:#389e0d;margin-bottom:6px">📉 ${esc(P.yinglu.label || '录取情况')}</div>
           ${P.yinglu.text ? `<div style="font-size:14px;color:#135200;line-height:1.7">${esc(P.yinglu.text)}</div>` : ''}
           ${P.yinglu.scaleNote ? `<div style="font-size:12px;color:#237804;line-height:1.7;margin-top:8px;padding-top:8px;border-top:1px dashed #95de64">${esc(P.yinglu.scaleNote)}</div>` : ''}
         </div>`)
    : '';

  // 该校的具体政策（仅当有逐校数据时）
  const schoolBlock = schoolPolicy
    ? `<div style="background:${(schoolYinglu || schoolYinglu2) ? 'linear-gradient(135deg,#f6ffed,#d9f7be)' : '#f5f5f5'};
              border:${(schoolYinglu || schoolYinglu2) ? '2px solid #52c41a' : '1px solid #d9d9d9'};
              border-radius:12px;padding:12px 14px;margin-bottom:12px">
         <div style="font-size:13px;font-weight:700;color:${(schoolYinglu || schoolYinglu2) ? '#389e0d' : '#595959'};margin-bottom:6px">
           ${(schoolYinglu || schoolYinglu2) ? '⭐ ' : ''}${esc(c.name)} · 2026年章程原文${(schoolYinglu || schoolYinglu2) ? '（应录尽录）' : ''}
         </div>
         <div style="font-size:14px;color:#262626;line-height:1.7">${esc(schoolPolicy)}</div>
       </div>`
    : '';

  const srcBlock = (P && P.sources && P.sources.length)
    ? `<div style="font-size:12px;color:var(--text-light);margin-top:8px;line-height:1.6">
         来源：${P.sources.map((s) => `<a href="${esc(s)}" target="_blank" rel="noopener" style="color:var(--primary);word-break:break-all">${esc(s)}</a>`).join('<br>')}
       </div>`
    : '';

  // 收纳：关键结论（应录尽录 / 可多报）留在外面始终可见，政策正文折进 <details>
  panel.innerHTML = `
    <div class="about-section" style="margin:8px 12px">
      ${header}
      ${specialHighlightHtml(P, esc)}
      <div class="zx-fold-below">
        ${yingluBlock}
        ${schoolBlock}
      </div>
      <details class="zx-fold zx-fold-inline">
        <summary>
          <span>📖 详细政策说明</span>
          <span class="zx-fold-hint">
            <span class="zx-fold-hint-text">点击展开</span>
            <span class="zx-fold-collapse-text">点击收起</span>
            <span class="zx-fold-arrow">▼</span>
          </span>
        </summary>
        <div class="zx-fold-body" style="padding:12px 0 0">
          ${sec('政策说明', esc(P && P.intro))}
          ${sec('报考条件', esc(P && P.condition))}
          ${regionHtml}
          ${sec('考试办法', esc(P && P.exam))}
          ${sec('录取政策', esc(P && P.admission))}
          ${sec('定向协议与毕业去向', esc(P && P.agreement))}
          ${srcBlock}
        </div>
      </details>
      <div class="note" style="margin-top:10px">以上为该专项的政策说明；各院校具体测试科目、分值以院校当年招生章程为准。</div>
    </div>`;
}

/**
 * 院校详情页的返回按钮。
 *
 * 优先用 document.referrer 回到**来源页的完整 URL**（含查询串），
 * 这样从「中职起点 → 🎓 对口本科」进来的，返回时仍停在对口本科栏，
 * 而不是掉回默认的中职专科栏（history.back() 在部分浏览器里会丢掉查询串）。
 * referrer 不可用（直接打开、跨域）时退回 history.back()。
 */
function goBackSmart() {
  try {
    const ref = document.referrer;
    if (ref) {
      const u = new URL(ref);
      if (u.origin === location.origin) {
        // 来源页是本站页面 → 直接跳回去（保留 ?tab= 之类的查询串）
        location.href = u.href;
        return;
      }
    }
  } catch (e) { /* 解析失败就走下面的兜底 */ }
  if (history.length > 1) history.back();
  else location.href = 'index.html';
}

/**
 * 对口本科院校的「招生计划」面板。
 *
 * 与高职院校不同，对口本科：
 *   · 考试口径是「文化素质测试 300 + 职业技能考试 450 = 750」，没有普高/中职/专项三列计划，
 *     所以不复用那张分专业计划表（复用了每格都是「—」，前面就是被这么撑出空表格的）；
 *   · 招生规模小，因此直接给「招生计划 + 专业清单」，
 *     2026 录取分数线放在并列的「录取分数」标签里（见 renderDuikouBenkeScorePanel）。
 *
 * @param {object} c 院校对象（COLLEGES 中的对口本科条目）
 */
function renderDuikouBenkePlanPanel(c) {
  const panel = document.getElementById('panel-plan');
  if (!panel) return;
  const esc = (s) => String(s == null ? '' : s);

  const majors = c.majors || [];
  const planTotal = c.plan2026Benke || majors.reduce((a, m) => a + (Number(m.plan2026) || 0), 0);
  const bkExam = c.bkExam || {};

  // ---- 招生专业清单（名称 / 大类 / 计划 / 学费 / 职业技能测试科目）----
  const MC = (typeof MAJOR_CATEGORIES !== 'undefined') ? MAJOR_CATEGORIES : {};
  const key2name = {};
  Object.values(MC).forEach((v) => { if (v && v.key) key2name[v.key] = v.name; });
  const majorRows = majors.map((m) => `<tr>
      <td>${esc(m.name)}</td>
      <td style="font-size:12px">${esc(key2name[m.category] || m.categoryText || '—')}</td>
      <td style="text-align:right;font-weight:600">${m.plan2026 != null ? esc(m.plan2026) : '—'}</td>
      <td style="text-align:right">${m.fee ? esc(m.fee) + ' 元' : (m.tuitionText ? esc(m.tuitionText) : '—')}</td>
      <td style="font-size:12px;color:#666">${esc(String(m.examSubjects || '').slice(0, 120))}${String(m.examSubjects || '').length > 120 ? '…' : ''}</td>
    </tr>`).join('');

  panel.innerHTML = `
    <div class="about-section" style="margin:8px 12px">
      <h3>📋 招生计划（2026年）</h3>
      <p style="font-size:16px;font-weight:600;color:var(--primary)">对口本科 ${planTotal} 人 · ${majors.length} 个专业</p>
      ${bkExam.scoreFormula || c.scoreComposition
        ? `<div style="font-size:12.5px;color:#595959;line-height:1.7;margin-top:6px">${esc(String(bkExam.scoreFormula || c.scoreComposition).slice(0, 300))}</div>`
        : ''}
    </div>

    <div class="about-section" style="margin:8px 12px">
      <h3>📚 招生专业（2026年）</h3>
    </div>
    <div class="table-wrap" style="margin:0 12px">
      <table>
        <thead><tr>
          <th>专业名称</th><th>所属大类</th><th style="text-align:right">计划</th>
          <th style="text-align:right">学费(元/年)</th><th>职业技能测试</th>
        </tr></thead>
        <tbody>${majorRows || '<tr><td colspan="5" style="text-align:center;color:#999">暂无数据</td></tr>'}</tbody>
      </table>
    </div>
    <div style="padding:8px 12px;font-size:12px;color:var(--text-light)">注：数据来源为该校 2026 年面向中职毕业生对口招生章程，最终招生专业及计划以安徽省教育厅下达为准。</div>
  `;
}

/**
 * 对口本科院校的「录取分数」面板（与 招生计划 / 录取规则 并列的第三个标签）。
 *
 * 分数线分三种**互不可比**的口径，必须分组展示：
 *   ① 普通类：总分（满分 750）
 *   ② 艺术/体育类：综合分（满分约 350）
 *   ③ 其他控制线：免测项目的文化课线、专业大类线（量纲各不相同）
 *
 * @param {object} c 院校对象（COLLEGES 中的对口本科条目）
 */
function renderDuikouBenkeScorePanel(c) {
  const panel = document.getElementById('panel-score');
  if (!panel) return;
  const esc = (s) => String(s == null ? '' : s);
  const sc = c.bkScores2026;

  if (!sc || !sc.lines || !sc.lines.length) {
    panel.innerHTML = `
      <div class="about-section" style="margin:8px 12px">
        <h3>📊 2026 年录取分数线</h3>
        <div style="font-size:13px;color:#8c8c8c;line-height:1.8">
          ${c.scores2026Checked
            ? `该校已公布录取分数线，但未能取得官网原文${c.scoreNote ? `<div style="margin-top:6px;font-size:12.5px">${esc(String(c.scoreNote).slice(0, 220))}</div>` : ''}`
            : '该校 2026 年对口招生录取分数线暂未收录。'}
        </div>
      </div>`;
    return;
  }

  const noteOf = (l) => String(l.note || '');
  const isSpecial = (l) => /文化课|免测|大类线/.test(noteOf(l));
  const isComp = (l) => !isSpecial(l) && (/综合/.test(noteOf(l)) || sc.scoreType === '综合分');
  const groups = [
    { label: '普通类（按总分，满分 750）', rows: sc.lines.filter((l) => !isSpecial(l) && !isComp(l)) },
    { label: '艺术/体育类（按综合分，满分约 350）', rows: sc.lines.filter(isComp) },
    { label: '⚠️ 其他控制线（口径与总分不同，请勿直接比较）', rows: sc.lines.filter(isSpecial) },
  ].filter((g) => g.rows.length);

  panel.innerHTML = `
    <div class="about-section" style="margin:8px 12px">
      <h3>📊 2026 年录取分数线${sc.publishedAt ? `（${esc(sc.publishedAt)} 公布）` : ''}</h3>
      ${sc.scoreFormulaNote ? `<div style="font-size:12.5px;color:#595959;line-height:1.7;margin-bottom:6px">${esc(sc.scoreFormulaNote)}</div>` : ''}
      ${groups.map((g) => `
        ${groups.length > 1 ? `<div style="font-size:12.5px;font-weight:600;color:#a8071a;margin:10px 0 2px">${g.label}</div>` : ''}
        <div class="table-wrap">
          <table>
            <thead><tr><th>专业（方向）</th><th style="text-align:right">录取线</th><th>说明</th></tr></thead>
            <tbody>${g.rows.map((l) => `<tr>
              <td>${esc(l.major)}</td>
              <td style="text-align:right;font-weight:700;color:#cf1322">${esc(l.score)}</td>
              <td style="font-size:12px;color:#666">${esc(l.note || '')}</td>
            </tr>`).join('')}</tbody>
          </table>
        </div>`).join('')}
      ${sc.sourceUrl ? `<div style="font-size:11.5px;margin-top:8px"><a href="${esc(sc.sourceUrl)}" target="_blank" rel="noopener" style="color:var(--primary)">分数线原文 ›</a></div>` : ''}
      <div style="font-size:11.5px;color:var(--text-light);margin-top:8px;line-height:1.7">
        注：分数线为该院校 2026 年对口招生公示数据。普通类按总分（文化素质测试＋专业理论＋技能测试＋政策加分）排序；
        艺术/体育类按各校规定的综合成绩排序，两者不可直接比较。
      </div>
    </div>`;
}

/**
 * 院校详情页「🎖️ 专项政策」：从「全部专项」点进来时，把三个专项的招生说明一并展示。
 *
 * 与单专项面板（renderSpecialPolicyPanel）内容同源，都来自 js/special-policy.js；
 * 这里只负责把三个专项依次铺开，方便学生在一个页面里横向比较。
 */
function renderAllSpecialPolicyPanel(c) {
  const panel = document.getElementById('panel-score');
  if (!panel) return;
  const tabEl = document.querySelector('.tab-switch .tab-item[data-tab="score"]');
  if (tabEl) tabEl.textContent = '🎖️ 专项政策';

  const esc = (s) => String(s == null ? '' : s);
  const sec = (title, body) => body
    ? `<div style="margin-bottom:10px"><div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:3px">${title}</div>
       <div style="font-size:13.5px;color:#262626;line-height:1.7">${body}</div></div>`
    : '';

  const kinds = ['tuiyi', 'laoxiang', 'xiangcun'];
  const blockOf = (k) => {
    const P = (typeof SPECIAL_POLICY !== 'undefined') ? SPECIAL_POLICY[k] : null;
    if (!P) return '';

    const schoolPolicy = (k === 'tuiyi' && c.retiredMilitaryPolicy) ? c.retiredMilitaryPolicy : '';
    const schoolYinglu = schoolPolicy &&
      (schoolPolicy.indexOf('应录尽录') >= 0 || schoolPolicy.indexOf('参加测试即录取') >= 0 || schoolPolicy.indexOf('全部录取') >= 0);

    let regionHtml = '';
    if (P.regions && P.regions.list && P.regions.list.length) {
      regionHtml = sec('适用地区（仅这些地方的考生可报考）',
        (P.regions.batchNote ? `<div style="margin-bottom:5px">${esc(P.regions.batchNote)}</div>` : '') +
        `<div style="background:#f6f8ff;border:1px solid #d6e4ff;border-radius:8px;padding:8px 10px;line-height:1.9">${P.regions.list.map(esc).join('、')}</div>` +
        `<div style="font-size:12px;color:var(--text-light);margin-top:3px">共 ${P.regions.list.length} 个</div>`);
    } else if (P.regions && P.regions.note) {
      regionHtml = sec('适用地区', esc(P.regions.note));
    }

    const yingluBlock = (P.yinglu && P.yinglu.text)
      ? (P.yinglu.has
        ? `<div style="background:linear-gradient(135deg,#f6ffed,#d9f7be);border:1px solid #52c41a;border-radius:8px;padding:8px 10px;margin-bottom:10px">
             <div style="font-size:12px;font-weight:700;color:#389e0d;margin-bottom:3px">⭐ 应录尽录</div>
             <div style="font-size:13px;color:#135200;line-height:1.7">${esc(P.yinglu.text)}</div>
           </div>`
        : `<div style="background:#f5f5f5;border:1px solid #d9d9d9;border-radius:8px;padding:8px 10px;margin-bottom:10px">
             <div style="font-size:12px;font-weight:700;color:#595959;margin-bottom:3px">录取方式</div>
             <div style="font-size:13px;color:#262626;line-height:1.7">${esc(P.yinglu.text)}</div>
           </div>`)
      : '';

    const schoolBlock = schoolPolicy
      ? `<div style="background:${schoolYinglu ? 'linear-gradient(135deg,#f6ffed,#d9f7be)' : '#fafafa'};
                border-left:3px solid ${schoolYinglu ? '#52c41a' : 'var(--primary)'};
                border-radius:8px;padding:8px 10px;margin-bottom:10px">
           <div style="font-size:12px;font-weight:700;color:${schoolYinglu ? '#389e0d' : 'var(--primary)'};margin-bottom:3px">
             ${schoolYinglu ? '⭐ ' : ''}${esc(c.name)} · 2026年章程原文
           </div>
           <div style="font-size:13px;color:#262626;line-height:1.7">${esc(schoolPolicy)}</div>
         </div>`
      : '';

    // 收纳：每个专项一块可折叠。标题 + 关键结论（应录尽录/可多报）留在外面，
    // 详细的报考条件/地区名单/考试办法/录取政策折进 <details>。
    return `
      <details class="zx-fold zx-fold-inline" style="margin:0 0 10px;box-shadow:none;border:1px solid #eee">
        <summary>
          <span>${esc(P.icon)} ${esc(P.fullName || P.name)}</span>
          <span class="zx-fold-hint">
            <span class="zx-fold-hint-text">点击展开</span>
            <span class="zx-fold-collapse-text">点击收起</span>
            <span class="zx-fold-arrow">▼</span>
          </span>
        </summary>
        <div class="zx-fold-body">
          ${specialHighlightHtml(P, esc)}
          ${yingluBlock}
          ${schoolBlock}
          ${sec('政策说明', esc(P.intro))}
          ${sec('报考条件', esc(P.condition))}
          ${regionHtml}
          ${sec('考试办法', esc(P.exam))}
          ${sec('录取政策', esc(P.admission))}
          ${sec('定向协议与毕业去向', esc(P.agreement))}
        </div>
      </details>`;
  };

  panel.innerHTML = `
    <div class="about-section" style="margin:8px 12px">
      <div style="font-size:15px;font-weight:700;margin-bottom:8px">⭐ 专项计划招生说明</div>
      <div style="font-size:13px;color:#595959;line-height:1.7;margin-bottom:12px">
        以下为三类专项计划各自的招生说明，点击可展开。该校 2026 年招收哪些专项，见「招生计划」标签页。
      </div>
      ${kinds.map(blockOf).join('')}
      <div class="note" style="margin-top:4px">各院校具体测试科目、分值以院校当年招生章程为准。</div>
    </div>`;
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

  // 对比表统一用「显示全文 + 自动换行」，不再截断：
  // 之前用 … 截断 + title 悬停提示，手机上根本看不到完整信息。
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function txt(v, missing) {
    const empty = v === undefined || v === null || v === '';
    if (empty) return `<span class="cmp-miss">${esc(missing || '—')}</span>`;
    return `<span class="cmp-full">${esc(v)}</span>`;
  }

  const planParts = (c) => {
    const arr = [];
    if (c.plan2026Gaozhong) arr.push('普高 ' + c.plan2026Gaozhong);
    if (c.plan2026Zhongzhi) arr.push('中职 ' + c.plan2026Zhongzhi);
    if (c.plan2026Zhuanxiang) arr.push('专项 ' + c.plan2026Zhuanxiang);
    return arr.length ? arr.join(' · ') : '';
  };

  const scoreCell = (c) => {
    const s = compactScore2026(c);
    const tag = s.tag ? `<span class="cmp-tag">${esc(s.tag)}</span>` : '';
    return `<span class="cmp-scorebox"><span class="cmp-score">${esc(s.text)}</span>${tag}</span>`;
  };

  // 行定义：{ label, fn } —— fn 返回 HTML
  const SECTIONS = [
    {
      title: '基本信息',
      rows: [
        { label: '城市', fn: (c) => txt(c.city) },
        { label: '办学层次', fn: (c) => txt(c.isUndergraduate ? '本科' : '专科（高职）') },
        { label: '性质', fn: (c) => txt(c.nature) },
        { label: '类型', fn: (c) => txt(c.type) },
        { label: '院校地址', fn: (c) => txt(c.address, '待补充') },
        {
          label: '官网',
          fn: (c) => (c.website
            ? `<a class="cmp-link" href="${esc(c.website)}" target="_blank" rel="noopener">${esc(c.website.replace(/^https?:\/\//, ''))}</a>`
            : txt('', c.websiteNote || '官网待补')),
        },
      ],
    },
    {
      title: '2026 招生',
      rows: [
        { label: '招生计划', fn: (c) => txt(c.plan2026, '待公布') },
        { label: '计划分项', fn: (c) => txt(planParts(c), '—') },
        { label: '校考占比', fn: (c) => txt(c.examRatio || (c.stoppedEnrollment ? '已停招' : ''), c.examRatioNote || '待补') },
        { label: '面试', fn: (c) => txt(c.interview && c.interview.hasInterview ? '有（' + (c.interview.desc || c.interview.type || '需面试') + '）' : '无') },
        { label: '录取规则', fn: (c) => txt(c.admissionRule2026, '详见招生章程') },
      ],
    },
    {
      title: '2026 分数',
      rows: [
        { label: '最低分', fn: scoreCell },
        { label: '中职最低', fn: (c) => txt(c.minScore2026Zhongzhi, '未公布') },
        { label: '分数说明', fn: (c) => txt(c.score2026, '暂未查到官方公布分数') },
      ],
    },
    {
      title: '专业与费用',
      rows: [
        { label: '招生专业数', fn: (c) => txt((c.majors || []).length ? (c.majors || []).length + ' 个' : '', '待补充') },
        { label: '部分专业', fn: (c) => txt((c.majors || []).slice(0, 8).map((m) => m.name).join('、') + ((c.majors || []).length > 8 ? ' 等' : ''), '待补充') },
        { label: '学费说明', fn: (c) => txt(c.feePolicyNote, '详见招生章程') },
      ],
    },
    {
      title: '就业与规模',
      rows: [
        { label: '在校生规模', fn: (c) => txt(c.scale, '待补') },
        { label: '就业率', fn: (c) => txt(c.employmentRate, '待补') },
        { label: '专升本率', fn: (c) => txt(c.upgradeRate, '待补') },
      ],
    },
    {
      title: '联系方式',
      rows: [
        { label: '招生办电话', fn: (c) => txt(c.phone, '待补') + (c.phoneNote ? '<div style="font-size:11px;color:#8a8f99;margin-top:3px;line-height:1.5">' + esc(c.phoneNote) + '</div>' : '') },
      ],
    },
  ];

  // 「只看不一样」：值全相同的行默认隐藏（长文本下能省很多滚动）
  const rowHTML = (r) => {
    const cells = list.map((c) => `<td>${r.fn(c)}</td>`).join('');
    const vals = list.map((c) => {
      const d = document.createElement('div');
      d.innerHTML = r.fn(c);
      return (d.textContent || '').trim();
    });
    const same = vals.every((v) => v === vals[0]);
    return `<tr class="cmp-row${same ? ' cmp-same' : ''}"><td class="dim">${esc(r.label)}</td>${cells}</tr>`;
  };

  body.innerHTML = `
    <div class="cmp-hint">已选 ${list.length}/4 所 · 全部信息完整显示，表格可左右滑动</div>
    <div style="margin:0 12px 8px;display:flex;gap:8px">
      <button id="cmp-share-btn" style="flex:1;padding:6px 0;border:1px solid var(--primary);border-radius:6px;background:#fff;color:var(--primary);font-size:13px;cursor:pointer">🔗 复制分享链接</button>
    </div>
    <label class="cmp-diffbar"><input type="checkbox" id="cmp-diff"> 只看有差异的项</label>
    <div class="table-wrap cmp-wrap">
      <table class="compare-table cmp-full-table">
        <thead><tr><th class="dim">对比项</th>${list.map(c => `
          <th>
            <a href="college-detail.html?id=${c.id}" class="cmp-name">${esc(c.name)}</a>
            <span class="cmp-remove" data-id="${c.id}" title="移除 ${esc(c.name)}">✕</span>
          </th>`).join('')}</tr></thead>
        <tbody>
          ${SECTIONS.map((s) => `
            <tr class="cmp-sec"><td colspan="${list.length + 1}">${esc(s.title)}</td></tr>
            ${s.rows.map(rowHTML).join('')}
          `).join('')}
        </tbody>
      </table>
    </div>`;

  const diffBox = document.getElementById('cmp-diff');
  if (diffBox) {
    diffBox.addEventListener('change', () => {
      body.querySelectorAll('.cmp-row.cmp-same').forEach((tr) => {
        tr.style.display = diffBox.checked ? 'none' : '';
      });
    });
  }

  // 复制分享链接
  const shareBtn = document.getElementById('cmp-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const url = location.origin + location.pathname + '?ids=' + ids.join(',');
      navigator.clipboard.writeText(url).then(() => toast('分享链接已复制')).catch(() => toast('复制失败'));
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

  body.innerHTML = `
    <div style="margin:0 12px 10px;display:flex;justify-content:flex-end">
      <button id="fav-copy-btn" style="padding:6px 14px;border:1px solid var(--primary);border-radius:6px;background:#fff;color:var(--primary);font-size:13px;cursor:pointer">📋 复制清单</button>
    </div>
  ` + list.map(c => `
    <div class="college-card" style="position:relative">
      <div class="head">
        <div class="name">${c.name}</div>
        <span class="score" style="color:var(--danger);font-weight:600">${scoreLabel(c)}</span>
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

  // 复制清单
  const copyBtn = document.getElementById('fav-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const lines = list.map((c, i) => `${i + 1}. ${c.name}（${c.city} · ${c.nature} · ${c.type}）${scoreLabel(c) !== '分数待查证' ? ' — ' + scoreLabel(c) : ''}`);
      const text = `我收藏了 ${list.length} 所安徽单招院校：\n${lines.join('\n')}\n\n来源：https://heyanxingyan.github.io/anhui-danzhao/`;
      navigator.clipboard.writeText(text).then(() => toast('已复制到剪贴板')).catch(() => toast('复制失败，请手动复制'));
    });
  }

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
  { q: '本站的分数线是官方公布的吗？', a: '本站的录取最低分只收录院校官网、安徽省教育招生考试院页面上可查证的数字，每条都附来源链接与原文摘录；查不到的院校显示「待查证」，不提供估算分数。2026年数据供2027考生参考，实际录取分以官方最新公布为准。' },
  { q: '单招没被录取怎么办？', a: '单招未录取不影响后续普通高考，考生可继续参加6月普通高考及志愿填报。' },
  { q: '在哪里报名？什么时候报名？', a: '高考报名网站为 gkbm.ahzsks.cn，2027年高考报名时间为2026年10月17日10:00至21日17:00（官方已公布）。单招报名预计2027年1月下旬，文化测试预计2027年3月上旬，具体以安徽省教育招生考试院最新通知为准。' },
  { q: '民办院校和公办院校文凭一样吗？', a: '文凭均为国家承认的全日制学历，区别主要在学费（民办较高）与办学性质，毕业证效力相同。' },
  { q: '如何选择适合自己的院校？', a: '建议综合参考：2026 各校最低分（本站分数页）、就业/专升本率、校考占比、有无面试、所在城市与专业，并用"分数推荐"按冲/稳/保梯度搭配。' }
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
/* 推荐用的参考线 = 2026 官方公布的最低录取分。
 * 历史上有一版估算出来的 minScore2024/minScore2025（与官方分全面冲突，已剔除），
 * 绝不能再拿它当推荐依据，也绝不为了凑数去估一个。
 * 返回 null 表示这所院校没有可比的官方分 —— 推荐页直接跳过，不排行。 */
function predLine(c) {
  if (c.minScore2026 != null && isFinite(c.minScore2026)) return Number(c.minScore2026);
  return null;
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
      if (line == null) return;           // 没有官方分就不参与推荐
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
          <span class="score" style="color:${tone.color};font-weight:600">${compactScore2026(c).text}</span>
        </div>
        <div class="tags">
          <span class="tag ${c.nature === '公办' ? 'tag-public' : 'tag-private'}">${c.nature}</span>
          <span class="tag tag-type">${c.city}</span>
        </div>
        <div class="meta-row"><span>${tone.label}（线差 ${Math.abs(diff)} 分）</span></div>
      </a>`;
    }

    const total = chong.length + wen.length + bao.length;
    if (!total) {
      // 全部院校都没有官方可查证的分数线时，别让用户看到三个空档位（像坏了）
      body.innerHTML = `
        <div class="empty" style="padding:40px 20px;text-align:center">
          <div style="font-size:44px;margin-bottom:12px">📭</div>
          <div style="font-size:16px;font-weight:600;margin-bottom:8px">暂无可比对的官方分数线</div>
          <div style="font-size:13px;color:#8c8c8c;line-height:1.9">
            分数推荐需要院校官方公布的录取最低分作参照。<br>
            本站在持续从院校官网补充，未查到的院校一律留空，不用估算值代替。<br>
            可先到<a href="score-trend.html" style="color:var(--primary)">2026 各校最低分</a>看已查明的院校。
          </div>
        </div>`;
      return;
    }

    body.innerHTML = `
      <div class="rec-group"><div class="rec-title" style="color:#ff4d4f">🔥 冲一冲（${chong.length}）</div>
        ${chong.length ? chong.map(x => card(x, { color:'#ff4d4f', label:'冲刺' })).join('') : '<div class="note">本档暂无匹配院校</div>'}</div>
      <div class="rec-group"><div class="rec-title" style="color:#1677ff">🎯 稳一稳（${wen.length}）</div>
        ${wen.length ? wen.map(x => card(x, { color:'#1677ff', label:'稳妥' })).join('') : '<div class="note">本档暂无匹配院校</div>'}</div>
      <div class="rec-group"><div class="rec-title" style="color:#52c41a">🛡️ 保一保（${bao.length}）</div>
        ${bao.length ? bao.map(x => card(x, { color:'#52c41a', label:'保底' })).join('') : '<div class="note">本档暂无匹配院校</div>'}</div>
      <div class="note" style="text-align:center">参照各校官方公布的最低录取分，梯度区间为±5/5-15分，仅供参考</div>`;
  }

  btn.addEventListener('click', run);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
}

/* ============================================================
 * 14.5 校园环境页
 * 数据：js/campus-data.js 的 CAMPUS_DATA（91 所，官网/百科/阳光高考/在校生分享整理）
 * 展示：占地与校区、宿舍（几人间/床型）、位置周边（商圈/交通）、
 *       日常管理（晚自习/早自习/校园跑/晚训），页首有「仅供参考」声明。
 * ============================================================ */
function campusEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

// 从 possibly-混合文本的 totalMu 中提取数字亩数（提取不到返回 null）
function campusMuNum(v) {
  if (typeof v === 'number') return v;
  const m = String(v || '').match(/(\d[\d,]*)\s*亩/);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

// 床型是否"已落实"——开头是留白措辞的一律视为未核实，避免被正文里引用的字样误判
function campusBedKnown(bed) {
  const b = String(bed || '').trim();
  if (!b) return false;
  // 留白措辞（未核实/未查到/未公布/未明确 开头）→ 未落实
  if (/^(还没核实到位|未查到|未找到|未公布|未明确)/.test(b)) return false;
  // 非官方口径（学生侧 / 第三方、仅供参考）→ 不算官方确认，不计入「上床下桌」官方筛选
  if (/(非官方|仅供参考|学生侧|第三方（无年份）)/.test(b)) return false;
  return true;
}

// 卡片头部摘要用的短判断
function campusShortBed(dorm) {
  const b = String(dorm.bed || '').trim();
  if (/^(还没核实到位|未查到|未找到|未公布|未明确)/.test(b)) return '床型未核实';
  const hasDesk = /上床下桌/.test(b);
  const hasBunk = /上下铺|上下床/.test(b);
  const isUnofficial = /(非官方|仅供参考|学生侧|第三方（无年份）)/.test(b);
  if (isUnofficial) {
    if (hasDesk && hasBunk) return '上床下桌/上下铺混合（学生侧）';
    if (hasDesk) return '上床下桌（学生侧）';
    if (hasBunk) return '上下铺（学生侧）';
    return '床型未核实（学生侧有说法）';
  }
  if (/混合/.test(b)) return '上下铺/上床下桌混合';
  if (hasDesk && hasBunk) return '上床下桌为主，部分上下铺';
  if (hasDesk) return '上床下桌';
  if (hasBunk) return '上下铺';
  return b.slice(0, 12);
}

function campusShortRule(s) {
  const t = String(s || '');
  if (/未查到|^$/.test(t)) return '未查到';
  if (/^无/.test(t)) return '无';
  if (/^有/.test(t)) return '有';
  if (/部分|大一|年级|学院|专业/.test(t)) return '部分/分年级';
  return t.slice(0, 8);
}

const CAMPUS_FILTERS = [
  { key: 'all', name: '全部' },
  { key: 'public', name: '公办' },
  { key: 'private', name: '民办' },
  { key: 'evening', name: '有晚自习' },
  { key: 'bed', name: '上床下桌' }
];

let campusState = { kw: '', filter: 'all' };

function renderCampus() {
  renderTabbar('me');

  const collegeMap = {};
  COLLEGES.forEach(c => { collegeMap[c.id] = c; });

  const filterBar = document.getElementById('campus-filters');
  const countEl = document.getElementById('campus-count');
  const listEl = document.getElementById('campus-list');
  const searchInput = document.getElementById('campus-search-input');
  if (!listEl || typeof CAMPUS_DATA === 'undefined') return;

  filterBar.innerHTML = CAMPUS_FILTERS.map(f =>
    `<button type="button" class="filter-chip ${f.key === 'all' ? 'active' : ''}" data-f="${f.key}">${f.name}</button>`
  ).join('');

  const match = (d) => {
    const c = collegeMap[d.id] || {};
    if (campusState.kw && !d.name.includes(campusState.kw)) return false;
    switch (campusState.filter) {
      case 'public': return c.nature === '公办';
      case 'private': return c.nature === '民办';
      case 'evening': return /^有/.test(d.rules.eveningStudy || '');
      case 'bed': return campusBedKnown(d.dorm.bed) && /上床下桌/.test(d.dorm.bed || '');
      default: return true;
    }
  };

  const render = () => {
    const list = CAMPUS_DATA.filter(match);
    countEl.textContent = `共 ${list.length} 所院校${campusState.filter !== 'all' || campusState.kw ? `（全部 ${CAMPUS_DATA.length} 所）` : ''}`;

    if (!list.length) {
      listEl.innerHTML = '<div class="campus-empty">没有找到匹配的院校，换个关键词或筛选条件试试</div>';
      return;
    }

    listEl.innerHTML = list.map(d => {
      const c = collegeMap[d.id] || {};
      const mu = campusMuNum(d.totalMu);
      const confLabel = d.confidence === 'high' ? '信息较全' : '部分待核';
      const campuses = (d.campuses || []).map(cp => `
        <div class="campus-campus">
          <span class="cn">${campusEsc(cp.name)}</span>${cp.mu ? (typeof cp.mu === 'number' ? ` · <span class="cmu">${cp.mu} 亩</span>` : ` · <span class="cmu">${campusEsc(cp.mu)}</span>`) : ''}
          ${cp.addr ? `<div>地址：${campusEsc(cp.addr)}</div>` : ''}
          ${cp.loc ? `<div>${campusEsc(cp.loc)}</div>` : ''}
        </div>`).join('');
      const srcs = (d.sources || []).map(s => campusEsc(s)).join('；');

      return `
      <div class="campus-item" data-id="${d.id}">
        <div class="campus-head">
          <div class="campus-head-main">
            <div class="campus-name">${campusEsc(d.name)}
              <span class="campus-badge ${d.confidence === 'high' ? 'high' : 'medium'}">${confLabel}</span>
            </div>
            <div class="campus-meta">${campusEsc(c.city || '')}${c.nature ? ' · ' + campusEsc(c.nature) : ''}${c.type ? ' · ' + campusEsc(c.type) : ''}${d.campuses && d.campuses.length > 1 ? ' · ' + d.campuses.length + ' 个校区' : ''}</div>
            <div class="campus-stats">
              <span>占地 <b>${mu ? mu + ' 亩' : '见详情'}</b></span>
              <span>宿舍 <b>${campusEsc(campusShortBed(d.dorm))}</b></span>
              <span>晚自习 <b>${campusEsc(campusShortRule(d.rules.eveningStudy))}</b></span>
            </div>
          </div>
          <span class="campus-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></span>
        </div>
        <div class="campus-body">
          <div class="campus-sec">
            <div class="campus-sec-title"><span class="campus-sec-emoji">🏫</span>校园与占地</div>
            <div class="campus-kv"><span class="k">总占地：</span>${campusEsc(d.totalMu)}</div>
            ${campuses}
          </div>
          <div class="campus-sec">
            <div class="campus-sec-title"><span class="campus-sec-emoji">🛏</span>宿舍</div>
            <div class="campus-kv"><span class="k">几人间：</span>${campusEsc(d.dorm.rooms)}</div>
            <div class="campus-kv"><span class="k">床型：</span>${campusEsc(d.dorm.bed)}</div>
            <div class="campus-kv"><span class="k">配套：</span>${campusEsc(d.dorm.facilities)}</div>
          </div>
          <div class="campus-sec">
            <div class="campus-sec-title"><span class="campus-sec-emoji">📍</span>位置与周边</div>
            <div class="campus-kv"><span class="k">位置：</span>${campusEsc(d.location.summary)}</div>
            <div class="campus-kv"><span class="k">商圈：</span>${campusEsc(d.location.mall)}</div>
            <div class="campus-kv"><span class="k">交通：</span>${campusEsc(d.location.metro)}</div>
            ${d.location.note ? `<div class="campus-kv"><span class="k">补充：</span>${campusEsc(d.location.note)}</div>` : ''}
          </div>
          <div class="campus-sec">
            <div class="campus-sec-title"><span class="campus-sec-emoji">📋</span>日常管理</div>
            <div class="campus-rule-row"><span class="rk">晚自习</span><span>${campusEsc(d.rules.eveningStudy)}</span></div>
            <div class="campus-rule-row"><span class="rk">早自习</span><span>${campusEsc(d.rules.morningStudy)}</span></div>
            <div class="campus-rule-row"><span class="rk">校园跑</span><span>${campusEsc(d.rules.campusRun)}</span></div>
            <div class="campus-rule-row"><span class="rk">晚训</span><span>${campusEsc(d.rules.eveningTraining)}</span></div>
          </div>
          ${srcs ? `<div class="campus-src"><span class="src-note">原始资料出处：下面保留的是各网站/报刊的原名（如「考动力」「高校数据」等是第三方高考资讯站的站名），方便你自行核对。</span><br>来源：${srcs}</div>` : ''}
        </div>
      </div>`;
    }).join('');

    listEl.querySelectorAll('.campus-head').forEach(head => {
      head.addEventListener('click', () => head.parentElement.classList.toggle('open'));
    });
  };

  filterBar.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      filterBar.querySelectorAll('.filter-chip').forEach(x => x.classList.remove('active'));
      chip.classList.add('active');
      campusState.filter = chip.dataset.f;
      render();
    });
  });

  searchInput.addEventListener('input', () => {
    campusState.kw = searchInput.value.trim();
    render();
  });

  render();
}
