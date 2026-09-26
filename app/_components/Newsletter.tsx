"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Newsletter signup — line-rule input + black CTA.
 * No backend yet: acknowledges locally and confirms with a toast.
 */
export default function Newsletter({ source = "blog" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    toast.success("You’re on the list");
  };

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label
          htmlFor={`newsletter-${source}`}
          className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
        >
          Email address
        </label>
        <Input
          id={`newsletter-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" className="h-10 shrink-0" disabled={subscribed}>
        {subscribed ? "Subscribed ✓" : "Subscribe"}
      </Button>
    </form>
  );
}
