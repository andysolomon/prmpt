import { PromptSpec } from './schema';

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintIssue {
  id: string;
  severity: LintSeverity;
  message: string;
  fieldPath?: string;
  suggestions?: string[];
}

const VAGUE_PHRASES = [
  'fix it',
  'make it better',
  'improve this',
  'clean this up',
  'optimize this',
  'help me',
];

const CONFLICTING_CONSTRAINT_PAIRS: Array<[string, string]> = [
  ['no new dependencies', 'add dependency'],
  ['no schema changes', 'update database schema'],
  ['no api changes', 'change api'],
];

export const INPUT_SIZE_WARNING_THRESHOLD = 12000;

function containsVaguePhrase(value: string): boolean {
  const lowered = value.toLowerCase();
  return VAGUE_PHRASES.some((phrase) => lowered.includes(phrase));
}

function hasConflictingConstraints(constraints: string[]): string[] {
  const lowered = constraints.map((item) => item.toLowerCase());
  const conflicts: string[] = [];

  CONFLICTING_CONSTRAINT_PAIRS.forEach(([left, right]) => {
    const hasLeft = lowered.some((item) => item.includes(left));
    const hasRight = lowered.some((item) => item.includes(right));

    if (hasLeft && hasRight) {
      conflicts.push(`${left} <-> ${right}`);
    }
  });

  return conflicts;
}

export function lintPromptSpec(spec: PromptSpec): LintIssue[] {
  const issues: LintIssue[] = [];

  if (!spec.goal.trim()) {
    issues.push({
      id: 'missing-goal',
      severity: 'error',
      message: 'Goal is required.',
      fieldPath: 'goal',
      suggestions: ['Describe the desired outcome in one sentence.'],
    });
  }

  if (!spec.taskType) {
    issues.push({
      id: 'missing-task-type',
      severity: 'error',
      message: 'Task type is required.',
      fieldPath: 'taskType',
      suggestions: ['Select implement, debug, refactor, tests, architecture, or docs.'],
    });
  }

  if (!spec.outputContract) {
    issues.push({
      id: 'missing-output-contract',
      severity: 'error',
      message: 'Output contract is required.',
      fieldPath: 'outputContract',
      suggestions: ['Choose output mode and list output requirements.'],
    });
  }

  if (containsVaguePhrase(spec.goal) || (spec.taskType === 'debug' && spec.contextNotes.length === 0)) {
    issues.push({
      id: 'vague-goal-or-task',
      severity: 'warning',
      message: 'Goal or task details may be too vague.',
      fieldPath: 'goal',
      suggestions: ['Add concrete acceptance criteria, expected behavior, and affected files.'],
    });
  }

  if (spec.stackTags.length === 0 && spec.contextNotes.length === 0) {
    issues.push({
      id: 'missing-stack-context',
      severity: 'warning',
      message: 'Stack tags or context notes are recommended.',
      fieldPath: 'stackTags',
      suggestions: ['Add your framework/runtime and relevant environment constraints.'],
    });
  }

  const totalInputChars = spec.inputs.reduce((total, item) => total + item.content.length, 0);
  if (totalInputChars > INPUT_SIZE_WARNING_THRESHOLD) {
    issues.push({
      id: 'inputs-too-large',
      severity: 'warning',
      message: `Inputs are large (${totalInputChars} chars).`,
      fieldPath: 'inputs',
      suggestions: [
        'Trim logs/code to only relevant sections.',
        'Add a brief summary before raw data.',
      ],
    });
  }

  const conflicts = hasConflictingConstraints(spec.constraints);
  if (conflicts.length > 0) {
    issues.push({
      id: 'conflicting-constraints',
      severity: 'warning',
      message: 'Some constraints appear to conflict.',
      fieldPath: 'constraints',
      suggestions: conflicts.map((conflict) => `Resolve conflict: ${conflict}`),
    });
  }

  return issues;
}
