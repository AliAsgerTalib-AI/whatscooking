/**
 * Safe localStorage wrapper for FlavorLab.
 * All keys are automatically prefixed with "flavorlab_".
 */

const PREFIX = "flavorlab_";

export function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return { ok: true, value: fallback };
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, value: fallback };
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export function storageAvailable() {
  try {
    const probe = "__flavorlab_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
