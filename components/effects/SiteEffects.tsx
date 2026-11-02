"use client";

import { usePathname } from "next/navigation";
import BackToTop from "./BackToTop";
import CustomCursor from "./CustomCursor";
import ReadingProgress from "./ReadingProgress";
import Sakura from "./Sakura";
import StarField from "./StarField";

// 站点氛围层：后台不挂载，避免影响写作界面
export default function SiteEffects() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const showReading = pathname?.startsWith("/posts/") || pathname?.startsWith("/digests/");

  return (
    <>
      <StarField />
      <Sakura />
      <CustomCursor />
      {showReading ? <ReadingProgress /> : null}
      <BackToTop />
    </>
  );
}
