import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PromptBuilderPage } from '@/components/prompt-builder';
import { getItem, touchLastUsed } from '@/lib/library';
import { saveDraft } from '@/lib/prompt';

export function PromptBuilderRoutePage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const itemId = searchParams.get('itemId');
    if (!itemId) {
      return;
    }

    const item = getItem(itemId);
    if (!item || item.type !== 'prompt') {
      return;
    }

    saveDraft(item.payload.promptSpec);
    touchLastUsed(item.id);
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prompt Builder</h1>
        <p className="text-sm text-muted-foreground">Build structured prompts with lint and export tools.</p>
      </div>
      <PromptBuilderPage />
    </div>
  );
}
