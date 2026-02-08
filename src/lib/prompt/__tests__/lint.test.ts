import { createDefaultPromptSpec, lintPromptSpec } from '@/lib/prompt';

describe('prompt linter', () => {
  it('returns errors for required missing fields', () => {
    const spec = createDefaultPromptSpec();
    const issues = lintPromptSpec(spec);

    expect(issues.some((issue) => issue.id === 'missing-goal')).toBe(true);
    expect(issues.some((issue) => issue.id === 'missing-task-type')).toBe(true);
    expect(issues.some((issue) => issue.id === 'missing-output-contract')).toBe(true);
  });

  it('returns warning for conflicting constraints', () => {
    const spec = createDefaultPromptSpec();
    spec.goal = 'Implement feature';
    spec.taskType = 'implement';
    spec.outputContract = { mode: 'plan', requirements: [] };
    spec.constraints = ['No new dependencies', 'Add dependency uuid'];

    const issues = lintPromptSpec(spec);

    expect(issues.some((issue) => issue.id === 'conflicting-constraints')).toBe(true);
  });
});
