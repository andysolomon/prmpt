import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  PromptSpec,
  createDefaultPromptSpec,
  deleteCustomPreset,
  lintPromptSpec,
  loadAllPresets,
  loadDraft,
  saveDraft,
  toCustomPreset,
  upsertCustomPreset,
} from '@/lib/prompt';

import { LintPanel } from './LintPanel';
import { PresetPicker } from './PresetPicker';
import { PreviewPanel } from './PreviewPanel';
import { PromptWizard } from './PromptWizard';
import { StepId } from './types';

interface UndoPresetState {
  presetName: string;
  previousSpec: PromptSpec;
}

function cloneSpec(spec: PromptSpec): PromptSpec {
  return JSON.parse(JSON.stringify(spec)) as PromptSpec;
}

function mergePatch(spec: PromptSpec, patch: Partial<PromptSpec>): PromptSpec {
  return {
    ...spec,
    ...patch,
    metadata: {
      ...spec.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

function getCompletion(spec: PromptSpec): Record<StepId, boolean> {
  return {
    goal: spec.goal.trim().length > 0,
    context: spec.stackTags.length > 0 || spec.contextNotes.length > 0,
    inputs: spec.inputs.length > 0,
    task: Boolean(spec.taskType),
    output: Boolean(spec.outputContract),
    constraints: spec.constraints.length > 0,
    review: spec.goal.trim().length > 0 && Boolean(spec.taskType) && Boolean(spec.outputContract),
  };
}

export function PromptBuilderPage() {
  const [spec, setSpec] = useState<PromptSpec>(() => loadDraft());
  const [step, setStep] = useState<StepId>('goal');
  const [presetRefreshToken, setPresetRefreshToken] = useState(0);
  const [undoPresetState, setUndoPresetState] = useState<UndoPresetState | null>(null);

  const presets = useMemo(() => loadAllPresets(), [presetRefreshToken]);
  const lintIssues = useMemo(() => lintPromptSpec(spec), [spec]);
  const completion = useMemo(() => getCompletion(spec), [spec]);

  useEffect(() => {
    saveDraft(spec);
  }, [spec]);

  const onSpecChange = (patch: Partial<PromptSpec>) => {
    setSpec((prev) => mergePatch(prev, patch));
  };

  const onApplyPreset = (presetId: string) => {
    const preset = presets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    const hasUserData =
      spec.goal.trim().length > 0 ||
      spec.inputs.length > 0 ||
      spec.contextNotes.length > 0 ||
      spec.constraints.length > 0;

    if (hasUserData) {
      const confirmed = window.confirm('Applying a preset will replace your current draft. Continue?');
      if (!confirmed) {
        return;
      }
    }

    setUndoPresetState({
      presetName: preset.name,
      previousSpec: cloneSpec(spec),
    });

    setSpec(mergePatch(cloneSpec(preset.spec), {}));
    setStep('goal');
  };

  const onUndoPreset = () => {
    if (!undoPresetState) {
      return;
    }

    setSpec(mergePatch(cloneSpec(undoPresetState.previousSpec), {}));
    setUndoPresetState(null);
    setStep('goal');
  };

  const onSaveCustomPreset = (name: string, description: string) => {
    upsertCustomPreset(toCustomPreset(name, description, spec));
    setPresetRefreshToken((value) => value + 1);
  };

  const onDeleteCustom = (id: string) => {
    deleteCustomPreset(id);
    setPresetRefreshToken((value) => value + 1);
  };

  const onReset = () => {
    const confirmed = window.confirm('Reset current draft to defaults?');
    if (!confirmed) {
      return;
    }

    setSpec(createDefaultPromptSpec());
    setUndoPresetState(null);
    setStep('goal');
  };

  return (
    <div className="space-y-4">
      {undoPresetState && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-blue-300 bg-blue-50 p-3 text-sm">
          <span>Applied preset: {undoPresetState.presetName}</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onUndoPreset}>
              Undo
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setUndoPresetState(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <PresetPicker
        presets={presets}
        onApplyPreset={onApplyPreset}
        onSaveCustomPreset={onSaveCustomPreset}
        onDeleteCustomPreset={onDeleteCustom}
        spec={spec}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
        <PromptWizard
          step={step}
          spec={spec}
          completion={completion}
          lintIssues={lintIssues}
          onStepChange={setStep}
          onSpecChange={onSpecChange}
          onReset={onReset}
          onSavePreset={() => onSaveCustomPreset(spec.title || 'Untitled preset', 'Saved from wizard review step.')}
        />

        <div className="space-y-4">
          <PreviewPanel spec={spec} />
          <LintPanel issues={lintIssues} />
        </div>
      </div>
    </div>
  );
}
