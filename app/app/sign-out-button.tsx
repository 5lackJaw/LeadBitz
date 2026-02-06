"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ padding: "0.5rem 0.8rem" }}>
      Sign out
    </button>
  );
}
