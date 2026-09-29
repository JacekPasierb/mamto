"use client";

import {useEffect, useState} from "react";
import {createPortal} from "react-dom";

type MobileQuickAddFabProps = {
  onClick: () => void;
};

/** Zielony plus nad dolnym menu — tylko telefon / tablet (< lg). */
const MobileQuickAddFab = ({onClick}: MobileQuickAddFabProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <button
      type="button"
      onClick={onClick}
      aria-label="Dodaj rzecz"
      className="fixed left-1/2 z-40 flex size-[3.5rem] -translate-x-1/2 items-center justify-center rounded-full bg-[var(--mt-accent)] text-white shadow-[0_8px_24px_rgba(10,99,99,0.35)] transition hover:bg-[var(--mt-ink)] active:scale-95 lg:hidden"
      style={{
        bottom: "calc(5.75rem + env(safe-area-inset-bottom) - 1.75rem)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>,
    document.body
  );
};

export default MobileQuickAddFab;
