import type { Metadata } from "next";
import Link from "next/link";
import { getPortfolioData } from "@/lib/data";
import { CurrentDate } from "./current-date";
import { PrintButton } from "./print-button";
import { ProposalSmoothScroll } from "./smooth-scroll";
import { ContentsRail } from "./contents-rail";

export const metadata: Metadata = {
  title: "Proposal",
  description: "A freelance design and interactive build proposal outline.",
};

const proposalSections = [
  {
    id: "scope",
    title: "Scope of Work",
    items: [
      {
        term: "Discovery",
        text: "A short kickoff to understand the product, audience, constraints, references, success criteria, and what must be delivered first.",
      },
      {
        term: "Direction",
        text: "A compact creative direction covering layout principles, interaction tone, motion references, and the visual system for the work.",
      },
      {
        term: "Design",
        text: "High-fidelity screens, responsive states, key flows, and implementation-ready details for web, Framer, Rive, or product interface work.",
      },
      {
        term: "Interactive build",
        text: "Functional prototypes, production-ready components, Rive interactions, Framer builds, or front-end implementation depending on the project scope.",
      },
      {
        term: "Handoff",
        text: "Clean source files, component notes, asset exports, and a walkthrough so the final work is easy to maintain after delivery.",
      },
    ],
  },
  {
    id: "timeline",
    title: "Timeline",
    items: [
      {
        term: "Week 1",
        text: "Kickoff, project brief, reference gathering, direction, and agreement on the first milestone.",
      },
      {
        term: "Weeks 2-3",
        text: "Core design exploration, interaction passes, reviews, and refinement into a clear approved direction.",
      },
      {
        term: "Weeks 4",
        text: "Build, responsive polish, animation details, asset optimization, and practical QA across the agreed target surfaces.",
      },
      {
        term: "Launch window",
        text: "Final handoff, small launch fixes, and support for anything discovered while the work moves into production.",
      },
    ],
  },
  {
    id: "investment",
    title: "Investment",
    items: [
      {
        term: "Fixed scope",
        text: "Best for defined deliverables such as a landing page, interaction prototype, Framer site, or focused product flow.",
      },
      {
        term: "Sprint",
        text: "Best for exploratory work where design, motion, and build need to happen together over a focused 1-2 week block.",
      },
      {
        term: "Retainer",
        text: "Best for ongoing product, brand, or interaction design support with weekly priorities and a predictable monthly cadence.",
      },
      {
        term: "Quote",
        text: "Final pricing is shared after scope is clear, before any work begins. No vague billing or surprise additions.",
      },
    ],
  },
  {
    id: "payment-terms",
    title: "Payment Terms",
    items: [
      {
        term: "Deposit",
        text: "A 50% deposit reserves the project window and starts the first milestone.",
      },
      {
        term: "Milestones",
        text: "Larger projects can be split into milestone payments tied to approved phases of work.",
      },
      {
        term: "Final payment",
        text: "Remaining balance is due before final source files, production access, or unrestricted usage rights are transferred.",
      },
      {
        term: "Invoices",
        text: "Invoices are issued with the agreed scope, payment schedule, and delivery expectations clearly listed.",
      },
    ],
  },
  {
    id: "payment-methods",
    title: "Payment Methods",
    items: [
      {
        term: "Contra",
        text: "Strongly preferred for project payments because it keeps the proposal, contract, milestones, and invoices in one place.",
      },
      {
        term: "Wise",
        text: "Available for international payments where transparent conversion and transfer fees matter.",
      },
      {
        term: "Stripe",
        text: "Available for card-backed payments when the client prefers a standard checkout flow.",
      },
      {
        term: "Bank transfer",
        text: "Available for domestic or international transfers when it is the simplest route for both sides.",
      },
    ],
  },
  {
    id: "rights-usage",
    title: "Rights & Usage",
    items: [
      {
        term: "Ownership",
        text: "Final approved design files, exported assets, and code produced for the project are owned by the client after final payment.",
      },
      {
        term: "Portfolio rights",
        text: "Aashay may feature the work in a portfolio, social post, or case study after launch unless an NDA or written exception says otherwise.",
      },
      {
        term: "Revisions",
        text: "Reasonable revisions are included inside the agreed milestone. New directions or extra deliverables are scoped separately.",
      },
      {
        term: "Scope changes",
        text: "New requirements can be added mid-project, but they are priced and scheduled separately so the core build stays on track.",
      },
      {
        term: "Cancellation",
        text: "Either side can cancel in writing. Completed work is invoiced pro-rata against the agreed milestones.",
      },
      {
        term: "Post-launch",
        text: "Thirty days of small bug-fix support is included after launch. Ongoing maintenance can be arranged separately.",
      },
    ],
  },
  {
    id: "next-steps",
    title: "Next Steps",
    items: [
      {
        term: "Share context",
        text: "Send the goal, timeline, references, existing assets, and any constraints that could affect the work.",
      },
      {
        term: "Fit call",
        text: "Book a short call to confirm scope, priorities, timeline, and the best working model.",
      },
      {
        term: "Proposal",
        text: "Receive a scoped proposal with milestones, price, responsibilities, and start date.",
      },
      {
        term: "Kickoff",
        text: "Approve the proposal, pay the deposit, and begin the first milestone.",
      },
    ],
  },
];

