"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent ?? "";
    const ios = /iPad|iPhone|iPod/i.test(ua);
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
    setIsIos(ios);
    setIsMobile(mobile);

    const mq = window.matchMedia?.("(display-mode: standalone)");
    const updateStandalone = () => {
      const navStandalone = (navigator as any).standalone === true; // iOS
      setIsStandalone(Boolean(mq?.matches || navStandalone));
    };
    updateStandalone();
    mq?.addEventListener?.("change", updateStandalone);
    window.addEventListener("appinstalled", updateStandalone);
    return () => {
      mq?.removeEventListener?.("change", updateStandalone);
      window.removeEventListener("appinstalled", updateStandalone);
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const evt = e as InstallPromptEvent;
      setDeferred(evt);
      (window as typeof window & { __llDeferredPrompt?: InstallPromptEvent | null }).__llDeferredPrompt = evt;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      (window as typeof window & { __llDeferredPrompt?: InstallPromptEvent | null }).__llDeferredPrompt = null;
    };
  }, []);

  if (dismissed || isStandalone) return null;
  const showIos = isMobile && isIos && !deferred;
  const showAndroid = Boolean(deferred);
  if (!showIos && !showAndroid) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-black/[0.08] bg-[#E9B8C9] p-4 shadow-xl backdrop-blur-sm sm:left-auto">
      <p className="text-sm font-semibold text-slate-900">Install LocalLift</p>
      <p className="mt-1 text-xs text-slate-800/90">
        Add to Home for quick access. No GPS permissions.
      </p>
      <div className="mt-3 flex gap-2">
        {deferred ? (
          <button
            type="button"
            className="flex-1 rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white"
            onClick={async () => {
              await deferred.prompt();
              setDeferred(null);
              (window as typeof window & { __llDeferredPrompt?: InstallPromptEvent | null }).__llDeferredPrompt = null;
            }}
          >
            Install
          </button>
        ) : (
          <div className="flex-1 rounded-xl bg-white/80 px-3 py-2 text-xs font-medium text-slate-900 ring-1 ring-black/10 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
            On iPhone: tap <span className="font-semibold">Share</span> →{" "}
            <span className="font-semibold">Add to Home Screen</span>
          </div>
        )}
        <button
          type="button"
          className="rounded-xl border border-slate-800/20 bg-white/60 px-4 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          onClick={() => {
            setDismissed(true);
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
