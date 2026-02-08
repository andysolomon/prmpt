import { renderToString } from 'react-dom/server';

import { PromptBuilderPage } from '@/components/prompt-builder/PromptBuilderPage';

describe('PromptBuilderPage', () => {
  it('renders key wizard labels', () => {
    const html = renderToString(<PromptBuilderPage />);

    expect(html).toContain('Steps');
    expect(html).toContain('Goal');
    expect(html).toContain('Context/Stack');
    expect(html).toContain('Preview');
    expect(html).toContain('Lint');
  });
});
