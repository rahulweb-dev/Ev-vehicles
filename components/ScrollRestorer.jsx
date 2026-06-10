"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    /* Kill any GSAP ScrollTriggers left over from the previous page */
    try { ScrollTrigger.killAll(); } catch {}

    /* Force scroll to top immediately */
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
