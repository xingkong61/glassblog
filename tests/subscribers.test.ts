import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addSubscriber, isValidEmail, listSubscribers, normalizeEmail, removeSubscriber } from "@/lib/subscribers";

let root: string;

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "gb-subs-"));
  process.env.GLASSBLOG_ROOT = root;
});

afterEach(() => {
  delete process.env.GLASSBLOG_ROOT;
  rmSync(root, { recursive: true, force: true });
});

describe("邮箱校验", () => {
  it("常见合法邮箱通过", () => {
    for (const e of ["a@b.co", "first.last+tag@example.com", "USER@Example.COM"]) {
      expect(isValidEmail(normalizeEmail(e))).toBe(true);
    }
  });

  it("非法格式被拒绝", () => {
    for (const e of ["", "abc", "a@b", "a@b.c", "a b@c.com", "@example.com", "a@@b.com", `${"x".repeat(300)}@b.com`]) {
      expect(isValidEmail(normalizeEmail(e))).toBe(false);
    }
  });

  it("归一化：去空白、转小写", () => {
    expect(normalizeEmail("  HELLO@Example.COM ")).toBe("hello@example.com");
    expect(normalizeEmail(null)).toBe("");
  });
});

describe("订阅存取", () => {
  it("新增后可列出，邮箱统一小写", () => {
    const r = addSubscriber("  Foo@Bar.COM ", { source: "site", now: new Date("2026-11-02T10:00:00Z") });
    expect(r).toEqual({ added: true, email: "foo@bar.com" });
    const list = listSubscribers();
    expect(list).toHaveLength(1);
    expect(list[0].email).toBe("foo@bar.com");
    expect(list[0].source).toBe("site");
    expect(list[0].at).toBe("2026-11-02T10:00:00.000Z");
  });

  it("重复订阅不再写入（大小写不同也算重复）", () => {
    addSubscriber("foo@bar.com", { now: new Date("2026-11-02T10:00:00Z") });
    expect(addSubscriber("FOO@BAR.COM").added).toBe(false);
    expect(listSubscribers()).toHaveLength(1);
  });

  it("非法邮箱抛错", () => {
    expect(() => addSubscriber("not-an-email")).toThrow(/邮箱/);
  });

  it("移除订阅者", () => {
    addSubscriber("a@b.com");
    addSubscriber("c@d.com");
    expect(removeSubscriber("A@B.COM")).toBe(true);
    expect(listSubscribers().map((s) => s.email)).toEqual(["c@d.com"]);
    expect(removeSubscriber("missing@x.com")).toBe(false);
  });

  it("坏行被跳过，不影响其余数据", () => {
    mkdirSync(path.join(root, "data"), { recursive: true });
    writeFileSync(
      path.join(root, "data", "subscribers.jsonl"),
      ['{"email":"ok@x.com","at":"2026-11-01T00:00:00.000Z"}', "{not json}", '{"email":"bad-email"}', ""].join("\n"),
      "utf8",
    );
    expect(listSubscribers().map((s) => s.email)).toEqual(["ok@x.com"]);
  });
});
