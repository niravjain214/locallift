"use client";

import { useEffect, useState } from "react";

type Props = {
  className?: string;
  label?: string;
  onTriggered?: () => void;
};

export function InstallAppButton({
  className,
  label = "Download App",
  onTriggered,
}: Props) {
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

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const w = window as typeof window & {
          __llDeferredPrompt?: InstallPromptEvent | null;
        };

        const evt = w.__llDeferredPrompt ?? null;
        if (evt) {
          await evt.prompt();
          w.__llDeferredPrompt = null;
          onTriggered?.();
          return;
        }

        // Fallback for browsers without native install prompt support.
        window.location.href = "/install";
        onTriggered?.();
      }}
    >
      {label}
    </button>
  );
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

