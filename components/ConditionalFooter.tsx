"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  // Hide footer on /apply route to prevent UI clutter
  if (pathname === "/apply") return null;

  return <Footer />;
}
