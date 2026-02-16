import { SkillSpec } from '@/lib/library/schema';

function bulletList(items: string[]): string {
  if (items.length === 0) {
    return '- None';
  }

  return items.map((item) => `- ${item}`).join('\n');
}

export function renderSkillToClaudeMarkdown(skill: SkillSpec): string {
  const lines: string[] = [];

  lines.push(`# ${skill.name}`);
  lines.push('');
  lines.push('## Purpose');
  lines.push(skill.description);

  if (skill.whenToUse) {
    lines.push('');
    lines.push('## When To Use');
    lines.push(skill.whenToUse);
  }

  lines.push('');
  lines.push('## Inputs');
  lines.push(
    skill.inputs.length
      ? skill.inputs
          .map((input) => {
            const suffix = input.required ? ' (required)' : '';
            const description = input.description ? `: ${input.description}` : '';
            return `- ${input.name}${suffix}${description}`;
          })
          .join('\n')
      : '- None'
  );

  lines.push('');
  lines.push('## Steps');
  lines.push(skill.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'));

  lines.push('');
  lines.push('## Output Expectations');
  lines.push(bulletList(skill.outputs));

  lines.push('');
  lines.push('## Verification Checklist');
  lines.push(bulletList(skill.verification));

  if (skill.notes) {
    lines.push('');
    lines.push('## Notes');
    lines.push(skill.notes);
  }

  return lines.join('\n').trim();
}
