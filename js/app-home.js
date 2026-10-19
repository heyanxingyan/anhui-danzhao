/* ============================================================
 * 安徽单招信息查询 · 首页专用脚本
 *
 * ⚠️ 本文件由 tools/build-home-js.js 从 js/app.js 自动裁剪生成，请勿手改。
 *    改动 app.js 后请重跑：node tools/build-home-js.js
 *
 * 只包含首页（index.html）渲染所需的 7 个函数
 * + 3 个常量，按源码原顺序排列。
 * 完整版 app.js 用于其它 26 个页面。
 *
 * 导入的函数：toast, renderTabbar, prepRegState, applyPrepStatus, initPrepCollapse, renderFooter, renderIndex
 * ============================================================ */

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

function initPrepCollapse() {
  const tl = document.querySelector('.prep-timeline');
  const btn = document.getElementById('prep-toggle');
  if (!tl || !btn) return;

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
  foot.textContent = '抖音@星焉 · xingyanheyan520 整理制作';

  const bar = document.querySelector('.tabbar');
  if (bar) { page.insertBefore(nav, bar); page.insertBefore(free, bar); page.insertBefore(foot, bar); }
  else { page.appendChild(nav); page.appendChild(free); page.appendChild(foot); }
}

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
 * 首页启动
 *
 * 原 app.js 的 DOMContentLoaded 里维护了覆盖 27 个页面的 handlers 表，
 * 那会把所有页面的渲染器都打进包里。首页只需要下面这几步。
 * ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (document.body && document.body.dataset.page === 'index') {
    if (typeof renderIndex === 'function') renderIndex();
    applyPrepStatus();
    renderFooter();
    if (typeof initPrepCollapse === 'function') initPrepCollapse();
  }
});
