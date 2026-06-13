// app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";

import { AuthForm } from "@/components/chat/auth-form";
import { OAuthButtons, OAuthDivider } from "@/components/chat/oauth-buttons";
import { ScientiaLogo } from "@/components/chat/scientia-logo";
import { SubmitButton } from "@/components/chat/submit-button";
import { toast } from "@/components/chat/toast";
import { type LoginActionState, login } from "../actions";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  useEffect(() => {
    if (state.status === "failed") {
      toast({ type: "error", description: "Invalid credentials!" });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Failed validating your submission!",
      });
    } else if (state.status === "success") {
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <>
      <div className="flex justify-center mb-8">
        <ScientiaLogo className="text-foreground" size={40} />
      </div>
      <h1 className="text-[22px] font-medium tracking-tight text-center">
        Welcome back
      </h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground text-center leading-relaxed">
        Sign in to your account to continue
      </p>

      <OAuthButtons />

      <OAuthDivider />

      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
        <p className="text-center text-[13px] text-muted-foreground mt-4">
          {"No account? "}
          <Link
            className="text-foreground font-medium underline-offset-4 hover:underline"
            href="/register"
          >
            Sign up
          </Link>
          {" · "}
          <Link
            className="text-foreground/70 underline-offset-4 hover:underline hover:text-foreground transition-colors"
            href="/api/auth/signin/guest"
          >
            continue as guest
          </Link>
        </p>
      </AuthForm>
    </>
  );
}
