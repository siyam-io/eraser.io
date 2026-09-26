import React from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { HttpError } from "@/lib/access";
import AdminShell from "./_components/AdminShell";

/**
 * Route-level protection. The middleware already screens /admin/* by JWT role;
 * this second gate re-checks against the database so a revoked admin (or a
 * stale token) is turned away even if the cookie survives.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const admin = await requireAdmin();
    return (
      <AdminShell
        admin={{
          name: admin.name ?? "",
          email: admin.email ?? "",
          role: "admin",
        }}
      >
        {children}
      </AdminShell>
    );
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      redirect("/login?callbackUrl=/admin");
    }
    redirect("/unauthorized");
  }
}
