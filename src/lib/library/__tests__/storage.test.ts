import {
  createAnatomyLibraryItem,
  createPromptLibraryItemFromPromptSpec,
  createSkillLibraryItem,
  deleteItem,
  duplicateItem,
  getItem,
  listItems,
  migrateLegacyPromptStorageIfNeeded,
  seedDefaultExampleSkillsIfMissing,
  toggleArchived,
  toggleFavorite,
  touchLastUsed,
  upsertItem,
} from '@/lib/library';
import { createDefaultPromptSpec } from '@/lib/prompt';

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

describe('library storage', () => {
  beforeAll(() => {
    (global as { window?: { localStorage: Storage } }).window = {
      localStorage: createMemoryStorage(),
    };
  });

  beforeEach(() => {
    (global as { window?: { localStorage: Storage } }).window?.localStorage.clear();
  });

  it('creates and lists items', () => {
    const skill = createSkillLibraryItem();
    upsertItem(skill);

    const prompt = createPromptLibraryItemFromPromptSpec('Prompt One', createDefaultPromptSpec());
    upsertItem(prompt);

    const anatomy = createAnatomyLibraryItem({
      title: 'SalesforceForge Anatomy',
      description: 'Anatomy test item',
      payload: {
        forgeState: {
          agentName: 'SalesforceForge',
          tagline: 'test',
          identityIntro: 'test',
          coreBehavior: 'test',
          rules: 'test',
          outputFormat: 'test',
          githubRepoUrls: '',
          githubFocusFiles: '',
          githubAlignmentRules: '',
          archetypes: [],
        },
        promptText: 'You are SalesforceForge.',
      },
    });
    upsertItem(anatomy);

    expect(listItems().length).toBe(3);
    expect(listItems({ type: 'skill' }).length).toBe(1);
    expect(listItems({ type: 'prompt' }).length).toBe(1);
    expect(listItems({ type: 'anatomy' }).length).toBe(1);
  });

  it('touches lastUsed and toggles favorite', () => {
    const skill = createSkillLibraryItem();
    upsertItem(skill);

    const before = getItem(skill.id);
    touchLastUsed(skill.id);
    toggleFavorite(skill.id);

    const after = getItem(skill.id);
    expect(after?.favorite).toBe(true);
    expect(after?.lastUsedAt).toBeGreaterThanOrEqual(before?.lastUsedAt ?? 0);
  });

  it('toggles archive state', () => {
    const prompt = createPromptLibraryItemFromPromptSpec('Prompt One', createDefaultPromptSpec());
    upsertItem(prompt);

    toggleArchived(prompt.id);
    expect(getItem(prompt.id)?.archived).toBe(true);
  });

  it('duplicates and deletes items', () => {
    const skill = createSkillLibraryItem({ title: 'Skill A' });
    upsertItem(skill);

    const duplicate = duplicateItem(skill.id);
    expect(duplicate).not.toBeNull();
    expect(duplicate?.id).not.toBe(skill.id);
    expect(duplicate?.title).toContain('Copy');

    deleteItem(skill.id);
    expect(getItem(skill.id)).toBeNull();
  });

  it('migrates legacy prompt storage once', () => {
    const legacySpec = createDefaultPromptSpec();
    legacySpec.title = 'Legacy Draft';
    legacySpec.goal = 'Legacy goal';

    (global as { window?: { localStorage: Storage } }).window?.localStorage.setItem(
      'prompt-builder:draft:v1',
      JSON.stringify(legacySpec)
    );

    migrateLegacyPromptStorageIfNeeded();
    const firstRunItems = listItems({ type: 'prompt' });

    expect(firstRunItems.length).toBe(1);
    expect(firstRunItems[0].title).toContain('Legacy');

    migrateLegacyPromptStorageIfNeeded();
    const secondRunItems = listItems({ type: 'prompt' });
    expect(secondRunItems.length).toBe(1);
  });

  it('seeds default example skills without duplicates', () => {
    seedDefaultExampleSkillsIfMissing();
    seedDefaultExampleSkillsIfMissing();

    const skills = listItems({ type: 'skill' });
    const titles = skills.map((item) => item.title);

    expect(titles).toContain('YouTube Video Analyzer');
    expect(titles).toContain('Hello World Skill: A Minimal Example');
    expect(titles.filter((title) => title === 'YouTube Video Analyzer')).toHaveLength(1);
    expect(titles.filter((title) => title === 'Hello World Skill: A Minimal Example')).toHaveLength(1);
  });
});
