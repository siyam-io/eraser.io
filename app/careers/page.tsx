import Header from "../_components/Header";
import Footer from "../_components/Footer";
import SectionHeading from "../_components/SectionHeading";
import StatsBand from "../_components/StatsBand";
import PullQuote from "../_components/PullQuote";
import Faq from "../_components/Faq";
import FinalCTA from "../_components/FinalCTA";

const JOBS = [
  { title: "Senior Frontend Engineer", dept: "Engineering", tag: "Remote" },
  { title: "Product Designer", dept: "Design", tag: "Berlin" },
  { title: "Developer Advocate", dept: "Marketing", tag: "Remote" },
  { title: "Backend Engineer, Node", dept: "Engineering", tag: "Remote" },
  { title: "Design Engineer", dept: "Design", tag: "Remote" },
  { title: "Site Reliability Engineer", dept: "Engineering", tag: "Berlin" },
  { title: "Technical Writer", dept: "Content", tag: "Remote" },
  { title: "Customer Engineer", dept: "Support", tag: "Remote" },
];

const BENEFITS = [
  {
    index: "01",
    title: "Remote-first",
    text: "Work where you think best. Async by default across four timezones, with writing as the default medium.",
  },
  {
    index: "02",
    title: "Learning budget",
    text: "€2,000 a year for books, courses, and conferences — plus a standing invitation to write about what you learn.",
  },
  {
    index: "03",
    title: "Hardware of choice",
    text: "A machine that doesn’t fight you, replaced on a normal cycle. Monochrome wallpaper optional.",
  },
  {
    index: "04",
    title: "Time off, for real",
    text: "28 days minimum, and we watch the metrics to make sure nobody quietly donates them back.",
  },
  {
    index: "05",
    title: "Workspace stipend",
    text: "Desk, chair, good coffee, better light. Set the room you do your best work in.",
  },
  {
    index: "06",
    title: "Real ownership",
    text: "Small teams, short chains. You ship what you specify, and you see who uses it.",
  },
];

const PROCESS = [
  {
    index: "01",
    title: "Apply",
    text: "A short form and your work. No cover letter required — we read what you’ve actually made.",
  },
  {
    index: "02",
    title: "Conversation",
    text: "Thirty minutes with the hiring lead about what you’ve built, what broke, and what you’d do again.",
  },
  {
    index: "03",
    title: "Craft session",
    text: "A practical session on real work — no whiteboard riddles, no trick questions, no gotchas.",
  },
  {
    index: "04",
    title: "Offer",
    text: "A decision within a week, with transparent salary bands shared before the first call.",
  },
];

const FAQS = [
  {
    q: "Do I need to relocate?",
    a: "No. Most of the team is remote and spread across four timezones. Berlin appears for roles that occasionally need lab or studio time; everything else is location-agnostic within reasonable overlap hours.",
  },
  {
    q: "Do you hire juniors?",
    a: "Yes — when the craft conversation shows real promise. We care more about what you can show us and how you think than about years on a résumé.",
  },
  {
    q: "How long does hiring take?",
    a: "Apply to offer is typically under two weeks: an intro call, a craft session, and a final conversation with the founders. We give a decision either way within a week of the last round.",
  },
  {
    q: "How do you work day to day?",
    a: "Async by default, writing first. Decisions live in documents, diagrams live next to them, and meetings are for the things that genuinely need a room.",
  },
];

