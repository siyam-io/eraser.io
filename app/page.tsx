import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Footer from "./_components/Footer";
import TechBand from "./_components/TechBand";
import SectionHeading from "./_components/SectionHeading";
import StatsBand from "./_components/StatsBand";
import PullQuote from "./_components/PullQuote";
import Faq from "./_components/Faq";
import FinalCTA from "./_components/FinalCTA";
import Link from "next/link";

const CAPABILITIES = [
  "Block Editor",
  "Infinite Canvas",
  "Live Files",
  "Templates",
  "Star & Archive",
  "Stripe Billing",
];

const FEATURES = [
  {
    index: "01",
    title: "Split-screen Workspace",
    text: "Documents and an infinite canvas side by side — context never leaves the screen.",
  },
  {
    index: "02",
    title: "Block-based Editor",
    text: "Headers, lists, code, quotes, and tables as structured blocks that save as you write.",
  },
  {
    index: "03",
    title: "Excalidraw Whiteboard",
    text: "Sketch architecture, flows, and diagrams with a hand-drawn feel, embedded in the workspace.",
  },
  {
    index: "04",
    title: "Team Files",
    text: "Shared team spaces with starred, recent, and archived views — every file where you expect it.",
  },
  {
    index: "05",
    title: "Templates",
    text: "Start from System Arch, API Docs, Wireframes, or a blank page. Structure in one click.",
  },
  {
    index: "06",
    title: "Google Sign-in",
    text: "NextAuth credentials and Google OAuth, with sessions handled end to end.",
  },
];

const STEPS = [
  {
    index: "01",
    title: "Create a team & file",
    text: "Spin up a team in seconds, name your file, and start. Nothing to configure, nothing to install.",
  },
  {
    index: "02",
    title: "Write and draw, together",
    text: "Editor.js blocks on the left, an infinite Excalidraw canvas on the right — both live in one document.",
  },
  {
    index: "03",
    title: "Save, share, ship",
    text: "Everything persists to your workspace. Reopen any file and pick up exactly where you left off.",
  },
];

const TEMPLATE_PREVIEW = [
  { name: "System Arch", tag: "Diagrams" },
  { name: "API Docs", tag: "Docs" },
  { name: "Wireframes", tag: "Design" },
];

const FAQS = [
  {
    q: "What exactly is Erasior?",
    a: "A collaborative workspace where a block-based document editor and an infinite whiteboard live side by side. Write the spec and draw the architecture without switching tools, tabs, or context.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The Free plan includes up to 5 files with the full document editor and whiteboard, plus archive and starred views. Upgrade to Pro only when you need unlimited files.",
  },
  {
    q: "How do I sign in?",
    a: "With email and password or Google — both handled by NextAuth. Sessions are secure, http-only, and shared across the marketing site, dashboard, and workspace.",
  },
  {
    q: "What powers the editor and the canvas?",
    a: "Editor.js provides structured, block-based documents that save as clean JSON, and Excalidraw provides the infinite, hand-drawn whiteboard. Both are embedded directly into the split-screen workspace.",
  },
  {
    q: "Can I organize a whole team’s work?",
    a: "Yes — create teams, keep their files together, star what matters, archive what doesn’t, and jump back to recent work from the dashboard.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <TechBand items={CAPABILITIES} />

        {/* Feature grid */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Everything included"
              title={
                <>
                  One workspace.
                  <br />
                  <span className="font-normal italic">Two</span> surfaces.
                </>
              }
              description="The discipline of a document, the freedom of a canvas — held together by typography, rules, and negative space."
            />
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 border-b-2 border-foreground pb-1 font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-foreground hover:text-background hover:border-background transition-colors duration-100"
            >
              All features
              <span
                aria-hidden="true"
                className="transition-transform duration-100 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>

          <div className="mt-12 grid gap-[2px] border-2 border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group cursor-pointer bg-background p-8 transition-colors duration-100 hover:bg-foreground hover:text-background"
              >
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground group-hover:text-background/70">
                  {feature.index}
                </span>
                <h3 className="mt-4 font-display text-2xl font-black tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground group-hover:text-background/80">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Inverted stats */}
        <StatsBand
          caption="Erasior, in numbers"
          stats={[
            { value: "2", label: "Surfaces", note: "Document and whiteboard, side by side." },
            { value: "5", label: "Free files", note: "Everything included, upgrade whenever." },
            { value: "0", label: "Tabs lost", note: "No more context switching between tools." },
            { value: "∞", label: "Canvas", note: "An infinite board sized to your thinking." },
          ]}
        />

        {/* Process */}
        <section className="border-b-4 border-foreground texture-diagonal">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28 lg:px-12">
            <SectionHeading
              eyebrow="How it works"
              title={
                <>
                  Blank page to <span className="font-normal italic">shipped</span>
                </>
              }
              description="Three moves. No setup, no migrations, no ceremony."
            />

            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((step) => (
                <li
                  key={step.index}
                  className="border-2 border-foreground bg-background p-8"
                >
                  <span className="font-display text-6xl leading-none font-black text-foreground/10">
                    {step.index}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Testimonial */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28 lg:px-12">
          <PullQuote
            eyebrow="From the field"
            quote={
              <>
                Erasior replaced three tabs and a whiteboard photo graveyard.
                The spec and the diagram finally live in the same room.
              </>
            }
            attribution="Maya Chen"
            role="Staff Engineer, Northwind Systems"
          />
        </section>

        {/* Template preview */}
        <section className="border-t-4 border-foreground bg-muted texture-hlines">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28 lg:px-12">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Templates"
                title="Start with structure"
                description="Six built-in starting points — from system architecture to brainstorming."
              />
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 border-b-2 border-foreground pb-1 font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-foreground hover:text-background hover:border-background transition-colors duration-100"
              >
                Browse templates
                <span
                  aria-hidden="true"
                  className="transition-transform duration-100 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>

            <div className="mt-12 grid gap-[2px] border-2 border-foreground bg-foreground sm:grid-cols-3">
              {TEMPLATE_PREVIEW.map((template) => (
                <div
                  key={template.name}
                  className="group flex cursor-pointer flex-col justify-between bg-background p-8 transition-colors duration-100 hover:bg-foreground hover:text-background"
                >
                  <span className="w-fit border border-current px-2 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
                    {template.tag}
                  </span>
                  <h3 className="mt-16 font-display text-3xl leading-none font-black tracking-tight">
                    {template.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="FAQ"
                title={
                  <>
                    Asked &amp; <span className="font-normal italic">answered</span>
                  </>
                }
              />
            </div>
            <div className="lg:col-span-8">
              <Faq items={FAQS} />
            </div>
          </div>
        </section>

        <FinalCTA
          eyebrow="Start now"
          title={
            <>
              Open a blank page.
              <br />
              <span className="font-normal italic">Draw</span> the rest.
            </>
          }
          description="Documents and whiteboards, held together by type and rules. Your first five files are free."
          primary={{ label: "Start creating", href: "/register" }}
          secondary={{ label: "See pricing", href: "/pricing" }}
          guestCta
          note="Free forever for up to 5 files · No card required"
        />
      </main>
      <Footer />
    </>
  );
}
