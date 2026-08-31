export type WorkMediaType = "image" | "video";

export type CdnImageOptimization =
  | {
      widthParam: string;
      widths?: number[];
    }
  | {
      sources: Array<{
        src: string;
        width: number;
      }>;
    };

export type CdnWorkMediaData =
  | string
  | {
      alt?: string;
      autoPlay?: boolean;
      controls?: boolean;
      height?: number;
      href?: string;
      imageOptimization?: CdnImageOptimization;
      loop?: boolean;
      muted?: boolean;
      playsInline?: boolean;
      poster?: string;
      src: string;
      type?: WorkMediaType;
      width?: number;
    };

// Add CDN-hosted work media here.
// Paste plain image/video URLs directly into the list below. Common CDN width
// parameters are detected automatically. Use an object only when you need a
// poster, alt text, project link, or a custom image transformation.
//
// Responsive image options are provider-specific and optional:
// - Query-based CDN: imageOptimization: { widthParam: "w" }
// - Custom/path-based CDN: imageOptimization: {
//     sources: [{ src: "...-640.webp", width: 640 }, ...]
//   }
// A plain URL remains safe and simply loads without a generated srcset.
//
//
// // Linked media example — copy, uncomment, and replace these values:
// {
//   src: "https://cdn.example.com/project-image.webp",
//   href: "https://example.com/original-project",
//   alt: "Original project name",
// },
export const cdnWorkMedia: CdnWorkMediaData[] = [
  "https://cdn.cosmos.so/ee7be4e3-10f9-47fc-86e4-18fa6216c84e?format=webp",

  "https://cdn.cosmos.so/3972a5b1-4669-4350-b7a2-443c5a2d1de2?format=webp&w=2048",

  "https://cdn.cosmos.so/0504161f-654b-4758-aee1-a50c6cb158b9?format=webp&w=2048",

  "https://cdn.cosmos.so/9b837dca-c61e-4e24-8cd0-b782cc75e8d4?format=webp&w=2048",
];
