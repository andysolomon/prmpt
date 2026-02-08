import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PromptSpec,
  formatApiMessages,
  formatChatText,
  formatPromptSpecJson,
} from '@/lib/prompt';

type PreviewTab = 'chat' | 'api' | 'json';

interface PreviewPanelProps {
  spec: PromptSpec;
}

function copyText(value: string): void {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    void navigator.clipboard.writeText(value);
  }
}

export function PreviewPanel({ spec }: PreviewPanelProps) {
  const [tab, setTab] = useState<PreviewTab>('chat');

  const chat = useMemo(() => formatChatText(spec), [spec]);
  const api = useMemo(() => formatApiMessages(spec), [spec]);
  const json = useMemo(() => formatPromptSpecJson(spec), [spec]);

  const activeContent =
    tab === 'chat' ? chat : tab === 'api' ? JSON.stringify(api, null, 2) : json;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={tab === 'chat' ? 'default' : 'outline'} size="sm" onClick={() => setTab('chat')}>
            Chat Prompt
          </Button>
          <Button type="button" variant={tab === 'api' ? 'default' : 'outline'} size="sm" onClick={() => setTab('api')}>
            API Messages
          </Button>
          <Button type="button" variant={tab === 'json' ? 'default' : 'outline'} size="sm" onClick={() => setTab('json')}>
            JSON
          </Button>
        </div>

        <div className="rounded border bg-slate-50 p-3">
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words text-xs">
            {activeContent}
          </pre>
        </div>

        <Button type="button" variant="outline" onClick={() => copyText(activeContent)}>
          Copy {tab.toUpperCase()}
        </Button>
      </CardContent>
    </Card>
  );
}
