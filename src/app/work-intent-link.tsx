"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { preconnect } from "react-dom";

export function WorkIntentLink({
  children,
  className,
  mediaOrigins,
}: {
  children: ReactNode;
  className: string;
  mediaOrigins: string[];
}) {
  const router = useRouter();

  const warmWorkPage = () => {
    for (const origin of mediaOrigins) {
      preconnect(origin, { crossOrigin: "anonymous" });
    }

    router.prefetch("/work");
  };

  return (
    <Link
      href="/work"
      className={className}
      prefetch={false}
      onPointerEnter={warmWorkPage}
      onPointerDown={warmWorkPage}
      onFocus={warmWorkPage}
    >
      {children}
    </Link>
  );
}
