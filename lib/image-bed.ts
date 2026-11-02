// 外部图床适配：约定「POST multipart(file 字段) + Bearer token，返回 JSON 里带 url」。
// 覆盖 PicGo / 兰空 / 多数自建图床的通用形态；不适配需要签名的 OSS 原生接口。
export interface ImageBedConfig {
  apiUrl: string;
  token: string;
}

function findUrl(value: unknown, depth = 0): string | null {
  if (depth > 3 || value === null || value === undefined) return null;
  if (typeof value === "string") {
    return /^https?:\/\//i.test(value.trim()) ? value.trim() : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const hit = findUrl(item, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // 优先常见字段，避免把无关链接当图片地址
    for (const key of ["url", "imageUrl", "src", "link"]) {
      const hit = findUrl(obj[key], depth + 1);
      if (hit) return hit;
    }
    for (const key of ["data", "result", "image", "links"]) {
      const hit = findUrl(obj[key], depth + 1);
      if (hit) return hit;
    }
  }
  return null;
}

// 从图床响应里提取图片 URL（兼容 {url} / {data:{url}} / {data:[{url}]} 等形状）
export function extractImageUrl(payload: unknown): string | null {
  return findUrl(payload);
}

export async function uploadToCustomBed(
  buffer: Buffer,
  filename: string,
  mime: string,
  cfg: ImageBedConfig,
): Promise<string> {
  const apiUrl = cfg.apiUrl.trim();
  if (!apiUrl) throw new Error("外部图床未配置 API 地址");

  // Buffer 转 ArrayBuffer 再包成 Blob，避免 TS 的 Buffer/BlobPart 类型冲突
  const bytes = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mime }), filename);

  const headers: Record<string, string> = {};
  const token = cfg.token.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: form,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`图床返回 HTTP ${res.status}`);

  const data = (await res.json().catch(() => null)) as unknown;
  const url = extractImageUrl(data);
  if (!url) throw new Error("图床响应里没有找到图片 URL");
  return url;
}
