import Link from "next/link";
import Typewriter from "./Typewriter";

interface HeroProps {
  siteName: string;
  subtitle: string;
}

// 首页整屏 Hero：背景由全站固定背景层提供（Hero 本身透明），
// 只有发光大标题、打字机副标题和下滑箭头。
export default function Hero({ siteName, subtitle }: HeroProps) {
  return (
    <section className="hero-full full-bleed">
      <div className="hero-full-content">
        <h1 className="hero-full-title">{siteName}</h1>
        <p className="hero-full-subtitle">
          <Typewriter text={subtitle} />
        </p>
      </div>

      <Link href="#recent-posts" className="hero-full-scroll" aria-label="下滑到文章列表">
        ⌄
      </Link>
    </section>
  );
}
