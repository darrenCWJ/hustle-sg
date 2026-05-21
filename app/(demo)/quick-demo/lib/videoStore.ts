// Module-level map persists for the lifetime of the browser tab.
// Key: `${appId}:${questionIdx}` → object URL from recorded blob.
const store = new Map<string, string>();

export function saveVideoBlob(appId: string, questionIdx: number, blob: Blob): string {
  const key = `${appId}:${questionIdx}`;
  const existing = store.get(key);
  if (existing) URL.revokeObjectURL(existing);
  const url = URL.createObjectURL(blob);
  store.set(key, url);
  return url;
}

export function getVideoUrl(appId: string, questionIdx: number): string | undefined {
  return store.get(`${appId}:${questionIdx}`);
}
