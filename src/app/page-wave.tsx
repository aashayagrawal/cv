"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  DistortionWave,
  snapshot,
  type CaptureFunction,
  type CaptureRequest,
  type DistortionWaveHandle,
} from "@/lib/distortion-waves";

type Point = { x: number; y: number };
type Media = HTMLImageElement | HTMLVideoElement;

// How a view is pictured for the wave: "dom" redraws its markup (text pages),
// "media" copies the images and videos on screen (the work grid).
export type WavePicture = "dom" | "media";

// About 1.3s end to end, against the library's 3.6s: a short pull toward the
// source, a quicker climb, and edges that clear soon after the front passes.
const WAVE_STYLE = {
  anticipation: 0.18,
  travel: 1.35,
  rimFade: 1.1,
  hairlineLinger: 0.15,
  hairlineFade: 0.8,
  particleLife: 1.1,
};
// The longest a slow picture may hold the wave back; its lens eases in late.
const PREPARE_TIMEOUT = 180;
// The longest the wave waits for the revealed view's media to load.
const MEDIA_TIMEOUT = 1500;
// Navigate anyway if the wave never reports its end, such as when the tab
// is hidden mid-run and animation frames stop.
const FINISH_TIMEOUT = 4000;
// Keys that would scroll the page out from under the wave's picture.
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

function isReady(media: Media) {
  return media instanceof HTMLImageElement
    ? media.complete && media.naturalWidth > 0
    : media.readyState >= 2;
}

// Cross-origin media drawn without CORS would taint the canvas for WebGL.
function canDraw(media: Media) {
  const src = media.currentSrc || media.src;
  if (!src || media.crossOrigin !== null) return true;
  try {
    const url = new URL(src, location.href);
    return url.origin === location.origin || url.protocol === "blob:" || url.protocol === "data:";
  } catch {
    return false;
  }
}

// Hidden by the page itself, such as the lightbox's open item; the wave's own
// hidden layer above `root` does not count.
function isHidden(media: Element, root: Element) {
  for (let node: Element | null = media; node && node !== root; node = node.parentElement) {
    if (getComputedStyle(node).opacity === "0") return true;
  }
  return false;
}

function visibleMedia(root: Element, height: number) {
  return Array.from(root.querySelectorAll<Media>("img, video")).filter((media) => {
    const rect = media.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < height && rect.width > 0;
  });
}

function waitForMedia(media: Media[], timeout: number) {
  const pending = media.filter((item) => !isReady(item) && canDraw(item));
  if (pending.length === 0) return Promise.resolve();
  return Promise.race([
    Promise.all(
      pending.map(
        (item) =>
          new Promise<void>((resolve) => {
            const event = item instanceof HTMLImageElement ? "load" : "loadeddata";
            item.addEventListener(event, () => resolve(), { once: true });
            item.addEventListener("error", () => resolve(), { once: true });
          })
      )
    ),
    new Promise<void>((resolve) => setTimeout(resolve, timeout)),
  ]);
}

// Copies the media already on screen straight from the page, rather than
// rebuilding it as SVG: no refetching, and no empty boxes while it loads.
function drawMedia(root: Element, { width, height, scale, background }: CaptureRequest) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("No 2D canvas");
  context.scale(scale, scale);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  for (const media of visibleMedia(root, height)) {
    if (!canDraw(media) || isHidden(media, root)) continue;
    const rect = media.getBoundingClientRect();
    context.save();
    context.beginPath();
    context.roundRect(rect.left, rect.top, rect.width, rect.height, 8);
    context.clip();
    context.fillStyle = "#f5f5f5";
    context.fillRect(rect.left, rect.top, rect.width, rect.height);
    if (isReady(media)) context.drawImage(media, rect.left, rect.top, rect.width, rect.height);
    context.restore();
    context.strokeStyle = "#F3F3F3";
    context.lineWidth = 1;
    context.beginPath();
    context.roundRect(rect.left + 0.5, rect.top + 0.5, rect.width - 1, rect.height - 1, 7.5);
    context.stroke();
  }
  return canvas;
}

// A media view with the controls marked `data-wave-picture` (the work page's
// floating bar) drawn over it, so they arrive with the wave rather than
// appearing once it has passed.
async function drawMediaView(root: Element, request: CaptureRequest) {
  const canvas = drawMedia(root, request);
  const context = canvas.getContext("2d")!;
  context.setTransform(1, 0, 0, 1, 0, 0);
  for (const control of root.querySelectorAll<HTMLElement>("[data-wave-picture]")) {
    context.drawImage(await drawElement(control, request, true), 0, 0);
  }
  return canvas;
}

// Redraws an element's markup where it sits on screen, scrolled or not.
// Transparent leaves the rest clear, to lay it over another picture.
async function drawElement(target: HTMLElement, request: CaptureRequest, transparent = false) {
  const rect = target.getBoundingClientRect();
  const shot = await snapshot(target, {
    width: request.width,
    height: request.height,
    scale: request.scale,
    background: request.background,
    transparent,
    skip: request.ignore,
    force: (el): Record<string, string> | undefined =>
      el === target
        ? {
            position: "absolute",
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            margin: "0",
            // The rect already holds these; written again they would apply twice.
            transform: "none",
            translate: "none",
            animation: "none",
            opacity: "1",
            visibility: "visible",
          }
        : undefined,
  });
  return shot.canvas;
}

