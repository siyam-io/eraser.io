import Header from "../_components/Header";
import Footer from "../_components/Footer";
import SectionHeading from "../_components/SectionHeading";
import Newsletter from "../_components/Newsletter";

const MILESTONES = [
  {
    version: "v1.0",
    title: "Initial Release",
    date: "Apr 2025",
    text: "The first public build: a document editor and an infinite whiteboard sharing one workspace, side by side.",
  },
  {
    version: "v1.1",
    title: "Block Editor",
    date: "May 2025",
    text: "Headers, lists, code, quotes, tables, and checklists as structured Editor.js blocks — clean JSON in, clean JSON out.",
  },
  {
    version: "v1.2",
    title: "Excalidraw Integration",
    date: "Jul 2025",
    text: "The whiteboard moved to Excalidraw — hand-drawn diagrams, frames, and export, embedded directly in the split view.",
  },
  {
    version: "v1.3",
    title: "Teams & Shared Files",
    date: "Aug 2025",
    text: "Team spaces arrived: shared file lists, a team switcher in the sidebar, and roles that keep work separated.",
  },
  {
    version: "v1.5",
    title: "Star, Archive & Views",
    date: "Oct 2025",
    text: "All Files, Recent, Starred, and Archived views — plus row-level actions for renaming, starring, and archiving.",
  },
  {
    version: "v1.8",
    title: "Google Sign-in",
    date: "Nov 2025",
    text: "NextAuth credentials were joined by Google OAuth, with secure http-only sessions across the whole app.",
  },
  {
    version: "v2.0",
    title: "Real-time Collaboration",
    date: "Dec 2025",
    text: "Added support for real-time multiplayer editing, cursors, live presence, and seamless integration between documents and whiteboards.",
  },
  {
    version: "v2.3",
    title: "Stripe Billing & Pro",
    date: "Feb 2026",
    text: "Checkout, customer portal, and plan limits — Free for trying, Pro for unlimited files, all metered by Stripe.",
  },
];

const ROADMAP = [
  {
    title: "Comments & annotations",
    text: "Leave margin notes on documents and pins on the canvas.",
    status: "Planned",
  },
  {
    title: "Version history diffing",
    text: "See what changed, when, and by whom — line by line.",
    status: "In progress",
  },
  {
    title: "Offline drafts",
    text: "Keep writing on a plane; sync when the connection returns.",
    status: "Research",
  },
  {
    title: "Public template gallery",
    text: "Publish and fork templates across the community.",
    status: "Planned",
  },
];

export default function History() {
  return (
    <>
      <Header />
      <main id="main" className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-8 md:py-24 lg:px-12">
          <div className="flex items-center gap-4">
            <span className="h-1 w-12 bg-foreground" aria-hidden="true" />
            <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              Version history
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 border-b-4 border-foreground pb-8">
            <h1 className="font-display text-6xl leading-[0.85] font-black tracking-tighter md:text-8xl">
              Changelog
            </h1>
            <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              {String(MILESTONES.length).padStart(2, "0")} releases · 2025 — 2026
            </span>
          </div>

          {/* Timeline: markers on a continuous rule */}
          <ol className="mx-auto mt-16 max-w-4xl">
            {MILESTONES.map((milestone) => (
              <li
                key={milestone.version}
                className="grid grid-cols-[1.25rem_1fr] gap-6 md:grid-cols-[2rem_1fr] md:gap-10 [&:last-child_.tl-line]:hidden"
              >
                <div className="flex flex-col items-center" aria-hidden="true">
                  <span className="mt-2 size-4 shrink-0 bg-foreground" />
                  <span className="tl-line w-0.5 flex-1 bg-foreground" />
                </div>

                <div className="relative pb-14 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-6 right-0 font-display text-8xl font-black tracking-tighter text-foreground/5 select-none"
                  >
                    {milestone.version}
                  </span>
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-block border-2 border-foreground px-3 py-1 font-mono text-[11px] tracking-[0.2em] uppercase">
                        {milestone.version}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                        {milestone.date}
                      </span>
                    </div>
                    <h2 className="mt-5 font-display text-3xl font-black tracking-tight md:text-4xl">
                      {milestone.title}
                    </h2>
                    <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                      {milestone.text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Roadmap */}
        <section className="border-t-4 border-foreground texture-diagonal">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
            <SectionHeading
              eyebrow="Roadmap"
              title={
                <>
                  What’s <span className="font-normal italic">next</span>
                </>
              }
              description="A public, honest shortlist — in progress means in progress, planned means planned."
            />

            <div className="mt-12 border-t-2 border-foreground">
              {ROADMAP.map((item) => (
                <div
                  key={item.title}
                  className="group grid gap-4 border-b-2 border-foreground px-4 py-7 transition-colors duration-100 hover:bg-foreground hover:text-background md:grid-cols-12 md:items-baseline md:px-6"
                >
                  <h3 className="font-display text-xl font-bold tracking-tight md:col-span-4">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground group-hover:text-background/80 md:col-span-5">
                    {item.text}
                  </p>
                  <span className="border-2 border-foreground px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-100 group-hover:border-background md:col-span-3 md:justify-self-end">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscribe to the changelog */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
          <div className="border-2 border-foreground p-8 md:p-12">
            <div className="grid items-end gap-8 lg:grid-cols-2">
              <SectionHeading
                eyebrow="Subscribe"
                title={
                  <>
                    Follow every <span className="font-normal italic">release</span>
                  </>
                }
                description="One email per notable version. No patches you’ll never read about."
              />
              <Newsletter source="changelog" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
