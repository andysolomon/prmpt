const SYNC_SETTINGS_KEY = 'prmpt.sync.v1.settings';

export interface SyncSettings {
  enabled: boolean;
  provider: 'convex';
  migratedAt?: number;
  lastError?: string;
  activeUserId?: string;
}

type Listener = () => void;
const listeners = new Set<Listener>();

const defaultSettings: SyncSettings = {
  enabled: false,
  provider: 'convex',
};

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getSyncSettings(): SyncSettings {
  if (!hasStorage()) {
    return defaultSettings;
  }

  const raw = window.localStorage.getItem(SYNC_SETTINGS_KEY);
  if (!raw) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SyncSettings>;
    return {
      ...defaultSettings,
      ...parsed,
      provider: 'convex',
    };
  } catch {
    return defaultSettings;
  }
}

export function setSyncSettings(next: Partial<SyncSettings>): SyncSettings {
  const merged: SyncSettings = {
    ...getSyncSettings(),
    ...next,
    provider: 'convex',
  };

  if (hasStorage()) {
    window.localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(merged));
  }
  listeners.forEach((listener) => listener());
  return merged;
}

export function subscribeSyncSettings(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearSyncError(): void {
  const current = getSyncSettings();
  if (!current.lastError) {
    return;
  }
  setSyncSettings({ lastError: undefined });
}
