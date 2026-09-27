import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GUEST_TTL_DAYS } from "@/lib/guest-constants";

export default function GuestBanner() {
  const router = useRouter();

  const handleSync = async () => {
    try {
      // Redirect to registration with callbackUrl to return here after sign-up
      router.push(
        `/register?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
      );
    } catch (error) {
      toast.error("Failed to start sync. Please try again.");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-5 py-2 text-[12px] text-amber-200">
      <span className="flex items-center gap-2">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400"
          aria-hidden="true"
        />
        You&apos;re working as a guest. Sign up to save permanently &amp; sync
        across devices.
      </span>
      <span className="flex items-center gap-3 font-mono text-[10px] tracking-[0.15em] uppercase">
        <span className="text-amber-200/60">
          Expires in ~{GUEST_TTL_DAYS} days
        </span>
        <button
          type="button"
          onClick={handleSync}
          className="border border-amber-400/60 px-3 py-1 text-amber-100 transition-colors hover:bg-amber-400/20"
        >
          Sync to Account →
        </button>
        <a
          href="/register"
          className="border border-amber-400/60 px-3 py-1 text-amber-100 transition-colors hover:bg-amber-400/20"
        >
          Create account
        </a>
      </span>
    </div>
  );
}
