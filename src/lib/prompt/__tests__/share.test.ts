import { createDefaultPromptSpec } from '@/lib/prompt';
import { decodePromptSpecParam, encodePromptSpecParam } from '@/lib/prompt/share';

describe('share encoding', () => {
  it('round-trips prompt spec', () => {
    const spec = createDefaultPromptSpec();
    spec.title = 'Share me';
    spec.goal = 'Implement sprint 6';

    const encoded = encodePromptSpecParam(spec);
    const decoded = decodePromptSpecParam(encoded);

    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.spec.goal).toBe('Implement sprint 6');
      expect(decoded.spec.title).toBe('Share me');
    }
  });

  it('rejects invalid payload', () => {
    const decoded = decodePromptSpecParam('not-valid');
    expect(decoded.ok).toBe(false);
  });
});
