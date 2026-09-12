"use client";

import { useEffect, useRef, type ReactNode } from "react";

export const LOAD_WORK_VIDEO_EVENT = "load-work-video";

function waitForMedia(
  media: HTMLImageElement | HTMLVideoElement,
  signal: AbortSignal
) {
  const isImage = media instanceof HTMLImageElement;
  if (signal.aborted || (isImage ? media.complete : media.readyState >= 2)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const event = isImage ? "load" : "loadeddata";
    const finish = () => {
      clearTimeout(timeout);
      media.removeEventListener(event, finish);
      media.removeEventListener("error", finish);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timeout = setTimeout(finish, 10000);
    media.addEventListener(event, finish, { once: true });
    media.addEventListener("error", finish, { once: true });
    signal.addEventListener("abort", finish, { once: true });
  });
}

export function WorkMediaLoader({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    // The DOM is grouped into columns; restore the visual reading order.
    const items = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>("[data-work-order]") ?? []
    ).sort((a, b) => Number(a.dataset.workOrder) - Number(b.dataset.workOrder));
    const images = items.flatMap((item) => Array.from(item.querySelectorAll("img")));
    const videos = items.flatMap((item) => Array.from(item.querySelectorAll("video")));

    async function loadRemainingMedia() {
      await Promise.all(
        images.filter((image) => image.loading === "eager")
          .map((image) => waitForMedia(image, signal))
      );

      const remaining = images.filter((image) => image.loading !== "eager");
      for (let index = 0; index < remaining.length; index += 4) {
        if (signal.aborted) return;
        await Promise.all(remaining.slice(index, index + 4).map((image) => {
          image.loading = "eager";
          return waitForMedia(image, signal);
        }));
      }

      for (const video of videos) {
        if (signal.aborted) return;
        const ready = waitForMedia(video, signal);
        video.dispatchEvent(new Event(LOAD_WORK_VIDEO_EVENT));
        await ready;
      }
    }

    void loadRemainingMedia();
    return () => controller.abort();
  }, []);

  return (
    <div ref={rootRef} className="flex flex-col gap-[6px] p-[10px] sm:grid sm:grid-cols-2 sm:items-start">
      {children}
    </div>
  );
}
