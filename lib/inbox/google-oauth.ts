import { createHash, randomBytes } from "node:crypto";

export const GOOGLE_OAUTH_COOKIE_NAME = "leadbitz_google_oauth_state";
const GOOGLE_AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

export type GoogleOAuthStatePayload = {
  state: string;
  codeVerifier: string;
  workspaceId: string;
};

function toBase64Url(value: Buffer | string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function generateOAuthState(): string {
  return toBase64Url(randomBytes(24));
}

export function generateCodeVerifier(): string {
  return toBase64Url(randomBytes(48));
}

export function buildCodeChallenge(codeVerifier: string): string {
  return toBase64Url(createHash("sha256").update(codeVerifier).digest());
}

export function encodeOAuthStatePayload(payload: GoogleOAuthStatePayload): string {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeOAuthStatePayload(encodedPayload: string): GoogleOAuthStatePayload | null {
  try {
    const json = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<GoogleOAuthStatePayload>;

    if (!parsed.state || !parsed.codeVerifier || !parsed.workspaceId) {
      return null;
    }

    return {
      state: parsed.state,
      codeVerifier: parsed.codeVerifier,
      workspaceId: parsed.workspaceId,
    };
  } catch {
    return null;
  }
}

type BuildGoogleAuthUrlInput = {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
};

export function buildGoogleAuthorizationUrl(input: BuildGoogleAuthUrlInput): string {
  const url = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile https://www.googleapis.com/auth/gmail.send");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}
