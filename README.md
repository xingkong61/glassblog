# GlassBlog 🪟

高颜值毛玻璃风格个人博客系统，**原创实现、代码 100% 归你、可自由商用**（MIT）。

前台 Next.js 静态化，后台本地运行，内容即 Markdown 文件——写作、发说说、传图床、调设置全在浏览器里完成，写完双击发布上线。

## 快速开始

```
双击 写作.bat   → 自动装依赖、起服务、打开后台（默认密码 glassblog）
双击 发布.bat   → 推送 GitHub；到服务器执行 scripts/deploy-server.sh 上线
```

详细部署步骤（甲骨文服务器 + GitHub + nginx/HTTPS + 排错）：见 **[docs/部署指南.md](docs/部署指南.md)**。

## 功能

- 🪟 毛玻璃设计语言：半透明卡片 + 全站固定夜景背景 + 樱花飘落，固定黑夜主题，移动端适配
- 🎨 Butterfly 风格首页：整屏头图 Hero（可在后台更换）+ 发光大标题 + 循环打字/删除的副标题 + 透明毛玻璃导航；文章卡左右交错大图、标题旋转花装饰、阅读进度、返回顶部、拖尾光标
- ✍️ Markdown 写作：分屏实时预览、草稿管理、一键发布
- 🖼️ 图床：默认本地（上传自动压缩为 webp，长边 ≤1920），可切外部图床，零第三方依赖
- 💭 说说时间轴 + 写作贡献度热力图
- ✉️ 邮件订阅：前台订阅卡片，邮箱存本地 `data/`（不进 git），后台可导出 CSV
- 💬 评论系统：giscus（GitHub Discussions），设置页填 4 个参数即开启
- 🧭 自定义 404 页：死链流量引导回首页/归档/选刊
- 🏅 等级系统（按内容量计算，可关闭）
- 🎵 网易云 BGM 挂件（官方外链播放器，零注册）
- 🐱 AI 猫猫助理：任意 OpenAI 兼容接口（智谱/通义/DeepSeek…），不填 key 自动隐藏
- 💰 商用就绪：SEO（sitemap/RSS/OG/JSON-LD 就绪位）、广告位（侧栏+文章底部）、统计代码接入、ICP 备案号位
- 🔒 线上安全：`ADMIN_MODE=cloud` 时后台与后台写接口 404（公开的邮件订阅接口除外）；密钥文件不进 git

## 技术栈

Next.js 15 · TypeScript · Tailwind CSS v4 · gray-matter · react-markdown · sharp · vitest（72 个单测）

## 目录速览

```
app/            前台页面 + admin 后台 + api 接口
components/     前台组件（Navbar/PostCard/挂件…）
lib/            内容解析/设置/发布/等级/热力图
content/        你的文章与说说（Markdown，进 git）
config/         site.json 站点配置；secrets.local.json 密钥（不进 git）
public/uploads/ 图床图片（进 git，随部署带上）
data/           订阅者邮箱（不进 git；线上用 scripts/subscribers.mjs 导出）
```

## 许可证

MIT —— 随便用，包括商用。保留版权声明即可。
