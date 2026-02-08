import { PromptSpec } from './schema';

function generateId(prefix: string): string {
  if (typeof globalThis !== 'undefined' && 'crypto' in globalThis && 'randomUUID' in globalThis.crypto) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createDefaultPromptSpec(now = new Date()): PromptSpec {
  const iso = now.toISOString();

  return {
    title: '',
    goal: '',
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

export function createDefaultInput(): PromptSpec['inputs'][number] {
  return {
    id: generateId('input'),
    type: 'code',
    label: '',
    language: '',
    content: '',
  };
}

export function touchPromptSpec(spec: PromptSpec, now = new Date()): PromptSpec {
  return {
    ...spec,
    metadata: {
      ...spec.metadata,
      updatedAt: now.toISOString(),
    },
  };
}
