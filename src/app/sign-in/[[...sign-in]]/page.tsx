import { SignIn } from "@clerk/nextjs";
import { AuthConfigurationNotice } from "@/thungatha-features/authentication/ui/auth-configuration-notice";
import { AuthPageShell } from "@/thungatha-features/authentication/ui/auth-page-shell";
import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";

function safeRedirect(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate?.startsWith("/") || candidate.startsWith("//")) return "/jobs";
  return candidate;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[] }>;
}) {
  const params = await searchParams;
  const redirectUrl = safeRedirect(params.redirect_url);
  return (
    <AuthPageShell>
      {hasClerkConfiguration() ? (
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
          forceRedirectUrl={redirectUrl}
        />
      ) : (
        <AuthConfigurationNotice />
      )}
    </AuthPageShell>
  );
}
