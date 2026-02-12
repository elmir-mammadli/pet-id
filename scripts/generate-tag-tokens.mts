#!/usr/bin/env node
/**
 * Generate activation tokens for NFC tags (manufacturing).
 * Requires: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL in env.
 * Usage: npm run generate:tags -- 10
 * Default count: 1. Outputs one URL per line to write to each tag.
 */

// Загружаем переменные из .env, чтобы process.env.*
// были доступны при запуске через tsx.
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const DETAILS: { alphabet: string; length: number} = {
  alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789",
  length: 9,
};

function generateToken() {
  const bytes = new Uint8Array(DETAILS.length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < DETAILS.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let result: string = "";
  for (let i = 0; i < DETAILS.length; i++) {
    result += DETAILS.alphabet[bytes[i] % DETAILS.alphabet.length];
  }
  return result;
}

const count = Math.max(1, parseInt(process.argv[2], 10) || 1);
const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_URL ||
  "https://pet-id-liart.vercel.app";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
  );
}

const supabase = createClient(url, key);
const tokens: string[] = [];
const maxAttempts = count * 5;

for (let i = 0; i < count; i++) {
  let token: string = generateToken();
  let attempts = 0;
  while (tokens.includes(token) && attempts < maxAttempts!) {
    token = generateToken();
    attempts++;
  }
  tokens.push(token);
}

const { error } = await supabase.from("tags").insert(
  tokens.map((activation_token) => ({
    activation_token,
    status: "unclaimed",
  }))
);

if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}

tokens.forEach((t) => {
  console.log(`${baseUrl.replace(/\/$/, "")}/activate/${t}`);
});
