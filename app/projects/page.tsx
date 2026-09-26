import Header from "../_components/Header";
import Footer from "../_components/Footer";
import SectionHeading from "../_components/SectionHeading";
import FinalCTA from "../_components/FinalCTA";

const TEMPLATES = [
  { name: "System Arch", tag: "Diagrams" },
  { name: "API Docs", tag: "Docs" },
  { name: "Wireframes", tag: "Design" },
  { name: "Brainstorm", tag: "Ideation" },
  { name: "DB Schema", tag: "Engineering" },
  { name: "Flowcharts", tag: "Product" },
  { name: "Meeting Notes", tag: "Meetings" },
  { name: "Retro Board", tag: "Process" },
  { name: "User Journey", tag: "Design" },
  { name: "RFC", tag: "Docs" },
  { name: "Incident Review", tag: "Engineering" },
  { name: "Onboarding Plan", tag: "Product" },
];

const CATEGORIES = [
  "Diagrams",
  "Docs",
  "Design",
  "Ideation",
  "Engineering",
  "Product",
  "Meetings",
  "Process",
];

const STEPS = [
  {
    index: "01",
    title: "Pick a structure",
    text: "Choose the template that matches the shape of the work — architecture, essay, retro, or review.",
  },
  {
    index: "02",
    title: "Replace the scaffolding",
    text: "Every template ships pre-filled with headings, starter blocks, and a canvas frame. Swap content, keep structure.",
  },
  {
    index: "03",
    title: "Make it your team’s",
    text: "Duplicate into any team space, edit once, and let everyone start from the same page — literally.",
  },
];

export default function Projects() {
  return (
    <>
      <Header />
      <main id="main" className="bg-background">
        {/* Masthead on the editorial grid */}
        <section className="border-b-4 border-foreground texture-grid">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-8 md:py-24 lg:px-12">
            <div className="flex items-center gap-4">
              <span className="h-1 w-12 bg-foreground" aria-hidden="true" />
              <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                Templates
              </span>
            </div>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-b-4 border-foreground pb-8">
              <h1 className="font-display text-6xl leading-[0.85] font-black tracking-tighter md:text-8xl">
                Built-in
                <br />
                <span className="font-normal italic">Templates</span>
              </h1>
              <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                {String(TEMPLATES.length).padStart(2, "0")} starting points
              </span>
            </div>

            {/* Category index */}
            <ul className="mt-8 flex flex-wrap gap-3">
              {CATEGORIES.map((category) => (
                <li
                  key={category}
                  className="cursor-pointer border-2 border-foreground px-4 py-2 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors duration-100 hover:bg-foreground hover:text-background"
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Template grid — 2px rules drawn with the background */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
          <div className="grid gap-[2px] border-2 border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((template, idx) => (
              <div
                key={template.name}
                className="group flex min-h-[220px] cursor-pointer flex-col justify-between bg-background p-6 transition-colors duration-100 hover:bg-foreground hover:text-background md:min-h-[260px] md:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="border border-current px-2 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
                    {template.tag}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground group-hover:text-background/70">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="font-display text-3xl leading-[0.95] font-black tracking-tight md:text-4xl">
                  {template.name}
                </h2>
              </div>
            ))}
          </div>
        </section>

        {/* How templates work */}
        <section className="border-t-4 border-foreground texture-diagonal">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
            <SectionHeading
              eyebrow="How templates work"
              title={
                <>
                  Structure in <span className="font-normal italic">one click</span>
                </>
              }
              description="Templates are documents with opinions — scaffolding you edit, not cages you fight."
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

        <FinalCTA
          eyebrow="Start faster"
          title={
            <>
              Don’t stare at
              <br />a <span className="font-normal italic">blank</span> page.
            </>
          }
          description="Twelve starting points, one workspace, zero setup. Open a template and start editing in seconds."
          primary={{ label: "Start creating", href: "/register" }}
          secondary={{ label: "See all features", href: "/services" }}
          note="Templates included on every plan · Free forever for up to 5 files"
        />
      </main>
      <Footer />
    </>
  );
}
