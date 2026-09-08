import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// AES-256-GCM encryption for secrets stored at rest (Fortnox OAuth tokens, etc).
// Format: "enc:v1:<iv_base64>:<authTag_base64>:<ciphertext_base64>"
//
// decryptSecret() treats any string WITHOUT the "enc:v1:" prefix as legacy
// plaintext and returns it unchanged — this keeps old, not-yet-migrated rows
// working during and after the rollout, with no hard cutover required.
const PREFIX = 'enc:v1:';

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY saknas i miljövariablerna');
  const buf = Buffer.from(key, 'base64');
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY måste vara 32 bytes (base64-kodad)');
  return buf;
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`;
}

export function decryptSecret(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored; // legacy plaintext — pass through unchanged
  const [ivB64, authTagB64, ciphertextB64] = stored.slice(PREFIX.length).split(':');
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextB64, 'base64')), decipher.final()]);
  return plaintext.toString('utf8');
}
