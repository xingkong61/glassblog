import { afterEach, describe, expect, it, vi } from "vitest";
import { extractImageUrl, uploadToCustomBed } from "@/lib/image-bed";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("图床响应解析", () => {
  it("识别常见返回形状", () => {
    expect(extractImageUrl({ url: "https://cdn.example.com/a.webp" })).toBe("https://cdn.example.com/a.webp");
    expect(extractImageUrl({ data: { url: "https://cdn.example.com/b.webp" } })).toBe(
      "https://cdn.example.com/b.webp",
    );
    expect(extractImageUrl({ data: [{ url: "https://cdn.example.com/c.webp" }] })).toBe(
      "https://cdn.example.com/c.webp",
    );
    expect(extractImageUrl({ result: { imageUrl: "https://cdn.example.com/d.webp" } })).toBe(
      "https://cdn.example.com/d.webp",
    );
  });

  it("找不到 URL 或非 http 链接时返回 null", () => {
    expect(extractImageUrl(null)).toBeNull();
    expect(extractImageUrl({ ok: true })).toBeNull();
    expect(extractImageUrl({ url: "/relative/path.png" })).toBeNull();
    expect(extractImageUrl("not-an-object")).toBeNull();
  });
});

describe("外部图床上传", () => {
  it("以 multipart 转发，带 Bearer token，返回图床 URL", async () => {
    // 声明参数类型，让 mock.calls 是 [url, init] 元组而不是空元组
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () => ({ data: { url: "https://cdn.example.com/uploaded.webp" } }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const url = await uploadToCustomBed(
      Buffer.from("fake-image"),
      "photo.webp",
      "image/webp",
      { apiUrl: "https://bed.example.com/api/upload", token: "secret-token" },
    );

    expect(url).toBe("https://cdn.example.com/uploaded.webp");
    const init = fetchMock.mock.calls[0][1]!;
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer secret-token");
    expect(init.body instanceof FormData).toBe(true);
    expect((init.body as FormData).get("file")).not.toBeNull();
  });

  it("未配置地址直接报错", async () => {
    await expect(
      uploadToCustomBed(Buffer.from("x"), "a.webp", "image/webp", { apiUrl: "  ", token: "" }),
    ).rejects.toThrow(/未配置/);
  });

  it("图床非 2xx 或响应没有 URL 时报错", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })));
    await expect(
      uploadToCustomBed(Buffer.from("x"), "a.webp", "image/webp", { apiUrl: "https://bed.example.com", token: "" }),
    ).rejects.toThrow(/HTTP 500/);

    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) })));
    await expect(
      uploadToCustomBed(Buffer.from("x"), "a.webp", "image/webp", { apiUrl: "https://bed.example.com", token: "" }),
    ).rejects.toThrow(/没有找到图片 URL/);
  });
});
