import Header from "../_components/Header";
import Footer from "../_components/Footer";
import SectionHeading from "../_components/SectionHeading";
import StatsBand from "../_components/StatsBand";
import PullQuote from "../_components/PullQuote";
import FinalCTA from "../_components/FinalCTA";

const PILLARS = [
  {
    index: "01",
    title: "Mission",
    text: "To eliminate the friction between writing and drawing.",
  },
  {
    index: "02",
    title: "Vision",
    text: "A unified workspace where documentation lives with architecture diagrams.",
  },
  {
    index: "03",
    title: "Values",
    text: "Speed, collaboration, and developer-first design.",
  },
];

const TEAM = [
  { name: "Ada Okonkwo", role: "Founder & CEO" },
  { name: "Jonas Lindqvist", role: "Engineering" },
  { name: "Priya Raman", role: "Product Design" },
  { name: "Tomás Herrera", role: "Frontend" },
  { name: "Wei Zhang", role: "Infrastructure" },
  { name: "Noor Haddad", role: "Developer Relations" },
];

const PRINCIPLES = [
  {
    index: "01",
    title: "Reduction over addition",
    text: "If a feature needs a color to explain itself, it isn’t finished. We remove until only the essential remains.",
  },
  {
    index: "02",
    title: "Type before decoration",
    text: "Hierarchy comes from scale, weight, and space — not from gradients, glows, or accent hues.",
  },
  {
    index: "03",
    title: "Ship in black and white",
    text: "Contrast first, polish second. If it reads clearly in monochrome, color will never rescue it.",
  },
  {
    index: "04",
    title: "Respect the reader’s time",
    text: "Instant interactions, no slow easing, no ceremony. The interface should feel like turning a page.",
  },
];

