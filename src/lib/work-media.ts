import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cdnWorkMedia } from "@/lib/work-media-data";
import type { CdnWorkMediaData, WorkMediaType } from "@/lib/work-media-data";

const WORK_DIR = path.join(process.cwd(), "public", "work");
const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([
  ".m3u8",
  ".m4v",
  ".mov",
  ".mp4",
  ".ogg",
  ".ogv",
  ".webm",
]);

export type WorkMediaData = {
  alt?: string;
  autoPlay?: boolean;
  controls?: boolean;
  height?: number;
  href?: string;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  poster?: string;
  src: string;
  type: WorkMediaType;
  width?: number;
};

export type WorkMediaPreloadItem = {
  poster?: string;
  src: string;
  type: WorkMediaType;
};

function getUrlPathname(src: string) {
  try {
    return new URL(src, "https://local.invalid").pathname;
  } catch {
    return src;
  }
}

export function getExtension(src: string) {
  return path.extname(getUrlPathname(src)).toLowerCase();
}

function getQueryFormatExtension(src: string) {
  try {
    const format = new URL(src, "https://local.invalid").searchParams.get("format");

    return format ? `.${format.toLowerCase()}` : "";
  } catch {
    return "";
  }
}

function getMediaType(src: string, type?: WorkMediaType): WorkMediaType | null {
  if (type) {
    return type;
  }

  const extension = getExtension(src) || getQueryFormatExtension(src);

  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  return null;
}

function getPngDimensions(buffer: Buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function getJpegDimensions(buffer: Buffer) {
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      break;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}

async function getImageDimensions(filePath: string) {
  try {
    const buffer = await readFile(filePath);
    const extension = getExtension(filePath);

    if (extension === ".png") {
      return getPngDimensions(buffer);
    }

    if (extension === ".jpg" || extension === ".jpeg") {
      return getJpegDimensions(buffer);
    }
  } catch {
    return null;
  }

  return null;
}

async function getLocalWorkMedia() {
  try {
    const files = await readdir(WORK_DIR);

    const media = await Promise.all(
      files
        .filter((file) => getMediaType(file) !== null)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map(async (file): Promise<WorkMediaData> => {
          const type = getMediaType(file) ?? "image";
          const src = `/work/${encodeURIComponent(file)}`;

          if (type === "video") {
            return { src, type };
          }

          const dimensions = await getImageDimensions(path.join(WORK_DIR, file));

          return {
            src,
            type,
            width: dimensions?.width ?? 1440,
            height: dimensions?.height ?? 1080,
          };
        })
    );

    return media;
  } catch {
    return [];
  }
}

function getCdnImageDimensions(src: string, media: CdnWorkMediaData) {
  if (typeof media === "object" && media.width && media.height) {
    return {
      width: media.width,
      height: media.height,
    };
  }

  const url = new URL(src, "https://local.invalid");
  const width = Number(url.searchParams.get("width") ?? url.searchParams.get("w"));
  const height = Number(url.searchParams.get("height") ?? url.searchParams.get("h"));

  return {
    width: Number.isFinite(width) && width > 0 ? width : 1440,
    height: Number.isFinite(height) && height > 0 ? height : 1080,
  };
}

function getCdnWorkMedia(): WorkMediaData[] {
  const media: Array<WorkMediaData | null> = cdnWorkMedia.map((media) => {
    const src = typeof media === "string" ? media : media.src;
    const type = getMediaType(src, typeof media === "string" ? undefined : media.type);

    if (!type) {
      return null;
    }

    if (type === "video") {
      return {
        src,
        type,
        alt: typeof media === "string" ? "" : media.alt ?? "",
        autoPlay: typeof media === "string" ? undefined : media.autoPlay,
        controls: typeof media === "string" ? undefined : media.controls,
        href: typeof media === "string" ? undefined : media.href,
        loop: typeof media === "string" ? undefined : media.loop,
        muted: typeof media === "string" ? undefined : media.muted,
        playsInline: typeof media === "string" ? undefined : media.playsInline,
        poster: typeof media === "string" ? undefined : media.poster,
      };
    }

    const dimensions = getCdnImageDimensions(src, media);

    return {
      src,
      type,
      alt: typeof media === "string" ? "" : media.alt ?? "",
      href: typeof media === "string" ? undefined : media.href,
      ...dimensions,
    };
  });

  return media.filter((item): item is WorkMediaData => item !== null);
}

export async function getWorkMedia() {
  return [...(await getLocalWorkMedia()), ...getCdnWorkMedia()];
}

export async function getWorkMediaPreloadItems() {
  const media = await getWorkMedia();
  const seen = new Set<string>();
  const items: WorkMediaPreloadItem[] = [];

  for (const item of media) {
    const key = `${item.type}:${item.src}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push({
      src: item.src,
      type: item.type,
      poster: item.poster,
    });
  }

  return items;
}
