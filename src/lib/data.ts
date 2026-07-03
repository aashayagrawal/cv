// Data layer for dynamic content fetching
export interface Project {
  href: string;
  title: string;
}

export interface SocialLink {
  href: string;
  label: string;
}

export interface PortfolioData {
  about: {
    name: string;
    text: string;
  };
  projects: Project[];
  contact: {
    email: string;
    calendar: string;
    freelance: string;
    telegram: string;
    whatsapp: string;
  };
  socials: SocialLink[];
}

// Default data that can be overridden by external sources
const defaultData: PortfolioData = {
  about: {
    name: "Aashay Agrawal",
    text: `Hey, I'm Aashay. I'm a Multidisciplinary Designer. But I try not to let that title define me. I feel like the self is ever-evolving, constantly shifting, a thing which is being shaped by new experiences, new ideas, new obsessions. Pinning it down to a single word feels like such a disservice to that process and existence.

There's something almost violent about it, the way we reduce this whole living, breathing, changing thing into a neat little box for others to categorize it. Most of what I do in life is simply follow my desires sincerely. I don't have a grand plan for life; all I have is genuine curiosity leading the way, wherever it takes me.`,
  },
  projects: [
    {
      href: "/work",
      title: "Artifacts: Collection of all my Design Experiments",
    },
    {
      href: "https://rive.app/@aashayagrawal/",
      title: "Rive Interactions: Collection of my Rive Creations",
    },
    {
      href: "https://www.patreon.com/cw/aashayagrawal",
      title: "Patreon: TouchDesigner and Cavalry Project Files",
    },
    {
      href: "https://framer.link/KNrvUWZ",
      title: "Store: Framer Templates and Components",
    },
    {
      href: "https://aashay.framer.website",
      title: "Bookshelf: My Reading List",
    },
    {
      href: "https://aashayagrawal.substack.com/",
      title: "Notes: Essays on Design and Craft",
    },
  ],
  contact: {
    email: "aashayagrawal.work@gmail.com",
    calendar: "https://cal.com/aashayagrawal/30min",
    freelance: "https://contra.com/aashayagrawal/work",
    telegram: "https://t.me/aashayagrawal",
    whatsapp: "https://wa.me/message/FKS3GDOQWFROE1",
  },
  socials: [
    { href: "https://twitter.com/_aashay_", label: "Twitter" },
    { href: "https://instagram.com/asyagra", label: "Instagram" },
    { href: "https://linkedin.com/in/aashayagrawal", label: "LinkedIn" },
    { href: "https://www.youtube.com/@aashay.agrawal", label: "YouTube" },
    // { href: "/work", label: "Resume" },
  ],
};

// Main function to get portfolio data with external data override
export async function getPortfolioData(): Promise<PortfolioData> {
  return defaultData;
}