export default function Careers() {
  return (
    <>
      <Header />
      <main id="main" className="bg-background">
        {/* Inverted masthead with vertical line texture */}
        <section className="border-b-4 border-foreground bg-foreground text-background texture-vlines">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-10 px-6 py-16 md:flex-row md:items-end md:py-24 lg:px-12">
            <div>
              <div className="flex items-center gap-4">
                <span className="h-1 w-10 bg-background" aria-hidden="true" />
                <span className="font-mono text-[11px] tracking-[0.2em] text-background/70 uppercase">
                  Careers
                </span>
              </div>
              <h1 className="mt-8 font-display text-6xl leading-[0.85] font-black tracking-tighter md:text-8xl">
                Join
                <br />
                <span className="font-normal italic">Our</span> Team
              </h1>
            </div>

            {/* Boxed label — punctuation, not decoration */}
            <div className="shrink-0 border-2 border-background bg-background px-8 py-5 text-foreground">
              <span className="font-mono text-sm tracking-[0.3em] uppercase">
                Now Hiring
              </span>
            </div>
          </div>
        </section>

        {/* Numbers */}
        <StatsBand
          caption="Working here, in numbers"
          stats={[
            { value: "12", label: "Teammates", note: "Small on purpose; every hire is felt." },
            { value: "4", label: "Timezones", note: "Async first, writing over meetings." },
            { value: "28", label: "Days off", note: "Minimum — and audited every quarter." },
            { value: "€2k", label: "Learning", note: "Annual budget, per person." },
          ]}
        />

        {/* Benefits */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
          <SectionHeading
            eyebrow="Benefits"
            title={
              <>
                What you <span className="font-normal italic">get</span>
              </>
            }
            description="The boring-but-decisive things, stated plainly instead of buried in a PDF."
          />

          <div className="mt-12 grid gap-[2px] border-2 border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.index}
                className="group bg-background p-8 transition-colors duration-100 hover:bg-foreground hover:text-background"
              >
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground group-hover:text-background/70">
                  {benefit.index}
                </span>
                <h3 className="mt-4 font-display text-2xl font-black tracking-tight">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground group-hover:text-background/80">
                  {benefit.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Open positions */}
        <section id="roles" className="border-t-4 border-foreground texture-hlines">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
            <div className="flex items-baseline justify-between border-b-4 border-foreground pb-6">
              <h2 className="font-display text-4xl font-black tracking-tight md:text-5xl">
                Open Positions
              </h2>
              <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                {String(JOBS.length).padStart(2, "0")} roles
              </span>
            </div>

            <ul>
              {JOBS.map((job) => (
                <li
                  key={job.title}
                  className="group border-b-2 border-foreground transition-colors duration-100 hover:bg-foreground hover:text-background"
                >
                  <div className="flex flex-col items-start justify-between gap-6 px-4 py-8 md:flex-row md:items-center md:px-6">
                    <div>
                      <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                        {job.title}
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className="border-2 border-foreground bg-foreground px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-background uppercase transition-colors duration-100 group-hover:border-background group-hover:bg-background group-hover:text-foreground">
                          {job.dept}
                        </span>
                        <span className="border-2 border-foreground px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-100 group-hover:border-background">
                          {job.tag}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="shrink-0 border-2 border-foreground bg-foreground px-8 py-4 font-mono text-xs tracking-widest text-background uppercase transition-colors duration-100 group-hover:border-background hover:bg-background hover:text-foreground"
                    >
                      Apply Now
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Hiring process */}
        <section className="border-t-4 border-foreground texture-diagonal">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
            <SectionHeading
              eyebrow="Hiring process"
              title={
                <>
                  Four steps, <span className="font-normal italic">no theatre</span>
                </>
              }
              description="From application to offer in under two weeks."
            />

            <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((step) => (
                <li
                  key={step.index}
                  className="border-2 border-foreground bg-background p-6"
                >
                  <span className="font-display text-5xl leading-none font-black text-foreground/10">
                    {step.index}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Culture quote */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
          <PullQuote
            eyebrow="Hiring note"
            quote={
              <>
                We hire people who <em className="font-normal">delete</em> more
                than they add — and then argue well about what stays.
              </>
            }
            attribution="Jonas Lindqvist"
            role="Engineering"
          />
        </section>

        {/* FAQ */}
        <section className="border-t-4 border-foreground">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionHeading
                  eyebrow="Before you apply"
                  title={
                    <>
                      Questions, <span className="font-normal italic">answered</span>
                    </>
                  }
                />
              </div>
              <div className="lg:col-span-8">
                <Faq items={FAQS} />
              </div>
            </div>
          </div>
        </section>

        <FinalCTA
          eyebrow="Open application"
          title={
            <>
              Don’t see your role?
              <br />
              <span className="font-normal italic">Write</span> to us anyway.
            </>
          }
          description="Tell us what you’d build here. We read every application that shows real work."
          primary={{ label: "See open roles", href: "#roles" }}
          secondary={{ label: "About the product", href: "/about" }}
          note="Applications reviewed weekly · Decisions within a week"
        />
      </main>
      <Footer />
    </>
  );
}
