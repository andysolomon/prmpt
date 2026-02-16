import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatChatText } from '@/lib/prompt';
import { createPromptLibraryItemFromPromptSpec, upsertItem } from '@/lib/library';
import {
  UiBuilderType,
  UiBuilderTypeSchema,
  UiPromptSpec,
  createDefaultUiPromptSpec,
  mapUiPromptSpecToPromptSpec,
} from '@/lib/ui-builder';

function stackSelect(
  label: string,
  value: string | undefined,
  options: string[],
  onChange: (value: string) => void
) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium">{label}</label>
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function UiBuilderScaffoldPage() {
  const params = useParams();
  const navigate = useNavigate();
  const parsedType = UiBuilderTypeSchema.safeParse(params.builderType);
  const builderType: UiBuilderType = parsedType.success ? parsedType.data : 'layout';

  const [uiSpec, setUiSpec] = useState<UiPromptSpec>(() => createDefaultUiPromptSpec(builderType));

  const promptSpec = useMemo(() => mapUiPromptSpecToPromptSpec(uiSpec), [uiSpec]);
  const promptText = useMemo(() => formatChatText(promptSpec), [promptSpec]);

  const saveToLibrary = () => {
    const tags = ['ui', `ui:${builderType}`];
    if (uiSpec.stack.framework) {
      tags.push(uiSpec.stack.framework);
    }
    if (uiSpec.stack.uiLib) {
      tags.push(uiSpec.stack.uiLib);
    }

    const item = createPromptLibraryItemFromPromptSpec(uiSpec.title, promptSpec, tags, {
      source: 'ui-builder',
      uiPromptSpec: uiSpec,
    });
    upsertItem(item);
    navigate('/library');
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{builderType} Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={uiSpec.title}
              onChange={(event) => setUiSpec((current) => ({ ...current, title: event.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {stackSelect('Framework', uiSpec.stack.framework, ['nextjs', 'react', 'vite', 'other'], (value) =>
              setUiSpec((current) => ({ ...current, stack: { ...current.stack, framework: value as UiPromptSpec['stack']['framework'] } }))
            )}
            {stackSelect('UI Lib', uiSpec.stack.uiLib, ['shadcn', 'mui', 'chakra', 'other'], (value) =>
              setUiSpec((current) => ({ ...current, stack: { ...current.stack, uiLib: value as UiPromptSpec['stack']['uiLib'] } }))
            )}
            {stackSelect('Styling', uiSpec.stack.styling, ['tailwind', 'css', 'other'], (value) =>
              setUiSpec((current) => ({ ...current, stack: { ...current.stack, styling: value as UiPromptSpec['stack']['styling'] } }))
            )}
          </div>

          {builderType === 'layout' && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {stackSelect('Page Pattern', uiSpec.layout?.pagePattern, ['dashboard', 'list-detail', 'settings', 'wizard'], (value) =>
                setUiSpec((current) => ({
                  ...current,
                  layout: { ...current.layout, pagePattern: value as NonNullable<UiPromptSpec['layout']>['pagePattern'] },
                }))
              )}
              {stackSelect('Navigation', uiSpec.layout?.navigation, ['sidebar', 'top-nav', 'tabs'], (value) =>
                setUiSpec((current) => ({
                  ...current,
                  layout: { ...current.layout, navigation: value as NonNullable<UiPromptSpec['layout']>['navigation'] },
                }))
              )}
            </div>
          )}

          {builderType === 'styling' && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {stackSelect('Vibe', uiSpec.styling?.vibe, ['minimal', 'modern', 'playful'], (value) =>
                setUiSpec((current) => ({
                  ...current,
                  styling: { ...current.styling, vibe: value as NonNullable<UiPromptSpec['styling']>['vibe'] },
                }))
              )}
              {stackSelect('Theme', uiSpec.styling?.theme, ['light', 'dark', 'system'], (value) =>
                setUiSpec((current) => ({
                  ...current,
                  styling: { ...current.styling, theme: value as NonNullable<UiPromptSpec['styling']>['theme'] },
                }))
              )}
              {stackSelect('Density', uiSpec.styling?.density, ['compact', 'comfortable'], (value) =>
                setUiSpec((current) => ({
                  ...current,
                  styling: { ...current.styling, density: value as NonNullable<UiPromptSpec['styling']>['density'] },
                }))
              )}
            </div>
          )}

          {builderType === 'components' && (
            <div>
              <label className="mb-1 block text-sm font-medium">Components (comma separated)</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={(uiSpec.components?.selected ?? []).join(', ')}
                onChange={(event) =>
                  setUiSpec((current) => ({
                    ...current,
                    components: {
                      interactions: current.components?.interactions ?? [],
                      selected: event.target.value
                        .split(',')
                        .map((value) => value.trim())
                        .filter(Boolean),
                    },
                  }))
                }
              />
            </div>
          )}

          {builderType === 'page' && (
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Screen name</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={uiSpec.page?.screenName ?? ''}
                  onChange={(event) =>
                    setUiSpec((current) => ({
                      ...current,
                      page: {
                        screenName: event.target.value,
                        route: current.page?.route ?? '',
                        actions: current.page?.actions ?? [],
                        outputMode: current.page?.outputMode,
                      },
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Route</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={uiSpec.page?.route ?? ''}
                  onChange={(event) =>
                    setUiSpec((current) => ({
                      ...current,
                      page: {
                        screenName: current.page?.screenName ?? '',
                        route: event.target.value,
                        actions: current.page?.actions ?? [],
                        outputMode: current.page?.outputMode,
                      },
                    }))
                  }
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveToLibrary}>Save to Library</Button>
            <Button
              variant="outline"
              onClick={() => {
                if (navigator.clipboard) {
                  void navigator.clipboard.writeText(promptText);
                }
              }}
            >
              Copy Prompt
            </Button>
            <Button asChild variant="outline">
              <Link to="/create/ui">Back</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prompt Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap rounded border bg-slate-50 p-3 text-xs">{promptText}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
