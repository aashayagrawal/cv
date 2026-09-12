import type { Metadata } from "next";
import Image from "next/image";
import { preconnect } from "react-dom";
import { getPortfolioData } from "@/lib/data";
import {
  EAGER_WORK_IMAGE_COUNT,
  getPriorityImageOrigins,
  getWorkMedia,
} from "@/lib/work-media";
import type { WorkMediaData } from "@/lib/work-media";
import type { CdnImageOptimization } from "@/lib/work-media-data";
import { WorkVideo } from "./work-video";
import { WorkMediaLoader } from "./work-media-loader";
import { FloatingWorkBar } from "./floating-work-bar";

export const metadata: Metadata = {
  title: "Aashay Agrawal",
  description: "",
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
      <div className={className} style={{ order }} data-work-order={order}>
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
      data-work-order={order}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
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

  return (
    <>
      <FloatingWorkBar
        calendar={contact.calendar}
        email={contact.email}
        twitter={twitter}
      />
      <main className="relative min-h-screen bg-white font-mono text-neutral-900">
        {media.length > 0 ? (
          <WorkMediaLoader>
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
          </WorkMediaLoader>
        ) : null}
      </main>
    </>
  );
}
