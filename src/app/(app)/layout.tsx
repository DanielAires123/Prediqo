import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-lg">
          Prediqo
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </Link>
          <Link href="/ranking" className="text-sm hover:underline">
            Ranking
          </Link>
          <Link href="/profile" className="text-sm hover:underline">
            {user.profile.username}
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-sm text-zinc-500 hover:underline">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
