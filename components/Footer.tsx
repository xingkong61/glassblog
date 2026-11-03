import Link from "next/link";
import { getSiteConfig } from "@/lib/settings";

export default function Footer() {
  const site = getSiteConfig();
  const year = new Date().getFullYear();
  return (
    <footer className="px-4 pb-8 sm:px-6">
      <div className="site-footer mx-auto max-w-6xl border-t border-slate-200/50 py-6 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
        <div>
          © {year} {site.author}
          {site.footerText ? ` · ${site.footerText}` : null}
        </div>
        {site.icp ? (
          <div className="mt-1">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:underline">
              {site.icp}
            </a>
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-center gap-3">
          <Link href="/admin" className="opacity-40 transition hover:text-sky-500 hover:opacity-90" title="本地管理入口">
            管理
          </Link>
          <a href="/rss.xml" className="opacity-40 transition hover:text-sky-500 hover:opacity-90" title="RSS 订阅">
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
