import Link from "next/link";
import { memo } from "react";
import { getPortfolioData } from "@/lib/data";
import { WorkPreloader } from "./work-preloader";

// Memoized components for better performance
const AboutSection = memo(({ name, text }: { name: string; text: string }) => {
  return (
    <section className="flex flex-col gap-1">
      <h1 className="text-[17px] font-bold sm:text-xl">{name}</h1>
      <p className="text-[15px] leading-relaxed whitespace-pre-line text-neutral-600 sm:text-base">
        {text}
      </p>
    </section>
  );
});

AboutSection.displayName = "AboutSection";

// Optimized Projects Section
const ProjectsSection = memo(
  ({ projects }: { projects: Array<{ href: string; title: string }> }) => {
    return (
      <section className="flex flex-col gap-1">
        <h2 className="text-[17px] font-bold sm:text-lg">Projects</h2>
        <ul className="space-y-1 text-neutral-600">
          {projects.map((project, index) => {
            const isInternalLink = project.href.startsWith("/");
            const className =
              "text-[15px] transition-colors duration-200 hover:text-[#007CFF] sm:text-base";

            return (
              <li key={index} className="flex items-start">
                <span className="mr-3">•</span>
                {isInternalLink ? (
                  <Link href={project.href} className={className}>
                    {project.title}
                  </Link>
                ) : (
                  <a
                    href={project.href}
                    className={className}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.title}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
);

ProjectsSection.displayName = "ProjectsSection";

// Optimized Contact Section
const ContactSection = memo(
  ({
    contact,
  }: {
    contact: {
      email: string;
      calendar: string;
      telegram: string;
      whatsapp: string;
      freelance: string;
    };
  }) => (
    <section className="flex flex-col gap-1">
      <h2 className="text-[17px] font-bold sm:text-lg">Contact</h2>
      <div className="text-[15px] text-neutral-600 sm:text-base">
        <p>
          For full-time opportunities or contract work, feel free to reach out via{" "}
          <a
            href={`https://mail.google.com/mail/?view=cm&to=${contact.email}`}
            className="underline-offset-2 underline hover:text-[#007CFF] transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            email
          </a>{" "}
          or schedule a{" "}
          <a
            href={contact.calendar}
            className="underline-offset-2 underline hover:text-[#007CFF] transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            meet
          </a>{" "}
          or DM me on{" "}
          <a
            href={contact.telegram}
            className="underline-offset-2 underline hover:text-[#007CFF] transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            telegram
          </a>.{" "}
          {/*or{" "}
          <a
            href={contact.whatsapp}
            className="underline-offset-2 underline hover:text-[#007CFF] transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            whatsapp
          </a>*/}
           You can also hire for freelance work via{" "}
          <a
            href={contact.freelance}
            className="underline-offset-2 underline hover:text-[#007CFF] transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            contra
          </a>
          .
        </p>
      </div>
    </section>
  )
);

ContactSection.displayName = "ContactSection";

// Optimized Socials Section
const SocialsSection = memo(
  ({ socials }: { socials: Array<{ href: string; label: string }> }) => {
    return (
      <section className="flex flex-col gap-1">
        <h2 className="text-[17px] font-bold sm:text-lg">Socials</h2>
        <div className="flex flex-wrap gap-4">
          {socials.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              className="text-[15px] font-normal text-[#007CFF] transition-all duration-200 hover:underline sm:text-base"
              target="_blank"
              rel="noopener noreferrer"
            >
              {social.label}
            </Link>
          ))}
        </div>
      </section>
    );
  }
);

SocialsSection.displayName = "SocialsSection";

// Server-side rendered page component
export default async function Portfolio() {
  // Fetch data on each request (Server-side rendering)
  const data = await getPortfolioData();
  return (
    <div className="font-mono min-h-screen flex flex-col overflow-visible bg-white text-neutral-900">
      <div className="flex-1 flex flex-col justify-center px-4 py-12">
        <div className="max-w-xl mx-auto w-full flex flex-col gap-12">
          {/* Header and About Section */}
          <AboutSection name={data.about.name} text={data.about.text} />

          {/* Side Projects Section */}
          <ProjectsSection projects={data.projects} />

          {/* Contact Section */}
          <ContactSection contact={data.contact} />

          {/* Socials Section */}
          <SocialsSection socials={data.socials} />
        </div>
      </div>
      <WorkPreloader />
    </div>
  );
}
