import Link from "next/link";

export const metadata = { title: "Not Authorized — ERASIOR.IO" };

export default function Unauthorized() {
  return (
    <main
      id="main"
      className="flex min-h-screen items-center justify-center bg-background texture-grid px-6 py-16"
    >
      <div className="w-full max-w-md border-2 border-foreground bg-background p-8 md:p-10">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground hover:underline underline-offset-4"
        >
          ← Erasior
        </Link>

        <p className="mt-8 font-mono text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
          Error 403
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[0.9] font-black tracking-tighter">
          Not <span className="font-normal italic">authorized</span>
        </h1>

        <div className="mt-6 mb-8 flex items-center" aria-hidden="true">
          <span className="h-1 w-20 bg-foreground" />
          <span className="size-3 border-2 border-foreground" />
        </div>

        <p className="text-base leading-relaxed text-muted-foreground">
          You’re signed in, but this account doesn’t have administrator access.
          If you believe you should, ask an operator to elevate your role — then
          sign out and back in.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="border-2 border-foreground bg-foreground px-6 py-3 font-mono text-xs font-medium tracking-widest text-background uppercase transition-colors duration-100 hover:bg-background hover:text-foreground"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="border-2 border-foreground px-6 py-3 font-mono text-xs font-medium tracking-widest uppercase transition-colors duration-100 hover:bg-foreground hover:text-background"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
