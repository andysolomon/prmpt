import { createDefaultPromptSpec } from './defaults';
import { PromptPreset, PromptSpec } from './schema';

function basePreset(name: string, description: string): PromptPreset {
  const spec = createDefaultPromptSpec();

  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    description,
    builtIn: true,
    spec,
  };
}

export const BUILT_IN_PRESETS: PromptPreset[] = [
  {
    ...basePreset(
      'Salesforce Feature (Apex + LWC + Tests)',
      'Feature implementation preset for Salesforce projects with testing and governor-limit guidance.'
    ),
    spec: {
      ...createDefaultPromptSpec(),
      title: 'Salesforce Feature Request',
      goal: 'Implement a Salesforce feature with Apex, LWC, and robust test coverage.',
      persona: 'a Salesforce senior engineer',
      stackTags: ['Salesforce', 'Apex', 'LWC', 'SOQL'],
      taskType: 'implement',
      constraints: [
        'Use Assert class in tests.',
        'Do not use SeeAllData=true.',
        'Account for governor limits and bulk-safe logic.',
        'Include file paths for all code changes.',
      ],
      outputContract: {
        mode: 'patch_diff',
        requirements: [
          'Provide file paths and diffs.',
          'Include acceptance criteria and edge cases.',
          'Include test classes and run instructions.',
        ],
      },
      assumptionsPolicy: {
        mode: 'ask_questions',
        maxQuestions: 3,
      },
      metadata: {
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      contextNotes: [],
      inputs: [],
      examples: [],
    },
  },
  {
    ...basePreset(
      'Next.js + shadcn UI Feature',
      'Feature implementation preset for Next.js with shadcn UI and accessibility checks.'
    ),
    spec: {
      ...createDefaultPromptSpec(),
      title: 'Next.js + shadcn Feature Request',
      goal: 'Build a production-ready Next.js feature with accessible shadcn UI and tests.',
      persona: 'a senior full-stack TypeScript engineer',
      stackTags: ['Next.js', 'React', 'TypeScript', 'shadcn/ui'],
      taskType: 'implement',
      constraints: [
        'Include file paths in responses.',
        'Use strict TypeScript types.',
        'Include accessibility considerations (keyboard, focus, semantic markup).',
        'Add unit/component tests for changed UI behavior.',
      ],
      outputContract: {
        mode: 'code_plus_explanation',
        requirements: [
          'Provide files changed and commands to run tests.',
          'Call out edge cases and validation states.',
        ],
      },
      assumptionsPolicy: {
        mode: 'ask_questions',
        maxQuestions: 3,
      },
      metadata: {
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      contextNotes: [],
      inputs: [],
      examples: [],
    },
  },
];

export function toCustomPreset(name: string, description: string, spec: PromptSpec): PromptPreset {
  return {
    id: `custom-${Date.now()}`,
    name,
    description,
    builtIn: false,
    spec,
  };
}
