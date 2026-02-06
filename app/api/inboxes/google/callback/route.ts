import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { requireWorkspaceAccess } from "@/lib/auth/require-workspace-access";
import { completeGoogleConnection } from "@/lib/inbox/complete-google-connection";
import {
  GOOGLE_OAUTH_COOKIE_NAME,
  decodeOAuthStatePayload,
} from "@/lib/inbox/google-oauth";

function resolveAppOrigin(request: Request): string {
  const configuredOrigin = process.env.NEXTAUTH_URL?.trim();
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
}

function buildInboxesRedirect(request: Request, query: string): URL {
  return new URL(`/app/settings/inboxes${query}`, request.url);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(buildInboxesRedirect(request, "?error=missing_google_config"));
  }

  const requestUrl = new URL(request.url);
  const state = requestUrl.searchParams.get("state")?.trim() ?? "";
  const code = requestUrl.searchParams.get("code")?.trim() ?? "";
  const stateCookieValue = request.cookies.get(GOOGLE_OAUTH_COOKIE_NAME)?.value ?? "";
  const decodedState = decodeOAuthStatePayload(stateCookieValue);

  if (!state || !code || !decodedState || decodedState.state !== state) {
    const response = NextResponse.redirect(buildInboxesRedirect(request, "?error=oauth_state"));
    response.cookies.delete(GOOGLE_OAUTH_COOKIE_NAME);
    return response;
  }

  try {
    await requireWorkspaceAccess({
      workspaceId: decodedState.workspaceId,
      userEmail: session.user.email,
    });
  } catch {
    const response = NextResponse.redirect(buildInboxesRedirect(request, "?error=workspace_forbidden"));
    response.cookies.delete(GOOGLE_OAUTH_COOKIE_NAME);
    return response;
  }

  const appOrigin = resolveAppOrigin(request);
  const redirectUri = `${appOrigin}/api/inboxes/google/callback`;

  try {
    await completeGoogleConnection({
      workspaceId: decodedState.workspaceId,
      code,
      codeVerifier: decodedState.codeVerifier,
      clientId,
      clientSecret,
      redirectUri,
    });
  } catch {
    const response = NextResponse.redirect(buildInboxesRedirect(request, "?error=oauth_connect_failed"));
    response.cookies.delete(GOOGLE_OAUTH_COOKIE_NAME);
    return response;
  }

  const response = NextResponse.redirect(buildInboxesRedirect(request, "?connected=gmail"));
  response.cookies.delete(GOOGLE_OAUTH_COOKIE_NAME);
  return response;
}
