import Link from "next/link";

const FOOTER_LINKS = [
  { name: "About", path: "/about" },
  { name: "Features", path: "/services" },
  { name: "Templates", path: "/projects" },
  { name: "Pricing", path: "/pricing" },
  { name: "Changelog", path: "/history" },
  { name: "Careers", path: "/careers" },
  { name: "Blog", path: "/blog" },
  { name: "Login", path: "/login" },
];

const Footer = () => {
  return (
    <footer className="border-t-4 border-foreground bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-8 lg:px-12">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-3" aria-label="Erasior — home">
              <span
                className="flex size-6 shrink-0 items-center justify-center bg-foreground"
                aria-hidden="true"
              >
                <span className="size-2 bg-background" />
              </span>
              <span className="font-display text-xl font-black tracking-tighter uppercase">
                Erasior
              </span>
            </Link>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground italic">
              A collaborative workspace where documents and whiteboards live
              together.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-14 gap-y-4">
              {FOOTER_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    className="font-mono text-[11px] tracking-[0.15em] uppercase hover:underline decoration-2 underline-offset-4"
                    href={link.path}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border-light pt-6 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Erasior</span>
          <span>Black · White · Type</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
