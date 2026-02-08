import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PromptSpec } from '@/lib/prompt';

interface ConstraintsStepProps {
  spec: PromptSpec;
  onChange: (patch: Partial<PromptSpec>) => void;
}

const COMMON_CONSTRAINTS = [
  'No new dependencies',
  'Keep API signatures stable',
  'Use strict TypeScript',
  'Include tests for changed behavior',
  'List file paths in output',
];

const CONSTRAINT_SNIPPETS = [
  'Do not change public API signatures unless explicitly requested.',
  'Preserve backward compatibility for existing configs.',
  'Prefer minimal diff and avoid unrelated refactors.',
];

export function ConstraintsStep({ spec, onChange }: ConstraintsStepProps) {
  const [constraintInput, setConstraintInput] = useState('');
  const [exampleInput, setExampleInput] = useState('');

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium">Constraints</p>
        <div className="mb-2 flex flex-wrap gap-2">
          {COMMON_CONSTRAINTS.map((constraint) => (
            <Button
              key={constraint}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!spec.constraints.includes(constraint)) {
                  onChange({ constraints: [...spec.constraints, constraint] });
                }
              }}
            >
              {constraint}
            </Button>
          ))}
        </div>

        <p className="mb-2 text-sm font-medium">Snippet library</p>
        <div className="mb-2 flex flex-wrap gap-2">
          {CONSTRAINT_SNIPPETS.map((snippet) => (
            <Button
              key={snippet}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!spec.constraints.includes(snippet)) {
                  onChange({ constraints: [...spec.constraints, snippet] });
                }
              }}
            >
              Insert snippet
            </Button>
          ))}
        </div>
        <ul className="mb-2 list-disc pl-4 text-xs text-muted-foreground">
          {CONSTRAINT_SNIPPETS.map((snippet) => (
            <li key={`snippet-${snippet}`}>{snippet}</li>
          ))}
        </ul>

        <div className="flex gap-2">
          <Input
            value={constraintInput}
            placeholder="Add custom constraint"
            onChange={(event) => setConstraintInput(event.target.value)}
          />
          <Button
            type="button"
            onClick={() => {
              const value = constraintInput.trim();
              if (!value) {
                return;
              }

              onChange({ constraints: [...spec.constraints, value] });
              setConstraintInput('');
            }}
          >
            Add
          </Button>
        </div>

        <ul className="mt-2 space-y-1">
          {spec.constraints.map((constraint, index) => (
            <li key={`${constraint}-${index}`} className="flex items-center justify-between rounded border p-2 text-sm">
              <span>{constraint}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    constraints: spec.constraints.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Examples (optional)</p>
        <div className="flex gap-2">
          <Input
            value={exampleInput}
            placeholder="Add example response snippet or pattern"
            onChange={(event) => setExampleInput(event.target.value)}
          />
          <Button
            type="button"
            onClick={() => {
              const value = exampleInput.trim();
              if (!value) {
                return;
              }

              onChange({ examples: [...spec.examples, value] });
              setExampleInput('');
            }}
          >
            Add
          </Button>
        </div>

        <ul className="mt-2 space-y-1">
          {spec.examples.map((example, index) => (
            <li key={`${example}-${index}`} className="flex items-center justify-between rounded border p-2 text-sm">
              <span>{example}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    examples: spec.examples.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
