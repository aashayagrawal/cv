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
import { preconnect } from "react-dom";
import type { IconSvgElement } from "@hugeicons/react";
import { getPortfolioData } from "@/lib/data";
import {
  EAGER_WORK_IMAGE_COUNT,
  getPriorityImageOrigins,
  getWorkMedia,
} from "@/lib/work-media";
import type { WorkMediaData } from "@/lib/work-media";
import type { CdnImageOptimization } from "@/lib/work-media-data";
import { WorkVideo } from "./work-video";

export const metadata: Metadata = {
  title: "Aashay Agrawal",
  description: "Hey, I’m Aashay. I’m an independent designer working across brand and web, creating thoughtful digital experiences.",
};

const DEFAULT_RESPONSIVE_IMAGE_WIDTHS = [640, 1024, 1600, 2048];
const WORK_IMAGE_SIZES = "(min-width: 640px) calc(50vw - 13px), calc(100vw - 20px)";

function getImageUrlWithWidth(src: string, widthParam: string, width: number) {
  try {
    const url = new URL(src);
    url.searchParams.set(widthParam, String(width));
    return url.toString();
  } catch {
    return null;
  }
}

function getResponsiveImageProps(
  src: string,
  sourceWidth: number,
  imageOptimization?: CdnImageOptimization
) {
  if (!imageOptimization) {
    return { src, srcSet: undefined };
  }

  if ("sources" in imageOptimization) {
    const sources = imageOptimization.sources
      .filter((source) => source.src && source.width > 0)
      .toSorted((a, b) => a.width - b.width);
    const fallback =
      sources.find((source) => source.width >= sourceWidth) ?? sources.at(-1);

    return {
      src: fallback?.src ?? src,
      srcSet:
        sources.length > 0
          ? sources.map((source) => `${source.src} ${source.width}w`).join(", ")
          : undefined,
    };
  }

  const widths = [
    ...new Set(
      (imageOptimization.widths ?? DEFAULT_RESPONSIVE_IMAGE_WIDTHS).filter(
        (width) => Number.isFinite(width) && width > 0
      )
    ),
  ].toSorted((a, b) => a - b);
  const maxWidth = widths.at(-1);
  const fallbackWidth = maxWidth ? Math.min(sourceWidth, maxWidth) : sourceWidth;
  const responsiveSrc = getImageUrlWithWidth(
    src,
    imageOptimization.widthParam,
    fallbackWidth
  );
  const sources = widths.map((width) => {
    const url = getImageUrlWithWidth(src, imageOptimization.widthParam, width);
    return url ? `${url} ${width}w` : null;
  });

  return {
    src: responsiveSrc ?? src,
    srcSet:
      sources.length > 0 && sources.every((source) => source !== null)
        ? sources.join(", ")
        : undefined,
  };
}

function WorkImage({
  alt = "",
  height = 1080,
  imageOptimization,
  priority = false,
  src,
  width = 1440,
}: WorkMediaData & { priority?: boolean }) {
  const className =
    "block h-auto w-full rounded-[8px] border border-[#F3F3F3]";
  const isRemote = src.startsWith("http://") || src.startsWith("https://");

  if (isRemote) {
    const responsiveImage = getResponsiveImageProps(
      src,
      width,
      imageOptimization
    );

    return (
      // Remote image hosts can be added freely in the data file without editing next.config.ts.
      <img
        src={responsiveImage.src}
        srcSet={responsiveImage.srcSet}
        sizes={WORK_IMAGE_SIZES}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
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
      sizes={WORK_IMAGE_SIZES}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

function WorkMedia({
  order,
  priority = false,
  ...media
}: WorkMediaData & { order: number; priority?: boolean }) {
  const className = `block ${
    media.href ? "cursor-pointer" : "cursor-default"
  }`;
  const content =
    media.type === "video" ? (
      <WorkVideo {...media} />
    ) : (
      <WorkImage {...media} priority={priority} />
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
  const priorityImageOrigins = getPriorityImageOrigins(
    media,
    EAGER_WORK_IMAGE_COUNT
  );

  for (const origin of priorityImageOrigins) {
    preconnect(origin, { crossOrigin: "anonymous" });
  }

  let imageIndex = 0;
  const indexedMedia = media.map((item, index) => {
    const priority =
      item.type === "image" && imageIndex < EAGER_WORK_IMAGE_COUNT;

    if (item.type === "image") {
      imageIndex += 1;
    }

    return { index, item, priority };
  });
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
                  .map(({ index, item, priority }) => (
                    <WorkMedia
                      key={item.src}
                      order={index}
                      priority={priority}
                      {...item}
                    />
                  ))}
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </>
  );
}
