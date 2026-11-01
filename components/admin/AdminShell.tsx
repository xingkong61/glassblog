"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cx } from "@/lib/format";

const LINKS = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/posts", label: "文章管理" },
  { href: "/admin/editor", label: "写文章" },
  { href: "/admin/moments", label: "说说" },
  { href: "/admin/settings", label: "设置" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/40 bg-white/40 backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-100">
            <span>🛠️</span> GlassBlog 后台
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {LINKS.map((l) => {
              const active = l.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cx(
                    "rounded-full px-3 py-1.5 text-sm transition",
                    active
                      ? "bg-indigo-500/15 font-semibold text-indigo-600 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/10",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-slate-500 transition hover:bg-white/60 dark:text-slate-400 dark:hover:bg-white/10"
            >
              ↩ 回到博客
            </Link>
            <button
              onClick={logout}
              className="rounded-full bg-rose-500/10 px-3 py-1.5 text-rose-500 transition hover:bg-rose-500/20"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
