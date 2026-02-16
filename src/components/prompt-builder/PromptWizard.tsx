import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LintIssue, PromptSpec } from '@/lib/prompt';

import { ConstraintsStep } from './steps/ConstraintsStep';
import { ContextStep } from './steps/ContextStep';
import { GoalStep } from './steps/GoalStep';
import { InputsStep } from './steps/InputsStep';
import { OutputContractStep } from './steps/OutputContractStep';
import { ReviewExportStep } from './steps/ReviewExportStep';
import { TaskStep } from './steps/TaskStep';
import { StepId, WIZARD_STEPS } from './types';

interface PromptWizardProps {
  step: StepId;
  spec: PromptSpec;
  completion: Record<StepId, boolean>;
  lintIssues: LintIssue[];
  onStepChange: (step: StepId) => void;
  onSpecChange: (patch: Partial<PromptSpec>) => void;
  onReset: () => void;
  onSavePreset: () => void;
}

const STEP_FIELD_PATHS: Record<StepId, string[]> = {
  goal: ['goal', 'persona'],
  context: ['stackTags', 'contextNotes'],
  inputs: ['inputs'],
  task: ['taskType'],
  output: ['outputContract'],
  constraints: ['constraints', 'examples'],
  review: [],
};

function getStepIndex(step: StepId): number {
  return WIZARD_STEPS.findIndex((item) => item.id === step);
}

function getStepIssues(step: StepId, issues: LintIssue[]): LintIssue[] {
  if (step === 'review') {
    return issues;
  }

  const fields = STEP_FIELD_PATHS[step];
  return issues.filter((issue) => issue.fieldPath && fields.some((field) => issue.fieldPath?.startsWith(field)));
}

export function PromptWizard({
  step,
  spec,
  completion,
  lintIssues,
  onStepChange,
  onSpecChange,
  onReset,
  onSavePreset,
}: PromptWizardProps) {
  const stepIndex = getStepIndex(step);
  const completedCount = Object.values(completion).filter(Boolean).length;
  const stepIssues = getStepIssues(step, lintIssues);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steps</CardTitle>
          <CardDescription>
            {completedCount}/{WIZARD_STEPS.length} complete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {WIZARD_STEPS.map((wizardStep, index) => {
            const isCurrent = wizardStep.id === step;
            const isComplete = completion[wizardStep.id];

            return (
              <button
                key={wizardStep.id}
                className={`flex w-full items-center justify-between rounded border px-2 py-2 text-left text-sm transition-colors ${
                  isCurrent
                    ? 'border-primary/40 bg-accent text-accent-foreground'
                    : isComplete
                      ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-100'
                      : 'border-border bg-card text-foreground hover:bg-accent/40'
                }`}
                onClick={() => onStepChange(wizardStep.id)}
                type="button"
              >
                <span>{wizardStep.title}</span>
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    isComplete ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? '✓' : index + 1}
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{WIZARD_STEPS[stepIndex].title}</CardTitle>
          <CardDescription>{WIZARD_STEPS[stepIndex].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {stepIssues.length > 0 && (
            <div className="rounded border border-amber-700/60 bg-amber-950/30 p-3 text-sm text-amber-100">
              <p className="font-medium">Step guidance</p>
              <ul className="mt-1 list-disc pl-4">
                {stepIssues.map((issue) => (
                  <li key={`${issue.id}-${issue.message}`}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}

          {step === 'goal' && <GoalStep spec={spec} onChange={onSpecChange} />}
          {step === 'context' && <ContextStep spec={spec} onChange={onSpecChange} />}
          {step === 'inputs' && <InputsStep spec={spec} onChange={onSpecChange} />}
          {step === 'task' && <TaskStep spec={spec} onChange={onSpecChange} />}
          {step === 'output' && <OutputContractStep spec={spec} onChange={onSpecChange} />}
          {step === 'constraints' && <ConstraintsStep spec={spec} onChange={onSpecChange} />}
          {step === 'review' && <ReviewExportStep spec={spec} onReset={onReset} onSavePreset={onSavePreset} />}

          <div className="flex items-center justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={stepIndex <= 0}
              onClick={() => onStepChange(WIZARD_STEPS[Math.max(0, stepIndex - 1)].id)}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={stepIndex >= WIZARD_STEPS.length - 1}
              onClick={() =>
                onStepChange(WIZARD_STEPS[Math.min(WIZARD_STEPS.length - 1, stepIndex + 1)].id)
              }
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
