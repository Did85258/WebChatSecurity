export async function encryptAES(message: string, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder().encode(message);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
  return JSON.stringify({ iv: Array.from(iv), content: Array.from(new Uint8Array(encrypted)) });
}