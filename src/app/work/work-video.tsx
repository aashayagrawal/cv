"use client";

import Hls from "hls.js";
import { useEffect, useRef } from "react";

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
    return new URL(src, window.location.href).pathname.toLowerCase().endsWith(".m3u8");
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
  const shouldMute = muted || autoPlay;

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !isHlsSource(src)) {
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
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={isHlsSource(src) ? undefined : src}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={shouldMute}
      playsInline={playsInline}
      preload="metadata"
      className="block h-auto w-full rounded-[8px] border border-[#F3F3F3] bg-neutral-100"
    />
  );
}
