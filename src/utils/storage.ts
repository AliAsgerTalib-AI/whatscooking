const PREFIX = "flavorlab_";

export function storageGet<T>(key: string, fallback: T): { ok: boolean; value: T } {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return { ok: true, value: fallback };
    return { ok: true, value: JSON.parse(raw) as T };
  } catch {
    return { ok: false, value: fallback };
  }
}

export function storageSet(key: string, value: unknown): { ok: boolean; error?: unknown } {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export function storageRemove(key: string): { ok: boolean; error?: unknown } {
  try {
    localStorage.removeItem(PREFIX + key);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export function storageAvailable(): boolean {
  try {
    const probe = "__flavorlab_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
