/**
 * 对口本科「招生说明」内容（单一数据源）
 *
 * 为什么单独一个文件：
 *   同一份内容出现在两个地方——独立页 benke.html，以及中职起点页的「🎓 对口本科」子标签。
 *   以前两边各写一份，改一边忘一边就会不一致（卡片撑爆、宿州学院重复都是这么来的）。
 *   现在两边都调 renderBenkeIntro()，只维护这一份。
 *
 * 依赖：css/style.css 里的 .bk-* 与 .zx-fold 样式。
 */

var BENKE_FACTS = [
  { k: '考试科目', v: '文化 300 + 技能 450', n: '合计满分 750 分' },
  { k: '招生院校', v: '10 所', n: '均为公办应用型本科' },
  { k: '志愿数量', v: '1 校 + 1 专业', n: '可另按 3 所高职兼报' },
  { k: '录取分数参考', v: '约 500+ 分', n: '满分 750，热门专业更高' },
];

// 目录：锚点 id 与标题
var BENKE_NAV = [
  { id: 'bk-schools', label: '🏫 招生院校' },
  { id: 'bk-what', label: '🎓 是什么' },
  { id: 'bk-cond', label: '📝 报考条件' },
  { id: 'bk-exam', label: '📚 考试科目' },
  { id: 'bk-rule', label: '⚖️ 录取规则' },
  { id: 'bk-major', label: '🗂️ 专业类别' },
  { id: 'bk-diff', label: '🔍 与专科区别' },
  { id: 'bk-time', label: '📅 时间轴' },
];

/**
 * 需要折叠的资料块。每项 { id, title, body }。
 * body 里可以正常写 HTML；不要写 </script>（会提前闭合脚本）。
 */
