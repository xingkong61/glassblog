// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import AdSlot from "@/components/AdSlot";

// React 19 的 act() 需要这个全局标志；直接断言在 globalThis 上，用交叉类型避免索引签名报错
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderAd(code: string): HTMLElement {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(<AdSlot code={code} />);
  });
  return host;
}

afterEach(() => {
  document.body.innerHTML = "";
});

// 脚本执行结果写 DOM 属性来断言（vitest 的 window 代理对脚本新增属性不可见，DOM 树是共享的）
const INLINE =
  '<div id="ad-hello">推广位</div><script>document.getElementById("ad-hello").dataset.executed = "yes"</script>';
const EXTERNAL = '<script async src="https://example.com/ad.js" data-ad-client="ca-pub-1"></script>';

describe("AdSlot", () => {
  it("HTML 片段正常渲染，内联脚本被真实执行", () => {
    renderAd(INLINE);
    const ad = document.getElementById("ad-hello");
    expect(ad?.textContent).toBe("推广位");
    expect(ad?.getAttribute("data-executed")).toBe("yes");
  });

  it("带 src 的外部脚本保留属性挂载", () => {
    renderAd(EXTERNAL);
    const s = document.querySelector('script[src="https://example.com/ad.js"]');
    expect(s).not.toBeNull();
    expect(s?.getAttribute("data-ad-client")).toBe("ca-pub-1");
    expect(s?.hasAttribute("async")).toBe(true);
  });

  it("空代码完全不渲染", () => {
    const host = renderAd("   ");
    expect(host.innerHTML).toBe("");
  });
});
