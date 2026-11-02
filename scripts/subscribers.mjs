// 订阅者导出脚本（服务器上用）：线上 ADMIN_MODE=cloud 时后台不可访问，用它在服务器查看/导出。
// 用法：
//   node scripts/subscribers.mjs list           # 列表打印
//   node scripts/subscribers.mjs export [file]  # 导出 CSV（默认 data/subscribers-export.csv）
//   node scripts/subscribers.mjs count          # 只看数量
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const store = path.join(root, "data", "subscribers.jsonl");

function readAll() {
  let raw = "";
  try {
    raw = fs.readFileSync(store, "utf8");
  } catch {
    console.error(`❌ 没有找到 ${store}（还没有人订阅，或站点不在当前目录）`);
    process.exit(1);
  }
  const seen = new Set();
  const out = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const item = JSON.parse(line);
      const email = String(item.email ?? "").trim().toLowerCase();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      out.push({ email, at: String(item.at ?? ""), source: String(item.source ?? "site") });
    } catch {
      // 坏行跳过
    }
  }
  return out.sort((a, b) => (a.at < b.at ? 1 : -1));
}

function csvCell(v) {
  return `"${String(v).replace(/"/g, '""')}"`;
}

const cmd = process.argv[2] ?? "count";
const rows = readAll();

if (cmd === "count") {
  console.log(`订阅者数量：${rows.length}`);
} else if (cmd === "list") {
  rows.forEach((r) => console.log(`${r.at.slice(0, 10) || "—"}  ${r.email}`));
  console.log(`\n共 ${rows.length} 人`);
} else if (cmd === "export") {
  const target = process.argv[3] ?? path.join(root, "data", "subscribers-export.csv");
  const csv = [["email", "subscribed_at", "source"].map(csvCell).join(",")]
    .concat(rows.map((r) => [r.email, r.at, r.source].map(csvCell).join(",")))
    .join("\r\n");
  fs.writeFileSync(target, "\uFEFF" + csv + "\r\n", "utf8");
  console.log(`✅ 已导出 ${rows.length} 条到 ${target}`);
} else {
  console.error("用法：node scripts/subscribers.mjs <list|count|export> [输出文件]");
  process.exit(1);
}
