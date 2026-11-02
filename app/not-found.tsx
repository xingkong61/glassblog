import Link from "next/link";

export default function NotFound() {
  const links = [
    { href: "/", label: "回到首页" },
    { href: "/archive", label: "全部文章" },
    { href: "/digests", label: "每日选刊" },
    { href: "/tags", label: "按标签浏览" },
  ];

  return (
    <div className="mx-auto max-w-xl pt-10">
      <div className="glass px-8 py-12 text-center">
        <div className="text-6xl" aria-hidden>
          🪟
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">这扇窗是空的</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          页面可能已经移走、改名，或者链接本身拼错了。
          <br />
          下面这些地方还亮着灯。
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full bg-indigo-500/10 px-4 py-2 text-sm text-indigo-600 transition hover:bg-indigo-500/20 dark:text-indigo-300"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
