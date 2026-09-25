"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

const NAME = "CHECCITO".split("");

export default function Boot({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="boot"
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.28 }}
      onClick={onDone}
      role="button"
      aria-label="Entrar a Checcito"
    >
      <motion.img
        className="boot-logo"
        src="/logo.png"
        alt="Checcito, mascota de ciberseguridad"
        initial={{ scale: 0, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      />
      <motion.p
        className="boot-over"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        Formación en ciberseguridad
      </motion.p>
      <h1 className="boot-title" aria-label="CHECCITO">
        {NAME.map((l, i) => (
          <motion.span
            key={i}
            className="boot-letter"
            initial={{ y: 46, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 320, damping: 19 }}
            aria-hidden
          >
            {l}
          </motion.span>
        ))}
      </h1>
      <motion.p
        className="boot-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.05 }}
      >
        5 islas · 0 clics en trampas · toca para entrar
      </motion.p>
      <motion.span
        className="boot-cursor"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        ▊
      </motion.span>
    </motion.div>
  );
}
