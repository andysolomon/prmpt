import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PromptSpec } from '@/lib/prompt';

interface GoalStepProps {
  spec: PromptSpec;
  onChange: (patch: Partial<PromptSpec>) => void;
}

export function GoalStep({ spec, onChange }: GoalStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="prompt-title">
          Title
        </label>
        <Input
          id="prompt-title"
          placeholder="Short title for this prompt"
          value={spec.title}
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="prompt-goal">
          Goal
        </label>
        <Textarea
          id="prompt-goal"
          rows={5}
          placeholder="Describe the exact outcome you need from the assistant."
          value={spec.goal}
          onChange={(event) => onChange({ goal: event.target.value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="prompt-persona">
          Persona (optional)
        </label>
        <Input
          id="prompt-persona"
          placeholder="Example: a senior Salesforce engineer"
          value={spec.persona ?? ''}
          onChange={(event) => onChange({ persona: event.target.value || undefined })}
        />
      </div>

      <div className="rounded-md border p-4">
        <p className="mb-3 text-sm font-medium">Assumptions policy</p>
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded border px-3 py-2 text-sm ${
              spec.assumptionsPolicy.mode === 'ask_questions' ? 'bg-accent' : ''
            }`}
            onClick={() =>
              onChange({
                assumptionsPolicy: {
                  mode: 'ask_questions',
                  maxQuestions:
                    spec.assumptionsPolicy.mode === 'ask_questions'
                      ? spec.assumptionsPolicy.maxQuestions
                      : 3,
                },
              })
            }
            type="button"
          >
            Ask clarifying questions
          </button>
          <button
            className={`rounded border px-3 py-2 text-sm ${
              spec.assumptionsPolicy.mode === 'proceed_with_assumptions' ? 'bg-accent' : ''
            }`}
            onClick={() => onChange({ assumptionsPolicy: { mode: 'proceed_with_assumptions' } })}
            type="button"
          >
            Proceed with assumptions
          </button>
        </div>

        {spec.assumptionsPolicy.mode === 'ask_questions' && (
          <div className="mt-3 max-w-xs">
            <label className="mb-1 block text-sm" htmlFor="max-questions">
              Max clarifying questions
            </label>
            <Input
              id="max-questions"
              min={1}
              max={10}
              type="number"
              value={spec.assumptionsPolicy.maxQuestions}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isNaN(value)) {
                  onChange({
                    assumptionsPolicy: {
                      mode: 'ask_questions',
                      maxQuestions: Math.max(1, Math.min(10, value)),
                    },
                  });
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
