import {
  clearDraft,
  createDefaultPromptSpec,
  deleteCustomPreset,
  loadCustomPresets,
  loadDraft,
  toCustomPreset,
  upsertCustomPreset,
  saveDraft,
} from '@/lib/prompt';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe('prompt storage', () => {
  beforeAll(() => {
    (global as { window?: { localStorage: Storage } }).window = {
      localStorage: createMemoryStorage(),
    };
  });

  beforeEach(() => {
    (global as { window?: { localStorage: Storage } }).window?.localStorage.clear();
  });

  it('loads default draft when storage is empty', () => {
    const draft = loadDraft();
    expect(draft.metadata.version).toBe(1);
  });

  it('saves and loads draft', () => {
    const spec = createDefaultPromptSpec();
    spec.goal = 'Write tests';

    saveDraft(spec);
    const loaded = loadDraft();

    expect(loaded.goal).toBe('Write tests');
  });

  it('falls back when draft is corrupted', () => {
    (global as { window?: { localStorage: Storage } }).window?.localStorage.setItem(
      'prompt-builder:draft:v1',
      '{bad-json'
    );
    const loaded = loadDraft();

    expect(loaded.goal).toBe('');
  });

  it('upserts and deletes custom presets', () => {
    const spec = createDefaultPromptSpec();
    spec.goal = 'Goal';
    const preset = toCustomPreset('My preset', 'desc', spec);

    upsertCustomPreset(preset);
    expect(loadCustomPresets().some((item) => item.id === preset.id)).toBe(true);

    deleteCustomPreset(preset.id);
    expect(loadCustomPresets().some((item) => item.id === preset.id)).toBe(false);
  });

  it('clears draft', () => {
    const spec = createDefaultPromptSpec();
    spec.goal = 'Need persistence';
    saveDraft(spec);

    clearDraft();
    const loaded = loadDraft();

    expect(loaded.goal).toBe('');
  });
});
