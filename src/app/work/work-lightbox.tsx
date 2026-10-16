"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Rect = { height: number; left: number; top: number; width: number };

const VIEWPORT_PADDING = 24;
const LINK_SPACE = 52;
const spring = { type: "spring", duration: 0.35, bounce: 0.1 } as const;

function getTargetRect(source: DOMRect, hasLink: boolean): Rect {
  const padding = window.innerWidth < 640 ? 10 : VIEWPORT_PADDING;
  const maxWidth = window.innerWidth - padding * 2;
  const maxHeight =
    window.innerHeight - padding * 2 - (hasLink ? LINK_SPACE : 0);
  const scale = Math.min(maxWidth / source.width, maxHeight / source.height);
  const width = source.width * scale;
  const height = source.height * scale;

  return {
    width,
    height,
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height - (hasLink ? LINK_SPACE : 0)) / 2,
  };
}

// Transform that places the target box exactly over the thumbnail.
function getOriginTransform(source: DOMRect, target: Rect) {
  return {
    x: source.left - target.left,
    y: source.top - target.top,
    scale: source.width / target.width,
  };
}

export function WorkLightboxItem({
  alt,
  children,
  expanded,
  href,
  order,
}: {
  alt?: string;
  children: ReactNode;
  expanded: ReactNode;
  href?: string;
  order: number;
}) {
  const thumbRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [layout, setLayout] = useState<{
    origin: ReturnType<typeof getOriginTransform>;
    target: Rect;
  } | null>(null);

  function measure() {
    const thumb = thumbRef.current;
    if (!thumb) return null;
    const source = thumb.getBoundingClientRect();
    const target = getTargetRect(source, Boolean(href));
    return { origin: getOriginTransform(source, target), target };
  }

  function openLightbox() {
    const next = measure();
    if (!next) return;
    setLayout(next);
    setOpen(true);
    setHidden(true);
  }

  function closeLightbox() {
    // Re-measure so the exit lands on the thumbnail even after a resize.
    const next = measure();
    if (next) setLayout(next);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
    };
    const onResize = () => {
      const next = measure();
      if (next) setLayout(next);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const from = reduceMotion
    ? { opacity: 0 }
    : { ...layout?.origin, opacity: 1 };

  return (
    <>
      <button
        ref={thumbRef}
        type="button"
        aria-label={alt ? `Expand ${alt}` : "Expand work"}
        className="block w-full cursor-pointer rounded-[8px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF]"
        style={{ order, opacity: hidden ? 0 : 1 }}
        data-work-order={order}
        onClick={openLightbox}
      >
        {children}
      </button>
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence onExitComplete={() => setHidden(false)}>
              {open && layout ? (
                <motion.div
                  key="lightbox"
                  role="dialog"
                  aria-modal="true"
                  aria-label={alt || "Expanded work"}
                  className="fixed inset-0 z-[1000]"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/85 backdrop-blur-[4px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    onClick={closeLightbox}
                  />
                  <motion.div
                    className="absolute origin-top-left overflow-hidden rounded-[8px] [&_img]:h-full [&_img]:object-contain [&_video]:h-full [&_video]:object-contain"
                    style={layout.target}
                    initial={from}
                    animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    exit={from}
                    transition={spring}
                    onClick={closeLightbox}
                  >
                    {expanded}
                  </motion.div>
                  <motion.button
                    type="button"
                    aria-label="Close"
                    autoFocus
                    className="absolute top-[14px] right-[14px] z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#F5F5F5] bg-white text-zinc-500 shadow-[0_2px_2px_#00000014,0_12px_20px_#0000001F] transition-colors duration-200 hover:bg-[#F9F9F9] hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF] motion-reduce:transition-none"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
                    transition={{ delay: 0.06, duration: 0.18 }}
                    onClick={closeLightbox}
                  >
                    <svg
                      aria-hidden="true"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </motion.button>
                  {href ? (
                    <motion.a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute left-1/2 rounded-full border border-[#F1F1F1] bg-white px-4 py-2 font-mono text-[13px] text-neutral-900 transition-colors duration-200 hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF]"
                      style={{ top: layout.target.top + layout.target.height + 12, x: "-50%" }}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                    >
                      View project ↗
                    </motion.a>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
