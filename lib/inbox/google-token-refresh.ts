import { InboxConnectionStatus, InboxProvider } from "@prisma/client";

import { prisma } from "../prisma";
import { decryptToken, encryptToken } from "./token-encryption";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

type RefreshGoogleAccessTokenInput = {
  connectionId: string;
  clientId: string;
  clientSecret: string;
  fetchImpl?: typeof fetch;
};

type RefreshTokenResponse = {
  access_token?: string;
  refresh_token?: string;
};

export async function refreshGoogleAccessToken(
  input: RefreshGoogleAccessTokenInput,
): Promise<string> {
  const connectionId = input.connectionId.trim();
  const clientId = input.clientId.trim();
  const clientSecret = input.clientSecret.trim();
  const fetchImpl = input.fetchImpl ?? fetch;

  if (!connectionId || !clientId || !clientSecret) {
    throw new Error("Missing required Google token refresh input.");
  }

  const connection = await prisma.inboxConnection.findUnique({
    where: { id: connectionId },
    select: {
      id: true,
      provider: true,
      refreshTokenEncrypted: true,
    },
  });

  if (!connection || connection.provider !== InboxProvider.GMAIL) {
    throw new Error("Google inbox connection was not found.");
  }

  if (!connection.refreshTokenEncrypted) {
    throw new Error("Missing encrypted refresh token for this inbox connection.");
  }

  const refreshToken = decryptToken(connection.refreshTokenEncrypted);

  const response = await fetchImpl(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Google refresh token request failed.");
  }

  const payload = (await response.json()) as RefreshTokenResponse;
  const newAccessToken = payload.access_token?.trim() ?? "";
  const maybeNewRefreshToken = payload.refresh_token?.trim() ?? "";

  if (!newAccessToken) {
    throw new Error("Google refresh token response did not include access token.");
  }

  await prisma.inboxConnection.update({
    where: { id: connection.id },
    data: {
      accessTokenEncrypted: encryptToken(newAccessToken),
      refreshTokenEncrypted: maybeNewRefreshToken
        ? encryptToken(maybeNewRefreshToken)
        : connection.refreshTokenEncrypted,
      status: InboxConnectionStatus.ACTIVE,
    },
  });

  return newAccessToken;
}

type GetGoogleAccessTokenInput = {
  connectionId: string;
  clientId: string;
  clientSecret: string;
  forceRefresh?: boolean;
  fetchImpl?: typeof fetch;
};

export async function getGoogleAccessToken(
  input: GetGoogleAccessTokenInput,
): Promise<string> {
  const connectionId = input.connectionId.trim();
  const clientId = input.clientId.trim();
  const clientSecret = input.clientSecret.trim();
  const forceRefresh = input.forceRefresh ?? false;

  if (!connectionId || !clientId || !clientSecret) {
    throw new Error("Missing required Google access token input.");
  }

  const connection = await prisma.inboxConnection.findUnique({
    where: { id: connectionId },
    select: {
      id: true,
      provider: true,
      accessTokenEncrypted: true,
    },
  });

  if (!connection || connection.provider !== InboxProvider.GMAIL) {
    throw new Error("Google inbox connection was not found.");
  }

  if (!forceRefresh && connection.accessTokenEncrypted) {
    return decryptToken(connection.accessTokenEncrypted);
  }

  return refreshGoogleAccessToken({
    connectionId: connection.id,
    clientId,
    clientSecret,
    fetchImpl: input.fetchImpl,
  });
}
