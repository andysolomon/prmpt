import { z } from 'zod';

export const promptInputTypes = ['code', 'logs', 'requirements', 'data'] as const;
export const taskTypes = ['implement', 'debug', 'refactor', 'tests', 'architecture', 'docs'] as const;
export const outputModes = ['full_files', 'patch_diff', 'plan', 'code_plus_explanation'] as const;

export const PromptInputTypeSchema = z.enum(promptInputTypes);
export const TaskTypeSchema = z.enum(taskTypes);
export const OutputModeSchema = z.enum(outputModes);

export const AssumptionsPolicySchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('ask_questions'),
    maxQuestions: z.number().int().min(1).max(10).default(3),
  }),
  z.object({
    mode: z.literal('proceed_with_assumptions'),
  }),
]);

export const PromptInputSchema = z.object({
  id: z.string().min(1),
  type: PromptInputTypeSchema,
  label: z.string().trim().optional(),
  language: z.string().trim().optional(),
  content: z.string().trim(),
});

export const OutputContractSchema = z.object({
  mode: OutputModeSchema,
  requirements: z.array(z.string().trim().min(1)).default([]),
});

export const PromptMetadataSchema = z.object({
  version: z.literal(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PromptSpecSchema = z.object({
  title: z.string().trim(),
  goal: z.string().trim(),
  persona: z.string().trim().optional(),
  stackTags: z.array(z.string().trim().min(1)).default([]),
  contextNotes: z.array(z.string().trim().min(1)).default([]),
  inputs: z.array(PromptInputSchema).default([]),
  taskType: TaskTypeSchema.optional(),
  constraints: z.array(z.string().trim().min(1)).default([]),
  outputContract: OutputContractSchema.optional(),
  examples: z.array(z.string().trim().min(1)).default([]),
  assumptionsPolicy: AssumptionsPolicySchema,
  metadata: PromptMetadataSchema,
});

export const PromptPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  builtIn: z.boolean().default(false),
  spec: PromptSpecSchema,
});

export type PromptInputType = z.infer<typeof PromptInputTypeSchema>;
export type TaskType = z.infer<typeof TaskTypeSchema>;
export type OutputMode = z.infer<typeof OutputModeSchema>;
export type AssumptionsPolicy = z.infer<typeof AssumptionsPolicySchema>;
export type PromptInput = z.infer<typeof PromptInputSchema>;
export type OutputContract = z.infer<typeof OutputContractSchema>;
export type PromptMetadata = z.infer<typeof PromptMetadataSchema>;
export type PromptSpec = z.infer<typeof PromptSpecSchema>;
export type PromptPreset = z.infer<typeof PromptPresetSchema>;

export type ParseResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

export function parsePromptSpec(input: unknown): ParseResult<PromptSpec> {
  const result = PromptSpecSchema.safeParse(input);
  if (result.success) {
    return { ok: true, value: result.data };
  }

  return {
    ok: false,
    error: result.error.issues.map((issue) => issue.message).join('; '),
  };
}
