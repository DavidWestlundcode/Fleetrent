const STORAGE_KEY = 'fleetos_dismissed_notifications';

function readDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeDismissed(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

export function getDismissed(): Set<string> {
  return readDismissed();
}

export function dismissNotification(id: string) {
  const ids = readDismissed();
  ids.add(id);
  writeDismissed(ids);
}

// Prunes dismissed ids that no longer correspond to a currently computed
// notification, so the stored list doesn't grow forever.
export function pruneDismissed(currentIds: Set<string>) {
  const ids = readDismissed();
  let changed = false;
  for (const id of ids) {
    if (!currentIds.has(id)) { ids.delete(id); changed = true; }
  }
  if (changed) writeDismissed(ids);
}
