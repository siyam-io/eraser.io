"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Users", href: "/admin/users", icon: Users, exact: false },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard, exact: false },
  { label: "Settings", href: "/admin/settings", icon: Settings, exact: false },
];

const sectionTitle = (pathname: string) => {
  if (pathname.startsWith("/admin/users/")) return "User detail";
  const item = NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)));
  return item?.label ?? "Admin";
};

export default function AdminShell({
  admin,
  children,
}: {
  admin: { name: string; email: string; role: "admin" };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title = sectionTitle(pathname);

  const nav = (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto py-4">
      <div className="px-5 pb-3 font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
        Modules
      </div>
      <ul className="space-y-1 px-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 text-[15px] transition-colors duration-100 ${
                  active
                    ? "bg-foreground font-medium text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const brand = (
    <Link
      href="/"
      className="flex items-center gap-3 border-b-2 border-foreground px-5 py-5"
    >
      <span
        className="flex size-6 shrink-0 items-center justify-center bg-foreground"
        aria-hidden="true"
      >
        <span className="size-2 bg-background" />
      </span>
      <span className="font-display text-lg font-black tracking-tighter uppercase">
        Erasior
      </span>
      <span className="ml-auto border border-foreground px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase">
        Admin
      </span>
    </Link>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 flex-col border-r-2 border-foreground bg-background md:flex">
        {brand}
        {nav}
        <div className="border-t-2 border-foreground p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2 font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase transition-colors duration-100 hover:text-foreground"
          >
            <ArrowLeft size={13} strokeWidth={1.5} />
            Back to app
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[260px] flex-col border-r-2 border-foreground bg-background">
            <button
              aria-label="Close menu"
              className="absolute top-4 right-3 border-2 border-foreground p-1.5"
              onClick={() => setOpen(false)}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
            {brand}
            {nav}
            <div className="border-t-2 border-foreground p-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-2 font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
              >
                <ArrowLeft size={13} strokeWidth={1.5} />
                Back to app
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b-2 border-foreground bg-background/90 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-4">
            <button
              aria-label="Open menu"
              className="border-2 border-foreground p-2 transition-colors duration-100 hover:bg-foreground hover:text-background md:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={16} strokeWidth={1.5} />
            </button>
            <h1 className="font-display text-xl font-black tracking-tight">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase sm:inline">
              {admin.email}
            </span>
            <span className="flex size-8 items-center justify-center border-2 border-foreground bg-foreground font-mono text-[11px] text-background">
              {(admin.name || admin.email || "?").charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main id="main" className="min-w-0 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
