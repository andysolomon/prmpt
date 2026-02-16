import { ConvexHttpClient } from 'convex/browser';

import { LibraryItem, LibraryItemSchema } from '@/lib/library';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

function ensureConvexUrl(): string {
  if (!convexUrl) {
    throw new Error('Missing VITE_CONVEX_URL. Add it to .env.local to enable Cloud Sync.');
  }
  return convexUrl;
}

function createClient(token?: string | null): ConvexHttpClient {
  const client = new ConvexHttpClient(ensureConvexUrl());
  if (token) {
    client.setAuth(token);
  }
  return client;
}

function buildContentSearch(item: LibraryItem): string {
  return [item.title, item.description ?? '', ...item.tags, JSON.stringify(item.payload)]
    .join(' ')
    .toLowerCase();
}

function toConvexDocument(item: LibraryItem) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    tags: item.tags,
    targets: item.targets,
    status: item.status,
    favorite: item.favorite,
    archived: item.archived,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastUsedAt: item.lastUsedAt,
    schemaVersion: 1,
    spec: item.payload,
    contentSearch: buildContentSearch(item),
  };
}

function fromConvexDocument(doc: {
  id: string;
  type: string;
  title: string;
  description?: string;
  tags: string[];
  targets: string[];
  status: string;
  favorite: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number;
  spec: unknown;
}): LibraryItem {
  return LibraryItemSchema.parse({
    id: doc.id,
    type: doc.type,
    title: doc.title,
    description: doc.description,
    tags: doc.tags,
    targets: doc.targets,
    status: doc.status,
    favorite: doc.favorite,
    archived: doc.archived,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    lastUsedAt: doc.lastUsedAt,
    payload: doc.spec,
  });
}

export function isConvexConfigured(): boolean {
  return Boolean(convexUrl);
}

export async function listCloudLibraryItems(token: string | null): Promise<LibraryItem[]> {
  const client = createClient(token) as unknown as {
    query: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
  };
  const docs = await client.query('libraryItems:listLibraryItems', { includeArchived: true });
  return (docs as Array<Record<string, unknown>>).map((doc) =>
    fromConvexDocument(doc as Parameters<typeof fromConvexDocument>[0])
  );
}

export async function upsertCloudLibraryItem(item: LibraryItem, token: string | null): Promise<void> {
  const client = createClient(token) as unknown as {
    mutation: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
  };
  await client.mutation('libraryItems:upsertLibraryItem', { item: toConvexDocument(item) });
}

export async function deleteCloudLibraryItem(id: string, token: string | null): Promise<void> {
  const client = createClient(token) as unknown as {
    mutation: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
  };
  await client.mutation('libraryItems:deleteLibraryItem', { id });
}

export async function touchCloudLastUsed(id: string, token: string | null): Promise<void> {
  const client = createClient(token) as unknown as {
    mutation: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
  };
  await client.mutation('libraryItems:touchLastUsed', { id });
}

export async function toggleCloudFavorite(id: string, token: string | null): Promise<void> {
  const client = createClient(token) as unknown as {
    mutation: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
  };
  await client.mutation('libraryItems:toggleFavorite', { id });
}

export async function toggleCloudArchived(id: string, token: string | null): Promise<void> {
  const client = createClient(token) as unknown as {
    mutation: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
  };
  await client.mutation('libraryItems:toggleArchived', { id });
}

export async function migrateLocalItemsToCloud(
  items: LibraryItem[],
  token: string | null,
  onProgress?: (completed: number, total: number) => void
): Promise<{ completed: number; total: number; failed: number }> {
  let completed = 0;
  let failed = 0;
  const total = items.length;

  for (const item of items) {
    try {
      await upsertCloudLibraryItem(item, token);
      completed += 1;
    } catch {
      failed += 1;
    }
    onProgress?.(completed + failed, total);
  }

  return { completed, total, failed };
}
