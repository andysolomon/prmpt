import { z } from 'zod';

import { PromptSpecSchema } from '@/lib/prompt';
import { UiPromptSpecSchema } from '@/lib/ui-builder/schema';

export const LibraryItemTypeSchema = z.enum(['prompt', 'skill']);
export const LibraryStatusSchema = z.enum(['draft', 'stable', 'deprecated']);

export const SkillInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  required: z.boolean().default(false),
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
});

export const PromptLibraryItemSchema = LibraryBaseSchema.extend({
  type: z.literal('prompt'),
  payload: PromptPayloadSchema,
});

export const SkillLibraryItemSchema = LibraryBaseSchema.extend({
  type: z.literal('skill'),
  payload: SkillPayloadSchema,
});

export const LibraryItemSchema = z.discriminatedUnion('type', [PromptLibraryItemSchema, SkillLibraryItemSchema]);

export const LibraryStoreMetaSchema = z.object({
  schemaVersion: z.literal(1),
  migratedFromLegacyPromptStore: z.boolean().default(false),
});

export type LibraryItemType = z.infer<typeof LibraryItemTypeSchema>;
export type LibraryStatus = z.infer<typeof LibraryStatusSchema>;
export type SkillInput = z.infer<typeof SkillInputSchema>;
export type SkillSpec = z.infer<typeof SkillSpecSchema>;
export type PromptLibraryItem = z.infer<typeof PromptLibraryItemSchema>;
export type SkillLibraryItem = z.infer<typeof SkillLibraryItemSchema>;
export type LibraryItem = z.infer<typeof LibraryItemSchema>;
export type LibraryStoreMeta = z.infer<typeof LibraryStoreMetaSchema>;

export function createDefaultSkillSpec(): SkillSpec {
  return {
    name: 'Untitled Skill',
    description: 'Describe what this skill does and when to use it.',
    inputs: [],
    steps: ['Describe the first implementation step.'],
    outputs: [],
    verification: [],
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
