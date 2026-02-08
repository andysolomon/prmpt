import { useEffect, useMemo, useState } from 'react';

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

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

export function PreviewPanel({ spec }: PreviewPanelProps) {
  const [tab, setTab] = useState<PreviewTab>('chat');
  const [copied, setCopied] = useState(false);

  const chat = useMemo(() => formatChatText(spec), [spec]);
  const api = useMemo(() => formatApiMessages(spec), [spec]);
  const json = useMemo(() => formatPromptSpecJson(spec), [spec]);

  const activeContent =
    tab === 'chat' ? chat : tab === 'api' ? JSON.stringify(api, null, 2) : json;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        copyText(activeContent);
        setCopied(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeContent]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

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

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            copyText(activeContent);
            setCopied(true);
          }}
        >
          Copy {tab.toUpperCase()}
        </Button>
        <p className="text-xs text-muted-foreground">
          Shortcut: <code>Ctrl/Cmd + Shift + C</code> copies the active export.
          {copied ? ' Copied.' : ''}
        </p>
      </CardContent>
    </Card>
  );
}
