"use client";

import { useEffect, useRef, useState } from "react";
import { TextMorph } from "torph/react";

export function CopyEmailButton({ email }: { email: string }) {
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
    resetTimer.current = setTimeout(() => setStatus("idle"), 600);
  }

  return (
    <>
      <button
        type="button"
        onClick={copyEmail}
        aria-label={status === "copied" ? "Email copied" : `Copy email: ${email}`}
        title={email}
        className="cursor-pointer underline underline-offset-2 transition-colors duration-200 hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF] motion-reduce:transition-none"
      >
        <TextMorph
          as="span"
          className="[&_span]:underline [&_span]:underline-offset-2"
          duration={260}
          ease="cubic-bezier(0.22, 1, 0.36, 1)"
          respectReducedMotion
        >
          {status === "copied" ? "copied" : "email"}
        </TextMorph>
      </button>
      <span role="status" className="sr-only">
        {status === "copied"
          ? "Email copied to clipboard."
          : status === "error"
            ? `Couldn't copy email. You can copy it manually: ${email}`
            : ""}
      </span>
    </>
  );
}
