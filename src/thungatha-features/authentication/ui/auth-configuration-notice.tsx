export function AuthConfigurationNotice() {
  return (
    <section className="w-full max-w-[420px] rounded-panel border border-line bg-panel p-6 text-fg">
      <h1 className="text-title font-medium">Authentication needs setup</h1>
      <p className="mt-2 text-control text-fg-muted">
        Add the Clerk keys and Supabase settings from <code>.env.example</code>,
        then restart the development server. No account data was changed.
      </p>
    </section>
  );
}
