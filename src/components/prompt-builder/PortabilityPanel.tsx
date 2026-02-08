import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PortabilityPanelProps {
  onExportJson: () => void;
  onImportJsonFile: (file: File) => Promise<void>;
  onCopyShareUrl: () => Promise<void>;
  onLoadFromUrl: () => void;
  onDeleteAllCustomPresets: () => void;
  onClearAllLocalData: () => void;
}

export function PortabilityPanel({
  onExportJson,
  onImportJsonFile,
  onCopyShareUrl,
  onLoadFromUrl,
  onDeleteAllCustomPresets,
  onClearAllLocalData,
}: PortabilityPanelProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState('');
  const [confirmToken, setConfirmToken] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Import / Export / Share</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="space-y-3 rounded border border-red-300 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">Danger Zone</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                const confirmed = window.confirm(
                  'Delete all custom presets? Built-in presets will remain.'
                );
                if (!confirmed) {
                  return;
                }

                onDeleteAllCustomPresets();
                setStatus('Deleted all custom presets.');
              }}
            >
              Delete All Custom Presets
            </Button>
          </div>

          <div className="space-y-2 rounded border border-red-200 bg-white p-3">
            <p className="text-sm text-red-900">
              Clear all local data (draft + custom presets). Type <code>RESET</code> to enable.
            </p>
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="Type RESET"
              value={confirmToken}
              onChange={(event) => setConfirmToken(event.target.value)}
            />
            <Button
              type="button"
              variant="destructive"
              disabled={confirmToken !== 'RESET'}
              onClick={() => {
                const confirmed = window.confirm(
                  'Permanently clear all local prompt data? This cannot be undone.'
                );
                if (!confirmed) {
                  return;
                }

                onClearAllLocalData();
                setConfirmToken('');
                setStatus('Cleared all local prompt data.');
              }}
            >
              Permanently Clear Local Data
            </Button>
          </div>
        </div>

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