export default function About() {
  return (
    <>
      <Header />
      <main id="main" className="bg-background">
        {/* Masthead */}
        <section className="border-b-4 border-foreground">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:px-8 md:py-24 lg:grid-cols-12 lg:px-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-4">
                <span className="h-1 w-12 bg-foreground" aria-hidden="true" />
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                  About Erasior
                </span>
              </div>
              <h1 className="mt-8 font-display text-6xl leading-[0.85] font-black tracking-tighter md:text-8xl">
                We
                <br />
                <span className="font-normal italic">Build</span>
                <br />
                Tools
              </h1>
            </div>

            <div className="flex flex-col justify-end gap-8 lg:col-span-5">
              <p className="border-l-2 border-foreground pl-6 text-xl leading-relaxed text-muted-foreground">
                A passionate team of developers and designers building the
                ultimate workspace. We eliminate the context switching between
                docs and diagrams.
              </p>

              {/* Fig. 01 — a museum-catalog plate */}
              <figure className="border-2 border-foreground texture-grid">
                <div className="flex aspect-[4/3] items-center justify-center">
                  <div className="flex size-1/2 items-center justify-center bg-foreground">
                    <span className="font-display text-6xl font-black text-background italic">
                      E
                    </span>
                  </div>
                </div>
                <figcaption className="border-t-2 border-foreground px-4 py-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                  Fig. 01 — The workspace, reduced to essence
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Pillars — columns divided by rules, inverting on hover */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
          <div className="grid border-t-4 border-foreground md:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.title}
                className={`group border-b-4 border-foreground p-8 transition-colors duration-100 hover:bg-foreground hover:text-background md:border-b-0 md:p-10 ${
                  i < 2 ? "md:border-r-4" : ""
                }`}
              >
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground group-hover:text-background/70">
                  {pillar.index}
                </span>
                <h2 className="mt-4 font-display text-3xl font-black tracking-tight">
                  {pillar.title}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground group-hover:text-background/80">
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Story with boxed drop cap */}
        <section className="border-t-4 border-foreground texture-hlines">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:px-8 md:py-24 lg:grid-cols-12 lg:px-12">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="Our story"
                title={
                  <>
                    Built from a<br />
                    shared <span className="font-normal italic">frustration</span>
                  </>
                }
              />
            </div>

            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground lg:col-span-8">
              <p>
                <span
                  aria-hidden="true"
                  className="mr-4 mb-2 flex size-16 float-left items-center justify-center border-2 border-foreground bg-background font-display text-4xl font-black text-foreground"
                >
                  E
                </span>
                very team eventually collects the same artifacts: a document
                that describes the system, a diagram that explains it, and a
                growing gap between the two. We built Erasior because we were
                tired of paying the tax that gap charges — switching tools,
                re-explaining context, watching docs drift away from the thing
                they documented.
              </p>
              <p>
                So we put both surfaces in one place. A structured, block-based
                document on one side; an infinite, hand-drawn canvas on the
                other. Write the decision record, draw the architecture, and keep
                them in a single file that your whole team can open.
              </p>
              <p>
                The product is deliberately austere — black, white, and
                typography. No accent colors to hide behind, no dashboards to
                decorate. Just the work, ruled and set like a page worth
                reading.
              </p>
            </div>
          </div>
        </section>

        {/* Numbers */}
        <StatsBand
          caption="The team, in numbers"
          stats={[
            { value: "2025", label: "Founded", note: "Started as a weekend prototype." },
            { value: "12", label: "Teammates", note: "Engineers, designers, and writers." },
            { value: "4", label: "Timezones", note: "Async by default, prose first." },
            { value: "1", label: "Workspace", note: "Docs and diagrams, together at last." },
          ]}
        />

        {/* Team */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
          <SectionHeading
            eyebrow="People"
            title={
              <>
                The ones who <span className="font-normal italic">draw</span> the lines
              </>
            }
            description="A small, senior team that writes as much code as it writes prose."
          />

          <div className="mt-12 grid gap-[2px] border-2 border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member, i) => (
              <div
                key={member.name}
                className="group flex items-center gap-5 bg-background p-6 transition-colors duration-100 hover:bg-foreground hover:text-background md:p-8"
              >
                <span className="flex size-14 shrink-0 items-center justify-center border-2 border-foreground font-mono text-sm font-medium transition-colors duration-100 group-hover:border-background group-hover:bg-background group-hover:text-foreground">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-xl font-bold tracking-tight">
                    {member.name}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase group-hover:text-background/70">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section className="border-t-4 border-foreground">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
            <SectionHeading
              eyebrow="Principles"
              title={
                <>
                  How we <span className="font-normal italic">work</span>
                </>
              }
            />

            <div className="mt-12 border-t-2 border-foreground">
              {PRINCIPLES.map((principle) => (
                <div
                  key={principle.index}
                  className="group grid gap-4 border-b-2 border-foreground px-4 py-8 transition-colors duration-100 hover:bg-foreground hover:text-background md:grid-cols-12 md:px-6"
                >
                  <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground group-hover:text-background/70 md:col-span-2">
                    {principle.index}
                  </span>
                  <h3 className="font-display text-2xl font-bold tracking-tight md:col-span-4">
                    {principle.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground group-hover:text-background/80 md:col-span-6">
                    {principle.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder quote */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
          <PullQuote
            eyebrow="Founder’s note"
            quote={
              <>
                We’re not trying to make software that looks friendly. We’re
                trying to make software that looks <em className="font-normal">certain</em>.
              </>
            }
            attribution="Ada Okonkwo"
            role="Founder & CEO"
          />
        </section>

        <FinalCTA
          eyebrow="Join us"
          title={
            <>
              Read less tooling.
              <br />
              <span className="font-normal italic">Make</span> more work.
            </>
          }
          description="See the workspace the team ships from every day."
          primary={{ label: "Start creating", href: "/register" }}
          secondary={{ label: "View careers", href: "/careers" }}
          note="Free forever for up to 5 files · No card required"
        />
      </main>
      <Footer />
    </>
  );
}
