import { renderSkillToClaudeMarkdown } from '@/lib/skill/formatters';

import { createDefaultSkillSpec } from '@/lib/library/schema';

describe('skill formatter', () => {
  it('renders deterministic markdown sections', () => {
    const skill = createDefaultSkillSpec();
    skill.name = 'Build Dashboard Skill';
    skill.description = 'Helps build dashboard pages';
    skill.steps = ['Collect requirements', 'Implement layout'];

    const markdown = renderSkillToClaudeMarkdown(skill);

    expect(markdown).toContain('# Build Dashboard Skill');
    expect(markdown).toContain('## Steps');
    expect(markdown).toContain('1. Collect requirements');
    expect(markdown).toContain('2. Implement layout');
  });
});
