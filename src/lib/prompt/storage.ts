import { createDefaultPromptSpec, touchPromptSpec } from './defaults';
import { BUILT_IN_PRESETS } from './presets';
import { PromptPreset, PromptPresetSchema, PromptSpec, PromptSpecSchema } from './schema';

const DRAFT_STORAGE_KEY = 'prompt-builder:draft:v1';
const CUSTOM_PRESETS_STORAGE_KEY = 'prompt-builder:custom-presets:v1';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadDraft(): PromptSpec {
  if (!hasStorage()) {
    return createDefaultPromptSpec();
  }

  const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) {
    return createDefaultPromptSpec();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = PromptSpecSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }
  } catch {
    // fallback below
  }

  return createDefaultPromptSpec();
}

export function saveDraft(spec: PromptSpec): void {
  if (!hasStorage()) {
    return;
  }

  const valid = PromptSpecSchema.safeParse(spec);
  if (!valid.success) {
    return;
  }

  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(touchPromptSpec(valid.data)));
}

export function clearDraft(): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}

export function loadCustomPresets(): PromptPreset[] {
  if (!hasStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => PromptPresetSchema.safeParse(item))
      .filter((result): result is { success: true; data: PromptPreset } => result.success)
      .map((result) => result.data)
      .filter((preset) => !preset.builtIn);
  } catch {
    return [];
  }
}

function saveCustomPresets(presets: PromptPreset[]): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(presets));
}

export function upsertCustomPreset(preset: PromptPreset): void {
  if (preset.builtIn) {
    return;
  }

  const customPresets = loadCustomPresets();
  const index = customPresets.findIndex((item) => item.id === preset.id);

  if (index === -1) {
    customPresets.push(preset);
  } else {
    customPresets[index] = preset;
  }

  saveCustomPresets(customPresets);
}

export function deleteCustomPreset(id: string): void {
  const customPresets = loadCustomPresets().filter((preset) => preset.id !== id);
  saveCustomPresets(customPresets);
}

export function loadAllPresets(): PromptPreset[] {
  return [...BUILT_IN_PRESETS, ...loadCustomPresets()];
}
