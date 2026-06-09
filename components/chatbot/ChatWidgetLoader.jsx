"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

export default function ChatWidgetLoader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (pathname?.startsWith("/admin")) return null;
  if (!mounted) return null;

  /* render directly into body — bypasses any ancestor transform/overflow */
  return createPortal(<ChatWidget />, document.body);
}
