import assert from "node:assert/strict";
import test from "node:test";

import { decryptToken, encryptToken } from "../../lib/inbox/token-encryption";

test("encryptToken/decryptToken performs roundtrip with versioned payload", () => {
  process.env.TOKEN_ENCRYPTION_KEY = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

  const encrypted = encryptToken("sample-google-token");
  assert.match(encrypted, /^v1:/);

  const decrypted = decryptToken(encrypted);
  assert.equal(decrypted, "sample-google-token");
});

test("decryptToken rejects malformed payload", () => {
  process.env.TOKEN_ENCRYPTION_KEY = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

  assert.throws(() => decryptToken("invalid-payload"), /Unsupported encrypted token format/i);
});
