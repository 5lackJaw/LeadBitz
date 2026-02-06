import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ENCRYPTION_VERSION = "v1";
const IV_BYTE_LENGTH = 12;
const AUTH_TAG_BYTE_LENGTH = 16;
const KEY_BYTE_LENGTH = 32;

function resolveEncryptionKey(): Buffer {
  const rawKey = process.env.TOKEN_ENCRYPTION_KEY?.trim() ?? "";

  if (!rawKey) {
    throw new Error("TOKEN_ENCRYPTION_KEY is required.");
  }

  const decodedBase64Key = Buffer.from(rawKey, "base64");
  if (decodedBase64Key.length === KEY_BYTE_LENGTH) {
    return decodedBase64Key;
  }

  const utf8Key = Buffer.from(rawKey, "utf8");
  if (utf8Key.length === KEY_BYTE_LENGTH) {
    return utf8Key;
  }

  throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes (raw or base64 encoded).");
}

export function encryptToken(plaintextToken: string): string {
  const token = plaintextToken.trim();

  if (!token) {
    throw new Error("Cannot encrypt an empty token.");
  }

  const key = resolveEncryptionKey();
  const iv = randomBytes(IV_BYTE_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTION_VERSION}:${iv.toString("base64url")}:${authTag.toString("base64url")}:${ciphertext.toString("base64url")}`;
}

export function decryptToken(encryptedToken: string): string {
  const payload = encryptedToken.trim();

  if (!payload) {
    throw new Error("Cannot decrypt an empty token payload.");
  }

  const [version, ivPart, authTagPart, ciphertextPart] = payload.split(":");

  if (!version || !ivPart || !authTagPart || !ciphertextPart || version !== ENCRYPTION_VERSION) {
    throw new Error("Unsupported encrypted token format.");
  }

  const iv = Buffer.from(ivPart, "base64url");
  const authTag = Buffer.from(authTagPart, "base64url");
  const ciphertext = Buffer.from(ciphertextPart, "base64url");

  if (iv.length !== IV_BYTE_LENGTH || authTag.length !== AUTH_TAG_BYTE_LENGTH || ciphertext.length === 0) {
    throw new Error("Invalid encrypted token payload.");
  }

  const key = resolveEncryptionKey();
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");

  if (!plaintext) {
    throw new Error("Decryption produced an empty token.");
  }

  return plaintext;
}
