"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Logged in successfully");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main" className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Editorial value panel */}
      <aside className="flex flex-col justify-between bg-foreground p-8 text-background texture-vlines md:p-12">
        <Link
          href="/"
          className="flex items-center gap-3 font-display text-xl font-black tracking-tighter uppercase"
        >
          <span
            className="flex size-6 shrink-0 items-center justify-center bg-background"
            aria-hidden="true"
          >
            <span className="size-2 bg-foreground" />
          </span>
          Erasior
        </Link>

        <div className="my-12">
          <p className="font-display text-4xl leading-[1.05] font-black tracking-tighter md:text-5xl">
            Docs and
            <br />
            <span className="font-normal italic">diagrams</span>,
            <br />
            one room.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              "Block-based documents",
              "Infinite Excalidraw canvas",
              "Five free files, forever",
            ].map((item, i) => (
              <li
                key={item}
                className="flex items-center gap-4 border-t border-background/20 pt-4 font-mono text-[11px] tracking-[0.2em] uppercase"
              >
                <span className="text-background/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-[10px] tracking-[0.3em] text-background/60 uppercase">
          Black · White · Type
        </p>
      </aside>

      {/* Form */}
      <div className="flex items-center justify-center px-6 py-16 texture-grid md:px-12">
        <div className="w-full max-w-md border-2 border-foreground bg-background p-8 md:p-10">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground hover:underline underline-offset-4"
        >
          ← Erasior
        </Link>

        <h1 className="mt-6 font-display text-4xl font-black tracking-tighter">
          Welcome <span className="font-normal italic">back</span>
        </h1>
        <div className="mt-4 mb-8 flex items-center" aria-hidden="true">
          <span className="h-1 w-16 bg-foreground" />
          <span className="size-3 border-2 border-foreground" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="mt-5 w-full"
          >
            <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline decoration-2 underline-offset-4"
          >
            Sign up
          </Link>
        </p>
        </div>
      </div>
    </main>
  );
}
