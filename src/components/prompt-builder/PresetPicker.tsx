import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PromptPreset, PromptSpec } from '@/lib/prompt';

interface PresetPickerProps {
  presets: PromptPreset[];
  onApplyPreset: (presetId: string) => void;
  onSaveCustomPreset: (name: string, description: string) => void;
  onDeleteCustomPreset: (presetId: string) => void;
  spec: PromptSpec;
}

export function PresetPicker({
  presets,
  onApplyPreset,
  onSaveCustomPreset,
  onDeleteCustomPreset,
  spec,
}: PresetPickerProps) {
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const customPresets = useMemo(() => presets.filter((preset) => !preset.builtIn), [presets]);

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="text-sm font-medium">Presets</p>
      <div className="flex gap-2">
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={selectedPresetId}
          onChange={(event) => setSelectedPresetId(event.target.value)}
        >
          <option value="">Select a preset</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={() => {
            if (selectedPresetId) {
              onApplyPreset(selectedPresetId);
            }
          }}
        >
          Apply
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <Input
          placeholder="Custom preset name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const presetName = name.trim();
            const presetDescription = description.trim() || `Custom preset for ${spec.title || 'prompt'}`;
            if (!presetName) {
              return;
            }

            onSaveCustomPreset(presetName, presetDescription);
            setName('');
            setDescription('');
          }}
        >
          Save current as preset
        </Button>
      </div>

      {customPresets.length > 0 && (
        <div className="space-y-1">
          {customPresets.map((preset) => (
            <div key={preset.id} className="flex items-center justify-between rounded border p-2 text-sm">
              <span>{preset.name}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => onDeleteCustomPreset(preset.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
