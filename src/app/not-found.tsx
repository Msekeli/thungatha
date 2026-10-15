import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold text-teal-800">404</p>

      <h1 className="mt-3 text-2xl font-semibold text-slate-900">
        Page not found
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        We couldn’t find the page you’re looking for. It may have moved or the
        address may be incorrect.
      </p>

      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Return home
      </Link>
    </main>
  );
}
