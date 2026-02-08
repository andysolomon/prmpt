import { taskTypes, PromptSpec } from '@/lib/prompt';

interface TaskStepProps {
  spec: PromptSpec;
  onChange: (patch: Partial<PromptSpec>) => void;
}

export function TaskStep({ spec, onChange }: TaskStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Choose the type of work you want the assistant to perform.</p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {taskTypes.map((type) => (
          <button
            key={type}
            className={`rounded border px-3 py-2 text-left text-sm ${spec.taskType === type ? 'bg-accent' : ''}`}
            onClick={() => onChange({ taskType: type })}
            type="button"
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
