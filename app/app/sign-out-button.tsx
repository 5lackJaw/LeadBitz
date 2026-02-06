"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button className="lb-button lb-button-secondary" onClick={() => signOut({ callbackUrl: "/login" })}>
      Sign out
    </button>
  );
}
