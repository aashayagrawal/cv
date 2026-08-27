import {
  Calendar03Icon,
  Home01Icon,
  InstagramIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { getPortfolioData } from "@/lib/data";
import { getWorkMedia } from "@/lib/work-media";
import type { WorkMediaData } from "@/lib/work-media";
import { WorkVideo } from "./work-video";

export const metadata: Metadata = {
  title: "Artifacts",
  description: "Artifacts of my Design Experiments",
};

function WorkImage({ alt = "", height = 1080, src, width = 1440 }: WorkMediaData) {
  const className =
    "block h-auto w-full rounded-[8px] border border-[#F3F3F3]";
  const isRemote = src.startsWith("http://") || src.startsWith("https://");

  if (isRemote) {
    return (
      // Remote image hosts can be added freely in the data file without editing next.config.ts.
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    // Natural image dimensions keep mixed-height PNGs flowing in the masonry columns.
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
}

function WorkMedia({ order, ...media }: WorkMediaData & { order: number }) {
  const className = `block ${
    media.href ? "cursor-pointer" : "cursor-default"
  }`;
  const content =
    media.type === "video" ? (
      <WorkVideo {...media} />
    ) : (
      <WorkImage {...media} />
    );

  if (!media.href) {
    return (
      <div className={className} style={{ order }}>
        {content}
      </div>
    );
  }

  return (
    <a
      href={media.href}
      aria-label={media.alt || "View original project"}
      className={className}
      style={{ order }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  );
}

function WorkBarIcon({
  className = "",
  icon,
}: {
  className?: string;
  icon: IconSvgElement;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={16}
      strokeWidth={1.8}
      aria-hidden="true"
      className={`h-4 w-4 flex-shrink-0 ${className}`}
    />
  );
}

function BarIconLink({
  href,
  label,
  children,
  external = false,
}: {
  href: string;
  label: string;
  children: ReactNode;
  external?: boolean;
}) {
  const className =
    "group relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F9F9F9] text-zinc-500 transition-colors duration-200 hover:bg-[#F1F1F1] hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF]";
  const content = (
    <>
      <span className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-30 max-w-[180px] -translate-x-1/2 whitespace-nowrap rounded-[7px] bg-black px-2.5 py-1.5 text-[10px] font-medium leading-none text-white opacity-0 shadow-[0_8px_20px_#00000024] group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
      {children}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        aria-label={label}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={label} className={className}>
      {content}
    </Link>
  );
}

function FloatingWorkBar({
  calendar,
  freelance,
  instagram,
  twitter,
}: {
  calendar: string;
  freelance: string;
  instagram: string;
  twitter: string;
}) {
  return (
    <nav
      aria-label="Work page shortcuts"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+14px)] left-1/2 z-[999] flex max-w-[calc(100vw-20px)] -translate-x-1/2 items-center gap-1 rounded-full border border-[#F5F5F5] bg-white p-1 font-mono shadow-[0_2px_2px_#00000014,0_12px_20px_#0000001F]"
    >
      <BarIconLink href="/" label="Home">
        <WorkBarIcon icon={Home01Icon} />
      </BarIconLink>
      <BarIconLink href={twitter} label="Twitter" external>
        <WorkBarIcon icon={NewTwitterIcon}  className="scale-[0.90]"/>
      </BarIconLink>
      <BarIconLink href={instagram} label="Instagram" external>
        <WorkBarIcon icon={InstagramIcon} className="scale-[1.05]" />
      </BarIconLink>
      <BarIconLink href={calendar} label="Schedule a Meet" external>
        <WorkBarIcon icon={Calendar03Icon} />
      </BarIconLink>
      <a
        href={"https://t.me/aashayagrawal"}
        className="flex h-9 flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-neutral-950 px-3.5 text-sm font-medium leading-5 text-neutral-50 transition-colors duration-200 hover:bg-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF]"
        target="_blank"
        rel="noopener noreferrer"
      >
        Work with me
      </a>
    </nav>
  );
}

export default async function WorkPage() {
  const media = await getWorkMedia();
  const indexedMedia = media.map((item, index) => ({ index, item }));
  const { contact, socials } = await getPortfolioData();
  const twitter = socials.find((social) => social.label === "Twitter")?.href ?? "";
  const instagram =
    socials.find((social) => social.label === "Instagram")?.href ?? "";

  return (
    <>
      <FloatingWorkBar
        calendar={contact.calendar}
        freelance={contact.freelance}
        instagram={instagram}
        twitter={twitter}
      />
      <main className="relative min-h-screen bg-white font-mono text-neutral-900">
        {media.length > 0 ? (
          <div className="flex flex-col gap-[6px] p-[10px] sm:grid sm:grid-cols-2 sm:items-start">
            {[0, 1].map((columnIndex) => (
              <div
                key={columnIndex}
                className="contents sm:flex sm:min-w-0 sm:flex-col sm:gap-[6px]"
              >
                {indexedMedia
                  .filter(({ index }) => index % 2 === columnIndex)
                  .map(({ index, item }) => (
                    <WorkMedia key={item.src} order={index} {...item} />
                  ))}
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </>
  );
}
