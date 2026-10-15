/* ============================================================
 * 校考考试类别（专业组）与考纲
 *
 * 结构（按院校 id 索引）：
 *   EXAM_GROUPS[院校id] = {
 *     gaozhong: { note: '普高说明', groups: [ { name, form, content, majors: [], source } ] },
 *     zhongzhi: { note: '中职说明', groups: [ ... ] },
 *     special:  '退役军人/专项计划怎么测',
 *     sources:  ['URL', ...],
 *     confidence: '高' | '中' | '低'
 *   }
 *
 * 用途：院校详情页「分专业招生计划」表按考试类别分组渲染，
 *       组头可展开查看该类别考什么（笔试/面试、科目与分值）。
 *       专业通过 majors 名单或 categories（大类 key）归属到某个组。
 *
 * 数据来源：各校 2026 年分类考试招生章程与「考试大纲 / 测试纲要」页，
 *           逐校联网核查，来源 URL 保存在每条 group 与 sources 里。
 * 维护约定：**查不到就留空并写 note，绝不编造分组名、包含专业与分值。**
 * ============================================================ */

var EXAM_GROUPS = {
  // ---- 安徽扬子职业技术学院 ----
  // 来源: ahzsks 2026 分类考试招生章程（提取文本 tools/_exam_research/txt2/yangzi.txt）
  // 注：该校章程招生专业表有 35 个专业，data.js 原只有 24 个，已按原文补齐缺失的 11 个
  58: {
    confidence: '高',
    gaozhong: {
      note: '除中职毕业生外的考生参加「职业适应性测试」，不分专业组，统一线下笔试。',
      groups: [
        {
          name: '普高 · 统一测试（不分专业组）',
          form: '线下笔试（总分300分，90分钟）',
          content:
            '职业适应性测试主要考查考生未来从事生产、建设、服务、管理等一线工作所必备的基本职业素质，' +
            '主要采用开放性试题考查书面表达、逻辑思维、应试能力、知识面、专业特长等职业素质、职业潜能和能力倾向。' +
            '总分300分，测试时间90分钟，考试形式为线下笔试。' +
            '入学测试成绩（满分300分）＝ 文化素质成绩（满分300分）×10% + 职业适应性测试成绩×90%。',
          majors: [],
          categories: [],
          source: 'https://www.ahzsks.cn/',
        },
      ],
    },
    zhongzhi: {
      note: '中职毕业生参加「职业技能考试」，按第一志愿专业划分为五个考试类别；同一考试类别专业可兼报，不同考试类别不可兼报。',
      groups: [
        {
          name: '职业技能考试一（制造与信息类）',
          form: '合卷线下笔试（总分300分，90分钟）',
          content:
            '专业能力测试 + 技术技能测试合卷进行笔试，总分300分，测试时间90分钟。' +
            '专业能力测试主要涵盖职业基本素养和综合专业能力；技术技能测试包括岗位技能、通用技术和专业素养等内容。' +
            '主要采用开放性试题考查书面表达、逻辑思维、应试能力、知识面、专业特长等。' +
            '入学测试成绩（满分300分）＝ 文化素质成绩×10% + 职业技能考试成绩×90%。',
          majors: [
            '电气自动化技术', '机电一体化技术', '工业机器人技术', '无人机应用技术',
            '汽车制造与试验技术', '新能源汽车技术', '机械装备制造技术', '机械制造及自动化',
            '数控技术', '城市轨道车辆应用技术', '计算机应用技术', '计算机网络技术',
            '物联网应用技术', '大数据技术', '软件技术', '智能网联汽车技术',
            '信息安全技术应用', '人工智能技术应用', '数字化设计与制造技术',
          ],
          categories: [],
          source: 'https://www.ahzsks.cn/',
        },
        {
          name: '职业技能考试二（财经商贸与文旅服务类）',
          form: '合卷线下笔试（总分300分，90分钟）',
          content: '同考试一：专业能力测试 + 技术技能测试合卷笔试，总分300分/90分钟；入学测试成绩＝文化素质×10% + 职业技能考试×90%。',
          majors: [
            '大数据与会计', '大数据与审计', '工程造价', '大数据与财务管理', '现代物流管理',
            '电子商务', '市场营销', '旅游管理', '空中乘务', '高速铁路客运服务', '网络营销与直播电商',
          ],
          categories: [],
          source: 'https://www.ahzsks.cn/',
        },
        {
          name: '职业技能考试三（艺术设计类）',
          form: '合卷线下笔试（总分300分，90分钟）',
          content: '同考试一：专业能力测试 + 技术技能测试合卷笔试，总分300分/90分钟。',
          majors: ['艺术设计', '数字媒体艺术设计', '动漫制作技术'],
          categories: [],
          source: 'https://www.ahzsks.cn/',
        },
        {
          name: '职业技能考试四（教育类）',
          form: '合卷线下笔试（总分300分，90分钟）',
          content: '同考试一：专业能力测试 + 技术技能测试合卷笔试，总分300分/90分钟。',
          majors: ['学前教育'],
          categories: [],
          source: 'https://www.ahzsks.cn/',
        },
        {
          name: '职业技能考试五（医药康养类）',
          form: '合卷线下笔试（总分300分，90分钟）',
          content: '同考试一：专业能力测试 + 技术技能测试合卷笔试，总分300分/90分钟。',
          majors: ['护理', '智慧健康养老服务与管理'],
          categories: [],
          source: 'https://www.ahzsks.cn/',
        },
      ],
    },
    special: '退役军人考生若报考普通计划，必须参加文化素质测试，并按毕业类型参加职业适应性测试（除中职毕业生外）或职业技能考试（中职毕业生）。技能拔尖人才（技能大赛获奖/高级工等）可免职业技能考试。',
    sources: ['https://www.ahzsks.cn/'],
  },
  // ---- 安徽冶金科技职业学院 ----
  // 来源: https://zhao.avcmt.edu.cn/admission/detail/74896 《2026年分类考试招生校考测试纲要》
  60: {
    confidence: '高',
    gaozhong: {
      note: '普高生参加「职业适应性测试」，笔试+现场面试；笔试各专业大类合卷。',
      groups: [
        {
          name: '普高 · 统一命题（不分专业组）',
          form: '笔试（120分钟，100分）+ 面试（100分）',
          content:
            '笔试：单选40题×1分 + 多选20题×2分 + 判断20题×1分，共100分，时长120分钟；考查沟通交流、学习能力、心理健康、信息常识、团队协作、职业素养，以及高中基础知识（物理/化学/历史/地理/生物等）。' +
            '面试：两题各50分共100分，第一题语言交流表达，第二题考察应用高中知识对生产实际解释、说明、分析、应用的能力。',
          majors: [],
          categories: ['zhuangbei', 'dianxin', 'yiyao', 'caijing', 'jiaotong', 'nonglin', 'gonggong', 'wenyi', 'lvyou', 'tumu', 'huagong'],
          source: 'https://zhao.avcmt.edu.cn/admission/detail/74896',
        },
      ],
    },
    zhongzhi: {
      note: '中职生参加「职业技能考试」，笔试+面试；笔试与面试均按三个专业组分别实施。',
      groups: [
        {
          name: '智慧制造类专业组',
          form: '笔试（通识+专业能力，100分）+ 面试（通识+技术能力，100分）',
          content:
            '笔试：通识能力（沟通交流/学习能力/心理健康/信息常识/团队协作/职业素养）+ 专业能力（智慧制造相关专业基础知识与拓展知识），共100分/120分钟。' +
            '面试：通识能力 + 技术能力（智慧制造相关设备、工艺、流程、操作及分析应用），两题各50分共100分。',
          majors: ['机械制造及自动化', '工业机器人技术', '智能控制技术', '智能轧钢技术', '钢铁智能冶金技术', '计算机网络技术', '信息安全技术应用'],
          categories: ['zhuangbei', 'dianxin'],
          source: 'https://zhao.avcmt.edu.cn/admission/detail/74896',
        },
        {
          name: '机电装备类专业组',
          form: '笔试 + 面试（同上结构）',
          content:
            '笔试：通识能力 + 专业能力（机电电气相关专业基础知识与拓展知识），共100分/120分钟。' +
            '面试：通识能力 + 技术能力（机电电气相关设备、工艺、流程、操作及分析应用），两题各50分共100分。',
          majors: ['电气自动化技术', '机电一体化技术', '数控技术', '城市轨道交通机电技术', '钢铁冶金设备维护', '新能源汽车技术'],
          categories: [],
          source: 'https://zhao.avcmt.edu.cn/admission/detail/74896',
        },
        {
          name: '现代服务类专业组',
          form: '笔试 + 面试（同上结构）',
          content:
            '笔试：通识能力 + 专业能力（社会服务相关专业基础知识与拓展知识），共100分/120分钟。' +
            '面试：通识能力 + 技术能力（社会服务有关现象、性质、方法、原理、规范的识别应用与案例分析），两题各50分共100分。',
          majors: ['大数据与会计', '市场营销', '护理'],
          categories: [],
          source: 'https://zhao.avcmt.edu.cn/admission/detail/74896',
        },
      ],
    },
    special: '退役军人专项计划单独测试：面试形式，四题每题50分共200分，10分钟以内；考查语言交流表达、专业认知与职业规划、团队协作与组织策划、学习能力（规律辨识推演3选2）。',
    sources: ['https://zhao.avcmt.edu.cn/admission/detail/74896'],
  },

  // ---- 合肥财经职业学院 ----
  // 来源: https://zs.hfcfe.edu.cn/index.php?m=content&c=index&a=show&catid=464&id=103830 职业技能考试大纲
  //       https://www.hfcfe.edu.cn/uploadfile/2026/0315/ed2f25892814e5c.pdf 大纲 PDF
  62: {
    confidence: '中',
    gaozhong: {
      note: '普高生按「职业适应性测试」成绩排名，另有单独的职业适应性测试大纲。',
      groups: [
        {
          name: '普高 · 统一测试（不分专业组）',
          form: '笔试（校考300分）',
          content:
            '面向普高生按职业适应性测试成绩排名录取；校考满分300分。学校另发布《2026年分类考试招生职业适应性测试大纲》（详见来源页下一篇）。' +
            '文化素质测试须达安徽省合格线（2026年为82分）。',
          majors: [],
          categories: ['caijing', 'dianxin', 'jiaoyu', 'jiaotong', 'yiyao', 'lvyou', 'wenyi', 'zhuangbei', 'gonggong', 'tumu', 'nonglin', 'shipin', 'xinwen', 'huagong', 'qinggong', 'ziyuan', 'nengyuan', 'shuili', 'gongan'],
          source: 'https://zs.hfcfe.edu.cn/index.php?m=content&c=index&a=show&catid=464&id=103830',
        },
      ],
    },
    zhongzhi: {
      note: '中职生参加「职业技能考试」，按五个类别分别划线；大纲见学校发布的 PDF。',
      groups: [
        {
          name: '财经商贸类',
          form: '笔试（校考300分）',
          content:
            '中职生按职业技能测试分五个类别分别划线录取，校考满分300分。各类别具体考试范围见《合肥财经职业学院2026年分类考试招生职业技能考试大纲》PDF。' +
            '注：五个类别的官方完整名单与逐类考纲在 PDF 内，此处按校方公布的五类名称归类，具体专业归入哪一类以校方 PDF 为准。',
          majors: [],
          categories: ['caijing', 'gonggong'],
          source: 'https://www.hfcfe.edu.cn/uploadfile/2026/0315/ed2f25892814e5c.pdf',
        },
        {
          name: '电子与信息类',
          form: '笔试（校考300分）',
          content: '同上，按职业技能测试分类别划线；具体考试范围见学校职业技能考试大纲 PDF。',
          majors: [],
          categories: ['dianxin'],
          source: 'https://www.hfcfe.edu.cn/uploadfile/2026/0315/ed2f25892814e5c.pdf',
        },
        {
          name: '教育与艺术类',
          form: '笔试（校考300分）',
          content: '同上，按职业技能测试分类别划线；具体考试范围见学校职业技能考试大纲 PDF。',
          majors: [],
          categories: ['jiaoyu', 'wenyi'],
          source: 'https://www.hfcfe.edu.cn/uploadfile/2026/0315/ed2f25892814e5c.pdf',
        },
        {
          name: '智能交通与工程类',
          form: '笔试（校考300分）',
          content: '同上，按职业技能测试分类别划线；具体考试范围见学校职业技能考试大纲 PDF。',
          majors: [],
          categories: ['jiaotong', 'zhuangbei', 'tumu'],
          source: 'https://www.hfcfe.edu.cn/uploadfile/2026/0315/ed2f25892814e5c.pdf',
        },
        {
          name: '康养与文旅类',
          form: '笔试（校考300分）',
          content: '同上，按职业技能测试分类别划线；具体考试范围见学校职业技能考试大纲 PDF。',
          majors: [],
          categories: ['yiyao', 'lvyou'],
          source: 'https://www.hfcfe.edu.cn/uploadfile/2026/0315/ed2f25892814e5c.pdf',
        },
      ],
    },
    special: '退役军人专项计划按学校章程执行（未在考纲页单独说明）。',
    sources: [
      'https://zs.hfcfe.edu.cn/index.php?m=content&c=index&a=show&catid=464&id=103830',
      'https://www.hfcfe.edu.cn/uploadfile/2026/0315/ed2f25892814e5c.pdf',
    ],
  },
};
