import { LibraryItem } from '@/lib/library';

export interface CloudSyncRuntime {
  isActive: () => boolean;
  onUpsert: (item: LibraryItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTouchLastUsed: (id: string) => Promise<void>;
  onToggleFavorite: (id: string) => Promise<void>;
  onToggleArchived: (id: string) => Promise<void>;
}

let runtime: CloudSyncRuntime | null = null;

export function registerCloudSyncRuntime(next: CloudSyncRuntime | null): void {
  runtime = next;
}

export function getCloudSyncRuntime(): CloudSyncRuntime | null {
  return runtime;
}
