import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UiBuilderType } from '@/lib/ui-builder';

const BUILDER_CARDS: Array<{ type: UiBuilderType; description: string }> = [
  { type: 'layout', description: 'Define page pattern, navigation, and responsiveness.' },
  { type: 'styling', description: 'Choose visual direction, theme, and density.' },
  { type: 'components', description: 'Specify component mix and interactions.' },
  { type: 'page', description: 'Define one concrete screen route and actions.' },
];

export function UiBuilderLandingPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">UI Prompt Builder</h1>
        <p className="text-sm text-muted-foreground">
          Choose a builder type and generate a deterministic prompt through the UiPromptSpec bridge.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {BUILDER_CARDS.map((card) => (
          <Card key={card.type}>
            <CardHeader>
              <CardTitle className="capitalize">{card.type} Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <p className="text-xs text-muted-foreground">Output type: Prompt</p>
              <Button asChild>
                <Link to={`/create/ui/${card.type}`}>Start</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
