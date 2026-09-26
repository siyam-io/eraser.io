"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        toast.success("Registration successful! Please login.");
        router.push("/login");
      } else {
        const data = await res.json();
        toast.error(data.message || "Registration failed");
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
            Start with
            <br />
            a blank page,
            <br />
            <span className="font-normal italic">not</span> a blank stare.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              "Document + whiteboard, side by side",
              "Twelve built-in templates",
              "No card required to start",
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
          Create an <span className="font-normal italic">account</span>
        </h1>
        <div className="mt-4 mb-8 flex items-center" aria-hidden="true">
          <span className="h-1 w-16 bg-foreground" />
          <span className="size-3 border-2 border-foreground" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>
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
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline decoration-2 underline-offset-4"
          >
            Sign in
          </Link>
        </p>
        </div>
      </div>
    </main>
  );
}
