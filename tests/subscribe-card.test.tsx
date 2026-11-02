// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import SubscribeCard from "@/components/SubscribeCard";

// React 19 的 act() 需要这个全局标志；直接断言在 globalThis 上，用交叉类型避免索引签名报错
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderCard(): HTMLElement {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(<SubscribeCard title="订阅更新" note="新内容通知" />);
  });
  return host;
}

function typeEmail(host: HTMLElement, value: string) {
  const input = host.querySelector<HTMLInputElement>('input[type="email"]')!;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function submit(host: HTMLElement) {
  const form = host.querySelector("form")!;
  await act(async () => {
    form.requestSubmit();
  });
}

function mockFetch(payload: { ok?: boolean; duplicate?: boolean; error?: string }, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      json: async () => payload,
    })),
  );
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

describe("订阅卡片", () => {
  it("提交成功后显示成功文案并清空输入", async () => {
    mockFetch({ ok: true });
    const host = renderCard();
    expect(host.textContent).toContain("订阅更新");
    typeEmail(host, "reader@example.com");
    await submit(host);
    expect(host.textContent).toContain("订阅成功");
    expect(host.querySelector<HTMLInputElement>('input[type="email"]')!.value).toBe("");
  });

  it("重复订阅给出对应提示", async () => {
    mockFetch({ ok: true, duplicate: true });
    const host = renderCard();
    typeEmail(host, "reader@example.com");
    await submit(host);
    expect(host.textContent).toContain("已经订阅过");
  });

  it("接口报错时展示错误信息", async () => {
    mockFetch({ error: "邮箱格式不正确" }, 400);
    const host = renderCard();
    typeEmail(host, "bad@x");
    await submit(host);
    expect(host.textContent).toContain("邮箱格式不正确");
  });

  it("蜜罐字段随请求提交（用于静默拦截机器人）", async () => {
    mockFetch({ ok: true });
    const host = renderCard();
    const honeypot = host.querySelector<HTMLInputElement>('input[name="website"]')!;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    const spy = vi.spyOn(globalThis, "fetch");
    typeEmail(host, "reader@example.com");
    act(() => {
      setter.call(honeypot, "bot-filled");
      honeypot.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await submit(host);
    const body = String((spy.mock.calls[0][1] as RequestInit).body);
    expect(body).toContain("bot-filled");
  });
});
