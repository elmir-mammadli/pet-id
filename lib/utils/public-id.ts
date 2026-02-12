import { randomBytes } from "crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const LENGTH = 10;

/**
 * Генерирует случайный public_id длиной 8–12 символов (сейчас 10).
 * URL-safe, только строчные буквы и цифры.
 */
export function generatePublicId(): string {
  const bytes = randomBytes(LENGTH);
  let result = "";
  for (let i = 0; i < LENGTH; i++) {
    result += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return result;
}

const ACTIVATION_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const ACTIVATION_LENGTH = 9;

/**
 * Генерирует activation_token для NFC-тега (уникальный, короткий, URL-safe).
 * Пример: 7Hf92KxQ
 */
export function generateActivationToken(): string {
  const bytes = randomBytes(ACTIVATION_LENGTH);
  let result = "";
  for (let i = 0; i < ACTIVATION_LENGTH; i++) {
    result += ACTIVATION_ALPHABET[bytes[i]! % ACTIVATION_ALPHABET.length];
  }
  return result;
}