var BENKE_FOLDS = [
  {
    id: 'bk-what',
    title: '🎓 什么是对口本科？',
    body:
      '<p>应用型本科高校面向中职毕业生对口招生（简称"对口本科"），是中职生升入<b>全日制普通本科</b>的重要通道。' +
      '考生参加安徽省统一<b>文化素质测试</b> + 招生院校组织的<b>职业技能测试</b>，按总分单独划线、单独录取，' +
      '毕业颁发全日制本科毕业证书、符合条件者授予学士学位。</p>',
  },
  {
    id: 'bk-cond',
    title: '📝 报考条件',
    body:
      '<p>① <b>学历要求：</b>中等职业学校（含普通中专、职业中专、职业高中、成人中专、技工学校）<b>三年制及以上毕业</b>生。</p>' +
      '<p>② <b>报名要求：</b>已完成安徽省普通高校招生考试报名（含对口招生），取得考生号。应历届中职毕业生均可报考。</p>' +
      '<p>③ <b>专业对口：</b>原则上考生中职阶段所学专业须与报考本科专业大类相对应（按专业大类报考）。</p>',
  },
  {
    id: 'bk-exam',
    title: '📚 考试科目（文化 300 + 技能 450）',
    body:
      '<p><span class="bk-num">1</span><b>文化素质测试</b>（省统一命题、统一考试）</p>' +
      '<p style="padding-left:26px">科目：语文 + 数学 + 英语，合卷考试，<b>满分300分</b>（各科各100分）。考试时间通常为3月上旬。</p>' +
      '<p><span class="bk-num">2</span><b>职业技能考试</b>（招生院校自行组织校考）</p>' +
      '<p style="padding-left:26px">按考生报考的专业大类分别命题与测试，<b>满分450分</b>，形式为技能操作或笔试+面试，时间通常为3月下旬。</p>',
  },
  {
    id: 'bk-rule',
    title: '⚖️ 成绩构成与录取规则',
    body:
      '<p><b>综合总分 = 文化素质测试 × 30% + 职业技能测试 × 70%</b>（以宿州学院等院校为例；' +
      '<u>各院校占比可能不同，以各院校当年对口招生章程为准</u>）。</p>' +
      '<p>① <b>单独划线：</b>对口本科单独划定文化素质测试合格线与职业技能测试分数线，不与普通高职混合排队。</p>' +
      '<p>② <b>单独录取：</b>按招生计划的 <b>120%</b> 左右预录取，考生须在规定时间内登录 gkbm.ahzsks.cn 网上确认；放弃者不影响后续普通高考。</p>' +
      '<p>③ <b>不占高职计划：</b>对口本科计划单列，被对口本科录取后不再参加普通高校统一招生考试。</p>',
  },
  {
    id: 'bk-major',
    title: '🗂️ 招生专业类别（19 大类）',
    body:
      '<div>' +
      ['农林牧渔', '资源环境', '能源动力', '土木建筑', '水利', '装备制造', '生物与化工', '轻工纺织',
        '食品药品与粮食', '交通运输', '电子信息', '医药卫生', '财经商贸', '旅游', '文化艺术',
        '新闻传播', '教育与体育', '公安与司法', '公共管理与服务']
        .map((t) => '<span class="bk-tag">' + t + '</span>').join('') +
      '</div>' +
      '<p style="font-size:12px;color:#999;margin-top:8px">考生按上述专业大类选择对应本科专业，不同大类之间一般不可跨类兼报。</p>',
  },
  {
    id: 'bk-diff',
    title: '🔍 对口本科 vs 高职（专科）',
    body:
      '<table class="bk-table">' +
      '<tr><th>对比项</th><th>对口本科</th><th>高职专科（分类考试）</th></tr>' +
      '<tr><td>学历层次</td><td>全日制本科</td><td>全日制专科</td></tr>' +
      '<tr><td>招生院校</td><td>应用型本科高校（10所）</td><td>高职院校（70+所）</td></tr>' +
      '<tr><td>考试科目</td><td>文化300 + 职业技能450</td><td>文化300 + 职业适应性/技能300</td></tr>' +
      '<tr><td>录取分数</td><td>较高，总分多需500分以上</td><td>相对较低，过线即可</td></tr>' +
      '<tr><td>竞争程度</td><td>计划少、竞争激烈</td><td>计划多、录取率高</td></tr>' +
      '<tr><td>毕业文凭</td><td>本科毕业证 + 学士学位</td><td>专科毕业证，可再专升本</td></tr>' +
      '</table>',
  },
  {
    id: 'bk-volunteer',
    title: '✍️ 志愿填报与录取确认',
    body:
      '<p>① 对口本科批次：可填报 <b>1 所本科高校 + 1 个专业志愿</b>（按专业大类）。</p>' +
      '<p>② 同时可兼报：在填报对口本科的同时，可另填报<b>不超过 3 所</b>高职院校分类考试志愿（本科与专科兼报，本科优先录取）。</p>' +
      '<p>③ 确认录取：预录取考生须在省规定时间内登录 gkbm.ahzsks.cn 网上确认，逾期视为放弃；一经确认录取，不得再参加普通高考。</p>',
  },
  {
    id: 'bk-line',
    title: '📈 历年分数线参考',
    body:
      '<p>对口本科因招生计划少、报考热度高，录取分数普遍高于高职专科。通常文化测试 + 职业技能测试' +
      '<b>合成分需达到500分以上</b>（满分750分）方有录取希望，热门专业（如学前教育、医学、计算机）分数线更高。</p>' +
      '<p style="color:#ad6800;font-size:12px">⚠️ 对口本科分专业大类、分院校划线，历年分数差异较大，' +
      '<b>具体以各院校当年公布的预录取最低分为准</b>。本站收录的宿州学院可查看历年分数走势。</p>',
  },
];

