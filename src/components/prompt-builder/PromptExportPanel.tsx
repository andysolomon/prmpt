import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { PromptSpec, formatApiMessages, formatChatText, formatPromptSpecJson } from '@/lib/prompt';

type ExportTab = 'chat' | 'api' | 'json';

interface PromptExportPanelProps {
  spec: PromptSpec;
  title?: string;
  showDownload?: boolean;
}

function copyText(value: string): void {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    void navigator.clipboard.writeText(value);
  }
}

function downloadJson(spec: PromptSpec): void {
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
}

export function PromptExportPanel({ spec, title = 'Export', showDownload = false }: PromptExportPanelProps) {
  const [tab, setTab] = useState<ExportTab>('chat');
  const [copied, setCopied] = useState(false);

  const chat = useMemo(() => formatChatText(spec), [spec]);
  const api = useMemo(() => formatApiMessages(spec), [spec]);
  const json = useMemo(() => formatPromptSpecJson(spec), [spec]);

  const activeContent = tab === 'chat' ? chat : tab === 'api' ? JSON.stringify(api, null, 2) : json;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{title}</p>
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

      <div className="rounded border bg-muted p-3">
        <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words text-xs text-foreground">{activeContent}</pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            copyText(activeContent);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
        >
          Copy {tab.toUpperCase()}
        </Button>
        {showDownload && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (tab === 'json') {
                downloadJson(spec);
                return;
              }
              const blob = new Blob([activeContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${(spec.title || 'prompt-export').toLowerCase().replace(/\s+/g, '-')}-${tab}.txt`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
          >
            Download
          </Button>
        )}
      </div>
      {copied && <p className="text-xs text-muted-foreground">Copied.</p>}
    </div>
  );
}
