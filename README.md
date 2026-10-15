# 安徽单招信息查询站

面向安徽省高职分类考试（俗称"单招"）考生的纯静态信息查询站：74 所院校、1941 个专业的招生计划、学费、历年分数、录取概率与报考辅助工具。

- **源码仓库**：https://github.com/heyanxingyan/anhui-danzhao （public，默认分支 `main`）
- **线上地址**：https://heyanxingyan.github.io/anhui-danzhao/ （GitHub Pages，已开启）
- **备用域名**：仓库内有 `CNAME`，历史上还部署过 `anhui-danzhao.surge.sh`（Surge 部署脚本见 `_dev/deploy-surge.js`）
- **技术栈**：原生 HTML + CSS + JavaScript，**无框架、无构建步骤、无后端**。改完文件直接发布即可生效。
- **目录约定**：`index.html` 等 23 个页面 + `js/data.js`（全部数据）+ `js/app.js`（全部逻辑）+ `css/style.css`；`body` 上的 `data-page="xxx"` 是路由键，`app.js` 末尾的 `handlers` 表按它分发渲染函数。

---

## ⚠️ 接手第一件事：凭据泄露（未处理）

原开发者的工作副本里有 **4 个脚本硬编码了 GitHub Personal Access Token**：

```
DoubaoWork\chats\2026-10-13\new-chat\github_update.py        第 7 行
DoubaoWork\chats\2026-10-13\new-chat\github_upload.py        第 8 行
DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\_check_remote.js   第 9 行
DoubaoWork\chats\2026-10-13\new-chat\anhui-danzhao-site\_upload_github.js 第 9 行
```

**实测该 token 目前仍然有效**（`ghp_CjK6IF…`，归属账号 `heyanxingyan`，具备该仓库写权限）。它泄露在磁盘明文里，且这些文件曾被整体打包成 zip 在聊天/网盘流转，应视为已泄露。

处置步骤：
1. 到 GitHub → Settings → Developer settings → Personal access tokens **立刻 Revoke 该 token**。
2. 新建一个 token，**只授予 `repo` 范围内该仓库所需权限**，并设置较短有效期。
3. 以后用环境变量传递，不要写进任何文件：
   ```powershell
   $env:GITHUB_TOKEN = "新token"
   node tools/release.js --dry-run    # 先对比
   node tools/release.js              # 再发布
   ```
4. 本仓库的 `tools/release.js` 已改为**只从 `GITHUB_TOKEN` 环境变量读取**，源码里不留凭据；`.gitignore` 也挡住了 `.env` / `*.token`。

---

## 目录结构

```
anhui-danzhao/
├── index.html                 首页（Banner + 板块入口 + 热门院校 + 工具入口）
├── college-list.html          院校列表（按地区/性质筛选）
├── college-detail.html        院校详情（专业表、计划、学费、章程 PDF）
├── major-search.html          专业查询（按大类筛选、关键词搜索）
├── major-detail.html          专业详情
├── score-trend.html           五年分数走势（依赖 echarts）
├── probability.html           录取概率测算
├── low-score.html             低分上公办
├── recommend.html             分数推荐
├── ranking.html               报考排行
├── compare.html               院校对比
├── favorites.html             我的收藏
├── guide.html / faq.html      报考指南 / 常见问题
├── gaozhong.html              普高起点
├── zhongzhi.html              中职起点
├── zhuanxiang*.html           专项计划（退役/老区/乡村医生）
├── benke.html                 对口本科
├── about.html                 关于
├── css/style.css              全站唯一样式表
├── js/data.js                 全部数据（顶层 const，约 1MB）
├── js/app.js                  全部逻辑（约 89KB）
├── js/low-score.js            「低分上公办」「录取概率」专用数据+逻辑
├── js/echarts.min.js          本地 echarts 5.5.1
├── zhangcheng/*.pdf           8 份院校招生章程原文
├── data-collection/           数据采集/合并脚本与中间 JSON（开发用，不影响线上）
├── tools/                     本次接管新增的运维脚本（见下）
└── 核对报告.md                上一轮全网核对报告（74 所院校逐校明细，很有价值，别删）
```

`js/data.js` 提供的顶层常量：`CATEGORIES`、`BENKE_SCHOOLS`、`BANNERS`、`MAJOR_CATEGORIES`、`COLLEGES`（74 所）、`SECONDARY_REGIONS`（中职版块），以及函数 `get2026Fee()`、`getAllMajors()`。

