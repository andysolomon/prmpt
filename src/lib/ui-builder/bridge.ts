import { createDefaultPromptSpec, PromptSpec } from '@/lib/prompt';

import { UiPromptSpec } from './schema';

function toTitleCase(value: string): string {
  return value
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((token) => token[0].toUpperCase() + token.slice(1))
    .join(' ');
}

export function mapUiPromptSpecToPromptSpec(uiSpec: UiPromptSpec): PromptSpec {
  const spec = createDefaultPromptSpec();
  const sections: string[] = [];

  spec.title = uiSpec.title.trim();
  spec.taskType = 'implement';
  spec.stackTags = [
    uiSpec.stack.framework,
    uiSpec.stack.uiLib,
    uiSpec.stack.styling,
    `ui:${uiSpec.builderType}`,
  ].filter((item): item is string => Boolean(item));

  sections.push(`Build a ${uiSpec.builderType} focused UI implementation prompt.`);

  if (uiSpec.layout) {
    sections.push(
      `Layout: ${[
        uiSpec.layout.pagePattern,
        uiSpec.layout.navigation,
        uiSpec.layout.responsiveness,
        uiSpec.layout.dataPresentation,
      ]
        .filter(Boolean)
        .join(', ')}`
    );
  }

  if (uiSpec.styling) {
    sections.push(
      `Styling: ${[uiSpec.styling.vibe, uiSpec.styling.theme, uiSpec.styling.density]
        .filter(Boolean)
        .join(', ')}`
    );
  }

  if (uiSpec.components) {
    sections.push(`Components: ${(uiSpec.components.selected ?? []).join(', ') || 'none provided'}`);
    if (uiSpec.components.interactions && uiSpec.components.interactions.length > 0) {
      sections.push(`Interactions: ${uiSpec.components.interactions.join(', ')}`);
    }
  }

  if (uiSpec.page) {
    sections.push(
      `Page: ${[
        uiSpec.page.screenName,
        uiSpec.page.route,
        uiSpec.page.actions?.length ? `actions(${uiSpec.page.actions.join(', ')})` : undefined,
      ]
        .filter(Boolean)
        .join(' | ')}`
    );
  }

  spec.goal = sections.join('\n');

  const requirements: string[] = ['Provide file paths for all changed files.'];
  if (uiSpec.requirements.a11y) {
    requirements.push('Include keyboard navigation, focus states, and semantic HTML accessibility checks.');
  }
  if (uiSpec.requirements.states) {
    requirements.push('Handle loading, empty, and error states in the UI implementation.');
  }
  if (uiSpec.requirements.tests) {
    requirements.push('Include component/unit tests for changed UI behavior.');
  }

  spec.outputContract = {
    mode: uiSpec.page?.outputMode === 'full-files' ? 'full_files' : 'patch_diff',
    requirements,
  };

  spec.constraints = [
    'Use TypeScript strict mode patterns.',
    'Keep changes scoped to requested UI builder goal.',
    `Builder Type: ${toTitleCase(uiSpec.builderType)}`,
  ];

  spec.contextNotes = [
    `Framework: ${toTitleCase(uiSpec.stack.framework ?? 'other')}`,
    `UI Library: ${toTitleCase(uiSpec.stack.uiLib ?? 'other')}`,
    `Styling: ${toTitleCase(uiSpec.stack.styling ?? 'other')}`,
  ];

  return spec;
}
