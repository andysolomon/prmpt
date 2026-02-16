import { mapUiPromptSpecToPromptSpec } from '@/lib/ui-builder/bridge';
import { createDefaultUiPromptSpec } from '@/lib/ui-builder/schema';

describe('UiPromptSpec bridge', () => {
  it('maps ui spec to stable prompt spec', () => {
    const uiSpec = createDefaultUiPromptSpec('layout');
    uiSpec.title = 'UI Layout Prompt';

    const prompt = mapUiPromptSpecToPromptSpec(uiSpec);

    expect(prompt.title).toBe('UI Layout Prompt');
    expect(prompt.goal).toContain('Build a layout focused UI implementation prompt.');
    expect(prompt.outputContract?.requirements.length).toBeGreaterThan(0);
    expect(prompt.stackTags).toContain('ui:layout');
  });
});
