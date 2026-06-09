"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X } from "lucide-react";

/* lazy-load ChatWindow — zero cost until user opens it */
const ChatWindow = dynamic(() => import("./ChatWindow"), {
  ssr: false,
  loading: () => null,
});

export default function ChatWidget() {
  const [open,  setOpen]  = useState(false);
  const [pulse, setPulse] = useState(false);

  /* show notification badge after 4 seconds to attract attention */
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setPulse(false);
  };

  return (
    <>
      {/* Chat window (AnimatePresence gives exit animation) */}
      <AnimatePresence>
        {open && <ChatWindow onClose={() => setOpen(false)} />}
      </AnimatePresence>

      {/* Floating action button — hidden when window is open */}
      {!open && (
        <motion.button
          onClick={handleOpen}
          aria-label="Open EVRadar AI chat"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full
                     bg-gradient-to-br from-green-500 to-green-700
                     shadow-[0_8px_32px_rgba(22,163,74,0.45)] hover:shadow-[0_8px_40px_rgba(22,163,74,0.6)]
                     text-white transition-shadow"
        >
          <Zap size={22} fill="white" />

          {/* Notification badge */}
          {pulse && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[9px] font-black text-white">
                1
              </span>
            </span>
          )}
        </motion.button>
      )}
    </>
  );
}
