import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PromptSpec } from '@/lib/prompt';

import { StepId, WIZARD_STEPS } from './types';
import { GoalStep } from './steps/GoalStep';
import { ContextStep } from './steps/ContextStep';
import { InputsStep } from './steps/InputsStep';
import { TaskStep } from './steps/TaskStep';
import { OutputContractStep } from './steps/OutputContractStep';
import { ConstraintsStep } from './steps/ConstraintsStep';
import { ReviewExportStep } from './steps/ReviewExportStep';

interface PromptWizardProps {
  step: StepId;
  spec: PromptSpec;
  completion: Record<StepId, boolean>;
  onStepChange: (step: StepId) => void;
  onSpecChange: (patch: Partial<PromptSpec>) => void;
  onReset: () => void;
  onSavePreset: () => void;
}

function getStepIndex(step: StepId): number {
  return WIZARD_STEPS.findIndex((item) => item.id === step);
}

export function PromptWizard({
  step,
  spec,
  completion,
  onStepChange,
  onSpecChange,
  onReset,
  onSavePreset,
}: PromptWizardProps) {
  const stepIndex = getStepIndex(step);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {WIZARD_STEPS.map((wizardStep) => (
            <button
              key={wizardStep.id}
              className={`w-full rounded border px-2 py-2 text-left text-sm ${
                wizardStep.id === step ? 'bg-accent' : ''
              }`}
              onClick={() => onStepChange(wizardStep.id)}
              type="button"
            >
              {wizardStep.title} {completion[wizardStep.id] ? '✓' : ''}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{WIZARD_STEPS[stepIndex].title}</CardTitle>
          <CardDescription>{WIZARD_STEPS[stepIndex].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
