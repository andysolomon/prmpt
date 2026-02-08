import { PromptSpec, parsePromptSpec } from './schema';

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function encodePromptSpecParam(spec: PromptSpec): string {
  const json = JSON.stringify(spec);
  return bytesToBase64Url(new TextEncoder().encode(json));
}

export function decodePromptSpecParam(value: string): { ok: true; spec: PromptSpec } | { ok: false; error: string } {
  try {
    const bytes = base64UrlToBytes(value);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as unknown;
    const result = parsePromptSpec(parsed);

    if (result.ok) {
      return { ok: true, spec: result.value };
    }

    return { ok: false, error: result.error };
  } catch {
    return { ok: false, error: 'Invalid URL payload.' };
  }
}

export function createShareUrl(spec: PromptSpec): string {
  const url = new URL(window.location.href);
  url.searchParams.set('pb', encodePromptSpecParam(spec));
  return url.toString();
}

export function parsePromptSpecFromUrl(search = window.location.search):
  | { ok: true; spec: PromptSpec }
  | { ok: false; error: string } {
  const params = new URLSearchParams(search);
  const encoded = params.get('pb');

  if (!encoded) {
    return { ok: false, error: 'No prompt payload found in URL.' };
  }

  return decodePromptSpecParam(encoded);
}
