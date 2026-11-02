// 每日选刊生成管线：arXiv 论文 + Tavily 新闻（可选）→ LLM 汇总成中文选刊草稿。
// 素材源各自独立降级：任一失败不阻塞整体，全部为空才报错。
import { aiRuntimeConfig, getSecrets } from "./settings";

export interface SourceItem {
  kind: "news" | "paper";
  title: string;
  summary: string;
  source: string; // 展示用来源名
  url?: string;
}

// 默认关注的 arXiv 分类：AI / 自然语言处理 / 机器学习
export const ARXIV_CATEGORIES = ["cs.AI", "cs.CL", "cs.LG"];

// 解析 arXiv Atom 响应。不引入 XML 依赖，按 <entry> 切块 + 取标签内容，缺字段给默认值。
export function parseArxivEntries(xml: string): SourceItem[] {
  const items: SourceItem[] = [];
  for (const chunk of xml.split("<entry>").slice(1)) {
    const pick = (tag: string): string => {
      const m = chunk.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].trim().replace(/\s+/g, " ") : "";
    };
    const title = pick("title");
    if (!title) continue;
    items.push({
      kind: "paper",
      title,
      summary: pick("summary").slice(0, 400),
      source: "arXiv",
      url: pick("id") || undefined,
    });
  }
  return items;
}

export async function fetchArxiv(maxResults = 15): Promise<SourceItem[]> {
  const query = ARXIV_CATEGORIES.map((c) => `cat:${c}`).join("+OR+");
  const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`arXiv 请求失败(${res.status})`);
  return parseArxivEntries(await res.text());
}

export async function fetchTavilyNews(apiKey: string, topic: string, maxResults = 8): Promise<SourceItem[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ query: topic, topic: "news", max_results: maxResults }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Tavily 请求失败(${res.status})`);
  const data = (await res.json()) as { results?: Array<{ title?: string; content?: string; url?: string }> };
  return (data.results ?? [])
    .filter((r) => r && r.title)
    .map((r) => ({
      kind: "news" as const,
      title: String(r.title),
      summary: String(r.content ?? "").slice(0, 400),
      source: "Tavily",
      url: r.url,
    }));
}

export function buildDigestPrompt(items: SourceItem[]): string {
  const material = items
    .map((it, i) => `${i + 1}. [${it.kind === "paper" ? "论文" : "新闻"}] ${it.title}\n   摘要：${it.summary}`)
    .join("\n");
  return [
    '你是博客「每日选刊」栏目的编辑。下面是今天的原始素材，请整理成一份中文 Markdown 选刊：',
    '1. 分为「## AI 动态」（新闻类素材）与「## 论文雷达」（论文类素材）两个板块，某板块没有素材就整节省略',
    "2. 每个板块最多挑选 6 条最有价值的",
    "3. 每条为一个编号列表项：**加粗的中文标题**，后接一到两句中文摘要（不超过 60 字）",
    "4. 不要编造素材里没有的信息，不要写开头结尾的客套话，直接从板块标题开始输出",
    "",
    "素材列表：",
    material,
  ].join("\n");
}

// 复用「AI 猫猫助理」同一套 OpenAI 兼容配置，不额外引入密钥
export async function summarizeWithLlm(prompt: string): Promise<string> {
  const ai = aiRuntimeConfig();
  if (!ai.apiKey || !ai.baseUrl || !ai.model) {
    throw new Error("AI 未配置：先到后台「设置 → AI 猫猫助理」填好三项配置，选刊借用同一套接口");
  }
  const res = await fetch(`${ai.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ai.apiKey}` },
    body: JSON.stringify({
      model: ai.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2500,
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`LLM 请求失败(${res.status})，检查 AI 配置与余额`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("LLM 返回为空，请重试");
  return text;
}

// 新闻素材源 key：本地 secrets 优先，线上/无 secrets 时回退环境变量
function tavilyKey(): string {
  return getSecrets().tavily.apiKey.trim() || (process.env.TAVILY_API_KEY ?? "").trim();
}

// 主流程：抓素材 → LLM 汇总 → 返回选刊 Markdown
export async function buildDigest(topic: string): Promise<{ markdown: string; sources: number }> {
  const key = tavilyKey();
  const [papers, news] = await Promise.all([
    fetchArxiv().catch(() => [] as SourceItem[]),
    key ? fetchTavilyNews(key, topic).catch(() => [] as SourceItem[]) : Promise.resolve([] as SourceItem[]),
  ]);
  const items = [...news, ...papers];
  if (items.length === 0) {
    throw new Error("素材抓取全部失败（arXiv 连不上且 Tavily 未配置/失败）。检查网络后重试");
  }
  const markdown = await summarizeWithLlm(buildDigestPrompt(items));
  return { markdown, sources: items.length };
}
