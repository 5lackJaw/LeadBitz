import { InboxConnectionStatus, InboxProvider } from "@prisma/client";

import { prisma } from "../prisma";
import { encryptToken } from "./token-encryption";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

type CompleteGoogleConnectionInput = {
  workspaceId: string;
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  fetchImpl?: typeof fetch;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
};

type UserInfoResponse = {
  sub?: string;
  email?: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function completeGoogleConnection(input: CompleteGoogleConnectionInput): Promise<void> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const workspaceId = input.workspaceId.trim();
  const code = input.code.trim();
  const codeVerifier = input.codeVerifier.trim();
  const clientId = input.clientId.trim();
  const clientSecret = input.clientSecret.trim();
  const redirectUri = input.redirectUri.trim();

  if (!workspaceId || !code || !codeVerifier || !clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing required Google OAuth callback input.");
  }

  const tokenResponse = await fetchImpl(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Google token exchange failed.");
  }

  const tokenPayload = (await tokenResponse.json()) as TokenResponse;
  const accessToken = tokenPayload.access_token?.trim() ?? "";
  const refreshToken = tokenPayload.refresh_token?.trim() ?? "";

  if (!accessToken) {
    throw new Error("Google token exchange did not return an access token.");
  }

  const encryptedAccessToken = encryptToken(accessToken);
  const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;

  const userInfoResponse = await fetchImpl(GOOGLE_USERINFO_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new Error("Google userinfo request failed.");
  }

  const userInfoPayload = (await userInfoResponse.json()) as UserInfoResponse;
  const email = userInfoPayload.email?.trim() ?? "";
  const providerAccountId = userInfoPayload.sub?.trim() || email;

  if (!email || !providerAccountId) {
    throw new Error("Google userinfo response did not include required identity fields.");
  }

  const normalizedEmail = normalizeEmail(email);

  const existingByProvider = await prisma.inboxConnection.findUnique({
    where: {
      provider_providerAccountId: {
        provider: InboxProvider.GMAIL,
        providerAccountId,
      },
    },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (existingByProvider && existingByProvider.workspaceId !== workspaceId) {
    throw new Error("This Google inbox is already connected to another workspace.");
  }

  if (existingByProvider && existingByProvider.workspaceId === workspaceId) {
    await prisma.inboxConnection.update({
      where: { id: existingByProvider.id },
      data: {
        email: normalizedEmail,
        accessTokenEncrypted: encryptedAccessToken,
        ...(encryptedRefreshToken ? { refreshTokenEncrypted: encryptedRefreshToken } : {}),
        status: InboxConnectionStatus.ACTIVE,
      },
    });
    return;
  }

  await prisma.inboxConnection.upsert({
    where: {
      workspaceId_email: {
        workspaceId,
        email: normalizedEmail,
      },
    },
    update: {
      provider: InboxProvider.GMAIL,
      providerAccountId,
      accessTokenEncrypted: encryptedAccessToken,
      ...(encryptedRefreshToken ? { refreshTokenEncrypted: encryptedRefreshToken } : {}),
      status: InboxConnectionStatus.ACTIVE,
    },
    create: {
      workspaceId,
      provider: InboxProvider.GMAIL,
      providerAccountId,
      email: normalizedEmail,
      accessTokenEncrypted: encryptedAccessToken,
      refreshTokenEncrypted: encryptedRefreshToken,
      status: InboxConnectionStatus.ACTIVE,
    },
  });
}
