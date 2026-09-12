"use client";

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { LOAD_WORK_VIDEO_EVENT } from "./work-media-loader";

type WorkVideoProps = {
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  poster?: string;
  src: string;
};

function isHlsSource(src: string) {
  try {
    return new URL(src, "https://local.invalid").pathname.toLowerCase().endsWith(".m3u8");
  } catch {
    return src.toLowerCase().includes(".m3u8");
  }
}

export function WorkVideo({
  autoPlay = true,
  controls = false,
  loop = true,
  muted = true,
  playsInline = true,
  poster,
  src,
}: WorkVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const shouldMute = muted || autoPlay;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const enable = () => setEnabled(true);
    video.addEventListener(LOAD_WORK_VIDEO_EVENT, enable);
    // Scrolling to a video can move it ahead of the background queue.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) enable();
    });
    observer.observe(video);
    return () => {
      video.removeEventListener(LOAD_WORK_VIDEO_EVENT, enable);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!enabled || !video || !isHlsSource(src)) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    if (!Hls.isSupported()) {
      return;
    }

    const hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);

    return () => {
      hls.destroy();
    };
  }, [src, enabled]);

  return (
    <video
      ref={videoRef}
      src={enabled && !isHlsSource(src) ? src : undefined}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={shouldMute}
      playsInline={playsInline}
      preload={enabled ? "auto" : "none"}
      className="block h-auto w-full rounded-[8px] border border-[#F3F3F3] bg-neutral-100"
    />
  );
}
