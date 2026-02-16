import type { Page } from '@playwright/test';

const LIBRARY_ITEMS_KEY = 'prmpt.library.v1.items';
const LIBRARY_META_KEY = 'prmpt.library.v1.meta';
const DRAFT_STORAGE_KEY = 'prompt-builder:draft:v1';
const CUSTOM_PRESETS_STORAGE_KEY = 'prompt-builder:custom-presets:v1';

export interface SeedStoragePayload {
  libraryItems?: unknown[];
  draft?: unknown;
  customPresets?: unknown[];
}

export async function seedStorageAndGoto(page: Page, path: string, payload: SeedStoragePayload = {}) {
  const libraryItems = payload.libraryItems ?? [];
  const draft = payload.draft;
  const customPresets = payload.customPresets ?? [];

  await page.addInitScript(
    ({
      libraryItemsArg,
      draftArg,
      customPresetsArg,
      keys,
    }: {
      libraryItemsArg: unknown[];
      draftArg: unknown | undefined;
      customPresetsArg: unknown[];
      keys: {
        libraryItems: string;
        libraryMeta: string;
        draft: string;
        customPresets: string;
      };
    }) => {
      window.localStorage.clear();
      window.localStorage.setItem(keys.libraryItems, JSON.stringify(libraryItemsArg));
      window.localStorage.setItem(
        keys.libraryMeta,
        JSON.stringify({ schemaVersion: 1, migratedFromLegacyPromptStore: true })
      );

      if (draftArg) {
        window.localStorage.setItem(keys.draft, JSON.stringify(draftArg));
      }

      if (customPresetsArg.length > 0) {
        window.localStorage.setItem(keys.customPresets, JSON.stringify(customPresetsArg));
      }
    },
    {
      libraryItemsArg: libraryItems,
      draftArg: draft,
      customPresetsArg: customPresets,
      keys: {
        libraryItems: LIBRARY_ITEMS_KEY,
        libraryMeta: LIBRARY_META_KEY,
        draft: DRAFT_STORAGE_KEY,
        customPresets: CUSTOM_PRESETS_STORAGE_KEY,
      },
    }
  );

  await page.goto(path);
}
