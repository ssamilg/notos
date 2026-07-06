"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { GlowButton } from "@/components/glow-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AuthResponse = {
  ok: boolean;
  error?: string;
  message?: string;
  redirect?: string;
};

export default function LoginPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<"login" | "signup" | "magic" | null>(null);
  const [mode, setMode] = useState<"password" | "magic">("magic");

  async function handleAuth(intent: "login" | "signup") {
    if (!formRef.current) {
      return;
    }

    const formData = new FormData(formRef.current);
    formData.set("intent", intent);
    setPending(intent);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/auth", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as AuthResponse;

    if (data.error) {
      setError(data.error);
      setPending(null);
      return;
    }

    if (data.message) {
      setMessage(data.message);
      setPending(null);
      return;
    }

    if (data.redirect) {
      window.location.href = data.redirect;
      return;
    }

    setPending(null);
  }

  async function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      return;
    }

    setPending("magic");
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (magicError) {
      setError(magicError.message);
      setPending(null);
      return;
    }

    setMessage("Check your email for the magic link.");
    setPending(null);
  }

  let formBody = (
    <form
      ref={formRef}
      aria-busy={pending !== null}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-required="true" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required={mode === "password"}
          aria-required={mode === "password"}
        />
      </div>

      <CardFooter className="mt-4 flex-col gap-3 border-0 bg-transparent p-0 sm:flex-row">
        <Button
          type="button"
          className="flex-1"
          disabled={pending !== null}
          aria-disabled={pending !== null}
          onClick={() => handleAuth("login")}
        >
          {pending === "login" ? "Logging in…" : "Log In"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={pending !== null}
          aria-disabled={pending !== null}
          onClick={() => handleAuth("signup")}
        >
          {pending === "signup" ? "Signing up…" : "Sign Up"}
        </Button>
      </CardFooter>
    </form>
  );

  if (mode === "magic") {
    formBody = (
      <form onSubmit={handleMagicLink} aria-busy={pending !== null} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="magic-email">Email</Label>
          <Input
            id="magic-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
          />
        </div>
        <GlowButton type="submit" disabled={pending !== null}>
          {pending === "magic" ? "Sending…" : "Send Magic Link"}
        </GlowButton>
      </form>
    );
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-background px-6"
    >
      <Card className="w-full max-w-sm">
        <CardContent className="pt-8">
          <div className="mb-6 text-center">
            <h1 className="text-heading glow-text-intense">NOTOS</h1>
            <p className="text-label mt-1 text-muted-foreground">
              Noise To Signal
            </p>
          </div>

          <div className="mb-4 flex gap-2">
            <Button
              type="button"
              variant={mode === "magic" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setMode("magic")}
            >
              Magic Link
            </Button>
            <Button
              type="button"
              variant={mode === "password" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setMode("password")}
            >
              Password
            </Button>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Authentication error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {message ? (
            <Alert className="mb-4">
              <AlertTitle>Notice</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          {formBody}

          <p className="text-caption mt-6 text-center">
            <Link href="/" className="hover:text-foreground">
              ← Back to landing
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
