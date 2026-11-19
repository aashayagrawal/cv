"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

export const LOAD_WORK_VIDEO_EVENT = "load-work-video";
export const DESKTOP_QUERY = "(min-width: 1024px)";
const TABLET_QUERY = "(min-width: 768px)";

function subscribeToColumnCount(onChange: () => void) {
  const query = window.matchMedia(TABLET_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getColumnCount() {
  return window.matchMedia(TABLET_QUERY).matches ? 2 : 1;
}

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

// Work media asks for CORS so the transition wave can draw it. A host that
// will not allow that would leave it blank, so retry it as a plain request:
// it shows on the page and the wave leaves it out.
function retryWithoutCors(media: EventTarget | null) {
  if (!(media instanceof HTMLImageElement || media instanceof HTMLVideoElement)) return;
  if (!media.hasAttribute("crossorigin")) return;
  // Images reload on their own when the attribute changes; videos do not.
  media.removeAttribute("crossorigin");
  if (media instanceof HTMLVideoElement) media.load();
}

export function WorkMediaLoader({ items }: { items: ReactNode[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Load errors do not bubble; listen in the capture phase. On the document,
    // so the lightbox's copies, rendered elsewhere, are covered too.
    const onError = (event: Event) => retryWithoutCors(event.target);
    document.addEventListener("error", onError, true);
    // Server-rendered media may have failed before this listener existed.
    for (const media of document.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
      "img[crossorigin], video[crossorigin]"
    )) {
      const failed =
        media instanceof HTMLImageElement
          ? media.complete && media.naturalWidth === 0 && Boolean(media.currentSrc)
          : media.error !== null;
      if (failed) retryWithoutCors(media);
    }
    return () => document.removeEventListener("error", onError, true);
  }, []);

  // The server renders desktop columns; mobile collapses them with CSS order.
  const columnCount = useSyncExternalStore(subscribeToColumnCount, getColumnCount, () => 2);

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
  }, [columnCount]);

  return (
    <div ref={rootRef} className="flex flex-col gap-[6px] p-[10px] md:grid md:grid-cols-2 md:items-start">
      {Array.from({ length: columnCount }, (_, columnIndex) => (
        <div
          key={columnIndex}
          className="contents md:flex md:min-w-0 md:flex-col md:gap-[6px]"
        >
          {items.filter((_, index) => index % columnCount === columnIndex)}
        </div>
      ))}
    </div>
  );
}
