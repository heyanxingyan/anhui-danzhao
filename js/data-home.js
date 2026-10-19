/* ============================================================
 * 安徽单招信息查询 - 院校数据（首页版 · 只够首屏用）
 *
 * ⚠️ 本文件由 tools/gen-data-core.js 自动生成，请勿手工编辑。
 *
 * 只保留首页渲染真正用到的 11 个字段（无专业、无分数、无简介）。
 * 首页是微信/外部链接的入口，越小越快；进其它页面再按需加载 data-core / data-list / data。
 *
 * 适用页面（1 个）：index.html
 *
 * ⚠️ 同一页面只能引用本文件、js/data.js、或另一个瘦身文件三者之一 ——
 *    它们都定义 const COLLEGES，同时加载会因重复声明报 SyntaxError。
 *    改动 js/data.js 后请重跑：node tools/gen-data-core.js
 * ============================================================ */

const CATEGORIES = {

  gaozhong:{key:'gaozhong',name:'高中起点',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9 12 4 2 9l10 5z"/><path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5"/><path d="M22 9v5"/></svg>',desc:'面向普通高中毕业生，文化素质测试+职业适应性测试录取',condition:'已参加安徽省2027年普通高考报名的普通高中毕业生',subjects:'文化素质测试（语数英，省统考）+ 职业适应性测试',rule:'文化素质为省统考；学业水平考试语数外均合格者可认定文化素质合格。职业适应性测试由招生院校组织。职业技能（适应性）考评成绩占比原则上不低于总成绩50%。'},

  zhongzhi:{key:'zhongzhi',name:'中职起点',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/></svg>',desc:'面向中职毕业生，含中职专科与对口本科两条通道',condition:'已参加安徽省2027年普通高考报名的中职毕业生（含技工学校）',subjects:'文化素质测试（语数英，省统考）+ 职业技能考试',rule:'职业技能考试含专业能力测试（笔试）+技术技能测试（操作），按对口类别由招生院校组织；对口本科单独划线、单独录取。职业技能考评成绩占比原则上不低于总成绩50%。'},

  zhuanxiang:{key:'zhuanxiang',name:'专项计划',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2.8 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.3 1.2-6.5L2.5 9.7l6.6-.9z"/></svg>',desc:'面向退役军人、革命老区建档立卡、乡村医生定向培养等专项考生，单独划线单独录取',condition:'符合条件的退役军人、革命老区建档立卡考生、乡村医生定向培养等专项报考人员',subjects:'与对应生源类别一致，单独划线',rule:'退役军人免文化素质测试；单独排队、单独录取，不占用普通计划名额。'}

};

const BANNERS = [

  {id:1,title:'2027安徽单招备考启动',sub:'高考报名10月17日10:00–21日17:00 · 分类考试预计1月下旬报名',bg:'linear-gradient(135deg,#2e5bff,#5f83ff)',link:'guide.html'},

  {id:2,title:'对口本科 22 所院校招生',sub:'100 个专业 · 计划 6181 人（2026年）',bg:'linear-gradient(135deg,#6d5df6,#9d8cff)',link:'zhongzhi.html?tab=benke'},

  {id:3,title:'2026 各校各专业分数',sub:'16 所公布分专业线 · 高中/中职分列 · 附官网来源',bg:'linear-gradient(135deg,#f08c1a,#fbbf24)',link:'score-trend.html'}

];

const MAJOR_CATEGORIES = [

  {key:'nonglin',name:'农林牧渔大类'},

  {key:'ziyuan',name:'资源环境与安全大类'},

  {key:'nengyuan',name:'能源动力与材料大类'},

  {key:'tumu',name:'土木建筑大类'},

  {key:'shuili',name:'水利大类'},

  {key:'zhuangbei',name:'装备制造大类'},

  {key:'huagong',name:'生物与化工大类'},

  {key:'qinggong',name:'轻工纺织大类'},

  {key:'shipin',name:'食品药品与粮食大类'},

  {key:'jiaotong',name:'交通运输大类'},

  {key:'dianxin',name:'电子与信息大类'},

  {key:'yiyao',name:'医药卫生大类'},

  {key:'caijing',name:'财经商贸大类'},

  {key:'lvyou',name:'旅游大类'},

  {key:'wenyi',name:'文化艺术大类'},

  {key:'xinwen',name:'新闻传播大类'},

  {key:'jiaoyu',name:'教育与体育大类'},

  {key:'gongan',name:'公安与司法大类'},

  {key:'gonggong',name:'公共管理与服务大类'},

];

const COLLEGES = [
  {"id":1,"name":"宿州学院","city":"宿州","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"_track":"duikou","tags":["benke","duikou"]},
  {"id":2,"name":"合肥幼儿师范高等专科学校","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":3,"name":"马鞍山师范高等专科学校","city":"马鞍山","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":4,"name":"阜阳幼儿师范高等专科学校","city":"阜阳","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":5,"name":"桐城师范高等专科学校","city":"安庆","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":6,"name":"安徽第二医学院","city":"合肥","nature":"公办","hot":true,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":7,"name":"安徽中医药高等专科学校","city":"芜湖","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":8,"name":"安庆医药高等专科学校","city":"安庆","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":9,"name":"安徽财贸职业学院","city":"合肥","nature":"公办","hot":true,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":10,"name":"安徽城市管理职业学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":11,"name":"安徽电气工程职业技术学院","city":"合肥","nature":"公办","hot":true,"stoppedEnrollment":true,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":12,"name":"安徽电子信息职业技术学院","city":"蚌埠","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":13,"name":"安徽工贸职业技术学院","city":"淮南","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":14,"name":"安徽工商职业学院","city":"合肥","nature":"公办","hot":true,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":15,"name":"安徽工业经济职业技术学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":16,"name":"安徽工业职业技术学院","city":"铜陵","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":17,"name":"安徽广播影视职业技术学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":18,"name":"安徽国防科技职业学院","city":"六安","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":19,"name":"安徽国际商务职业学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":20,"name":"安徽黄梅戏艺术职业学院","city":"安庆","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":21,"name":"安徽应用技术职业大学","city":"芜湖","nature":"公办","hot":true,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":22,"name":"安徽交通职业技术学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":23,"name":"安徽警官职业学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":24,"name":"安徽粮食工程职业学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":25,"name":"安徽林业职业技术学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":26,"name":"安徽汽车职业技术学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":28,"name":"安徽审计职业学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":29,"name":"安徽水利水电职业技术学院","city":"合肥","nature":"公办","hot":true,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":30,"name":"安徽体育运动职业技术学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":31,"name":"安徽卫生健康职业学院","city":"池州","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":32,"name":"安徽新闻出版职业技术学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":33,"name":"安徽艺术职业学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":34,"name":"安徽邮电职业技术学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":35,"name":"安徽职业技术大学","city":"合肥","nature":"公办","hot":true,"isUndergraduate":false,"_track":"fenlei","_sameSchoolAs":94,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":36,"name":"安徽中澳科技职业学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":37,"name":"安庆职业技术学院","city":"安庆","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":38,"name":"亳州职业技术学院","city":"亳州","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":39,"name":"池州职业技术学院","city":"池州","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":40,"name":"滁州城市职业学院","city":"滁州","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":41,"name":"滁州职业技术学院","city":"滁州","nature":"公办","hot":true,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":42,"name":"阜阳职业技术学院","city":"阜阳","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":43,"name":"合肥通用职业技术学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":44,"name":"合肥职业技术学院","city":"合肥","nature":"公办","hot":true,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":45,"name":"淮北职业技术学院","city":"淮北","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":46,"name":"淮南联合大学","city":"淮南","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":47,"name":"淮南职业技术学院","city":"淮南","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":48,"name":"黄山职业技术学院","city":"黄山","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":49,"name":"徽商职业学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":50,"name":"六安职业技术学院","city":"六安","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":51,"name":"马鞍山职业技术学院","city":"马鞍山","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":52,"name":"铜陵职业技术学院","city":"铜陵","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":53,"name":"皖北卫生职业学院","city":"宿州","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":54,"name":"皖西卫生职业学院","city":"六安","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":55,"name":"芜湖职业技术大学","city":"芜湖","nature":"公办","hot":true,"isUndergraduate":false,"_track":"fenlei","_sameSchoolAs":95,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":56,"name":"宿州职业技术学院","city":"宿州","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":57,"name":"宣城职业技术学院","city":"宣城","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":58,"name":"安徽扬子职业技术学院","city":"芜湖","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":59,"name":"万博科技职业学院","city":"淮南","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":60,"name":"安徽冶金科技职业学院","city":"马鞍山","nature":"公办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":61,"name":"安徽矿业职业技术学院","city":"淮北","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":62,"name":"合肥财经职业学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":63,"name":"合肥共达职业技术学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":64,"name":"合肥经济技术职业学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":65,"name":"合肥科技职业学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi","zhuanxiang"]},
  {"id":66,"name":"合肥信息技术职业学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":67,"name":"安徽绿海商务职业学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":68,"name":"蚌埠城市轨道交通职业学院","city":"蚌埠","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":69,"name":"蚌埠经济技术职业学院","city":"蚌埠","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":70,"name":"合肥滨湖职业技术学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":71,"name":"阜阳科技职业学院","city":"阜阳","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":72,"name":"宿州航空职业学院","city":"宿州","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":73,"name":"芜湖航空职业学院","city":"芜湖","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":74,"name":"芜湖医药健康职业学院","city":"芜湖","nature":"民办","hot":false,"isUndergraduate":false,"tags":["gaozhong","zhongzhi"]},
  {"id":75,"name":"安徽艺术学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"_track":"duikou","tags":["benke","duikou"]},
  {"id":76,"name":"滁州学院","city":"滁州","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":77,"name":"铜陵学院","city":"铜陵","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":78,"name":"黄山学院","city":"黄山","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":79,"name":"巢湖学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":80,"name":"淮南师范学院","city":"淮南","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":81,"name":"皖西学院","city":"六安","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":82,"name":"合肥师范学院","city":"合肥","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":83,"name":"安徽科技工程大学","city":"滁州","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":84,"name":"安庆师范大学","city":"安庆","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":85,"name":"池州学院","city":"池州","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":86,"name":"蚌埠学院","city":"蚌埠","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":87,"name":"合肥城市学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":88,"name":"淮北理工学院","city":"淮北","nature":"民办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":89,"name":"合肥经济学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":90,"name":"安徽外国语学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":91,"name":"安徽文达信息工程学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":92,"name":"安徽三联学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":93,"name":"安徽新华学院","city":"合肥","nature":"民办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"tags":["benke","duikou"]},
  {"id":94,"name":"安徽职业技术大学","city":"合肥","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"_track":"duikou","_sameSchoolAs":35,"tags":["benke","duikou"]},
  {"id":95,"name":"芜湖职业技术大学","city":"芜湖","nature":"公办","hot":false,"isUndergraduate":true,"isDuikouBenke":true,"_track":"duikou","_sameSchoolAs":55,"tags":["benke","duikou"]}
];


function getCollegeById(id){return COLLEGES.find(c=>c.id===Number(id));}
function getMajorCategoryName(key){const m=MAJOR_CATEGORIES.find(c=>c.key===key);return m?m.name:key;}


