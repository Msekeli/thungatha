import { SignUp } from "@clerk/nextjs";
import { AuthConfigurationNotice } from "@/thungatha-features/authentication/ui/auth-configuration-notice";
import { AuthPageShell } from "@/thungatha-features/authentication/ui/auth-page-shell";
import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";

export default function SignUpPage() {
  return (
    <AuthPageShell>
      {hasClerkConfiguration() ? (
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          oauthFlow="popup"
        />
      ) : (
        <AuthConfigurationNotice />
      )}
    </AuthPageShell>
  );
}
