import assert from "node:assert/strict";
import test from "node:test";

import { InboxProvider, InboxConnectionStatus } from "@prisma/client";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { completeGoogleConnection } from "../../lib/inbox/complete-google-connection";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("google connect flow integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("connects a Google inbox and blocks cross-workspace provider reuse", async () => {
    const ownerEmail = `google-owner-${Date.now()}@example.com`;
    const secondEmail = `google-second-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Google Owner",
      });

      const secondWorkspace = await ensureUserWorkspace({
        email: secondEmail,
        name: "Google Second",
      });

      let mockFetchCallCount = 0;
      const mockFetch = (async (url: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
        mockFetchCallCount += 1;
        const urlString = typeof url === "string" ? url : String(url);

        if (urlString.includes("/token")) {
          assert.equal(init?.method, "POST");
          return new Response(JSON.stringify({ access_token: "google-access-token" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        if (urlString.includes("/userinfo")) {
          return new Response(
            JSON.stringify({
              sub: "google-sub-123",
              email: "Google.Operator@example.com",
            }),
            {
              status: 200,
              headers: { "content-type": "application/json" },
            },
          );
        }

        throw new Error(`Unexpected fetch URL: ${urlString}`);
      }) as typeof fetch;

      await completeGoogleConnection({
        workspaceId: ownerWorkspace.workspaceId,
        code: "oauth-code",
        codeVerifier: "oauth-verifier",
        clientId: "google-client-id",
        clientSecret: "google-client-secret",
        redirectUri: "http://localhost:3000/api/inboxes/google/callback",
        fetchImpl: mockFetch,
      });

      const createdConnection = await prisma.inboxConnection.findFirst({
        where: { workspaceId: ownerWorkspace.workspaceId, provider: InboxProvider.GMAIL },
      });

      assert.ok(createdConnection);
      if (!createdConnection) {
        throw new Error("Expected Google inbox connection to be created.");
      }
      assert.equal(createdConnection.email, "google.operator@example.com");
      assert.equal(createdConnection.providerAccountId, "google-sub-123");
      assert.equal(createdConnection.status, InboxConnectionStatus.ACTIVE);
      assert.equal(mockFetchCallCount, 2);

      await assert.rejects(
        () =>
          completeGoogleConnection({
            workspaceId: secondWorkspace.workspaceId,
            code: "oauth-code",
            codeVerifier: "oauth-verifier",
            clientId: "google-client-id",
            clientSecret: "google-client-secret",
            redirectUri: "http://localhost:3000/api/inboxes/google/callback",
            fetchImpl: mockFetch,
          }),
        /already connected to another workspace/i,
      );
    } finally {
      const users = await prisma.user.findMany({
        where: {
          email: {
            in: [ownerEmail, secondEmail],
          },
        },
        select: { id: true },
      });

      const userIds = users.map((user) => user.id);

      if (userIds.length > 0) {
        await prisma.inboxConnection.deleteMany({
          where: {
            workspace: {
              is: {
                ownerId: {
                  in: userIds,
                },
              },
            },
          },
        });

        await prisma.workspace.deleteMany({
          where: {
            ownerId: {
              in: userIds,
            },
          },
        });

        await prisma.user.deleteMany({
          where: {
            id: {
              in: userIds,
            },
          },
        });
      }
    }
  });
}

test.after(async () => {
  await prisma.$disconnect();
});
