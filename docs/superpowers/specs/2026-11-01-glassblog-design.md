# GlassBlog 设计文档

日期：2026-11-01　状态：已批准（会话内方案评审通过）

## 背景与目标

用户需要一个**可自由商用**的个人博客站（挂广告/引流/卖课载体）。参考项目 XinghuisamaBlogs 采用 CC BY-NC 4.0 禁止商用，故从零原创重写同功能系统。著作权只保护代码与素材，不保护功能创意；本项目不复制原仓库任何代码、图片与文案。

**成功标准**：双击 bat 本地写作→一键发布上线；代码 100% 归用户；毛玻璃高颜值+移动端适配；SEO 与广告位就绪。

## 架构：单体 Next.js 应用

与参考项目"前台+后台双应用+双轨路径配置"不同，GlassBlog 是**一个应用**：

- 前台路由（静态化优先）：`/` 首页（文章流+个人名片）、`/posts/[slug]`、`/archive`、`/tags`、`/tags/[tag]`、`/moments`、`/about`
- 后台路由 `/admin`（仪表盘/文章管理/编辑器/说说管理/设置）：**仅本地可用**。所有写接口与 /admin 页面检查 `ADMIN_MODE` 环境变量，线上设为 `cloud` 时返回 404/403
- 本地写作：`写作.bat` 启动 dev server（端口 18601）并打开浏览器；发布：`发布.bat` 执行 git add/commit/push，Vercel 自动构建

## 数据模型（内容即文件）

- `content/posts/*.md`：frontmatter `{title, date, tags[], draft, summary, cover}`，正文 Markdown
- `content/moments/*.md`：`{date, mood?}`，正文即说说内容
- `config/site.json`：站名/副标题/简介/社交链接/导航/页脚 ICP 占位/BGM 歌单/等级系统开关/广告位配置
- `config/secrets.local.json`：**不进 git**——admin 密码哈希、AI API key、外部图床 token
- `public/uploads/`：本地图床，上传时 sharp 压缩（长边 ≤1920px，webp 优先）

## 技术栈

Next.js 15 (App Router, TS) + Tailwind v4 + gray-matter + react-markdown/remark-gfm/rehype-highlight + sharp + vitest。AI 助理走 OpenAI 兼容协议（可配智谱/通义/自建端点），无 key 自动隐藏入口。网易云 BGM 用外链播放器 iframe 方案（零注册）。

## 关键设计决策

1. **零注册优先**：图床默认本地；评论系统默认不做（giscus 作为 M5 可选教程）；部署推荐 Vercel（Next.js 原生支持），阿里云域名可选，国内访问慢时文档给出 CDN 方案
2. **admin 认证**：本地密码登录（HMAC 签名 httpOnly cookie），密码首启默认 `glassblog` 并在设置页提示修改
3. **发布管线**：`lib/git.ts` 封装 add/commit/push，支持 dry-run（测试用）；线上部署不需要 git 操作
4. **毛玻璃风格**：Tailwind `backdrop-blur` + 半透明渐变卡片 + 彩色模糊光斑背景，原创配色（紫蓝青系），深色模式双主题
5. **等级系统**：基于文章+说说数量与字数的纯函数计算（`lib/level.ts`），可开关
6. **中文 bat**：GBK+CRLF 编码（Windows cmd 中文兼容坑）

## 错误处理

- frontmatter 缺字段：解析时给默认值并跳过损坏文件（列表页不因单篇损坏崩溃）
- 上传非图片/超大文件：API 层校验类型与大小（≤10MB）
- git 推送失败（无 remote/网络）：返回明确错误信息给前端 toast，不静默
- secrets 缺失：AI/图床功能降级隐藏，站点其余功能不受影响

## 测试

vitest 单测：frontmatter 解析与容错、slug 生成、设置读写（隔离 tmp 目录）、发布脚本 dry-run、等级计算纯函数、上传校验。关键页面浏览器冒烟 + visual-judge 视觉验收。

## 里程碑

M0 环境/立项 → M1 毛玻璃前台 → M2 本地后台 → M3 发布+部署+SEO → M4 花活（说说/热力图等级/BGM/AI助理）→ M5 商用收尾（广告位/统计/性能/验收）
