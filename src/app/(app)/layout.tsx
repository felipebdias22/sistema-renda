import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/app/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdmin =
    (user.app_metadata as { role?: string } | null)?.role === "admin";

  return (
    <div className="min-h-screen">
      <Sidebar email={user.email ?? ""} isAdmin={isAdmin} />
      <main className="md:pl-72">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