function Header() {
  return (
    <header className="proposal-print-hidden sticky top-0 z-30 border-b border-[#F1F1F1] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto grid min-h-[48px] max-w-[1680px] grid-cols-1 gap-1 px-5 py-2 text-[11px] text-neutral-500 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-bold text-neutral-950 transition-colors duration-200 hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#007CFF]"
        >
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#007CFF]" aria-hidden="true" />
          <span className="truncate">Aashay Agrawal</span>
        </Link>
        <span className="hidden text-neutral-500 sm:block">Proposal </span>
        <CurrentDate />
      </div>
    </header>
  );
}

function DetailList({
  items,
}: {
  items: Array<{
    term: string;
    text: string;
  }>;
}) {
  return (
    <ul className="space-y-7">
      {items.map((item) => (
        <li
          key={item.term}
          className="grid grid-cols-[8px_minmax(0,1fr)] gap-4 text-[15px] leading-[1.65] text-neutral-800 sm:grid-cols-[8px_minmax(0,1fr)] sm:text-[17px]"
        >
          <span className="mt-[0.72em] h-1.5 w-1.5 rounded-full bg-neutral-950" aria-hidden="true" />
          <p>
            <strong className="font-bold text-neutral-950">{item.term}.</strong> {item.text}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ProposalSection({
  id,
  items,
  title,
}: {
  id: string;
  items: Array<{
    term: string;
    text: string;
  }>;
  title: string;
}) {
  return (
    <section id={id} className="proposal-section scroll-mt-28 border-t border-[#E9E9E9] pt-10">
      <h2 className="mb-10 text-[20px] font-bold tracking-[-0.01em] text-neutral-950 sm:text-[24px]">
        {title}
      </h2>
      <DetailList items={items} />
    </section>
  );
}

function Hero() {
  return (
    <section className="pb-16 sm:pb-20">
      <p className="mb-6 text-[12px] font-bold tracking-[0.28em] text-neutral-500 uppercase">
        Freelance Work Proposal
      </p>
      <h1 className="max-w-[880px] text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-neutral-950 sm:text-[18px] lg:text-[32px]">
        Design, motion, and build support for digital products that need careful craft.
      </h1>
      <p className="mt-7 max-w-[760px] text-[15px] leading-[1.75] text-neutral-600 sm:text-[17px]">
        This page outlines the usual engagement structure for freelance projects:
        what is included, how timelines are handled, how payments work, and what
        happens after launch.
      </p>
    </section>
  );
}

export default async function ProposalPage() {
  const { contact } = await getPortfolioData();
  const emailHref = `https://mail.google.com/mail/?view=cm&to=${contact.email}`;

  return (
    <main className="proposal-page min-h-screen bg-white font-mono text-neutral-900">
      <ProposalSmoothScroll />
      <Header />
      <PrintButton />
      <div className="mx-auto grid w-full max-w-[1680px] grid-cols-1 gap-14 px-5 pt-14 pb-24 sm:px-8 sm:pt-20 lg:grid-cols-[320px_minmax(0,75ch)] lg:gap-[clamp(4rem,9vw,11rem)] lg:px-12">
        <ContentsRail />
        <article className="max-w-[75ch]">
          <Hero />
          <div className="space-y-16 sm:space-y-20">
            {proposalSections.map((section) => (
              <ProposalSection key={section.id} {...section} />
            ))}
          </div>
          <footer className="mt-20 border-t border-[#E9E9E9] pt-10">
            <p className="max-w-[760px] text-[15px] leading-[1.75] text-neutral-600 sm:text-[17px]">
              When the scope is clear, the project starts with a written proposal,
              agreed milestones, and a deposit. The goal is to keep the work direct,
              accountable, and easy to finish well.
            </p>
            <div className="proposal-print-hidden mt-8 flex flex-wrap gap-3">
              <a
                href={contact.calendar}
                className="rounded-full bg-neutral-950 px-4 py-2.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Schedule a call
              </a>
              <Link
                href="/work"
                className="rounded-full bg-[#F7F7F7] px-4 py-2.5 text-[14px] font-medium text-neutral-700 transition-colors duration-200 hover:bg-[#EFF7FF] hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF]"
              >
                View work
              </Link>
              <a
                href={emailHref}
                className="rounded-full bg-[#F7F7F7] px-4 py-2.5 text-[14px] font-medium text-neutral-700 transition-colors duration-200 hover:bg-[#EFF7FF] hover:text-[#007CFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007CFF]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Email
              </a>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}
