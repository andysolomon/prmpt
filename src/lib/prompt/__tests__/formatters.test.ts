import {
  createDefaultPromptSpec,
  formatApiMessages,
  formatChatText,
  formatPromptSpecJson,
  parsePromptSpecJson,
} from '@/lib/prompt';

describe('Prompt formatters', () => {
  it('formats chat text with key sections', () => {
    const spec = createDefaultPromptSpec();
    spec.title = 'Implement feature';
    spec.goal = 'Implement user profile settings page.';
    spec.taskType = 'implement';
    spec.stackTags = ['React', 'TypeScript'];
    spec.outputContract = { mode: 'patch_diff', requirements: ['Include file paths'] };

    const output = formatChatText(spec);

    expect(output).toContain('# Implement feature');
    expect(output).toContain('## Goal');
    expect(output).toContain('## Output Mode');
  });

  it('formats api messages', () => {
    const spec = createDefaultPromptSpec();
    spec.goal = 'Debug flaky tests.';
    spec.taskType = 'debug';
    spec.outputContract = { mode: 'plan', requirements: [] };

    const output = formatApiMessages(spec);

    expect(output.system).toContain('senior software engineer assistant');
    expect(output.user).toContain('Debug flaky tests.');
  });

  it('serializes and parses json', () => {
    const spec = createDefaultPromptSpec();
    spec.goal = 'Refactor API handlers.';

    const raw = formatPromptSpecJson(spec);
    const parsed = parsePromptSpecJson(raw);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.goal).toBe('Refactor API handlers.');
    }
  });
});
