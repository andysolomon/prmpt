export type StepId =
  | 'goal'
  | 'context'
  | 'inputs'
  | 'task'
  | 'output'
  | 'constraints'
  | 'review';

export interface StepMeta {
  id: StepId;
  title: string;
  description: string;
}

export const WIZARD_STEPS: StepMeta[] = [
  { id: 'goal', title: 'Goal', description: 'Define the target outcome and persona.' },
  { id: 'context', title: 'Context/Stack', description: 'Add stack tags and context notes.' },
  { id: 'inputs', title: 'Inputs', description: 'Attach code/logs/requirements/data.' },
  { id: 'task', title: 'Task Type', description: 'Choose the type of help needed.' },
  { id: 'output', title: 'Output Contract', description: 'Set output mode and requirements.' },
  { id: 'constraints', title: 'Constraints', description: 'Add hard rules and optional examples.' },
  { id: 'review', title: 'Review/Export', description: 'Validate lint feedback and export.' },
];
