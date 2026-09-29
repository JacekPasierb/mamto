"use client";

import {useEffect, useState, type ReactNode} from "react";
import {createPortal} from "react-dom";

type ModalPortalProps = {
  children: ReactNode;
};

/** Renderuje modal w document.body — poza AppShell (backdrop-filter / overflow). */
const ModalPortal = ({children}: ModalPortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(children, document.body);
};

export default ModalPortal;
