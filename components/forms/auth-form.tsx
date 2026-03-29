"use client";

import { useState } from "react";
import Link from "next/link";
import { BrainCircuit, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authSchema } from "@/lib/types";

const signupSchema = authSchema.extend({
  name: z.string().min(2)
});

export function AuthForm({
  mode
}: {
  mode: "login" | "signup";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const parsed = (mode === "signup" ? signupSchema : authSchema).safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Please check the form.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsed.data)
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    // Force a fresh document request so the protected app boots with the new cookie
    // instead of reusing an unauthenticated App Router cache entry.
    window.location.replace("/dashboard");
  }

  return (
    <Card className="w-full max-w-md rounded-[32px] p-2 shadow-soft">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to access your AI-powered finance mentor."
            : "Start with demo-friendly local auth and continue into the onboarding wizard."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={handleSubmit}
          className="space-y-4"
        >
          {mode === "signup" ? <Input name="name" label="Full name" placeholder="e.g. Aanya Sharma" required /> : null}
          <Input name="email" type="email" label="Email address" placeholder="you@example.com" required />
          <Input name="password" type="password" label="Password" placeholder="Enter your password" required />

          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Login" : "Create account"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <Link href={mode === "login" ? "/signup" : "/login"} className="font-medium text-primary">
            {mode === "login" ? "Create an account" : "Already have an account?"}
          </Link>
          <Link href="/demo" className="font-medium text-primary">
            Use demo accounts
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
