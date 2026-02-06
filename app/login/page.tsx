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
    <main className="lb-login-frame">
      <section className="lb-container lb-container-narrow">
        <div className="lb-panel">
          <div style={{ display: "grid", gap: "8px", marginBottom: "20px" }}>
            <h1 className="lb-title">Sign in</h1>
            <p className="lb-subtitle">
              Use your workspace credentials. Google OAuth remains planned as the primary option in
              the Neon Auth migration.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="lb-form-grid" noValidate>
            <label className="lb-field">
              <span className="lb-label">Email</span>
              <input
                className="lb-input"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="lb-field">
              <span className="lb-label">Password</span>
              <input
                className="lb-input"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            <button className="lb-button lb-button-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
          {error ? (
            <p style={{ marginTop: "12px" }} className="lb-alert lb-alert-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="lb-panel">
          <p className="lb-subtitle">
            Access is currently limited to configured demo credentials in environment variables.
          </p>
        </div>
      </section>
    </main>
  );
}