// Runs a full-screen wave from `source`, over the current page (found by
// `contentSelector`) into `revealedContent`, then navigates to `href`. Mount
// it ahead with `playing` false to load the revealed view before the click.
export function PageWave({
  contentPicture,
  contentSelector,
  focus,
  href,
  playing,
  revealedContent,
  revealedPicture,
  source,
  type,
}: {
  contentPicture: WavePicture;
  contentSelector: string;
  focus: Point | null;
  href: string;
  playing: boolean;
  revealedContent: ReactNode;
  revealedPicture: WavePicture;
  source: HTMLElement;
  // "vertical" rises from a control at the bottom; "center" rings out from one mid-page.
  type: "vertical" | "center";
}) {
  const router = useRouter();
  const wave = useRef<DistortionWaveHandle>(null);
  const [revealed, setRevealed] = useState(false);
  const [resolution] = useState(() => Math.min(window.devicePixelRatio || 1, 1.5));

  const capture: CaptureFunction = (request) => {
    // The page's own view, not a hidden copy inside a wave.
    const target =
      request.slot === "content"
        ? Array.from(document.querySelectorAll<HTMLElement>(contentSelector)).find(
            (el) => !el.closest("[data-distortion-wave]")
          )
        : request.element.querySelector<HTMLElement>('[data-dw-layer="revealed"]');
    if (!target) throw new Error(`No ${request.slot} view to picture`);
    const picture = request.slot === "content" ? contentPicture : revealedPicture;
    return picture === "media" ? drawMediaView(target, request) : drawElement(target, request);
  };

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  useEffect(() => {
    if (!playing) return;
    // The wave bends a picture of the page as it was: keep it from scrolling.
    const preventScroll = (event: Event) => {
      if (event instanceof KeyboardEvent && !SCROLL_KEYS.has(event.key)) return;
      event.preventDefault();
    };
    const options = { capture: true, passive: false };
    window.addEventListener("wheel", preventScroll, options);
    window.addEventListener("touchmove", preventScroll, options);
    window.addEventListener("keydown", preventScroll, options);
    return () => {
      window.removeEventListener("wheel", preventScroll, options);
      window.removeEventListener("touchmove", preventScroll, options);
      window.removeEventListener("keydown", preventScroll, options);
    };
  }, [playing]);

  useEffect(() => {
    if (!revealed) return;
    const timeout = setTimeout(() => router.push(href), FINISH_TIMEOUT);
    return () => clearTimeout(timeout);
  }, [revealed, router, href]);

  // Where the page was scrolled when its picture was taken.
  const preparedAt = useRef<number | null>(null);

  // Picture both views as soon as the wave is mounted, on hover where the
  // caller allows, so the click has little left to do before the wave leaves.
  // The pictures take tens of milliseconds of main thread each; a slow CPU
  // would otherwise hold the wave back by that much after every click.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const layer = wave.current?.element?.querySelector('[data-dw-layer="revealed"]');
      if (layer && revealedPicture === "media") {
        await waitForMedia(visibleMedia(layer, window.innerHeight), MEDIA_TIMEOUT);
      }
      if (cancelled) return;
      const scrollY = window.scrollY;
      await wave.current?.prepare();
      if (!cancelled) preparedAt.current = scrollY;
    })();
    return () => {
      cancelled = true;
    };
  }, [revealedPicture]);

  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    void (async () => {
      const layer = wave.current?.element?.querySelector('[data-dw-layer="revealed"]');
      if (layer && revealedPicture === "media") {
        await waitForMedia(visibleMedia(layer, window.innerHeight), MEDIA_TIMEOUT);
      }
      // The page's picture follows its scroll position: take it again when it
      // has moved since the hover, or when it was cheap to take anyway.
      if (contentPicture === "media" || preparedAt.current !== window.scrollY) {
        wave.current?.controller?.forget("content");
      }
      await Promise.race([
        wave.current?.prepare(),
        new Promise((resolve) => setTimeout(resolve, PREPARE_TIMEOUT)),
      ]);
      if (!cancelled) setRevealed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [playing, contentPicture, revealedPicture]);

  return createPortal(
    <DistortionWave
      ref={wave}
      revealed={revealed}
      type={type}
      palette="colorful"
      waveStyle={WAVE_STYLE}
      resolution={resolution}
      source={source}
      focus={focus}
      capture={capture}
      // Neither view changes in the second the wave runs. Live pictures would
      // be taken again on every load event under the wave, mid-run.
      live={false}
      prewarm={false}
      onFinish={(done) => {
        if (done) router.push(href);
      }}
      // Inert: the hidden copy must not take focus or reach screen readers.
      revealedContent={
        <div inert className="h-dvh overflow-hidden bg-white">
          {revealedContent}
        </div>
      }
      // Once it plays, the wave takes the clicks meant for the page below.
      className={`${playing ? "" : "pointer-events-none"} fixed inset-0 z-[998] h-dvh overflow-hidden`}
    >
      <div />
    </DistortionWave>,
    document.body
  );
}
