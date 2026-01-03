"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hiddenRoutes = ["/apply"];

  if (hiddenRoutes.includes(pathname)) return null;
  return <Footer />;
}
