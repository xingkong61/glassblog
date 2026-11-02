import { afterEach, describe, expect, it } from "vitest";
import { configuredProxy, proxyEnv } from "@/lib/git";

afterEach(() => {
  delete process.env.GIT_PROXY;
});

describe("发布代理配置", () => {
  it("未设置代理返回空环境（不覆盖系统设置）", () => {
    expect(proxyEnv("")).toEqual({});
    expect(proxyEnv("   ")).toEqual({});
  });

  it("设置代理时同时写入 HTTPS_PROXY 与 HTTP_PROXY", () => {
    expect(proxyEnv("http://127.0.0.1:11129")).toEqual({
      HTTPS_PROXY: "http://127.0.0.1:11129",
      HTTP_PROXY: "http://127.0.0.1:11129",
    });
  });

  it("configuredProxy 读取环境变量并去空白", () => {
    process.env.GIT_PROXY = "  http://127.0.0.1:7890  ";
    expect(configuredProxy()).toBe("http://127.0.0.1:7890");
    delete process.env.GIT_PROXY;
    expect(configuredProxy()).toBe("");
  });
});
