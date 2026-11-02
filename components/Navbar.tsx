"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/lib/format";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/archive", label: "归档" },
  { href: "/tags", label: "标签" },
  { href: "/moments", label: "说说" },
  { href: "/about", label: "关于" },
];

const DIGEST_LINK = { href: "/digests", label: "每日选刊" };

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("gb-theme", next ? "dark" : "light");
    } catch {
      /* 隐私模式忽略 */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
      className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-sky-500/10"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}

export default function Navbar({ siteName, showDigests = false }: { siteName: string; showDigests?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  // 有已发布选刊时才出现「每日选刊」入口，插在首页之后
  const links = showDigests ? [NAV_LINKS[0], DIGEST_LINK, ...NAV_LINKS.slice(1)] : NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav className="glass relative mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-5">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-100">
          <span className="text-xl">🪟</span>
          <span className="max-w-[9rem] truncate sm:max-w-none">{siteName}</span>
        </Link>

        {/* 桌面端菜单居中（参考目标站导航布局） */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cx(
                  "rounded-full px-3.5 py-1.5 text-sm transition",
                  active
                    ? "bg-sky-500/15 font-semibold text-sky-600 dark:text-sky-300"
                    : "text-slate-600 hover:bg-sky-500/10 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-sky-300",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="打开菜单"
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-sky-500/10 md:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl p-2 md:hidden">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cx(
                  "block rounded-xl px-4 py-2.5 text-sm",
                  active
                    ? "bg-sky-500/15 font-semibold text-sky-600 dark:text-sky-300"
                    : "text-slate-600 dark:text-slate-300",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
