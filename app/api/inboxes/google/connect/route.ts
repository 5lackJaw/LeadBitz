import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";
import {
  GOOGLE_OAUTH_COOKIE_NAME,
  buildCodeChallenge,
  buildGoogleAuthorizationUrl,
  encodeOAuthStatePayload,
  generateCodeVerifier,
  generateOAuthState,
} from "@/lib/inbox/google-oauth";

function resolveAppOrigin(request: Request): string {
  const configuredOrigin = process.env.NEXTAUTH_URL?.trim();
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.redirect(new URL("/app/settings/inboxes?error=missing_google_config", request.url));
  }

  let workspaceId = "";
  try {
    const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);
    workspaceId = workspace.workspaceId;
  } catch {
    return NextResponse.redirect(new URL("/app/settings/inboxes?error=workspace_missing", request.url));
  }
  const appOrigin = resolveAppOrigin(request);
  const redirectUri = `${appOrigin}/api/inboxes/google/callback`;
  const state = generateOAuthState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = buildCodeChallenge(codeVerifier);

  const authorizationUrl = buildGoogleAuthorizationUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge,
  });

  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set({
    name: GOOGLE_OAUTH_COOKIE_NAME,
    value: encodeOAuthStatePayload({
      state,
      codeVerifier,
      workspaceId,
    }),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
