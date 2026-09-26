import Header from "../_components/Header";
import Footer from "../_components/Footer";
import SectionHeading from "../_components/SectionHeading";
import StatsBand from "../_components/StatsBand";
import Faq from "../_components/Faq";
import FinalCTA from "../_components/FinalCTA";

const FEATURES = [
  {
    title: "Split-screen Workspace",
    text: "Documents and an infinite canvas side by side — context never leaves the screen.",
  },
  {
    title: "Block-based Editor",
    text: "Headers, lists, code, quotes, tables, and checklists as structured blocks that save as you write.",
  },
  {
    title: "Excalidraw Whiteboard",
    text: "Sketch architecture, flows, and diagrams on an infinite canvas without leaving the workspace.",
  },
  {
    title: "NextAuth Security",
    text: "Credential and Google sign-in, with sessions handled end to end by NextAuth.",
  },
  {
    title: "Team Spaces",
    text: "Create teams, share file lists, and keep every project’s documents and boards together.",
  },
  {
    title: "Views That Scale",
    text: "All Files, Recent, Starred, and Archived — the four lists you actually need, nothing more.",
  },
  {
    title: "Templates",
    text: "Twelve built-in starting points: system architecture, API docs, RFCs, retros, and more.",
  },
  {
    title: "Metered Billing",
    text: "Stripe checkout and customer portal, a free tier that stays free, and Pro when you outgrow it.",
  },
];

const SPEC: [string, string][] = [
  ["Document editor", "Editor.js"],
  ["Whiteboard", "Excalidraw"],
  ["Framework", "Next.js 15 · App Router"],
  ["Styling", "Tailwind CSS v4"],
  ["Database", "MongoDB · Mongoose"],
  ["Authentication", "NextAuth · Credentials + Google"],
  ["Payments", "Stripe"],
  ["Icons", "Lucide"],
];

const INTEGRATIONS = [
  "Editor.js",
  "Excalidraw",
  "Next.js",
  "MongoDB",
  "NextAuth",
  "Stripe",
  "Lucide",
  "Tailwind CSS",
];

const FAQS = [
  {
    q: "Is the split screen really side by side?",
    a: "Yes — the document and the whiteboard are two resizable panels in one workspace, each taking 40–100% of the width. Maximize either one, or split evenly and work across both at once.",
  },
  {
    q: "Does it work on tablets and phones?",
    a: "The dashboard and marketing site are fully responsive. The split-screen workspace is tuned for larger screens, where side-by-side editing earns its keep.",
  },
  {
    q: "How fast is it?",
    a: "The app ships as a modern Next.js build with static marketing pages and a lean client bundle. Documents save as compact JSON, so reopening a file lands you back in context immediately.",
  },
  {
    q: "Can I get my data out?",
    a: "Documents are stored as portable Editor.js JSON and whiteboards as Excalidraw scenes — both open formats you can export and read without us.",
  },
  {
    q: "What about collaboration?",
    a: "Team spaces share files across a workspace, and v2.0 introduced real-time multiplayer editing with live presence and cursors on the same document.",
  },
];

export default function Services() {
  return (
    <>
      <Header />
      <main id="main" className="bg-background">
        {/* Inverted masthead */}
        <section className="border-b-4 border-foreground bg-foreground text-background texture-vlines">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 text-center md:px-8 md:py-32 lg:px-12">
            <div className="flex items-center justify-center gap-4">
              <span className="h-1 w-10 bg-background" aria-hidden="true" />
              <span className="font-mono text-[11px] tracking-[0.2em] text-background/70 uppercase">
                Features
              </span>
              <span className="h-1 w-10 bg-background" aria-hidden="true" />
            </div>
            <h1 className="mt-8 font-display text-6xl leading-[0.85] font-black tracking-tighter md:text-8xl lg:text-9xl">
              Core
              <br />
              <span className="font-normal italic">Features</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-background/80">
              Eight capabilities, one discipline: everything in the product
              answers to black, white, and type.
            </p>
          </div>
        </section>

        {/* Feature cells — numbered, inverting on hover */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
          <div className="grid gap-[2px] border-2 border-foreground bg-foreground sm:grid-cols-2">
            {FEATURES.map((feature, idx) => (
              <div
                key={feature.title}
                className="group cursor-pointer bg-background p-8 transition-colors duration-100 hover:bg-foreground hover:text-background md:p-12"
              >
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground group-hover:text-background/70">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 font-display text-3xl font-black tracking-tight">
                  {feature.title}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground group-hover:text-background/80">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Numbers */}
        <StatsBand
          caption="Under the hood, in numbers"
          stats={[
            { value: "8", label: "Features", note: "Counted, documented, and nothing more." },
            { value: "12", label: "Templates", note: "Documents with opinions, pre-filled." },
            { value: "2", label: "Auth paths", note: "Credentials and Google, via NextAuth." },
            { value: "0", label: "Lock-in", note: "Open formats: JSON scenes and blocks." },
          ]}
        />

        {/* Spec table */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Specification"
                title={
                  <>
                    What it’s <span className="font-normal italic">made of</span>
                  </>
                }
                description="No mystery stack — every part chosen for longevity and read like a colophon."
              />
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden border-2 border-foreground">
                <table className="w-full text-left">
                  <thead className="bg-foreground font-mono text-[10px] tracking-[0.15em] text-background uppercase">
                    <tr>
                      <th className="px-6 py-4 font-medium">Layer</th>
                      <th className="px-6 py-4 font-medium">Built with</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {SPEC.map(([layer, value]) => (
                      <tr
                        key={layer}
                        className="group transition-colors duration-100 hover:bg-foreground hover:text-background"
                      >
                        <td className="px-6 py-4 font-mono text-xs tracking-[0.1em] text-muted-foreground uppercase group-hover:text-background/70">
                          {layer}
                        </td>
                        <td className="px-6 py-4 font-medium">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="border-y-4 border-foreground bg-muted texture-hlines">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
            <SectionHeading
              eyebrow="Integrations"
              title={
                <>
                  Built on <span className="font-normal italic">proven</span> parts
                </>
              }
            />
            <ul className="mt-10 grid grid-cols-2 gap-[2px] border-2 border-foreground bg-foreground sm:grid-cols-4">
              {INTEGRATIONS.map((name) => (
                <li
                  key={name}
                  className="flex min-h-24 items-center justify-center bg-background px-4 py-6 text-center font-mono text-[11px] tracking-[0.2em] uppercase transition-colors duration-100 hover:bg-foreground hover:text-background"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="FAQ"
                title={
                  <>
                    Details, <span className="font-normal italic">settled</span>
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
          eyebrow="See for yourself"
          title={
            <>
              Eight features.
              <br />
              <span className="font-normal italic">One</span> workspace.
            </>
          }
          description="Open the split view, write a doc, draw a diagram — all before your coffee cools."
          primary={{ label: "Start creating", href: "/register" }}
          secondary={{ label: "See pricing", href: "/pricing" }}
          note="Free forever for up to 5 files · No card required"
        />
      </main>
      <Footer />
    </>
  );
}
