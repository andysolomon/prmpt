import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PromptExample } from '@/lib/prompt';

interface ExampleGalleryProps {
  examples: PromptExample[];
  onLoadExample: (exampleId: string) => void;
}

export function ExampleGallery({ examples, onLoadExample }: ExampleGalleryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Example Gallery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Load a curated example PromptSpec to learn the expected level of detail.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {examples.map((example) => (
            <div key={example.id} className="rounded border p-3">
              <p className="font-medium">{example.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{example.description}</p>
              <Button
                className="mt-3"
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onLoadExample(example.id)}
              >
                Load example
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
