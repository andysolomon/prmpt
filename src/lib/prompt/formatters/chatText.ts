import { PromptSpec } from '../schema';

function section(title: string, content: string | string[]): string {
  const normalized = Array.isArray(content)
    ? content.filter(Boolean).map((item) => `- ${item}`).join('\n')
    : content;

  if (!normalized.trim()) {
    return '';
  }

  return `## ${title}\n${normalized}\n`;
}

export function formatChatText(spec: PromptSpec): string {
  const lines: string[] = [];

  lines.push(`# ${spec.title || 'Prompt Request'}`);
  lines.push('');

  if (spec.persona) {
    lines.push(`Persona: ${spec.persona}`);
    lines.push('');
  }

  lines.push(section('Goal', spec.goal.trim() || ''));

  if (spec.taskType) {
    lines.push(section('Task Type', spec.taskType));
  }

  lines.push(section('Stack', spec.stackTags));
  lines.push(section('Context Notes', spec.contextNotes));

  if (spec.inputs.length > 0) {
    const inputLines = spec.inputs.map((input, index) => {
      const meta = [input.type, input.label, input.language].filter(Boolean).join(' | ');
      return `${index + 1}. ${meta || input.type}\n${input.content}`;
    });
    lines.push(section('Inputs', inputLines.join('\n\n')));
  }

  lines.push(section('Constraints', spec.constraints));

  if (spec.outputContract) {
    lines.push(section('Output Mode', spec.outputContract.mode));
    lines.push(section('Output Requirements', spec.outputContract.requirements));
  }

  lines.push(section('Examples', spec.examples));

  if (spec.assumptionsPolicy.mode === 'ask_questions') {
    lines.push(section('Assumptions Policy', `Ask up to ${spec.assumptionsPolicy.maxQuestions} clarifying questions before implementation when needed.`));
  } else {
    lines.push(section('Assumptions Policy', 'Proceed with reasonable assumptions and state them explicitly.'));
  }

  return lines
    .filter((line) => line.trim().length > 0)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
