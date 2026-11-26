type CacheEntry<T> = { value: T; updatedAt: number };

const entries = new Map<string, CacheEntry<unknown>>();

function makeKey(userId: string, key: string) {
  return `workspace:${userId}:${key}`;
}

export function readWorkspaceCache<T>(userId: string | null | undefined, key: string, maxAgeMs: number) {
  if (!userId) return null;
  const entry = entries.get(makeKey(userId, key)) as CacheEntry<T> | undefined;
  if (!entry) return null;
  return { value: entry.value, fresh: Date.now() - entry.updatedAt <= maxAgeMs };
}

export function writeWorkspaceCache<T>(userId: string | null | undefined, key: string, value: T) {
  if (!userId) return;
  entries.set(makeKey(userId, key), { value, updatedAt: Date.now() });
}

export function clearWorkspaceCache(userId: string | null | undefined, key?: string) {
  if (!userId) return;
  if (key) {
    entries.delete(makeKey(userId, key));
    return;
  }
  const prefix = `workspace:${userId}:`;
  for (const cacheKey of entries.keys()) {
    if (cacheKey.startsWith(prefix)) entries.delete(cacheKey);
  }
}
