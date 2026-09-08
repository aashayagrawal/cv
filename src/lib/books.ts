/**
 * Add books here in the order you want them to appear on the shelf.
 * image: a URL or a path inside public (e.g. /books/user-friendly.png).
 */
export interface Book {
  title: string;
  author: string;
  image: string;
}

export const books: Book[] = [
  {
    title: "User Friendly",
    author: "Cliff Kuang, Robert Fabricant",
    image:
      "https://app.paper.design/file-assets/01K4RR0VGVZAZBH7H0EKP6SASQ/2WDNSCQC51MSFR9DETACC0J3M7.png",
  },
  {
    title: "Designing Brand Identity",
    author: "Alina Wheeler, Rob Meyerson",
    // Sixth edition; cover hosted on Framer CDN.
    image:
      "https://framerusercontent.com/images/YVE3aESzo64n12VIBoAfIrtE.png?scale-down-to=512&width=2015&height=2560",
    // Source: https://www.wiley-vch.de/en/areas-interest/finance-economics-law/designing-brand-identity-978-1-119-98481-8
  },
  {
    title: "slide:ology",
    author: "Nancy Duarte",
    // Cover hosted on Framer CDN.
    image:
      "https://framerusercontent.com/images/IxMyAkwvTfHELZcxcyszSWv3L4.png?scale-down-to=512&width=1000&height=1000",
    // Source: https://www.oreilly.com/library/view/slide-ology/9780596522346/
  },
  {
    title: "Resonate",
    author: "Nancy Duarte",
    // Cover hosted on Framer CDN.
    image:
      "https://framerusercontent.com/images/5JG9nrw3zTfUPE8HKCUqXMwVX1U.png?scale-down-to=512&width=998&height=1000",
    // Source: https://www.wiley-vch.de/en/areas-interest/finance-economics-law/resonate-978-0-470-63201-7
  },
  {
    title: "Graphic Design Rules",
    author: "Peter Dawson, John Foster, Tony Seddon, Sean Adams",
    // Cover hosted on Framer CDN.
    image:
      "https://framerusercontent.com/images/KBt0FCDKIFYeq2xHHp9TPkiivtU.png?width=315&height=425",
    // Source: https://www.quarto.com/books/9780711233461/graphic-design-rules
  },
  {
    title: "Layout Essentials",
    author: "Beth Tondreau",
    // Revised and updated edition; cover hosted on Framer CDN.
    image:
      "https://framerusercontent.com/images/OnLVZnV3ZCcAACMJWa5hvSD3wO4.png?scale-down-to=512&width=850&height=1000",
    // Source: https://www.quarto.com/books/9781631596315/layout-essentials-revised-and-updated
  },
  {
    title: "Making and Breaking the Grid",
    author: "Timothy Samara",
    // Third edition; cover hosted on Framer CDN.
    image:
      "https://framerusercontent.com/images/9gRpMyO8ucDJ0DBIhWOk5tYcSiQ.png?scale-down-to=512&width=840&height=1000",
    // Source: https://www.quarto.com/books/9780760381939/making-and-breaking-the-grid-third-edition
  },
  // Covers from the existing bookshelf: https://aashay.framer.website
  {
    title: "Grid Systems in Graphic Design",
    author: "Josef Müller-Brockmann",
    image:
      "https://framerusercontent.com/images/hpvFdhjf903pWbIPYnTH2auMcMw.jpg?scale-down-to=512&width=1755&height=2560",
  },
  {
    title: "Principles of Logo Design",
    author: "George Bokhua",
    image:
      "https://framerusercontent.com/images/8QNXmkdoxzvpXnZyuohhGgfsnLc.png?scale-down-to=512&width=1976&height=2560",
  },
  {
    title: "Refactoring UI",
    author: "Adam Wathan, Steve Schoger",
    image:
      "https://framerusercontent.com/images/wft3FVberXqotVUO09gt0IAOzeI.png?scale-down-to=512&width=1050&height=1350",
  },
  {
    title: "Universal Principles of Design",
    author: "William Lidwell, Kritina Holden, Jill Butler",
    image:
      "https://framerusercontent.com/images/KIWuUZNpcJFTGNfVan8NimC1XY.png?scale-down-to=512&width=840&height=1000",
  },
  {
    title: "Universal Principles of UX",
    author: "Irene Pereyra",
    image:
      "https://framerusercontent.com/images/1TQ3AGiutDeMheP07BdRlgE7zcM.png?scale-down-to=512&width=2186&height=2560",
  },
  {
    title: "The Designer’s Dictionary of Color",
    author: "Sean Adams",
    image:
      "https://framerusercontent.com/images/94DmncYo0gcJw6pab6c0zOwWs.png?scale-down-to=512&width=750&height=1000",
  },
  {
    title: "Laws of UX",
    author: "Jon Yablonski",
    image:
      "https://framerusercontent.com/images/gtZ9znbIDFywAIAFFBzdrhpOqQ.png?scale-down-to=512&width=1707&height=2560",
  },
  {
    title: "Flawless Typography Checklist",
    author: "Jeremiah Shoaf",
    image:
      "https://framerusercontent.com/images/BycFs0EXIKoGG6UmrByHen9wKs.png?scale-down-to=512&width=3088&height=3240",
  },
  {
    title: "Don’t Make Me Think, Revisited",
    author: "Steve Krug",
    image:
      "https://framerusercontent.com/images/wobeBkv8sSGdZW2fCPkNOUMVDDo.png?scale-down-to=512&width=1046&height=1350",
  },
  {
    title: "Rocket Surgery Made Easy",
    author: "Steve Krug",
    image:
      "https://framerusercontent.com/images/8i1XId7woB9FlMNhj8nyhUZ7rHQ.png?scale-down-to=512&width=749&height=1000",
  },
  {
    title: "Interaction of Color",
    author: "Josef Albers",
    image:
      "https://framerusercontent.com/images/3xBY4S2SmjgiaBAAEEzbH7mRkU.jpg?scale-down-to=512&width=1667&height=2560",
  },
];
