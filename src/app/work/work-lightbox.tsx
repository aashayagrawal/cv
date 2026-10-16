"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

type Rect = { height: number; left: number; top: number; width: number };
type Origin = { scale: number; x: number; y: number };
type Layout = { origin: Origin; target: Rect };
type Entry = {
  alt?: string;
  expanded: ReactNode;
  href?: string;
  thumbRef: RefObject<HTMLButtonElement | null>;
};
type Transition = { mode: "open" | "navigate" | "close"; origin?: Origin };

const LINK_SPACE = 52;
const spring = { type: "spring", duration: 0.35, bounce: 0.1 } as const;
const controlClassName =
  "absolute z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#F5F5F5] bg-white text-zinc-500 shadow-[0_2px_2px_#00000014,0_12px_20px_#0000001F] transition-colors duration-200 hover:bg-[#F9F9F9] hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF] motion-reduce:transition-none";

function getTargetRect(source: DOMRect, hasLink: boolean): Rect {
  const isSmall = window.innerWidth < 640;
  // Leave generous room around the piece on larger screens.
  const maxWidth = isSmall ? window.innerWidth - 20 : window.innerWidth * 0.72;
  const maxHeight =
    (isSmall ? window.innerHeight - 20 : window.innerHeight * 0.78) -
    (hasLink ? LINK_SPACE : 0);
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
function getOriginTransform(source: DOMRect, target: Rect): Origin {
  return {
    x: source.left - target.left,
    y: source.top - target.top,
    scale: source.width / target.width,
  };
}

const LightboxContext = createContext<{
  hiddenOrder: number | null;
  open: (order: number) => void;
  register: (order: number, entry: Entry) => () => void;
} | null>(null);

export function WorkLightbox({ children }: { children: ReactNode }) {
  const entries = useRef(new Map<number, Entry>());
  const activeRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [hiddenOrder, setHiddenOrder] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [transition, setTransition] = useState<Transition>({ mode: "open" });

  const register = useCallback((order: number, entry: Entry) => {
    entries.current.set(order, entry);
    return () => {
      entries.current.delete(order);
    };
  }, []);

  const measure = useCallback((order: number): Layout | null => {
    const entry = entries.current.get(order);
    const thumb = entry?.thumbRef.current;
    if (!entry || !thumb) return null;
    const source = thumb.getBoundingClientRect();
    const target = getTargetRect(source, Boolean(entry.href));
    return { origin: getOriginTransform(source, target), target };
  }, []);

  const show = useCallback((order: number, next: Transition) => {
    const nextLayout = measure(order);
    if (!nextLayout) return;
    activeRef.current = order;
    setTransition(next);
    setLayout(nextLayout);
    setActive(order);
    setMounted(true);
    // Keep the gap where the lightbox opened, so the grid behind stays still
    // during arrow navigation.
    if (next.mode === "open") setHiddenOrder(order);
  }, [measure]);

  const open = useCallback((order: number) => {
    show(order, { mode: "open" });
  }, [show]);

  const close = useCallback(() => {
    const order = activeRef.current;
    if (order === null) return;
    // Re-measure so the exit lands on the thumbnail even after a resize.
    const nextLayout = measure(order);
    activeRef.current = null;
    setTransition({ mode: "close", origin: nextLayout?.origin });
    setActive(null);
    setHiddenOrder(order);
    entries.current.get(order)?.thumbRef.current?.focus({ preventScroll: true });
  }, [measure]);

  const step = useCallback((direction: 1 | -1) => {
    const order = activeRef.current;
    if (order === null) return;
    const orders = [...entries.current.keys()].toSorted((a, b) => a - b);
    const index = orders.indexOf(order);
    const next = orders[(index + direction + orders.length) % orders.length];
    if (next === undefined || next === order) return;
    show(next, { mode: "navigate" });
  }, [show]);

  useEffect(() => {
    if (active === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    const onResize = () => {
      const order = activeRef.current;
      const nextLayout = order === null ? null : measure(order);
      if (nextLayout) setLayout(nextLayout);
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
  }, [active, close, measure, step]);

  const entry = active === null ? undefined : entries.current.get(active);
  const isOpen = active !== null;

  // Focus the dialog itself so arrow keys don't light up a control's focus ring.
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus({ preventScroll: true });
  }, [isOpen]);
  const hasSiblings = entries.current.size > 1;

  const panelVariants = {
    enter: ({ mode }: Transition) => {
      // Arrow navigation swaps instantly.
      if (mode === "navigate") return { x: 0, y: 0, scale: 1, opacity: 1 };
      if (reduceMotion) return { opacity: 0 };
      return { ...layout?.origin, opacity: 1 };
    },
    center: { x: 0, y: 0, scale: 1, opacity: 1 },
    exit: ({ mode, origin }: Transition) => {
      if (mode === "navigate") return { opacity: 0, transition: { duration: 0 } };
      if (reduceMotion || !origin) return { opacity: 0 };
      return { ...origin, opacity: 1 };
    },
  };
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  };

  return (
    <LightboxContext value={{ hiddenOrder, open, register }}>
      {children}
      {typeof document !== "undefined" && mounted
        ? createPortal(
            <div
              ref={dialogRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={entry?.alt || "Expanded work"}
              className={`fixed inset-0 z-[1000] outline-none ${isOpen ? "" : "pointer-events-none"}`}
            >
              <AnimatePresence
                custom={transition}
                onExitComplete={() => {
                  if (activeRef.current !== null) return;
                  setHiddenOrder(null);
                  setMounted(false);
                }}
              >
                {isOpen ? (
                  <motion.div
                    key="backdrop"
                    className="absolute inset-0 bg-white/85 backdrop-blur-[8px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    onClick={close}
                  />
                ) : null}
                {isOpen && entry && layout ? (
                  <motion.div
                    key={`panel-${active}`}
                    custom={transition}
                    className="absolute origin-top-left overflow-hidden rounded-[8px] [&_img]:h-full [&_img]:object-contain [&_video]:h-full [&_video]:object-contain"
                    style={layout.target}
                    variants={panelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={spring}
                    onClick={close}
                  >
                    {entry.expanded}
                  </motion.div>
                ) : null}
                {isOpen ? (
                  <motion.button
                    key="close"
                    type="button"
                    aria-label="Close"
                    className={`${controlClassName} top-[14px] right-[14px]`}
                    {...fade}
                    transition={{ delay: 0.06, duration: 0.18 }}
                    onClick={close}
                  >
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </motion.button>
                ) : null}
                {isOpen && hasSiblings ? (
                  <motion.button
                    key="previous"
                    type="button"
                    aria-label="Previous work"
                    className={`${controlClassName} top-1/2 left-[14px] -mt-[18px]`}
                    {...fade}
                    transition={{ delay: 0.06, duration: 0.18 }}
                    onClick={() => step(-1)}
                  >
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 3.5L5.5 8l4.5 4.5" />
                    </svg>
                  </motion.button>
                ) : null}
                {isOpen && hasSiblings ? (
                  <motion.button
                    key="next"
                    type="button"
                    aria-label="Next work"
                    className={`${controlClassName} top-1/2 right-[14px] -mt-[18px]`}
                    {...fade}
                    transition={{ delay: 0.06, duration: 0.18 }}
                    onClick={() => step(1)}
                  >
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3.5L10.5 8 6 12.5" />
                    </svg>
                  </motion.button>
                ) : null}
                {isOpen && entry?.href && layout ? (
                  <motion.a
                    key="link"
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute left-1/2 rounded-full border border-[#F1F1F1] bg-white px-4 py-2 font-mono text-[13px] text-neutral-900 transition-colors duration-200 hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF]"
                    style={{ top: layout.target.top + layout.target.height + 12, x: "-50%" }}
                    {...fade}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    View project ↗
                  </motion.a>
                ) : null}
              </AnimatePresence>
            </div>,
            document.body
          )
        : null}
    </LightboxContext>
  );
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
  const lightbox = useContext(LightboxContext);
  const register = lightbox?.register;

  useEffect(() => {
    return register?.(order, { alt, expanded, href, thumbRef });
  }, [alt, expanded, href, order, register]);

  return (
    <button
      ref={thumbRef}
      type="button"
      aria-label={alt ? `Expand ${alt}` : "Expand work"}
      className="block w-full cursor-pointer rounded-[8px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF]"
      style={{ order, opacity: lightbox?.hiddenOrder === order ? 0 : 1 }}
      data-work-order={order}
      onClick={() => lightbox?.open(order)}
    >
      {children}
    </button>
  );
}