var BENKE_TIMELINE_TITLE = '📅 2027年对口招生时间轴';
var BENKE_TIMELINE = [
  '① 高考报名：<b>2026年10月17日10:00 — 21日17:00</b>（✅官方已公布，gkbm.ahzsks.cn）',
  '② 单招报名：预计2027年1月下旬（参考2026年1月26-30日）',
  '③ 文化素质测试：预计2027年3月上旬（参考2026年3月8日）',
  '④ 志愿填报：预计2027年3月中旬（参考2026年3月14-17日）',
  '⑤ 院校职业技能测试：预计2027年3月下旬 — 4月初',
  '⑥ 录取确认：预计2027年4月中旬（参考2026年4月11-13日，递补4月15-16日）',
];
var BENKE_TIMELINE_NOTE = '⏳ 除高考报名外，其余时间参考2025-2026年规律预估，以安徽省教育招生考试院官方公布为准。';

var BENKE_FOOTNOTE =
  '⚠️ <b>注意事项：</b>对口本科录取分数较高、竞争激烈；招生专业类别、分专业计划、校考大纲及分数线' +
  '以各院校最新对口招生章程及安徽省教育招生考试院公布为准。本页2026年数据供2027考生参考。';

/**
 * 渲染对口本科「招生说明」区（速览卡 + 目录 + 提示语），返回 HTML 字符串。
 * 院校列表与折叠资料块由调用方负责（因为两处的列表来源不同）。
 *
 * @param {object} opt
 * @param {string} opt.listId  院校列表容器 id（目录锚点指向它）
 * @param {string} [opt.tip]   列表上方的提示语，留空则不显示
 * @param {boolean} [opt.nav]  是否显示目录跳转（默认 true）
 */
function renderBenkeIntro(opt) {
  opt = opt || {};
  const listId = opt.listId || 'benke-other';
  const nav = opt.nav !== false;

  const facts = BENKE_FACTS.map((f) =>
    '<div class="bk-fact">' +
      '<div class="k">' + f.k + '</div>' +
      '<div class="v">' + f.v + '</div>' +
      '<div class="n">' + f.n + '</div>' +
    '</div>').join('');

  const navHtml = nav
    ? '<div class="bk-nav">' + BENKE_NAV.map((n) =>
        '<a href="#' + (n.id === 'bk-schools' ? listId : n.id) + '">' + n.label + '</a>').join('') + '</div>'
    : '';

  const tipHtml = opt.tip ? '<div class="zz-tip" style="margin:0 12px 8px">' + opt.tip + '</div>' : '';

  return `
    <div class="bk-hero">
      <h2>🎓 中职生升全日制本科的主通道</h2>
      <div class="sub">应用型本科高校面向中职毕业生对口招生，单独划线、单独录取，毕业发全日制本科毕业证 + 学士学位。</div>
      <div class="bk-facts">${facts}</div>
      <div class="bk-key" style="margin:10px 0 0">
        📌 <b>与分类考试不冲突</b>：对口本科计划单列，不占用普通高职（专科）计划；被对口本科录取后才不再参加普通高考。
      </div>
    </div>
    ${tipHtml}
    ${navHtml}`;
}

/** 渲染折叠资料块 + 时间轴 + 注意事项，返回 HTML 字符串。 */
function renderBenkeBlocks() {
  const folds = BENKE_FOLDS.map((f) => `
    <details class="zx-fold bk-fold" id="${f.id}">
      <summary>
        <span>${f.title}</span>
        <span class="zx-fold-hint"><span class="zx-fold-hint-text">展开</span><span class="zx-fold-collapse-text">收起</span><span class="zx-fold-arrow">▼</span></span>
      </summary>
      <div class="zx-fold-body">${f.body}</div>
    </details>`).join('');

  const timeline = `
    <div class="bk-block" id="bk-time">
      <h3>${BENKE_TIMELINE_TITLE}</h3>
      ${BENKE_TIMELINE.map((t) => '<p>' + t + '</p>').join('')}
      <p style="font-size:11px;color:#999;margin-top:4px">${BENKE_TIMELINE_NOTE}</p>
    </div>`;

  return folds + timeline + '<div class="note" style="margin:0 12px">' + BENKE_FOOTNOTE + '</div>';
}
