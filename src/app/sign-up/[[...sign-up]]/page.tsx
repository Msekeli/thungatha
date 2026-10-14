import { SignUp } from "@clerk/nextjs";
import { AuthConfigurationNotice } from "@/components/auth/auth-configuration-notice";
import { hasClerkConfiguration } from "@/lib/auth/identity";

export default function SignUpPage() {
  if (!hasClerkConfiguration()) return <AuthConfigurationNotice />;

  return (
    <main className="flex flex-1 items-center justify-center bg-[var(--background)] px-4 py-12">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        oauthFlow="popup"
      />
    </main>
  );
}
