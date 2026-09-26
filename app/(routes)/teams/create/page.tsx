"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKindeBrowserClient } from "@/app/hooks/useKindeBrowserClientMock";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export default function CreateTeam() {
  const [teamName, setTeamName] = useState("");

  const { user } = useKindeBrowserClient();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName,
          createdBy: user?.email || ""
        })
      });
      if (res.ok) {
        toast.success("Team created successfully");
        router.push("/dashboard");
      } else {
        toast.error("Failed to create team");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <main
      id="main"
      className="flex min-h-screen items-center justify-center bg-background texture-grid p-6"
    >
      <div className="w-full max-w-md border-2 border-foreground bg-background p-8 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="h-1 w-12 bg-foreground" aria-hidden="true" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              New team
            </span>
          </div>
          <h1 className="font-display text-3xl leading-tight font-black tracking-tighter">
            What should we call <span className="font-normal italic">your team</span>?
          </h1>
          <p className="text-sm text-muted-foreground">
            You can change this later from settings.
          </p>
        </div>

        <div className="space-y-6">
          <label
            htmlFor="teamName"
            className="block font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
          >
            Team Name
          </label>
          <Input
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter your team name"
          />
          <Button
            disabled={!(teamName && teamName?.length > 0)}
            className="w-full"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </main>
  );
}
