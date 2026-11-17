import { SignUp } from "@clerk/nextjs";
import { AuthConfigurationNotice } from "@/thungatha-features/authentication/ui/auth-configuration-notice";
import { AuthPageShell } from "@/thungatha-features/authentication/ui/auth-page-shell";
import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";

function safeRedirect(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate?.startsWith("/") || candidate.startsWith("//")) return "/jobs";
  return candidate;
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[] }>;
}) {
  const params = await searchParams;
  const redirectUrl = safeRedirect(params.redirect_url);
  return (
    <AuthPageShell>
      {hasClerkConfiguration() ? (
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
          forceRedirectUrl={redirectUrl}
          oauthFlow="popup"
        />
      ) : (
        <AuthConfigurationNotice />
      )}
    </AuthPageShell>
  );
}
