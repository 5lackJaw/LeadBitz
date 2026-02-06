"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/app",
    });

    if (!result || result.error) {
      setError("Invalid credentials.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = result.url ?? "/app";
  }

  return (
    <main style={{ maxWidth: 420, margin: "4rem auto", padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Sign in</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{ width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
          />
        </label>
        <button type="submit" disabled={isSubmitting} style={{ padding: "0.6rem 0.8rem" }}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {error ? (
        <p style={{ color: "#b42318", marginTop: "0.75rem" }} role="alert">
          {error}
        </p>
      ) : null}
    </main>
  );
}
