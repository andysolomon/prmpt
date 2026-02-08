import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PortabilityPanelProps {
  onExportJson: () => void;
  onImportJsonFile: (file: File) => Promise<void>;
  onCopyShareUrl: () => Promise<void>;
  onLoadFromUrl: () => void;
}

export function PortabilityPanel({
  onExportJson,
  onImportJsonFile,
  onCopyShareUrl,
  onLoadFromUrl,
}: PortabilityPanelProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Import / Export / Share</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onExportJson}>
            Download PromptSpec JSON
          </Button>
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
            Upload PromptSpec JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await onCopyShareUrl();
              setStatus('Share URL copied to clipboard.');
            }}
          >
            Copy share URL
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onLoadFromUrl();
              setStatus('Loaded PromptSpec from URL when payload exists.');
            }}
          >
            Load from URL
          </Button>
        </div>

        {status && <p className="text-xs text-muted-foreground">{status}</p>}

        <p className="text-xs text-muted-foreground">
          URL sharing uses an encoded `pb` query parameter. JSON import validates schema before replacing draft.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            await onImportJsonFile(file);
            event.target.value = '';
            setStatus('Imported PromptSpec JSON.');
          }}
        />
      </CardContent>
    </Card>
  );
}
