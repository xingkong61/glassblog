import { notFound } from "next/navigation";
import { isCloudMode } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // 线上部署（ADMIN_MODE=cloud）时整个后台不存在
  if (isCloudMode()) notFound();
  return <>{children}</>;
}
