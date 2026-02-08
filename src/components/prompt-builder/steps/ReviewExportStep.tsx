import { Button } from '@/components/ui/button';
import { PromptSpec } from '@/lib/prompt';

interface ReviewExportStepProps {
  spec: PromptSpec;
  onReset: () => void;
  onSavePreset: () => void;
}

export function ReviewExportStep({ spec, onReset, onSavePreset }: ReviewExportStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review lint and preview panels, then copy your preferred output format.
      </p>

      <div className="rounded border p-4 text-sm">
        <p>
          <strong>Title:</strong> {spec.title || 'Untitled prompt'}
        </p>
        <p>
          <strong>Goal:</strong> {spec.goal || 'Missing goal'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onSavePreset}>
          Save as custom preset
        </Button>
        <Button type="button" variant="destructive" onClick={onReset}>
          Clear draft
        </Button>
      </div>
    </div>
  );
}
