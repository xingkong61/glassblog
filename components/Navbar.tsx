"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/archive", label: "归档" },
  { href: "/tags", label: "标签" },
  { href: "/moments", label: "说说" },
  { href: "/about", label: "关于" },
];

const DIGEST_LINK = { href: "/digests", label: "每日选刊" };

export default function Navbar({ siteName, showDigests = false }: { siteName: string; showDigests?: boolean }) {
  const pathname = usePathname();
  const home = pathname === "/";

  if (pathname?.startsWith("/admin")) return null;

  // 有已发布选刊时才出现「每日选刊」入口，插在首页之后
  const links = showDigests ? [NAV_LINKS[0], DIGEST_LINK, ...NAV_LINKS.slice(1)] : NAV_LINKS;

  return (
    <header
      className={cx(
        "nav-blur z-40",
        home ? "fixed inset-x-0 top-0" : "sticky top-0",
      )}
    >
      <nav className="relative mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-white transition-opacity hover:opacity-90"
        >
          <span className="max-w-[9rem] truncate sm:max-w-none">{siteName}</span>
        </Link>

        {/* 导航链接：与站名同一排平铺，空间不足时可横向滑动；桌面端居中 */}
        <div className="flex min-w-0 flex-1 items-center justify-start gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center md:absolute md:left-1/2 md:top-1/2 md:flex-none md:-translate-x-1/2 md:-translate-y-1/2 md:gap-1 md:overflow-visible">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cx(
                  "shrink-0 rounded-full px-2.5 py-1.5 text-[13px] transition md:px-3.5 md:text-sm",
                  active
                    ? "bg-white/15 font-semibold text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
