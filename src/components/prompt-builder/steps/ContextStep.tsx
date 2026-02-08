import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PromptSpec } from '@/lib/prompt';

interface ContextStepProps {
  spec: PromptSpec;
  onChange: (patch: Partial<PromptSpec>) => void;
}

const COMMON_STACK_TAGS = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Postgres',
  'Salesforce',
  'Apex',
  'LWC',
  'shadcn/ui',
];

export function ContextStep({ spec, onChange }: ContextStepProps) {
  const [stackInput, setStackInput] = useState('');
  const [contextInput, setContextInput] = useState('');

  const addStackTag = (value: string) => {
    const normalized = value.trim();
    if (!normalized || spec.stackTags.includes(normalized)) {
      return;
    }

    onChange({ stackTags: [...spec.stackTags, normalized] });
  };

  const addContextNote = (value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }

    onChange({ contextNotes: [...spec.contextNotes, normalized] });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium">Stack tags</p>
        <div className="mb-2 flex flex-wrap gap-2">
          {COMMON_STACK_TAGS.map((tag) => (
            <Button key={tag} type="button" variant="outline" size="sm" onClick={() => addStackTag(tag)}>
              {tag}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add custom stack tag"
            value={stackInput}
            onChange={(event) => setStackInput(event.target.value)}
          />
          <Button
            type="button"
            onClick={() => {
              addStackTag(stackInput);
              setStackInput('');
            }}
          >
            Add
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {spec.stackTags.map((tag) => (
            <button
              key={tag}
              className="rounded border bg-muted px-2 py-1 text-xs"
              onClick={() => onChange({ stackTags: spec.stackTags.filter((item) => item !== tag) })}
              type="button"
            >
              {tag} x
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Context notes</p>
        <div className="flex gap-2">
          <Textarea
            rows={3}
            placeholder="Add environment details, architecture constraints, or known issues"
            value={contextInput}
            onChange={(event) => setContextInput(event.target.value)}
          />
          <Button
            type="button"
            onClick={() => {
              addContextNote(contextInput);
              setContextInput('');
            }}
          >
            Add
          </Button>
        </div>
        <ul className="mt-2 space-y-2">
          {spec.contextNotes.map((note, index) => (
            <li key={`${note}-${index}`} className="rounded border p-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <span>{note}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange({
                      contextNotes: spec.contextNotes.filter((_, itemIndex) => itemIndex !== index),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
