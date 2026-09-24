/**
 * Sicurezza lato server: hashing password (PBKDF2), TOTP per il 2FA (RFC 6238)
 * e firma JWT — usando Web Crypto API (compatibile con Cloudflare Workers)
 */

// ---------- Password hashing (PBKDF2) ----------

async function hashPasswordAsync(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const derived = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(derived).map(b => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2$${saltHex}$${hashHex}`;
}

export function hashPassword(password) {
  // Wrapper sync per compatibilità (usa async internamente ma ritorna promise)
  return hashPasswordAsync(password);
}

export async function verifyPassword(password, stored) {
  try {
    const [algo, saltHex, hashHex] = stored.split("$");
    if (algo !== "pbkdf2") return false;
    
    const encoder = new TextEncoder();
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const expected = new Uint8Array(hashHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );
    const derived = new Uint8Array(derivedBits);
    
    if (derived.length !== expected.length) return false;
    for (let i = 0; i < derived.length; i++) {
      if (derived[i] !== expected[i]) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ---------- TOTP 2FA (RFC 6238 / RFC 4226) ----------

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer) {
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");
  let output = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    output += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return output;
}

function base32Decode(str) {
  const clean = str.replace(/=+$/, "").toUpperCase();
  let bits = "";
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

export function generateTotpSecret() {
  return base32Encode(crypto.getRandomValues(new Uint8Array(20)));
}

async function hotp(secretB32, counter, digits = 6) {
  const key = base32Decode(secretB32);
  const msg = new ArrayBuffer(8);
  const view = new DataView(msg);
  view.setBigUint64(0, BigInt(counter));
  
  const keyImported = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", keyImported, msg);
  const digest = new Uint8Array(signature);
  
  const offset = digest[digest.length - 1] & 0x0f;
  const truncated =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(truncated % (10 ** digits)).padStart(digits, "0");
}

export function totpNow(secretB32, step = 30, digits = 6) {
  const counter = Math.floor(Date.now() / 1000 / step);
  return hotp(secretB32, counter, digits);
}

export async function verifyTotp(secretB32, code, step = 30, digits = 6, window = 1) {
  const counter = Math.floor(Date.now() / 1000 / step);
  const clean = String(code).trim();
  for (let delta = -window; delta <= window; delta++) {
    if (await hotp(secretB32, counter + delta, digits) === clean) return true;
  }
  return false;
}

export function totpUri(secretB32, email, issuer = "WidowBlue") {
  return `otpauth://totp/${issuer}:${email}?secret=${secretB32}&issuer=${issuer}&digits=6&period=30`;
}

// ---------- JWT (HS256), usando Web Crypto API ----------

function base64url(input) {
  const buffer = typeof input === "string" ? new TextEncoder().encode(input) : input;
  return btoa(String.fromCharCode(...buffer)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBuffer(input) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function signJwt(payload, secret, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresInSeconds };
  const headerPart = base64url(JSON.stringify(header));
  const payloadPart = base64url(JSON.stringify(fullPayload));
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${headerPart}.${payloadPart}`)
  );
  const signaturePart = base64url(signature);
  
  return `${headerPart}.${payloadPart}.${signaturePart}`;
}

export async function verifyJwt(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Token malformato");
  const [headerPart, payloadPart, signaturePart] = parts;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signature = base64urlToBuffer(signaturePart);
  const expectedSig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${headerPart}.${payloadPart}`)
  );
  
  const expectedSigBytes = new Uint8Array(expectedSig);
  if (signature.length !== expectedSigBytes.length) throw new Error("Firma non valida");
  for (let i = 0; i < signature.length; i++) {
    if (signature[i] !== expectedSigBytes[i]) throw new Error("Firma non valida");
  }
  
  const payload = JSON.parse(new TextDecoder().decode(base64urlToBuffer(payloadPart)));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error("Token scaduto");
  }
  return payload;
}
