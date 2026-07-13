export type WorkMediaType = "image" | "video";

export type CdnWorkMediaData =
  | string
  | {
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
      type?: WorkMediaType;
      width?: number;
    };

// Add CDN-hosted work media here.
// Plain links are auto-detected by extension. Use an object when a URL does not
// end in a normal image/video extension, or when you want a poster/alt label.
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
