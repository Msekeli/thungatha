export function AuthConfigurationNotice() {
  return (
    <section className="rounded-2xl border border-amber-300/40 bg-amber-50 p-6 text-slate-900">
      <h1 className="text-xl font-semibold">Authentication needs setup</h1>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Add the Clerk keys and Supabase settings from <code>.env.example</code>,
        then restart the development server. No account data was changed.
      </p>
    </section>
  );
}
