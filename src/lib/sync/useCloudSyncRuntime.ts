import { useEffect, useRef } from 'react';

import { useRuntimeAuth } from '@/lib/auth/runtime';
import { replaceAllItems } from '@/lib/library';
import {
  deleteCloudLibraryItem,
  isConvexConfigured,
  listCloudLibraryItems,
  toggleCloudArchived,
  toggleCloudFavorite,
  touchCloudLastUsed,
  upsertCloudLibraryItem,
} from '@/lib/sync/convexSync';
import { registerCloudSyncRuntime } from '@/lib/sync/runtime';
import { getSyncSettings, setSyncSettings } from '@/lib/sync/settings';

export function useCloudSyncRuntime(): void {
  const auth = useRuntimeAuth();
  const hydratedRef = useRef<string | null>(null);

  useEffect(() => {
    const settings = getSyncSettings();
    if (settings.enabled && auth.clerkEnabled && !auth.isSignedIn) {
      setSyncSettings({
        enabled: false,
        activeUserId: undefined,
      });
      registerCloudSyncRuntime(null);
    }
  }, [auth.clerkEnabled, auth.isSignedIn]);

  useEffect(() => {
    const settings = getSyncSettings();
    const shouldActivate = settings.enabled && auth.isSignedIn && isConvexConfigured();

    if (!shouldActivate) {
      registerCloudSyncRuntime(null);
      return;
    }

    registerCloudSyncRuntime({
      isActive: () => getSyncSettings().enabled,
      onUpsert: async (item) => upsertCloudLibraryItem(item, await auth.getToken()),
      onDelete: async (id) => deleteCloudLibraryItem(id, await auth.getToken()),
      onTouchLastUsed: async (id) => touchCloudLastUsed(id, await auth.getToken()),
      onToggleFavorite: async (id) => toggleCloudFavorite(id, await auth.getToken()),
      onToggleArchived: async (id) => toggleCloudArchived(id, await auth.getToken()),
    });
  }, [auth.isSignedIn, auth.getToken]);

  useEffect(() => {
    const settings = getSyncSettings();
    if (!settings.enabled || !auth.isSignedIn || !isConvexConfigured()) {
      return;
    }

    const hydratedKey = `${auth.userId ?? 'unknown'}:${settings.migratedAt ?? 0}`;
    if (hydratedRef.current === hydratedKey) {
      return;
    }

    hydratedRef.current = hydratedKey;
    void (async () => {
      try {
        const cloudItems = await listCloudLibraryItems(await auth.getToken());
        replaceAllItems(cloudItems);
        setSyncSettings({ lastError: undefined, activeUserId: auth.userId ?? undefined });
      } catch (syncError) {
        const message = syncError instanceof Error ? syncError.message : 'Failed to hydrate local cache from cloud.';
        setSyncSettings({ lastError: message });
      }
    })();
  }, [auth.isSignedIn, auth.userId, auth.getToken]);
}
