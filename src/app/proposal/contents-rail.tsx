"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { arc, LayoutGroup, motion, useReducedMotion } from "motion/react";

const contents = [
  { id: "scope", label: "Scope of work" },
  { id: "timeline", label: "Timeline" },
  { id: "investment", label: "Investment" },
  { id: "payment-terms", label: "Payment terms" },
  { id: "payment-methods", label: "Payment methods" },
  { id: "rights-usage", label: "Rights & usage" },
  { id: "next-steps", label: "Next steps" },
];

export function ContentsRail() {
  const [activeId, setActiveId] = useState(contents[0].id);
  const groupId = useId();
  const reducedMotion = useReducedMotion();
  // Reuse the path so a new click can smoothly interrupt an in-flight arc.
  const path = useMemo(() => arc({ strength: 0.18 }), []);

  useEffect(() => {
    function syncHash() {
      const id = window.location.hash.slice(1);
      setActiveId(contents.find((item) => item.id === id)?.id ?? contents[0].id);
    }

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  return (
    <motion.aside
      layoutRoot
      className="proposal-print-hidden lg:sticky lg:top-1/2 lg:-translate-y-1/2 lg:self-start"
    >
      <nav
        aria-label="Proposal contents"
        className="max-w-[320px]"
        data-proposal-contents
      >
        <p className="mb-8 text-[12px] font-bold tracking-[0.32em] text-neutral-500 uppercase">
          Contents
        </p>
        <LayoutGroup id={groupId}>
          <ol className="flex gap-3 overflow-x-auto pb-3 text-[14px] text-neutral-500 lg:block lg:space-y-3 lg:overflow-visible lg:pb-0 lg:text-[15px]">
            {contents.map((item) => (
              <li key={item.id} className="flex-shrink-0 lg:flex-shrink">
                <a
                  href={`#${item.id}`}
                  aria-current={activeId === item.id ? "location" : undefined}
                  onClick={() => setActiveId(item.id)}
                  className="flex items-center gap-3 whitespace-nowrap rounded-full border border-[#F1F1F1] px-3 py-2 transition-colors duration-200 hover:border-[#CFE7FF] hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF] aria-[current=location]:text-[#007CFF] motion-reduce:transition-none lg:rounded-none lg:border-0 lg:px-0 lg:py-0"
                >
                  <span aria-hidden="true" className="relative hidden h-1.5 w-1.5 shrink-0 lg:block">
                    {activeId === item.id && (
                      <motion.span
                        layoutId="contents-circle"
                        className="absolute inset-0 rounded-full bg-neutral-950"
                        transition={{
                          layout: {
                            duration: reducedMotion ? 0 : 0.4,
                            ease: [0.22, 1, 0.36, 1],
                            path,
                          },
                        }}
                        style={{ pointerEvents: "none" }}
                      />
                    )}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </LayoutGroup>
      </nav>
    </motion.aside>
  );
}
