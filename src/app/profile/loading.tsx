import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-6 py-10"
      aria-busy="true"
      aria-label="Loading profile page"
    >
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <section className="mt-8 space-y-5 rounded-xl border border-slate-200 p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-10 w-32" />
      </section>
    </main>
  );
}
