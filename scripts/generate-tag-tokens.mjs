#!/usr/bin/env node
/**
 * Generate activation tokens for NFC tags (manufacturing).
 * Requires: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL in env.
 * Usage: node scripts/generate-tag-tokens.mjs [count]
 * Default count: 1. Outputs one URL per line to write to each tag.
 */

import { createClient } from "@supabase/supabase-js";

const ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const LENGTH = 9;

function generateToken() {
  const bytes = new Uint8Array(LENGTH);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < LENGTH; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let result = "";
  for (let i = 0; i < LENGTH; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return result;
}

const count = Math.max(1, parseInt(process.argv[2], 10) || 1);
const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_URL ||
  "https://yourdomain.com";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);
const tokens = [];
const maxAttempts = count * 5;

for (let i = 0; i < count; i++) {
  let token = generateToken();
  let attempts = 0;
  while (tokens.includes(token) && attempts < maxAttempts) {
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
