"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, PointerEvent, ReactNode } from "react";
import { TextMorph } from "torph/react";
import { PageWave } from "../page-wave";
import { DESKTOP_QUERY } from "./work-media-loader";

const shortcuts = [
  { key: "home", label: "Home", icon: "/icons/IconHomeRoofDoor.svg" },
  { key: "twitter", label: "Twitter", icon: "/icons/IconX.svg" },
  { key: "email", label: "Email", icon: "/icons/IconEmail2.svg" },
  { key: "calendar", label: "Schedule a Meet", icon: "/icons/IconCalendar1.svg" },
] as const;

type Shortcut = (typeof shortcuts)[number]["key"];
type CopyStatus = "Copied" | "Couldn't copy" | null;
const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
// Set once the home page's transition wave has brought in its hidden copy of
// the bar, so the real bar, after the route change, is already in place.
let broughtByWave = false;
const iconClassName =
  "relative flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F9F9F9] text-zinc-500 transition-colors duration-200 hover:bg-[#F1F1F1] hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF] motion-reduce:transition-none";

export function FloatingWorkBar({
  calendar,
  email,
  entrance = "mount",
  home,
  twitter,
}: {
  calendar: string;
  email: string;
  // "mount" rises as the page appears; "wave" is the home page's hidden copy
  // of this page, which the transition wave brings in with the rest of it.
  entrance?: "mount" | "wave";
  // The home page, revealed under the transition wave. Without it, as in the
  // home page's own preview of this page, Home is a plain link.
  home?: ReactNode;
  twitter: string;
}) {
  const tooltipId = useId();
  const navRef = useRef<HTMLElement>(null);
  const [rises] = useState(() => entrance === "mount" && !broughtByWave);
  const controls = useRef<Partial<Record<Shortcut, HTMLElement>>>({});
  const hovered = useRef<Shortcut | null>(null);
  const focused = useRef<Shortcut | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyFeedback = useRef<CopyStatus>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const [homeWave, setHomeWave] = useState<{
    source: HTMLElement;
    focus: { x: number; y: number } | null;
    playing: boolean;
  } | null>(null);
  const canWave = () => Boolean(home) && window.matchMedia(DESKTOP_QUERY).matches;
  const [tooltip, setTooltip] = useState({
    key: "home" as Shortcut,
    center: 0,
    top: 0,
    visible: false,
    animate: false,
    keyboard: false,
  });

  useEffect(() => {
    if (entrance !== "wave") {
      broughtByWave = false;
      return;
    }
    // The wave reveals its hidden layer by raising the layer's opacity, and
    // clears it ("") once the layer is fully shown.
    const layer = navRef.current?.closest<HTMLElement>('[data-dw-layer="revealed"]');
    if (!layer) return;
    const observer = new MutationObserver(() => {
      const { opacity } = layer.style;
      if (opacity !== "" && parseFloat(opacity) <= 0) return;
      observer.disconnect();
      broughtByWave = true;
    });
    observer.observe(layer, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, [entrance]);

  useEffect(() => {
    return () => {
      if (hideTimer.current !== null) clearTimeout(hideTimer.current);
      if (copyTimer.current !== null) clearTimeout(copyTimer.current);
    };
  }, []);

  function showTooltip(key: Shortcut, keyboard = false) {
    if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    const control = controls.current[key];
    if (!control) return;

    const center = control.offsetLeft + control.offsetWidth / 2;
    setTooltip((previous) => ({
      key,
      center,
      top: control.offsetTop - 12,
      visible: true,
      animate: previous.visible && !keyboard,
      keyboard,
    }));
  }

  function scheduleHide() {
    if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    // Bridge the gaps between icons without closing the shared tooltip.
    hideTimer.current = setTimeout(() => {
      const active = hovered.current ?? focused.current;
      if (active) {
        showTooltip(active, focused.current === active);
      } else if (copyFeedback.current) {
        showTooltip("email");
      } else {
        setTooltip((previous) => ({ ...previous, visible: false }));
      }
    }, 100);
  }

  async function copyEmail() {
    let feedback: CopyStatus;
    try {
      await navigator.clipboard.writeText(email);
      feedback = "Copied";
    } catch {
      feedback = "Couldn't copy";
    }

    copyFeedback.current = feedback;
    setCopyStatus(feedback);
    const active = hovered.current ?? focused.current;
    if (!active || active === "email") {
      showTooltip("email", focused.current === "email");
    }

    if (copyTimer.current !== null) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => {
      copyFeedback.current = null;
      setCopyStatus(null);
      if (!hovered.current && !focused.current) {
        setTooltip((previous) => ({ ...previous, visible: false }));
      }
    }, 600);
  }

  function triggerProps(key: Shortcut) {
    return {
      ref: (element: HTMLElement | null) => {
        if (element) controls.current[key] = element;
        else delete controls.current[key];
      },
      className: iconClassName,
      "aria-describedby":
        tooltip.visible && tooltip.key === key ? tooltipId : undefined,
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === "touch") return;
        hovered.current = key;
        showTooltip(key);
      },
      onPointerLeave: () => {
        hovered.current = null;
        scheduleHide();
      },
      onFocus: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.matches(":focus-visible")) return;
        focused.current = key;
        showTooltip(key, true);
      },
      onBlur: () => {
        focused.current = null;
        scheduleHide();
      },
    };
  }

  const label =
    tooltip.key === "email" && copyStatus
      ? copyStatus
      : shortcuts.find((shortcut) => shortcut.key === tooltip.key)!.label;

  return (
    <nav
      aria-label="Work page shortcuts"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          if (hideTimer.current !== null) clearTimeout(hideTimer.current);
          setTooltip((previous) => ({ ...previous, visible: false }));
        }
      }}
      ref={navRef}
      // A wave leaving mid-entrance takes over: its fade-out must not wait.
      data-bar-enter={rises && !homeWave?.playing ? "play" : undefined}
      // Drawn into the picture the home page's transition wave reveals.
      data-wave-picture=""
      style={{
        opacity: homeWave?.playing ? 0 : undefined,
        pointerEvents: homeWave?.playing ? "none" : undefined,
        transition: `opacity 360ms ${easing} 120ms`,
      }}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+14px)] left-1/2 z-[999] flex max-w-[calc(100vw-20px)] -translate-x-1/2 items-center gap-1 rounded-full border border-[#F5F5F5] bg-white p-1 font-mono shadow-[0_2px_2px_#00000014,0_12px_20px_#0000001F]"
    >
      {shortcuts.map(({ key, label: shortcutLabel, icon }) => {
        const content = (
          <span
            aria-hidden="true"
            className={`h-4 w-4 flex-shrink-0 bg-current ${key === "twitter" ? "scale-[0.90]" : key === "email" ? "scale-[1.05]" : ""}`}
            style={{
              mask: `url("${icon}") center / contain no-repeat`,
              WebkitMask: `url("${icon}") center / contain no-repeat`,
            }}
          />
        );

        if (key === "email") {
          return (
            <button
              key={key}
              {...triggerProps(key)}
              type="button"
              aria-label="Copy email address"
              onClick={copyEmail}
            >
              {content}
            </button>
          );
        }

        if (key === "home") {
          const trigger = triggerProps(key);
          // Mount the wave on intent so the home page is pictured before the
          // click; let it go if the visitor moves on.
          const arm = (source: HTMLElement) => {
            if (!homeWave && canWave()) setHomeWave({ source, focus: null, playing: false });
          };
          const release = () => {
            if (!homeWave?.playing) setHomeWave(null);
          };
          return (
            <Link
              key={key}
              {...trigger}
              href="/"
              aria-label={shortcutLabel}
              onPointerEnter={(event) => {
                trigger.onPointerEnter(event);
                arm(event.currentTarget);
              }}
              onPointerLeave={() => {
                trigger.onPointerLeave();
                release();
              }}
              onFocus={(event) => {
                trigger.onFocus(event);
                arm(event.currentTarget);
              }}
              onBlur={() => {
                trigger.onBlur();
                release();
              }}
              onClick={(event) => {
                if (
                  homeWave?.playing ||
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey ||
                  // The wave is desktop only; smaller screens navigate as usual.
                  !canWave()
                ) {
                  if (homeWave?.playing) event.preventDefault();
                  return;
                }
                event.preventDefault();
                // Keyboard clicks report no pointer; let the wave start from the icon.
                setHomeWave({
                  source: event.currentTarget,
                  focus:
                    event.detail > 0
                      ? { x: event.clientX, y: event.clientY }
                      : null,
                  playing: true,
                });
              }}
            >
              {content}
            </Link>
          );
        }

        return (
          <a
            key={key}
            {...triggerProps(key)}
            href={key === "twitter" ? twitter : calendar}
            aria-label={shortcutLabel}
            target="_blank"
            rel="noopener noreferrer"
          >
            {content}
          </a>
        );
      })}
      <a
        href="https://t.me/aashayagrawal"
        className="flex h-9 flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-neutral-950 px-3.5 text-sm font-medium leading-5 text-neutral-50 transition-colors duration-200 hover:bg-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF] motion-reduce:transition-none"
        target="_blank"
        rel="noopener noreferrer"
      >
        Work with me
      </a>
      <div
        className="pointer-events-none absolute top-0 left-0 z-30 motion-reduce:!transition-none"
        style={{
          transform: `translate(${tooltip.center}px, ${tooltip.top}px)`,
          transition: tooltip.animate ? `transform 260ms ${easing}` : "none",
        }}
      >
        <div
          id={tooltipId}
          role="tooltip"
          aria-hidden={!tooltip.visible}
          className="w-max rounded-[7px] bg-black px-2.5 py-1.5 text-[10px] font-medium leading-none whitespace-nowrap text-white shadow-[0_8px_20px_#00000024] motion-reduce:!transition-none"
          style={{
            opacity: tooltip.visible ? 1 : 0,
            transform: `translate(-50%, -100%) translateY(${tooltip.visible ? 0 : 3}px)`,
            transition: tooltip.keyboard
              ? "none"
              : `opacity ${tooltip.visible ? 140 : 100}ms ${easing}, transform 140ms ${easing}`,
          }}
        >
          <TextMorph
            duration={260}
            ease={easing}
            disabled={!tooltip.animate}
            respectReducedMotion
          >
            {label}
          </TextMorph>
        </div>
      </div>
      <span role="status" className="sr-only">
        {copyStatus ?? ""}
      </span>
      {homeWave ? (
        <PageWave
          href="/"
          type="vertical"
          source={homeWave.source}
          focus={homeWave.focus}
          playing={homeWave.playing}
          contentSelector="main"
          contentPicture="media"
          revealedContent={home}
          revealedPicture="dom"
        />
      ) : null}
    </nav>
  );
}
