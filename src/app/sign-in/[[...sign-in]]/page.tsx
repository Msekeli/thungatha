import { SignIn } from "@clerk/nextjs";
import { AuthConfigurationNotice } from "@/thungatha-features/authentication/ui/auth-configuration-notice";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";

export default function SignInPage() {
  return (
    <AuthPageShell>
      {hasClerkConfiguration() ? (
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      ) : (
        <AuthConfigurationNotice />
      )}
    </AuthPageShell>
  );
}