---

## 日常运维

所有脚本都用打包自带的 Node 运行（本机 **没有** 全局 node/git/python）：

```powershell
$node = "C:\Users\Admin（无密码）\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
```

| 目的 | 命令 |
|---|---|
| 本地预览（带 gzip） | `& $node tools/serve.js 8899` → http://127.0.0.1:8899/ |
| 数据体检（计划/学费/分数/停招/重名） | `& $node tools/audit-data.js` |
| 静态一致性（语法/资源/死链/DOM） | `& $node tools/static-checks.js` |
| 与线上逐文件比对 | `& $node tools/compare-remote.js` |
| 查当前缓存版本 | `& $node tools/bump-cache.js --check` |
| 抬版本号 | `& $node tools/bump-cache.js 20261016a` |
| 发布（需 GITHUB_TOKEN） | `$env:GITHUB_TOKEN="…"; & $node tools/release.js --dry-run` |

### 标准发版流程

```powershell
# 1. 改数据/页面
# 2. 抬缓存版本号（**必做**：不抬的话用户会继续拿到旧 data.js）
& $node tools/bump-cache.js
# 3. 跑体检，必须全绿
& $node tools/audit-data.js
& $node tools/static-checks.js
# 4. 本地预览确认
& $node tools/serve.js 8899
# 5. 对比 + 发布
$env:GITHUB_TOKEN = "新token"
& $node tools/release.js --dry-run
& $node tools/release.js --message "2027政策更新"
```

> **为什么不用 git**：这台机器上全盘找不到 `git.exe`（`C:\Program Files\Git`、scoop、choco 路径都没有），所以发布走 GitHub Contents API —— 每个文件一次提交，没有真正的 git 历史与回滚能力。**建议装上 git**，之后把仓库改成标准 `git push` 流程，这是我认为最值得补的一件工程基建。

---

## 缓存与部署说明

- 所有页面通过 `<script src="js/data.js?v=20261015j">` 的查询串击穿缓存，**版本号硬编码在 23 个 HTML 里**，必须整体一致。`tools/bump-cache.js` 就是干这个的。
- 发布后 GitHub Pages 会重新构建，通常 1–3 分钟生效。
- 线上验证（不依赖本机浏览器）：
  ```powershell
  # 用 Node 直接取线上文件，和本地算 git blob SHA 对比
  & $node tools/compare-remote.js
  ```

---

## 当前体检结果（接管时基线）

- ✅ 与线上仓库 **86/86 文件逐字节一致**，无版本漂移（线上多出的 11 个文件都是 `_` 开头的调试脚本和 surge 部署脚本，已归档到 `_dev/`）。
- ✅ 全部 JS 语法合法；无缺失资源；无死链。
- ✅ 数据规模：74 所院校 / 1941 个专业 / 3 个免费定向专业。
- ⚠️ **1 个真实数据缺陷**：`安徽应用技术职业大学` 有 11 个专业被重复录入两条记录（同专业代码、不同 `plan2026`）。因为 `getAllMajors()` 按专业名聚合、把每条记录都塞进 `schools` 数组，页面表现是**同一所学校在一个专业下面出现两次**，"开设院校 N 所"也会被虚高。该校原始 78 条 → 按名去重 67 条。详见 `tools/inspect-dupes.js` 与 `tools/check-dupe-impact.js`。

---

## 尚未做完的事（按优先级）

1. **吊销泄露的 token**（见上文，最高优先级）。
2. **修 11 条重复专业数据**：需要与学校官方 2026 章程计划表核对，确认是"重复录入应合并"还是"两个不同方向应改名"，**不能简单去重**——两条的 `plan2026` 数值不同。核查脚本：`tools/inspect-dupes.js`。
3. **给 `getAllMajors()` 加去重兜底**：即使数据层修好，聚合层也应该按 `(专业名, 学校)` 去重，避免同类问题再次污染页面。
4. **装 git，换成标准 git 流程**（当前 API 发布无历史、无回滚）。
5. 数据层仍是"估算 + 官网公示"混合口径，约 65 所院校无官方分专业录取线，靠 2021–2025 估算；`核对报告.md` 有逐校诚实标注，保持这个口径，不要编数字。
6. 性能：`js/data.js` 约 1MB，全站首屏都要下载；可考虑按板块拆成多份或改用 JSON 懒加载（当前靠 gzip 扛着）。
