'use client';
import { useEffect } from 'react';

const LAST_RELOAD_KEY = 'chunk-error-reload-ts';
const MIN_INTERVAL_MS = 10_000;

// A tab left open across a new deploy can end up asking for a JS chunk that
// the previous build produced but the new one no longer serves — Next.js
// surfaces that as a ChunkLoadError / "Failed to fetch dynamically imported
// module" and the page is stuck until someone manually reloads. Since a
// reload always fixes it (it fetches the current build fresh), do that
// automatically instead of leaving the user on a dead page. Throttled so a
// genuinely broken deploy can't reload-loop forever.
function isChunkLoadError(message: string): boolean {
  return /loading chunk [\d]+ failed|failed to fetch dynamically imported module|error loading dynamically imported module|chunkloaderror/i.test(message);
}

function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(LAST_RELOAD_KEY) || 0);
    if (Date.now() - last < MIN_INTERVAL_MS) return;
    sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private browsing etc.) — reload anyway, just without throttling.
  }
  window.location.reload();
}

export function ChunkErrorReload() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.message || '')) reloadOnce();
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = (reason && typeof reason === 'object' && 'message' in reason ? String(reason.message) : String(reason ?? ''));
      if (isChunkLoadError(message)) reloadOnce();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
