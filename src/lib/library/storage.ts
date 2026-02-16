import { createDefaultPromptSpec, PromptPresetSchema, PromptSpecSchema } from '@/lib/prompt';
import { UiPromptSpec } from '@/lib/ui-builder';

import {
  LibraryItem,
  LibraryItemSchema,
  LibraryItemType,
  LibraryStoreMeta,
  LibraryStoreMetaSchema,
  PromptLibraryItem,
  SkillLibraryItem,
  createDefaultSkillSpec,
} from './schema';

const LIBRARY_ITEMS_KEY = 'prmpt.library.v1.items';
const LIBRARY_META_KEY = 'prmpt.library.v1.meta';
const LEGACY_DRAFT_KEY = 'prompt-builder:draft:v1';
const LEGACY_CUSTOM_PRESETS_KEY = 'prompt-builder:custom-presets:v1';

type Listener = () => void;
const listeners = new Set<Listener>();

function now(): number {
  return Date.now();
}

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function generateId(prefix: string): string {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}`;
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeLibrary(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readMeta(): LibraryStoreMeta {
  if (!hasStorage()) {
    return { schemaVersion: 1, migratedFromLegacyPromptStore: false };
  }

  const raw = window.localStorage.getItem(LIBRARY_META_KEY);
  if (!raw) {
    return { schemaVersion: 1, migratedFromLegacyPromptStore: false };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = LibraryStoreMetaSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
  } catch {
    // fall through
  }

  return { schemaVersion: 1, migratedFromLegacyPromptStore: false };
}

function writeMeta(meta: LibraryStoreMeta): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(LIBRARY_META_KEY, JSON.stringify(meta));
}

function readItems(): LibraryItem[] {
  if (!hasStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(LIBRARY_ITEMS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => LibraryItemSchema.safeParse(entry))
      .filter((result): result is { success: true; data: LibraryItem } => result.success)
      .map((result) => result.data);
  } catch {
    return [];
  }
}

function writeItems(items: LibraryItem[]): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(LIBRARY_ITEMS_KEY, JSON.stringify(items));
}

function createPromptItemFromPromptSpec(specTitle: string, specDescription: string, promptSpec: unknown): PromptLibraryItem | null {
  const parsed = PromptSpecSchema.safeParse(promptSpec);
  if (!parsed.success) {
    return null;
  }

  const timestamp = now();

  return {
    id: generateId('prompt'),
    type: 'prompt',
    title: specTitle,
    description: specDescription,
    tags: ['migrated', 'prompt-builder'],
    targets: ['codex', 'chatgpt'],
    status: 'draft',
    favorite: false,
    archived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: timestamp,
    payload: {
      promptSpec: parsed.data,
      source: 'prompt-builder',
    },
  };
}

export function migrateLegacyPromptStorageIfNeeded(): void {
  if (!hasStorage()) {
    return;
  }

  const meta = readMeta();
  if (meta.migratedFromLegacyPromptStore) {
    return;
  }

  const items = readItems();
  const migratedItems: LibraryItem[] = [];

  const legacyDraftRaw = window.localStorage.getItem(LEGACY_DRAFT_KEY);
  if (legacyDraftRaw) {
    try {
      const parsedDraft = JSON.parse(legacyDraftRaw) as unknown;
      const title =
        typeof parsedDraft === 'object' && parsedDraft && 'title' in parsedDraft
          ? String((parsedDraft as { title?: string }).title || 'Migrated Draft Prompt')
          : 'Migrated Draft Prompt';
      const description = 'Migrated from legacy draft storage';
      const item = createPromptItemFromPromptSpec(title, description, parsedDraft);
      if (item) {
        migratedItems.push(item);
      }
    } catch {
      // ignore legacy parse failures
    }
  }

  const legacyPresetRaw = window.localStorage.getItem(LEGACY_CUSTOM_PRESETS_KEY);
  if (legacyPresetRaw) {
    try {
      const parsedPreset = JSON.parse(legacyPresetRaw) as unknown;
      if (Array.isArray(parsedPreset)) {
        parsedPreset.forEach((preset) => {
          const parsed = PromptPresetSchema.safeParse(preset);
          if (!parsed.success) {
            return;
          }

          const item = createPromptItemFromPromptSpec(
            `Preset: ${parsed.data.name}`,
            parsed.data.description,
            parsed.data.spec
          );
          if (item) {
            item.tags = [...item.tags, 'preset'];
            migratedItems.push(item);
          }
        });
      }
    } catch {
      // ignore legacy parse failures
    }
  }

  if (migratedItems.length > 0) {
    writeItems([...items, ...migratedItems]);
  }

  writeMeta({
    schemaVersion: 1,
    migratedFromLegacyPromptStore: true,
  });

  emitChange();
}

export interface ListItemsOptions {
  type?: LibraryItemType;
  includeArchived?: boolean;
  query?: string;
  favoriteOnly?: boolean;
}

export function listItems(options: ListItemsOptions = {}): LibraryItem[] {
  const includeArchived = options.includeArchived ?? false;
  const query = options.query?.trim().toLowerCase();

  return readItems()
    .filter((item) => (options.type ? item.type === options.type : true))
    .filter((item) => (includeArchived ? true : !item.archived))
    .filter((item) => (options.favoriteOnly ? item.favorite : true))
    .filter((item) => {
      if (!query) {
        return true;
      }

      const haystack = [item.title, item.description ?? '', ...item.tags].join(' ').toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => right.updatedAt - left.updatedAt);
}

export function getItem(id: string): LibraryItem | null {
  return readItems().find((item) => item.id === id) ?? null;
}

export function upsertItem(item: LibraryItem): LibraryItem {
  const parsed = LibraryItemSchema.parse(item);
  const items = readItems();
  const index = items.findIndex((existing) => existing.id === parsed.id);

  if (index === -1) {
    items.push(parsed);
  } else {
    items[index] = parsed;
  }

  writeItems(items);
  emitChange();
  return parsed;
}

export function deleteItem(id: string): void {
  const next = readItems().filter((item) => item.id !== id);
  writeItems(next);
  emitChange();
}

export function touchLastUsed(id: string): void {
  const timestamp = now();
  const next = readItems().map((item) =>
    item.id === id
      ? {
          ...item,
          lastUsedAt: timestamp,
        }
      : item
  );

  writeItems(next);
  emitChange();
}

export function toggleFavorite(id: string): void {
  const timestamp = now();
  const next = readItems().map((item) =>
    item.id === id
      ? {
          ...item,
          favorite: !item.favorite,
          updatedAt: timestamp,
        }
      : item
  );

  writeItems(next);
  emitChange();
}

export function duplicateItem(id: string): LibraryItem | null {
  const source = getItem(id);
  if (!source) {
    return null;
  }

  const timestamp = now();
  const duplicate: LibraryItem = {
    ...source,
    id: generateId(source.type),
    title: `${source.title} Copy`,
    favorite: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: timestamp,
  };

  upsertItem(duplicate);
  return duplicate;
}

export function createSkillLibraryItem(partial?: Partial<SkillLibraryItem>): SkillLibraryItem {
  const timestamp = now();
  const defaultSkill = createDefaultSkillSpec();

  return {
    id: partial?.id ?? generateId('skill'),
    type: 'skill',
    title: partial?.title ?? defaultSkill.name,
    description: partial?.description ?? defaultSkill.description,
    tags: partial?.tags ?? ['skill'],
    targets: partial?.targets ?? ['claude'],
    status: partial?.status ?? 'draft',
    favorite: partial?.favorite ?? false,
    archived: partial?.archived ?? false,
    createdAt: partial?.createdAt ?? timestamp,
    updatedAt: partial?.updatedAt ?? timestamp,
    lastUsedAt: partial?.lastUsedAt ?? timestamp,
    payload: {
      skillSpec: partial?.payload?.skillSpec ?? defaultSkill,
    },
  };
}

export function createPromptLibraryItemFromPromptSpec(
  title: string,
  promptSpec = createDefaultPromptSpec(),
  tags: string[] = [],
  options?: {
    source?: 'prompt-builder' | 'ui-builder';
    uiPromptSpec?: UiPromptSpec;
  }
): PromptLibraryItem {
  const timestamp = now();

  return {
    id: generateId('prompt'),
    type: 'prompt',
    title,
    description: promptSpec.goal,
    tags: ['prompt', ...tags],
    targets: ['codex', 'chatgpt'],
    status: 'draft',
    favorite: false,
    archived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: timestamp,
    payload: {
      promptSpec,
      source: options?.source ?? 'prompt-builder',
      uiPromptSpec: options?.uiPromptSpec,
    },
  };
}
