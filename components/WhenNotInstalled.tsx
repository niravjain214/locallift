"use client";

import { useEffect, useState } from "react";

export function WhenNotInstalled({ children }: { children: React.ReactNode }) {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(display-mode: standalone)");
    const update = () => {
      const navStandalone = (navigator as any).standalone === true; // iOS
      setIsStandalone(Boolean(mq?.matches || navStandalone));
    };
    update();
    mq?.addEventListener?.("change", update);
    window.addEventListener("appinstalled", update);
    return () => {
      mq?.removeEventListener?.("change", update);
      window.removeEventListener("appinstalled", update);
    };
  }, []);

  if (isStandalone) return null;
  return children;
}

