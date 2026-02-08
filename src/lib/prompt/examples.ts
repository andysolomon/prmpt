import { createDefaultPromptSpec } from './defaults';
import { PromptSpec } from './schema';

export interface PromptExample {
  id: string;
  name: string;
  description: string;
  spec: PromptSpec;
}

export const PROMPT_EXAMPLES: PromptExample[] = [
  {
    id: 'example-debug-react-auth',
    name: 'React Auth Debug',
    description: 'Debug login redirect loops in a React + Node app.',
    spec: {
      ...createDefaultPromptSpec(),
      title: 'Debug React auth redirect loop',
      goal: 'Identify and fix login redirect loops for authenticated users in production.',
      stackTags: ['React', 'TypeScript', 'Node.js', 'JWT'],
      taskType: 'debug',
      contextNotes: [
        'Issue only happens after token refresh.',
        'Frontend stores access token in memory and refresh token in httpOnly cookie.',
      ],
      constraints: ['Do not add new dependencies', 'Keep API contract unchanged'],
      outputContract: {
        mode: 'code_plus_explanation',
        requirements: ['Provide root cause', 'List changed files', 'Include test steps'],
      },
      inputs: [],
      examples: [],
      assumptionsPolicy: {
        mode: 'ask_questions',
        maxQuestions: 2,
      },
      metadata: {
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  },
  {
    id: 'example-salesforce-feature',
    name: 'Salesforce Feature Delivery',
    description: 'Add Apex + LWC feature with full test guidance.',
    spec: {
      ...createDefaultPromptSpec(),
      title: 'Deliver Salesforce feature with tests',
      goal: 'Implement Opportunity health score feature using Apex + LWC and robust tests.',
      stackTags: ['Salesforce', 'Apex', 'LWC', 'SOQL'],
      taskType: 'implement',
      contextNotes: ['Feature must be bulk-safe for nightly batch processing.'],
      constraints: ['Use Assert class in tests', 'SeeAllData=false', 'Include file paths'],
      outputContract: {
        mode: 'patch_diff',
        requirements: ['Provide diff', 'Include tests', 'List governor-limit risks'],
      },
      inputs: [],
      examples: [],
      assumptionsPolicy: {
        mode: 'ask_questions',
        maxQuestions: 3,
      },
      metadata: {
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  },
];
