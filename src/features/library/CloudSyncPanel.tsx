import { useEffect, useMemo, useState } from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/components/ui/notifications';
import { useRuntimeAuth } from '@/lib/auth/runtime';
import { LibraryItem, listItems, replaceAllItems } from '@/lib/library';
import {
  isConvexConfigured,
  listCloudLibraryItems,
  migrateLocalItemsToCloud,
} from '@/lib/sync/convexSync';
import { getSyncSettings, setSyncSettings, subscribeSyncSettings } from '@/lib/sync/settings';

function normalizeByLatestUpdated(items: LibraryItem[]): LibraryItem[] {
  const byId = new Map<string, LibraryItem>();
  for (const item of items) {
    const existing = byId.get(item.id);
    if (!existing || item.updatedAt >= existing.updatedAt) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values());
}

export function CloudSyncPanel() {
  const auth = useRuntimeAuth();
  const { success, error } = useNotifications();
  const [settings, setSettings] = useState(() => getSyncSettings());
  const [isMigrating, setIsMigrating] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');

  useEffect(() => subscribeSyncSettings(() => setSettings(getSyncSettings())), []);

  const canEnable = useMemo(
    () => auth.clerkEnabled && auth.isSignedIn && isConvexConfigured(),
    [auth.clerkEnabled, auth.isSignedIn]
  );

  const migrateAndHydrate = async () => {
    if (!auth.isSignedIn) {
      error('Sign in required', 'You must sign in before enabling cloud sync.');
      return;
    }
    if (!isConvexConfigured()) {
      error('Convex not configured', 'Set VITE_CONVEX_URL in .env.local.');
      return;
    }

    setIsMigrating(true);
    try {
      const localItems = listItems({ includeArchived: true });
      const token = await auth.getToken();

      const migration = await migrateLocalItemsToCloud(localItems, token, (completed, total) => {
        setProgressLabel(`Migrating ${completed}/${total} items...`);
      });

      const cloudItems = await listCloudLibraryItems(token);
      const merged = normalizeByLatestUpdated([...localItems, ...cloudItems]);
      replaceAllItems(merged);

      setSyncSettings({
        enabled: true,
        activeUserId: auth.userId ?? undefined,
        migratedAt: Date.now(),
        lastError: undefined,
      });
      success(
        'Cloud Sync enabled',
        `Migration complete. Succeeded: ${migration.completed}/${migration.total}, failed: ${migration.failed}.`
      );
    } catch (migrationError) {
      const message = migrationError instanceof Error ? migrationError.message : 'Unable to migrate local data.';
      setSyncSettings({ enabled: false, lastError: message });
      error('Migration failed', message);
    } finally {
      setIsMigrating(false);
      setProgressLabel('');
    }
  };

  const disableSync = () => {
    setSyncSettings({
      enabled: false,
      activeUserId: undefined,
    });
    success('Cloud Sync disabled', 'The app is back in local-first mode.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cloud Sync</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Optional Convex sync with Clerk auth. Local mode remains the default fallback.
        </p>
        {!auth.clerkEnabled ? (
          <p className="text-sm text-amber-300">
            Clerk is not configured. Add `VITE_CLERK_PUBLISHABLE_KEY` to enable sign-in.
          </p>
        ) : null}
        {!isConvexConfigured() ? (
          <p className="text-sm text-amber-300">Convex is not configured. Add `VITE_CONVEX_URL` to enable sync.</p>
        ) : null}
        {settings.lastError ? <p className="text-sm text-rose-300">Last sync error: {settings.lastError}</p> : null}
        {progressLabel ? <p className="text-sm text-cyan-300">{progressLabel}</p> : null}

        <div className="flex flex-wrap items-center gap-2">
          {auth.clerkEnabled ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button type="button" variant="outline">
                    Sign in
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </>
          ) : null}

          {settings.enabled ? (
            <Button type="button" variant="outline" onClick={disableSync}>
              Disable Cloud Sync
            </Button>
          ) : (
            <Button type="button" onClick={migrateAndHydrate} disabled={!canEnable || isMigrating}>
              {isMigrating ? 'Migrating...' : 'Enable Cloud Sync'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
