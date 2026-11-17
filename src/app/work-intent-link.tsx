"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { preconnect } from "react-dom";
import { PageWave } from "./page-wave";
import { DESKTOP_QUERY } from "./work/work-media-loader";

type Wave = {
  source: HTMLElement;
  focus: { x: number; y: number } | null;
  playing: boolean;
};

export function WorkIntentLink({
  children,
  className,
  mediaOrigins,
  preview,
}: {
  children: ReactNode;
  className: string;
  mediaOrigins: string[];
  // The work page, revealed under a transition wave on desktop.
  preview?: ReactNode;
}) {
  const router = useRouter();
  const [wave, setWave] = useState<Wave | null>(null);
  const canWave = () => Boolean(preview) && window.matchMedia(DESKTOP_QUERY).matches;

  // Let the hidden work page go if the visitor moves on without clicking.
  const releaseWorkPage = () => {
    if (!wave?.playing) setWave(null);
  };

  const warmWorkPage = (source: HTMLElement) => {
    for (const origin of mediaOrigins) {
      preconnect(origin, { crossOrigin: "anonymous" });
    }

    router.prefetch("/work");
    // Mount the wave on intent so the work media loads before the click.
    if (!wave && canWave()) setWave({ source, focus: null, playing: false });
  };

  return (
    <>
      <Link
        href="/work"
        className={className}
        prefetch={false}
        onPointerEnter={(event) => warmWorkPage(event.currentTarget)}
        onPointerDown={(event) => warmWorkPage(event.currentTarget)}
        onFocus={(event) => warmWorkPage(event.currentTarget)}
        onPointerLeave={releaseWorkPage}
        onBlur={releaseWorkPage}
        onClick={(event) => {
          if (
            wave?.playing ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            !canWave()
          ) {
            if (wave?.playing) event.preventDefault();
            return;
          }
          event.preventDefault();
          // Keyboard clicks report no pointer; let the wave start from the link.
          setWave({
            source: event.currentTarget,
            focus: event.detail > 0 ? { x: event.clientX, y: event.clientY } : null,
            playing: true,
          });
        }}
      >
        {children}
      </Link>
      {wave ? (
        <PageWave
          href="/work"
          type="center"
          source={wave.source}
          focus={wave.focus}
          playing={wave.playing}
          contentSelector="[data-home-page]"
          contentPicture="dom"
          revealedContent={preview}
          revealedPicture="media"
        />
      ) : null}
    </>
  );
}
