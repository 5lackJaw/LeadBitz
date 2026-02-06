import assert from "node:assert/strict";
import test from "node:test";

import { InboxConnectionStatus, InboxProvider } from "@prisma/client";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { getGoogleAccessToken, refreshGoogleAccessToken } from "../../lib/inbox/google-token-refresh";
import { decryptToken, encryptToken } from "../../lib/inbox/token-encryption";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("google token refresh integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("refreshes Google access token on demand and updates encrypted values", async () => {
    const userEmail = `google-refresh-${Date.now()}@example.com`;

    try {
      const workspace = await ensureUserWorkspace({
        email: userEmail,
        name: "Google Refresh User",
      });

      const connection = await prisma.inboxConnection.create({
        data: {
          workspaceId: workspace.workspaceId,
          provider: InboxProvider.GMAIL,
          providerAccountId: `google-refresh-sub-${Date.now()}`,
          email: "refresh-user@example.com",
          status: InboxConnectionStatus.ACTIVE,
          accessTokenEncrypted: encryptToken("stale-access-token"),
          refreshTokenEncrypted: encryptToken("initial-refresh-token"),
        },
        select: {
          id: true,
        },
      });

      const mockRefreshFetch = (async (url: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
        const urlString = typeof url === "string" ? url : String(url);

        if (!urlString.includes("/token")) {
          throw new Error(`Unexpected refresh URL: ${urlString}`);
        }

        assert.equal(init?.method, "POST");
        return new Response(
          JSON.stringify({
            access_token: "new-access-token",
            refresh_token: "new-refresh-token",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }) as typeof fetch;

      const refreshedAccessToken = await refreshGoogleAccessToken({
        connectionId: connection.id,
        clientId: "google-client-id",
        clientSecret: "google-client-secret",
        fetchImpl: mockRefreshFetch,
      });

      assert.equal(refreshedAccessToken, "new-access-token");

      const refreshedConnection = await prisma.inboxConnection.findUnique({
        where: { id: connection.id },
      });

      assert.ok(refreshedConnection);
      if (!refreshedConnection) {
        throw new Error("Expected refreshed inbox connection.");
      }

      assert.equal(decryptToken(refreshedConnection.accessTokenEncrypted ?? ""), "new-access-token");
      assert.equal(decryptToken(refreshedConnection.refreshTokenEncrypted ?? ""), "new-refresh-token");

      const cachedAccessToken = await getGoogleAccessToken({
        connectionId: connection.id,
        clientId: "google-client-id",
        clientSecret: "google-client-secret",
      });

      assert.equal(cachedAccessToken, "new-access-token");

      const forcedRefreshFetch = (async (): Promise<Response> =>
        new Response(JSON.stringify({ access_token: "forced-refresh-access-token" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })) as typeof fetch;

      const forceRefreshedAccessToken = await getGoogleAccessToken({
        connectionId: connection.id,
        clientId: "google-client-id",
        clientSecret: "google-client-secret",
        forceRefresh: true,
        fetchImpl: forcedRefreshFetch,
      });

      assert.equal(forceRefreshedAccessToken, "forced-refresh-access-token");
    } finally {
      const user = await prisma.user.findUnique({
        where: {
          email: userEmail,
        },
        select: { id: true },
      });

      if (user) {
        await prisma.inboxConnection.deleteMany({
          where: {
            workspace: {
              is: {
                ownerId: user.id,
              },
            },
          },
        });
        await prisma.workspace.deleteMany({
          where: {
            ownerId: user.id,
          },
        });
        await prisma.user.delete({
          where: {
            id: user.id,
          },
        });
      }
    }
  });
}

test.after(async () => {
  await prisma.$disconnect();
});
