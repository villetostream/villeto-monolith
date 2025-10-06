import * as bcrypt from 'bcrypt';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const iv = randomBytes(16);
const algorithm = 'aes-256-ctr';
const secretKey =
  process.env.ENCRYPTION_KEY || '32_characters_long_passphrase!';

const generateKey = async (secret: string): Promise<Buffer> => {
  return promisify(scrypt)(secret, 'salt', 32) as Promise<Buffer>;
};

export const encrypt = async (plainText: string): Promise<string> => {
  const key = await generateKey(secretKey);
  const cipher = createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = async (cipherText: string): Promise<string> => {
  const [ivHex, encryptedText] = cipherText.split(':');
  const ivBuffer = Buffer.from(ivHex, 'hex');
  const key = await generateKey(secretKey);
  const decipher = createDecipheriv(algorithm, key, ivBuffer);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString();
};

export const hash = async (plainTextPassword: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(plainTextPassword, salt);
};

export const isMatch = async (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainTextPassword, hashedPassword);
};

export const generateRandomToken = (length: number) =>
  randomBytes(length / 2).toString('hex');
