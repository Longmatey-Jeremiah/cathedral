import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

export const hashPassword = (raw: string) => bcrypt.hash(raw, BCRYPT_ROUNDS);

export const verifyPassword = (raw: string, hash: string) =>
  bcrypt.compare(raw, hash);

export function generateTemporaryPassword(length = 16): string {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
