"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

const ChatWindow = dynamic(() => import("./ChatWindow"), {
  ssr: false,
  loading: () => null,
});

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setPulse(false);
  };
  const fabStyle = {
    position: "fixed",
    bottom: window.innerWidth < 768 ? "100px" : "20px",
    right: window.innerWidth < 768 ? "34px" : "20px",
    zIndex: 9999,
  };

  return (
    <>
      <AnimatePresence>
        {open && <ChatWindow onClose={() => setOpen(false)} />}
      </AnimatePresence>

      {!open && (
        <motion.button
          onClick={handleOpen}
          aria-label="Open EVRadar AI chat"
          style={fabStyle}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="flex h-14 w-14 items-center justify-center rounded-full
                     bg-linear-to-br from-green-500 to-green-700
                     shadow-[0_8px_32px_rgba(22,163,74,0.5)]
                     hover:shadow-[0_8px_40px_rgba(22,163,74,0.7)]
                     text-white transition-shadow"
        >
          <Zap size={24} fill="white" />

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
