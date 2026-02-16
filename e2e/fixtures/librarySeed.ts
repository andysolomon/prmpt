export interface SeedPromptItem {
  id: string;
  title: string;
  goal?: string;
  tags?: string[];
  status?: 'draft' | 'stable' | 'deprecated';
  favorite?: boolean;
  archived?: boolean;
}

export interface SeedSkillItem {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  status?: 'draft' | 'stable' | 'deprecated';
  favorite?: boolean;
}

export interface SeedAnatomyItem {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  status?: 'draft' | 'stable' | 'deprecated';
  favorite?: boolean;
}

function makePromptSpec(title: string, goal: string) {
  const iso = new Date().toISOString();
  return {
    title,
    goal,
    stackTags: [],
    contextNotes: [],
    inputs: [],
    constraints: [],
    examples: [],
    assumptionsPolicy: {
      mode: 'ask_questions',
      maxQuestions: 3,
    },
    metadata: {
      version: 1,
      createdAt: iso,
      updatedAt: iso,
    },
  };
}

function makeSkillSpec(name: string, description: string) {
  return {
    name,
    description,
    inputs: [],
    steps: ['Describe the first implementation step.'],
    outputs: [],
    verification: [],
  };
}

export function buildPromptItem(seed: SeedPromptItem, timestamp = Date.now()) {
  return {
    id: seed.id,
    type: 'prompt' as const,
    title: seed.title,
    description: seed.goal ?? `${seed.title} description`,
    tags: seed.tags ?? ['prompt-builder'],
    targets: ['claude', 'chatgpt'],
    status: seed.status ?? 'draft',
    favorite: seed.favorite ?? false,
    archived: seed.archived ?? false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: timestamp,
    payload: {
      promptSpec: makePromptSpec(seed.title, seed.goal ?? 'Implement requested changes.'),
      source: 'prompt-builder' as const,
    },
  };
}

export function buildSkillItem(seed: SeedSkillItem, timestamp = Date.now()) {
  return {
    id: seed.id,
    type: 'skill' as const,
    title: seed.title,
    description: seed.description ?? `${seed.title} description`,
    tags: seed.tags ?? ['skill'],
    targets: ['claude'],
    status: seed.status ?? 'draft',
    favorite: seed.favorite ?? false,
    archived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: timestamp,
    payload: {
      skillSpec: makeSkillSpec(seed.title, seed.description ?? `${seed.title} description`),
    },
  };
}

export function buildAnatomyItem(seed: SeedAnatomyItem, timestamp = Date.now()) {
  return {
    id: seed.id,
    type: 'anatomy' as const,
    title: seed.title,
    description: seed.description ?? `${seed.title} anatomy`,
    tags: seed.tags ?? ['anatomy', 'prompt-forge'],
    targets: ['claude', 'chatgpt'],
    status: seed.status ?? 'draft',
    favorite: seed.favorite ?? false,
    archived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: timestamp,
    payload: {
      forgeState: {
        agentName: 'SeedAgent',
        tagline: 'seed anatomy',
        identityIntro: 'seed identity',
        coreBehavior: 'seed behavior',
        rules: 'seed rules',
        outputFormat: 'seed format',
        githubRepoUrls: '',
        githubFocusFiles: '',
        githubAlignmentRules: '',
        archetypes: [{ name: 'Sherlock Holmes', trait: 'seed trait' }],
      },
      promptText: 'You are SeedAgent.',
      selectedPresetId: 'salesforce-forge',
    },
  };
}

export function buildSeedLibraryData() {
  const base = Date.now();

  const prompts = [
    buildPromptItem({
      id: 'prompt-seed-alpha',
      title: 'Alpha Prompt',
      goal: 'Implement alpha workflow and tests',
      tags: ['alpha', 'prompt-builder'],
      status: 'stable',
      favorite: true,
    }, base - 1000),
    buildPromptItem({
      id: 'prompt-seed-beta',
      title: 'Beta Prompt',
      goal: 'Refactor beta module',
      tags: ['beta'],
      status: 'draft',
    }, base - 2000),
    buildPromptItem({
      id: 'prompt-seed-gamma',
      title: 'Gamma Prompt',
      goal: 'Legacy prompt',
      tags: ['legacy'],
      status: 'deprecated',
      archived: true,
    }, base - 3000),
  ];

  const skills = [
    buildSkillItem(
      {
        id: 'skill-seed-a',
        title: 'Seed Skill A',
        description: 'Seed skill for dashboard and list tests.',
        status: 'stable',
        favorite: true,
      },
      base - 4000
    ),
    buildSkillItem(
      {
        id: 'skill-seed-b',
        title: 'Seed Skill B',
        description: 'Secondary skill entry.',
      },
      base - 5000
    ),
  ];

  const anatomies = [
    buildAnatomyItem(
      {
        id: 'anatomy-seed-a',
        title: 'SalesforceForge Anatomy',
        description: 'Seed anatomy library item.',
        favorite: true,
      },
      base - 6000
    ),
  ];

  return { prompts, skills, anatomies };
}
