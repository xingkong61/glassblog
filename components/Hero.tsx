import Link from "next/link";

interface HeroProps {
  siteName: string;
  subtitle: string;
  description: string;
  socials: Array<[string, string]>;
}

// 首页 Hero：大标题 + 副标题 + 社交入口 + 下滑提示（参考目标站的头图区，用渐变/星空代替版权图片）
export default function Hero({ siteName, subtitle, description, socials }: HeroProps) {
  return (
    <section className="hero">
      <h1 className="hero-title">{siteName}</h1>
      <p className="hero-subtitle">{subtitle}</p>
      <p className="hero-desc">{description}</p>

      {socials.length > 0 ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {socials.map(([label, href]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              className="rounded-full border border-white/60 bg-white/55 px-4 py-1.5 text-xs font-medium text-slate-600 backdrop-blur transition hover:border-sky-300 hover:text-sky-600 dark:border-white/15 dark:bg-white/10 dark:text-slate-300 dark:hover:text-sky-300"
            >
              {label}
            </a>
          ))}
        </div>
      ) : null}

      <Link href="#recent-posts" className="hero-scroll">
        <span>继续往下</span>
        <span>⌄</span>
      </Link>
    </section>
  );
}
