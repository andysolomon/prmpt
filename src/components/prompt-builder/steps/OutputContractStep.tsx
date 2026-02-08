import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { outputModes, PromptSpec } from '@/lib/prompt';

interface OutputContractStepProps {
  spec: PromptSpec;
  onChange: (patch: Partial<PromptSpec>) => void;
}

export function OutputContractStep({ spec, onChange }: OutputContractStepProps) {
  const [requirementInput, setRequirementInput] = useState('');

  const outputContract = spec.outputContract ?? {
    mode: 'plan' as const,
    requirements: [],
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Output mode</label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={outputContract.mode}
          onChange={(event) =>
            onChange({
              outputContract: {
                ...outputContract,
                mode: event.target.value as (typeof outputModes)[number],
              },
            })
          }
        >
          {outputModes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Requirements</label>
        <div className="flex gap-2">
          <Input
            placeholder="Example: include file paths and test commands"
            value={requirementInput}
            onChange={(event) => setRequirementInput(event.target.value)}
          />
          <Button
            type="button"
            onClick={() => {
              const value = requirementInput.trim();
              if (!value) {
                return;
              }

              onChange({
                outputContract: {
                  ...outputContract,
                  requirements: [...outputContract.requirements, value],
                },
              });
              setRequirementInput('');
            }}
          >
            Add
          </Button>
        </div>

        <ul className="mt-2 space-y-1">
          {outputContract.requirements.map((requirement, index) => (
            <li key={`${requirement}-${index}`} className="flex items-center justify-between rounded border p-2 text-sm">
              <span>{requirement}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange({
                    outputContract: {
                      ...outputContract,
                      requirements: outputContract.requirements.filter((_, itemIndex) => itemIndex !== index),
                    },
                  });
                }}
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
