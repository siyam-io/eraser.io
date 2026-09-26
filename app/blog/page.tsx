import Header from "../_components/Header";
import Footer from "../_components/Footer";
import SectionHeading from "../_components/SectionHeading";
import Newsletter from "../_components/Newsletter";

const SIDE_POSTS = [
  { title: "Diagramming Best Practices", cat: "Design" },
  { title: "Collaborative Editing Guide", cat: "Guide" },
  { title: "MongoDB Architecture", cat: "Engineering" },
];

const POSTS = [
  {
    title: "Setting Up Stripe Billing",
    cat: "Engineering",
    date: "Mar 4, 2026",
    read: "8 min",
    excerpt:
      "Checkout sessions, customer portals, and webhooks — how billing landed in the workspace without leaking keys.",
  },
  {
    title: "Typography as Interface",
    cat: "Design",
    date: "Feb 18, 2026",
    read: "6 min",
    excerpt:
      "What happens when you remove color from the UI entirely and let scale, weight, and rules carry the hierarchy.",
  },
  {
    title: "Block Editors vs. Textareas",
    cat: "Engineering",
    date: "Feb 2, 2026",
    read: "10 min",
    excerpt:
      "Why Editor.js JSON beat markdown files for documents that need to live next to an infinite canvas.",
  },
  {
    title: "How We Ship Without Staging",
    cat: "Product",
    date: "Jan 20, 2026",
    read: "5 min",
    excerpt:
      "Small batches, honest feature flags, and a dashboard we actually use — the release discipline of a tiny team.",
  },
  {
    title: "A Field Guide to Whiteboarding",
    cat: "Guides",
    date: "Jan 8, 2026",
    read: "7 min",
    excerpt:
      "Frames, arrows, and restraint: drawing architecture that other people can read back to you.",
  },
  {
    title: "Erasior v2.0 — Real-time Collaboration",
    cat: "Release",
    date: "Dec 15, 2025",
    read: "4 min",
    excerpt:
      "Live presence, shared cursors, and documents that two people can edit without stepping on each other.",
  },
];

const TOPICS = [
  "Engineering",
  "Design",
  "Product",
  "Guides",
  "Release",
  "Changelog",
  "Typography",
  "Excalidraw",
];

export default function Blog() {
  return (
    <>
      <Header />
      <main id="main" className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-8 md:py-24 lg:px-12">
          <div className="flex items-center gap-4">
            <span className="h-1 w-12 bg-foreground" aria-hidden="true" />
            <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              Field notes
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-b-4 border-foreground pb-8">
            <h1 className="font-display text-6xl leading-[0.85] font-black tracking-tighter md:text-8xl">
              Blog <span className="font-normal italic">&amp;</span> Updates
            </h1>
            <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              Issue 07 — Essays on tools &amp; type
            </span>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {/* Featured article */}
            <article className="group flex cursor-pointer flex-col border-2 border-foreground transition-colors duration-100 hover:bg-foreground hover:text-background lg:col-span-2">
              <div className="flex h-64 items-center justify-center overflow-hidden border-b-2 border-foreground bg-muted texture-grid md:h-72">
                <span
                  aria-hidden="true"
                  className="flex size-24 items-center justify-center border-2 border-foreground bg-foreground font-display text-5xl font-black text-background transition-all duration-300 group-hover:scale-105 group-hover:bg-background group-hover:text-foreground"
                >
                  E
                </span>
              </div>
              <div className="flex flex-1 flex-col p-8 md:p-10">
                <span className="w-fit border-2 border-current px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
                  Release
                </span>
                <h2 className="mt-6 font-display text-4xl leading-[0.95] font-black tracking-tight md:text-5xl">
                  Why we chose Next.js &amp; Excalidraw
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground group-hover:text-background/80">
                  A deep dive into our tech stack: integrating Editor.js and
                  Excalidraw with Next.js App Router for a seamless experience.
                </p>
                <span className="mt-auto inline-flex items-center gap-3 pt-8 font-mono text-xs tracking-widest uppercase">
                  Read
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-100 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
            </article>

            {/* Side posts */}
            <div className="flex flex-col gap-8">
              {SIDE_POSTS.map((post) => (
                <article
                  key={post.title}
                  className="group flex flex-1 cursor-pointer flex-col border-2 border-foreground p-6 transition-colors duration-100 hover:bg-foreground hover:text-background"
                >
                  <span className="w-fit border border-current px-2 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
                    {post.cat}
                  </span>
                  <h3 className="mt-5 font-display text-2xl leading-tight font-bold tracking-tight">
                    {post.title}
                  </h3>
                  <span
                    className="mt-auto pt-6 text-right font-mono text-xs"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </article>
              ))}
            </div>
          </div>

          {/* All posts */}
          <section className="mt-20">
            <div className="flex flex-wrap items-end justify-between gap-6 border-b-4 border-foreground pb-6">
              <SectionHeading
                eyebrow="Archive"
                title={
                  <>
                    Latest <span className="font-normal italic">writing</span>
                  </>
                }
              />
              <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                {String(POSTS.length).padStart(2, "0")} entries
              </span>
            </div>

            <div className="mt-10 grid gap-[2px] border-2 border-foreground bg-foreground md:grid-cols-2 lg:grid-cols-3">
              {POSTS.map((post) => (
                <article
                  key={post.title}
                  className="group flex cursor-pointer flex-col bg-background p-8 transition-colors duration-100 hover:bg-foreground hover:text-background"
                >
                  <span className="w-fit border border-current px-2 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
                    {post.cat}
                  </span>
                  <h3 className="mt-5 font-display text-2xl leading-tight font-bold tracking-tight">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground group-hover:text-background/80">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-6 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase group-hover:text-background/70">
                    <span>{post.date}</span>
                    <span>{post.read}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Topics */}
          <section className="mt-20">
            <SectionHeading eyebrow="Index" title="Browse by topic" />
            <ul className="mt-8 flex flex-wrap gap-3">
              {TOPICS.map((topic) => (
                <li
                  key={topic}
                  className="cursor-pointer border-2 border-foreground px-4 py-2 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors duration-100 hover:bg-foreground hover:text-background"
                >
                  {topic}
                </li>
              ))}
            </ul>
          </section>

          {/* Newsletter */}
          <section className="mt-20 border-2 border-foreground p-8 md:p-12">
            <div className="grid items-end gap-8 lg:grid-cols-2">
              <SectionHeading
                eyebrow="Subscribe"
                title={
                  <>
                    One letter, <span className="font-normal italic">monthly</span>
                  </>
                }
                description="New essays, release notes, and typographic digressions. No cadence theatre — we write when there’s something worth reading."
              />
              <Newsletter source="blog" />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
