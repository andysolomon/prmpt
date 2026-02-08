import { createDefaultPromptSpec, PromptSpecSchema } from '@/lib/prompt';

describe('PromptSpec schema', () => {
  it('validates default prompt spec', () => {
    const spec = createDefaultPromptSpec(new Date('2026-02-08T00:00:00.000Z'));
    const result = PromptSpecSchema.safeParse(spec);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata.version).toBe(1);
    }
  });

  it('rejects invalid metadata version', () => {
    const spec = {
      ...createDefaultPromptSpec(),
      metadata: {
        version: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    const result = PromptSpecSchema.safeParse(spec);
    expect(result.success).toBe(false);
  });
});
