"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export function CopyEmailButton({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    };
  }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      setStatus("error");
    }

    if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  const feedback = status === "copied" ? "Copied" : "Couldn't copy";

  return (
    <button
      type="button"
      onClick={copyEmail}
      aria-label="Copy email address"
      className="group relative flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F9F9F9] text-zinc-500 transition-colors duration-200 hover:bg-[#F1F1F1] hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF]"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-30 max-w-[180px] -translate-x-1/2 whitespace-nowrap rounded-[7px] bg-black px-2.5 py-1.5 text-[10px] font-medium leading-none text-white shadow-[0_8px_20px_#00000024] ${
          status === "idle"
            ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
            : "opacity-100"
        }`}
      >
        {status === "idle" ? "Email" : feedback}
      </span>
      <span role="status" className="sr-only">
        {status === "idle" ? "" : feedback}
      </span>
      {children}
    </button>
  );
}
