import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  PROMPT_EXAMPLES,
  PromptSpec,
  clearAllPromptLocalData,
  clearCustomPresets,
  clearDraft,
  createShareUrl,
  createDefaultPromptSpec,
  deleteCustomPreset,
  formatPromptSpecJson,
  lintPromptSpec,
  loadAllPresets,
  loadDraft,
  parsePromptSpecFromUrl,
  parsePromptSpecJson,
  saveDraft,
  toCustomPreset,
  upsertCustomPreset,
} from '@/lib/prompt';

import { ExampleGallery } from './ExampleGallery';
import { LintPanel } from './LintPanel';
import { PortabilityPanel } from './PortabilityPanel';
import { PresetPicker } from './PresetPicker';
import { PreviewPanel } from './PreviewPanel';
import { PromptWizard } from './PromptWizard';
import { StepId, WIZARD_STEPS } from './types';

interface UndoPresetState {
  presetName: string;
  previousSpec: PromptSpec;
}

function cloneSpec(spec: PromptSpec): PromptSpec {
  return JSON.parse(JSON.stringify(spec)) as PromptSpec;
}

function hasUserData(spec: PromptSpec): boolean {
  return (
    spec.goal.trim().length > 0 ||
    spec.inputs.length > 0 ||
    spec.contextNotes.length > 0 ||
    spec.constraints.length > 0
  );
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
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isTyping || !event.altKey) {
        return;
      }

      const currentIndex = WIZARD_STEPS.findIndex((item) => item.id === step);
      if (currentIndex < 0) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = Math.min(WIZARD_STEPS.length - 1, currentIndex + 1);
        setStep(WIZARD_STEPS[nextIndex].id);
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const prevIndex = Math.max(0, currentIndex - 1);
        setStep(WIZARD_STEPS[prevIndex].id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

  useEffect(() => {
    saveDraft(spec);
  }, [spec]);

  useEffect(() => {
    const parsed = parsePromptSpecFromUrl();
    if (!parsed.ok) {
      return;
    }

    const shouldApply = !hasUserData(spec) || window.confirm('Load PromptSpec from shared URL payload?');
    if (!shouldApply) {
      return;
    }

    setSpec(mergePatch(cloneSpec(parsed.spec), {}));
    setStep('goal');
  }, []);

  const onSpecChange = (patch: Partial<PromptSpec>) => {
    setSpec((prev) => mergePatch(prev, patch));
  };

  const onApplyPreset = (presetId: string) => {
    const preset = presets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    if (hasUserData(spec)) {
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
    const confirmed = window.confirm('Delete this custom preset?');
    if (!confirmed) {
      return;
    }

    deleteCustomPreset(id);
    setPresetRefreshToken((value) => value + 1);
  };

  const onReset = () => {
    const confirmed = window.confirm('Clear current draft and start a new prompt?');
    if (!confirmed) {
      return;
    }

    clearDraft();
    setSpec(createDefaultPromptSpec());
    setUndoPresetState(null);
    setStep('goal');
  };

  const onLoadExample = (exampleId: string) => {
    const example = PROMPT_EXAMPLES.find((item) => item.id === exampleId);
    if (!example) {
      return;
    }

    if (hasUserData(spec)) {
      const confirmed = window.confirm('Loading an example will replace your current draft. Continue?');
      if (!confirmed) {
        return;
      }
    }

    setSpec(mergePatch(cloneSpec(example.spec), {}));
    setUndoPresetState(null);
    setStep('goal');
  };

  const onExportJson = () => {
    const json = formatPromptSpecJson(spec);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(spec.title || 'prompt-spec').toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onImportJsonFile = async (file: File) => {
    const text = await file.text();
    const parsed = parsePromptSpecJson(text);

    if (!parsed.ok) {
      window.alert(`Unable to import PromptSpec JSON: ${parsed.error}`);
      return;
    }

    if (hasUserData(spec)) {
      const confirmed = window.confirm('Importing JSON will replace your current draft. Continue?');
      if (!confirmed) {
        return;
      }
    }

    setSpec(mergePatch(cloneSpec(parsed.value), {}));
    setStep('goal');
    setUndoPresetState(null);
  };

  const onCopyShareUrl = async () => {
    const shareUrl = createShareUrl(spec);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      return;
    }

    window.prompt('Copy this share URL', shareUrl);
  };

  const onLoadFromUrl = () => {
    const parsed = parsePromptSpecFromUrl();
    if (!parsed.ok) {
      window.alert(parsed.error);
      return;
    }

    if (hasUserData(spec)) {
      const confirmed = window.confirm('Loading from URL will replace your current draft. Continue?');
      if (!confirmed) {
        return;
      }
    }

    setSpec(mergePatch(cloneSpec(parsed.spec), {}));
    setStep('goal');
    setUndoPresetState(null);
  };

  const onDeleteAllCustomPresets = () => {
    clearCustomPresets();
    setPresetRefreshToken((value) => value + 1);
  };

  const onClearAllLocalData = () => {
    clearAllPromptLocalData();
    setSpec(createDefaultPromptSpec());
    setUndoPresetState(null);
    setPresetRefreshToken((value) => value + 1);
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
      <div className="flex items-center justify-end">
        <Button type="button" variant="outline" onClick={onReset}>
          New Prompt
        </Button>
      </div>
      <PortabilityPanel
        onExportJson={onExportJson}
        onImportJsonFile={onImportJsonFile}
        onCopyShareUrl={onCopyShareUrl}
        onLoadFromUrl={onLoadFromUrl}
        onDeleteAllCustomPresets={onDeleteAllCustomPresets}
        onClearAllLocalData={onClearAllLocalData}
      />
      <ExampleGallery examples={PROMPT_EXAMPLES} onLoadExample={onLoadExample} />
      <p className="text-xs text-muted-foreground">
        Shortcut: <code>Alt + ← / Alt + →</code> navigates wizard steps.
      </p>

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
