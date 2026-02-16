import { z } from 'zod';

export const UiBuilderTypeSchema = z.enum(['layout', 'styling', 'components', 'page']);

export const UiPromptSpecSchema = z.object({
  builderType: UiBuilderTypeSchema,
  title: z.string().trim().min(1),
  stack: z.object({
    framework: z.enum(['nextjs', 'react', 'vite', 'other']).optional(),
    uiLib: z.enum(['shadcn', 'mui', 'chakra', 'other']).optional(),
    styling: z.enum(['tailwind', 'css', 'other']).optional(),
  }),
  layout: z
    .object({
      pagePattern: z.enum(['dashboard', 'list-detail', 'settings', 'wizard']).optional(),
      navigation: z.enum(['sidebar', 'top-nav', 'tabs']).optional(),
      responsiveness: z.enum(['mobile-first', 'desktop-first']).optional(),
      dataPresentation: z.enum(['table', 'cards', 'mixed']).optional(),
    })
    .optional(),
  styling: z
    .object({
      vibe: z.enum(['minimal', 'modern', 'playful']).optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
      density: z.enum(['compact', 'comfortable']).optional(),
    })
    .optional(),
  components: z
    .object({
      selected: z.array(z.string()).default([]),
      interactions: z.array(z.string()).default([]),
    })
    .optional(),
  page: z
    .object({
      screenName: z.string().trim().optional(),
      route: z.string().trim().optional(),
      actions: z.array(z.string()).default([]),
      outputMode: z.enum(['full-files', 'patch-diff']).optional(),
    })
    .optional(),
  requirements: z
    .object({
      a11y: z.boolean().default(true),
      states: z.boolean().default(true),
      tests: z.boolean().default(true),
    })
    .default({
      a11y: true,
      states: true,
      tests: true,
    }),
});

export type UiBuilderType = z.infer<typeof UiBuilderTypeSchema>;
export type UiPromptSpec = z.infer<typeof UiPromptSpecSchema>;

export function createDefaultUiPromptSpec(builderType: UiBuilderType): UiPromptSpec {
  return {
    builderType,
    title: `UI ${builderType[0].toUpperCase()}${builderType.slice(1)} Prompt`,
    stack: {
      framework: 'nextjs',
      uiLib: 'shadcn',
      styling: 'tailwind',
    },
    layout:
      builderType === 'layout'
        ? {
            pagePattern: 'dashboard',
            navigation: 'sidebar',
            responsiveness: 'mobile-first',
            dataPresentation: 'mixed',
          }
        : undefined,
    styling:
      builderType === 'styling'
        ? {
            vibe: 'modern',
            theme: 'system',
            density: 'comfortable',
          }
        : undefined,
    components:
      builderType === 'components'
        ? {
            selected: ['table', 'form'],
            interactions: ['create', 'edit', 'search'],
          }
        : undefined,
    page:
      builderType === 'page'
        ? {
            screenName: 'Settings Page',
            route: '/settings',
            actions: ['create', 'edit'],
            outputMode: 'patch-diff',
          }
        : undefined,
    requirements: {
      a11y: true,
      states: true,
      tests: true,
    },
  };
}
