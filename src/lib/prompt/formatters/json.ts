import { createDefaultPromptSpec } from '../defaults';
import { ParseResult, PromptSpec, parsePromptSpec } from '../schema';

export function formatPromptSpecJson(spec: PromptSpec): string {
  return JSON.stringify(spec, null, 2);
}

export function parsePromptSpecJson(raw: string): ParseResult<PromptSpec> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsePromptSpec(parsed);
  } catch {
    return {
      ok: false,
      error: 'Invalid JSON input.',
    };
  }
}

export function parsePromptSpecJsonWithFallback(raw: string): PromptSpec {
  const result = parsePromptSpecJson(raw);
  return result.ok ? result.value : createDefaultPromptSpec();
}
