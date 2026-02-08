import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createDefaultInput, promptInputTypes, PromptSpec } from '@/lib/prompt';

interface InputsStepProps {
  spec: PromptSpec;
  onChange: (patch: Partial<PromptSpec>) => void;
}

export function InputsStep({ spec, onChange }: InputsStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Inputs</p>
        <Button type="button" onClick={() => onChange({ inputs: [...spec.inputs, createDefaultInput()] })}>
          Add input
        </Button>
      </div>

      {spec.inputs.length === 0 && (
        <p className="rounded border border-dashed p-4 text-sm text-muted-foreground">
          Add code snippets, logs, requirements, or data blocks.
        </p>
      )}

      {spec.inputs.map((input, index) => (
        <div key={input.id} className="space-y-2 rounded border p-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs">Type</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={input.type}
                onChange={(event) => {
                  const next = [...spec.inputs];
                  next[index] = { ...next[index], type: event.target.value as typeof input.type };
                  onChange({ inputs: next });
                }}
              >
                {promptInputTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs">Label</label>
              <Input
                value={input.label ?? ''}
                onChange={(event) => {
                  const next = [...spec.inputs];
                  next[index] = { ...next[index], label: event.target.value };
                  onChange({ inputs: next });
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs">Language</label>
              <Input
                value={input.language ?? ''}
                onChange={(event) => {
                  const next = [...spec.inputs];
                  next[index] = { ...next[index], language: event.target.value };
                  onChange({ inputs: next });
                }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs">Content</label>
            <Textarea
              rows={6}
              value={input.content}
              onChange={(event) => {
                const next = [...spec.inputs];
                next[index] = { ...next[index], content: event.target.value };
                onChange({ inputs: next });
              }}
            />
            <p className="mt-1 text-xs text-muted-foreground">{input.content.length} characters</p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ inputs: spec.inputs.filter((item) => item.id !== input.id) })}
          >
            Remove input
          </Button>
        </div>
      ))}
    </div>
  );
}
