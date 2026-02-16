import { z } from 'zod';

import { PromptSpecSchema } from '@/lib/prompt';
import { UiPromptSpecSchema } from '@/lib/ui-builder/schema';

export const LibraryItemTypeSchema = z.enum(['prompt', 'skill', 'anatomy']);
export const LibraryStatusSchema = z.enum(['draft', 'stable', 'deprecated']);

export const SkillInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  required: z.boolean().default(false),
});

export const SkillSourceFileSchema = z.object({
  path: z.string().trim().min(1),
  description: z.string().trim().optional(),
  content: z.string(),
});

export const SkillSpecSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  whenToUse: z.string().trim().optional(),
  inputs: z.array(SkillInputSchema).default([]),
  steps: z.array(z.string().trim().min(1)).min(1),
  outputs: z.array(z.string().trim().min(1)).default([]),
  verification: z.array(z.string().trim().min(1)).default([]),
  notes: z.string().trim().optional(),
});

const LibraryBaseSchema = z.object({
  id: z.string().min(1),
  type: LibraryItemTypeSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  targets: z.array(z.string().trim().min(1)).default([]),
  status: LibraryStatusSchema.default('draft'),
  favorite: z.boolean().default(false),
  archived: z.boolean().default(false),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  lastUsedAt: z.number().int().positive(),
});

const PromptPayloadSchema = z.object({
  promptSpec: PromptSpecSchema,
  source: z.enum(['prompt-builder', 'ui-builder']).optional(),
  uiPromptSpec: UiPromptSpecSchema.optional(),
});

const SkillPayloadSchema = z.object({
  skillSpec: SkillSpecSchema,
  sourceFiles: z.array(SkillSourceFileSchema).default([]),
});

export const AnatomyArchetypeRowSchema = z.object({
  name: z.string(),
  trait: z.string(),
});

export const AnatomyForgeStateSchema = z.object({
  agentName: z.string(),
  tagline: z.string(),
  identityIntro: z.string(),
  coreBehavior: z.string(),
  rules: z.string(),
  outputFormat: z.string(),
  githubRepoUrls: z.string(),
  githubFocusFiles: z.string(),
  githubAlignmentRules: z.string(),
  archetypes: z.array(AnatomyArchetypeRowSchema).default([]),
});

const AnatomyPayloadSchema = z.object({
  forgeState: AnatomyForgeStateSchema,
  promptText: z.string(),
  selectedPresetId: z.string().trim().optional(),
});

export const PromptLibraryItemSchema = LibraryBaseSchema.extend({
  type: z.literal('prompt'),
  payload: PromptPayloadSchema,
});

export const SkillLibraryItemSchema = LibraryBaseSchema.extend({
  type: z.literal('skill'),
  payload: SkillPayloadSchema,
});

export const AnatomyLibraryItemSchema = LibraryBaseSchema.extend({
  type: z.literal('anatomy'),
  payload: AnatomyPayloadSchema,
});

export const LibraryItemSchema = z.discriminatedUnion('type', [
  PromptLibraryItemSchema,
  SkillLibraryItemSchema,
  AnatomyLibraryItemSchema,
]);

export const LibraryStoreMetaSchema = z.object({
  schemaVersion: z.literal(1),
  migratedFromLegacyPromptStore: z.boolean().default(false),
});

export type LibraryItemType = z.infer<typeof LibraryItemTypeSchema>;
export type LibraryStatus = z.infer<typeof LibraryStatusSchema>;
export type SkillInput = z.infer<typeof SkillInputSchema>;
export type SkillSourceFile = z.infer<typeof SkillSourceFileSchema>;
export type SkillSpec = z.infer<typeof SkillSpecSchema>;
export type AnatomyArchetypeRow = z.infer<typeof AnatomyArchetypeRowSchema>;
export type AnatomyForgeState = z.infer<typeof AnatomyForgeStateSchema>;
export type PromptLibraryItem = z.infer<typeof PromptLibraryItemSchema>;
export type SkillLibraryItem = z.infer<typeof SkillLibraryItemSchema>;
export type AnatomyLibraryItem = z.infer<typeof AnatomyLibraryItemSchema>;
export type LibraryItem = z.infer<typeof LibraryItemSchema>;
export type LibraryStoreMeta = z.infer<typeof LibraryStoreMetaSchema>;

export function createDefaultSkillSpec(): SkillSpec {
  return {
    name: 'Untitled Skill',
    description:
      'Structured implementation skill with explicit inputs, workflow, deliverables, and quality checks.',
    whenToUse:
      'Use when a task requires repeatable execution with clear requirements, implementation steps, and validation criteria.',
    inputs: [
      {
        id: 'input-objective',
        name: 'Objective',
        description: 'What outcome is required and why it matters.',
        required: true,
      },
      {
        id: 'input-context',
        name: 'Context',
        description: 'Current system state, constraints, and relevant references.',
        required: false,
      },
      {
        id: 'input-acceptance',
        name: 'Acceptance criteria',
        description: 'Observable checks that confirm the task is complete.',
        required: true,
      },
    ],
    steps: [
      'Parse the objective and constraints, then restate scope and success criteria.',
      'Identify required inputs, dependencies, and assumptions before implementation.',
      'Execute the implementation workflow in small, verifiable steps.',
      'Validate outputs against acceptance criteria and edge cases.',
      'Summarize final deliverables, residual risks, and next actions.',
    ],
    outputs: [
      'Implementation result aligned to objective',
      'Decision log and key assumptions',
      'Validation summary with pass/fail checks',
      'Follow-up recommendations',
    ],
    verification: [
      'All required inputs were provided or assumptions were explicitly stated',
      'Steps were executed in sequence with traceable rationale',
      'Outputs satisfy acceptance criteria',
      'Risks, limitations, and open questions are documented',
    ],
  };
}

export function createEmptySkillInput(): SkillInput {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return {
    id: `input-${id}`,
    name: '',
    description: '',
    required: false,
  };
}
