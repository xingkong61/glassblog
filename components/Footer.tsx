import Link from "next/link";
import { getSiteConfig } from "@/lib/settings";

export default function Footer() {
  const site = getSiteConfig();
  const year = new Date().getFullYear();
  return (
    <footer className="px-4 pb-8 sm:px-6">
      <div className="glass mx-auto max-w-6xl px-6 py-5 text-center text-sm text-slate-500 dark:text-slate-400">
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
        <div className="mt-1 flex items-center justify-center gap-3">
          <Link href="/admin" className="opacity-40 transition hover:opacity-80" title="本地管理入口">
            管理
          </Link>
          <a href="/rss.xml" className="opacity-40 transition hover:opacity-80" title="RSS 订阅">
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
