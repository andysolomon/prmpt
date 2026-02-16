import { createDefaultPromptSpec, PromptPresetSchema, PromptSpecSchema } from '@/lib/prompt';
import { UiPromptSpec } from '@/lib/ui-builder';

import {
  LibraryItem,
  LibraryItemSchema,
  LibraryItemType,
  LibraryStoreMeta,
  LibraryStoreMetaSchema,
  AnatomyForgeState,
  AnatomyLibraryItem,
  PromptLibraryItem,
  SkillSourceFile,
  SkillSpec,
  SkillLibraryItem,
  createDefaultSkillSpec,
} from './schema';
import { getCloudSyncRuntime } from '@/lib/sync/runtime';

const LIBRARY_ITEMS_KEY = 'prmpt.library.v1.items';
const LIBRARY_META_KEY = 'prmpt.library.v1.meta';
const LEGACY_DRAFT_KEY = 'prompt-builder:draft:v1';
const LEGACY_CUSTOM_PRESETS_KEY = 'prompt-builder:custom-presets:v1';

const DEFAULT_SALESFORCE_SKILLS: Array<{
  id: string;
  title: string;
  description: string;
  tags: string[];
  skillSpec: ReturnType<typeof createDefaultSkillSpec>;
}> = [
  {
    id: 'skill-sf-apex',
    title: 'sf-apex',
    description: 'Apex implementation and review workflow focused on governor limits, security, and bulk-safe architecture.',
    tags: ['salesforce', 'apex', 'governor-limits', 'security'],
    skillSpec: {
      name: 'sf-apex',
      description:
        'Design and review Apex using bulk-safe patterns, layered architecture, and test-first validation.',
      whenToUse:
        'Use for Apex classes, trigger handlers, queueables/batches, integration logic, and performance/security reviews.',
      inputs: [
        {
          id: 'input-requirements',
          name: 'Requirements',
          description: 'User story, acceptance criteria, and non-functional constraints.',
          required: true,
        },
        {
          id: 'input-code-context',
          name: 'Code context',
          description: 'Existing Apex classes, trigger framework, and related selectors/services.',
          required: false,
        },
        {
          id: 'input-org-constraints',
          name: 'Org constraints',
          description: 'Security model, governor concerns, packaging constraints, API version.',
          required: false,
        },
      ],
      steps: [
        'Parse requirements and decide declarative vs Apex boundary; justify code-only decisions.',
        'Model the solution with Selector/Service/Domain or existing org pattern before writing logic.',
        'Implement bulk-safe logic with with sharing/USER_MODE, CRUD/FLS checks, and explicit error handling.',
        'Run anti-pattern sweep: SOQL/DML in loops, recursion risk, hardcoded IDs, unsafe dynamic SOQL.',
        'Generate tests in parallel with implementation, including bulk (200 records), negative, and async scenarios.',
        'Produce deployment notes with risks, rollback path, and follow-up refactors.',
      ],
      outputs: [
        'Apex implementation or review findings with severity labels',
        'Minimal code diffs or patch-ready snippets',
        'Apex test class plan with bulk/negative/async coverage',
        'Deployment and risk checklist',
      ],
      verification: [
        'No SOQL/DML in loops and no hardcoded IDs',
        'with sharing plus CRUD/FLS or USER_MODE applied where required',
        'Trigger logic is idempotent and recursion-safe',
        'Tests contain meaningful assertions and include failure paths',
      ],
      notes:
        'Prefer pragmatic fixes over rewrites. If context is missing, ask targeted questions before assuming org-specific behavior.',
    },
  },
  {
    id: 'skill-sf-lwc',
    title: 'sf-lwc',
    description: 'LWC component design with base components, SLDS, performance, accessibility, and Jest coverage.',
    tags: ['salesforce', 'lwc', 'ui', 'jest'],
    skillSpec: {
      name: 'sf-lwc',
      description:
        'Build reusable Lightning Web Components with strong UX defaults, predictable reactivity, and testable behavior.',
      whenToUse:
        'Use for new component delivery, component refactors, and debugging UI/data flow issues in Lightning apps.',
      inputs: [
        {
          id: 'input-ui-requirements',
          name: 'UI requirements',
          description: 'Layout, fields, interactions, and success criteria.',
          required: true,
        },
        {
          id: 'input-data-sources',
          name: 'Data sources',
          description: '@wire adapters, Apex methods, LDS forms, and cache expectations.',
          required: false,
        },
        {
          id: 'input-design-constraints',
          name: 'Design constraints',
          description: 'SLDS/SLDS 2 conventions, accessibility requirements, and target form factors.',
          required: false,
        },
      ],
      steps: [
        'Define component contract first: @api inputs/outputs, events, and loading states.',
        'Use Lightning base components first, then SLDS/SLDS 2 utilities, and only minimal scoped CSS if necessary.',
        'Implement resilient data flow with clear loading, empty, success, and error states.',
        'Use design tokens and accessibility-first semantics (labels, focus order, keyboard support).',
        'Write Jest tests for render paths, user interactions, and error handling behavior.',
      ],
      outputs: [
        'LWC html/js/meta blueprint or implementation diff',
        'Explicit component API and event contract documentation',
        'Jest test scenarios covering happy path and failure states',
      ],
      verification: [
        'Base components and SLDS utilities used appropriately',
        'Component handles loading/empty/error states cleanly',
        'Accessibility, LWR compatibility, and keyboard behavior validated',
      ],
      notes:
        'Avoid over-custom UI when base Lightning components solve the requirement. Keep props and events small and explicit.',
    },
  },
  {
    id: 'skill-sf-flow',
    title: 'sf-flow',
    description: 'Declarative-first Flow design with guardrails for maintainability, fault handling, and handoff to code when needed.',
    tags: ['salesforce', 'flow', 'declarative'],
    skillSpec: {
      name: 'sf-flow',
      description:
        'Design robust record-triggered and screen Flows with explicit decisions, fault handling, and admin-friendly operations.',
      whenToUse:
        'Use for workflow automation and low-code orchestration where declarative tooling can satisfy business logic cleanly.',
      inputs: [
        {
          id: 'input-flow-trigger',
          name: 'Trigger context',
          description: 'Record-triggered, screen flow, schedule, or platform event context.',
          required: true,
        },
        {
          id: 'input-automation-goal',
          name: 'Automation goal',
          description: 'Business outcome and success criteria.',
          required: true,
        },
        {
          id: 'input-objects-fields',
          name: 'Objects and fields',
          description: 'Source/target objects, field mappings, and update rules.',
          required: false,
        },
        {
          id: 'input-exception-rules',
          name: 'Exception rules',
          description: 'Known error paths, escalation contacts, and retry policies.',
          required: false,
        },
      ],
      steps: [
        'Map entry criteria, branching logic, and side effects before building elements.',
        'Design variable model and naming conventions for maintainability.',
        'Design fault paths, retries, and notifications for operations teams.',
        'Evaluate flow limits/performance and escalate to Apex only when necessary.',
        'Define security/visibility behavior and user-facing error messaging.',
        'Document test matrix for admins/QA with data setup and expected outcomes.',
      ],
      outputs: [
        'Flow blueprint (entry, decisions, actions, exits)',
        'Fault/retry strategy with owner escalation',
        'Admin runbook for monitoring and troubleshooting',
        'UAT checklist for deployment sign-off',
      ],
      verification: [
        'Fault paths and user-facing error messaging are defined',
        'Declarative-first solution is preserved unless Apex is justified',
        'Variable/element naming is consistent and maintainable',
        'Flow limits and transaction side effects are reviewed',
        'Deployment dependencies and rollback strategy are documented',
      ],
      notes:
        'Prefer fewer, clearer elements over dense branching. Keep admin maintenance and observability first-class concerns.',
    },
  },
  {
    id: 'skill-sf-metadata',
    title: 'sf-metadata',
    description: 'Metadata and org model changes with naming, packaging, permissions, and deployment consistency.',
    tags: ['salesforce', 'metadata', 'permissions', 'sfdx'],
    skillSpec: {
      name: 'sf-metadata',
      description:
        'Plan schema and configuration changes with explicit security impact, deployment order, and rollback safety.',
      whenToUse:
        'Use for object/field updates, record types, layouts, permission sets, and deployment packaging decisions.',
      inputs: [
        {
          id: 'input-metadata-scope',
          name: 'Metadata scope',
          description: 'Objects, fields, layouts, permissions, and automation impacted.',
          required: true,
        },
        {
          id: 'input-environment-strategy',
          name: 'Environment strategy',
          description: 'Sandbox/UAT/prod rollout order and packaging model.',
          required: false,
        },
        {
          id: 'input-usage-impact',
          name: 'User impact',
          description: 'Profiles/personas affected and expected behavior changes.',
          required: false,
        },
      ],
      steps: [
        'Identify metadata components to create/modify.',
        'Validate naming conventions, namespace concerns, and package boundaries.',
        'Define permission model updates (permission sets, visibility, FLS).',
        'Map dependencies and deployment ordering across metadata types.',
        'Prepare rollback and data backfill/remediation plan if needed.',
      ],
      outputs: [
        'Metadata change inventory',
        'Permission and security impact matrix',
        'Ordered deployment checklist',
        'Rollback and remediation plan',
      ],
      verification: [
        'No hardcoded IDs and no profile-only access assumptions',
        'Permissions and visibility model are updated',
        'Backward compatibility and dependency ordering validated',
        'Dependency order for deployment is documented',
      ],
      notes:
        'Prefer permission sets over profile-specific logic. Keep metadata changes modular to reduce deployment blast radius.',
    },
  },
  {
    id: 'skill-sf-testing',
    title: 'sf-testing',
    description: 'Salesforce testing strategy for Apex and LWC with meaningful assertions and bulk/error coverage.',
    tags: ['salesforce', 'testing', 'apex', 'lwc', 'jest'],
    skillSpec: {
      name: 'sf-testing',
      description:
        'Create high-value Salesforce tests (Apex + LWC Jest) that validate behavior, limits, security, and regressions.',
      whenToUse: 'Use when implementing or reviewing any Salesforce change.',
      inputs: [
        {
          id: 'input-change-scope',
          name: 'Change scope',
          description: 'Classes, components, flows, and integrations touched by the change.',
          required: true,
        },
        {
          id: 'input-risk-areas',
          name: 'Risk areas',
          description: 'Business-critical scenarios, historical bugs, and edge cases.',
          required: false,
        },
        {
          id: 'input-quality-gates',
          name: 'Quality gates',
          description: 'Coverage targets, CI checks, and deployment test requirements.',
          required: false,
        },
      ],
      steps: [
        'List behavior risks and map each risk to explicit test cases.',
        'Write Apex tests for positive, negative, bulk (200 records), security, and async execution paths.',
        'Write LWC Jest tests for rendering, events, prop changes, and error states.',
        'Validate data factories, mocks, and test isolation strategy.',
        'Assess assertion quality and regression detection, not just raw coverage percent.',
      ],
      outputs: [
        'Apex test scenario matrix',
        'LWC Jest scenario matrix',
        'Coverage quality and blind-spot checklist',
        'CI test execution guidance',
      ],
      verification: [
        'Meaningful assertions verify outcomes, not only non-null checks',
        'Bulk/error/async scenarios are covered',
        'Security and sharing behaviors are asserted where relevant',
        'SeeAllData=false used unless there is a justified exception',
      ],
      notes:
        'Treat testing as part of implementation, not a final step. Prioritize high-risk regressions and meaningful assertions.',
    },
  },
  {
    id: 'skill-sf-integration',
    title: 'sf-integration',
    description: 'External integration design using Named Credentials, resilient callout patterns, and observability.',
    tags: ['salesforce', 'integration', 'named-credentials', 'api'],
    skillSpec: {
      name: 'sf-integration',
      description:
        'Design resilient integrations with contract clarity, secure authentication, idempotency, and operational observability.',
      whenToUse:
        'Use for REST/SOAP callouts, event-based integrations, middleware sync, and external data orchestration.',
      inputs: [
        {
          id: 'input-integration-contract',
          name: 'Integration contract',
          description: 'API endpoints, payload schema, auth, and expected SLAs.',
          required: true,
        },
        {
          id: 'input-data-mapping',
          name: 'Data mapping',
          description: 'Field-level mappings, transforms, and conflict resolution rules.',
          required: false,
        },
        {
          id: 'input-failure-policy',
          name: 'Failure policy',
          description: 'Retry, timeout, dead-letter, and incident escalation expectations.',
          required: false,
        },
      ],
      steps: [
        'Define contract, authentication, and data mapping.',
        'Use Named Credentials and avoid embedded secrets.',
        'Implement idempotency, timeout, and retry/backoff strategy.',
        'Implement structured logging, monitoring signals, and alert triggers.',
        'Add test/mocking approach for callouts, partial failures, and edge cases.',
      ],
      outputs: [
        'Integration architecture and contract summary',
        'Retry/error/idempotency strategy',
        'Monitoring and alerting checklist',
        'Operational runbook for support teams',
      ],
      verification: [
        'Named Credentials used for auth and secret handling',
        'Failure handling, retries, and dead-letter approach are defined',
        'Idempotency and duplicate-event handling are validated',
        'Monitoring/alerting and runbook ownership are documented',
      ],
      notes:
        'Design integrations for failure by default. Avoid hidden coupling and document ownership boundaries clearly.',
    },
  },
];

const DEFAULT_EXAMPLE_SKILLS: Array<{
  id: string;
  title: string;
  description: string;
  tags: string[];
  skillSpec: ReturnType<typeof createDefaultSkillSpec>;
  sourceFiles?: SkillSourceFile[];
}> = [
  {
    id: 'skill-example-youtube-video-analyzer',
    title: 'YouTube Video Analyzer',
    description: 'Analyze YouTube videos into structured, timestamped insights and actionable recommendations.',
    tags: ['example', 'analysis', 'youtube', 'content'],
    skillSpec: {
      name: 'YouTube Video Analyzer',
      description:
        'Extract structured insights from one or more YouTube videos using transcript-first analysis and evidence-backed summaries.',
      whenToUse:
        'Use when researching topics, auditing competitor content, summarizing long videos, or extracting reusable content ideas.',
      inputs: [
        {
          id: 'input-video-urls',
          name: 'Video URL(s)',
          description: 'One or more YouTube links to analyze.',
          required: true,
        },
        {
          id: 'input-analysis-goal',
          name: 'Analysis goal',
          description: 'Primary objective (summary, SEO takeaways, script extraction, sentiment, etc.).',
          required: true,
        },
        {
          id: 'input-depth',
          name: 'Depth preference',
          description: 'Brief, standard, or deep-dive analysis.',
          required: false,
        },
        {
          id: 'input-output-format',
          name: 'Output format',
          description: 'Bullets, table, JSON, or executive memo.',
          required: false,
        },
      ],
      steps: [
        'Validate URLs and collect metadata (title, channel, duration, publish date).',
        'Extract transcript/captions and split content into coherent sections.',
        'Identify central themes, claims, examples, and turning points with timestamps.',
        'Summarize each section and synthesize an overall narrative arc.',
        'Generate actionable recommendations aligned to the analysis goal.',
        'Deliver final output with confidence notes, assumptions, and unresolved gaps.',
      ],
      outputs: [
        'Timestamped section-by-section summary',
        'Top insights and supporting evidence',
        'Actionable recommendations mapped to the goal',
        'Limitations/uncertainty notes',
      ],
      verification: [
        'Every major claim includes timestamp evidence',
        'Summary captures both high-level arc and concrete specifics',
        'Recommendations are grounded in transcript content',
        'Missing or low-quality transcript segments are explicitly flagged',
      ],
      notes:
        'Do not fabricate transcript details. If transcript quality is poor, state uncertainty and provide conservative conclusions.',
    },
    sourceFiles: [
      {
        path: 'scripts/youtube_video_analyzer.py',
        content: `"""YouTube Video Analyzer utility script.

Inputs:
- transcript_sections: list[dict] with {start_seconds, end_seconds, text}
- goal: analysis focus (summary, SEO, learning, content strategy)

Output:
- dict with timestamped sections, key insights, recommendations, and confidence notes
"""

from __future__ import annotations

from collections import Counter
import re
from typing import Any, Iterable


STOPWORDS = {
    "the", "and", "for", "that", "with", "from", "this", "have", "your",
    "about", "into", "when", "what", "where", "which", "their", "there",
    "just", "than", "then", "they", "them", "will", "would", "should",
}


def _tokenize(text: str) -> Iterable[str]:
    for token in re.findall(r"[a-zA-Z0-9']+", text.lower()):
        if token not in STOPWORDS and len(token) > 2:
            yield token


def _top_keywords(text: str, limit: int = 12) -> list[str]:
    counts = Counter(_tokenize(text))
    return [word for word, _ in counts.most_common(limit)]


def analyze_video(
    transcript_sections: list[dict[str, Any]],
    goal: str = "summary",
) -> dict[str, Any]:
    if not transcript_sections:
        return {
            "goal": goal,
            "sections": [],
            "insights": [],
            "recommendations": [],
            "confidence_notes": ["No transcript sections were provided."],
        }

    normalized_sections = []
    joined_text_parts: list[str] = []

    for section in transcript_sections:
        start = int(section.get("start_seconds", 0))
        end = int(section.get("end_seconds", start))
        text = str(section.get("text", "")).strip()
        if not text:
            continue
        normalized_sections.append(
            {
                "start_seconds": start,
                "end_seconds": end,
                "summary": text[:240] + ("..." if len(text) > 240 else ""),
            }
        )
        joined_text_parts.append(text)

    full_text = "\\n".join(joined_text_parts)
    keywords = _top_keywords(full_text)

    insights = [
        f"Primary focus appears to be: {', '.join(keywords[:5])}" if keywords else "No dominant keywords detected.",
        f"Transcript sections analyzed: {len(normalized_sections)}",
        f"Analysis goal applied: {goal}",
    ]

    recommendations = [
        "Clip high-signal sections into short-form content using timestamps.",
        "Use recurring keywords as chapter headings or SEO metadata.",
        "Add follow-up questions for sections with low confidence or sparse context.",
    ]

    return {
        "goal": goal,
        "sections": normalized_sections,
        "insights": insights,
        "recommendations": recommendations,
        "confidence_notes": [
            "Keyword extraction is heuristic-based; review nuanced sections manually.",
            "Timestamp summaries depend on transcript quality and segmentation.",
        ],
    }
`,
      },
    ],
  },
  {
    id: 'skill-example-hello-world',
    title: 'Hello World Skill: A Minimal Example',
    description: 'Minimal but complete skill showing the smallest useful structure for inputs, steps, outputs, and verification.',
    tags: ['example', 'starter', 'minimal'],
    skillSpec: {
      name: 'Hello World Skill: A Minimal Example',
      description:
        'A simple reference skill that demonstrates the required structure with concise, practical content.',
      whenToUse:
        'Use as a baseline template when creating new skills from scratch.',
      inputs: [
        {
          id: 'input-task',
          name: 'Task',
          description: 'What you want the agent to do.',
          required: true,
        },
        {
          id: 'input-context',
          name: 'Context',
          description: 'Any relevant background or constraints.',
          required: false,
        },
      ],
      steps: [
        'Read the task and context carefully.',
        'Break the work into clear, actionable sub-steps.',
        'Execute the task and produce a concise result.',
        'Validate the result against the requested outcome.',
      ],
      outputs: [
        'Task summary',
        'Completed result',
        'Any assumptions made',
      ],
      verification: [
        'Output directly addresses the task',
        'Assumptions are explicit',
        'Result is clear and actionable',
      ],
      notes:
        'This is intentionally short. Duplicate and expand it for domain-specific workflows.',
    },
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();

function now(): number {
  return Date.now();
}

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function generateId(prefix: string): string {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}`;
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeLibrary(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readMeta(): LibraryStoreMeta {
  if (!hasStorage()) {
    return { schemaVersion: 1, migratedFromLegacyPromptStore: false };
  }

  const raw = window.localStorage.getItem(LIBRARY_META_KEY);
  if (!raw) {
    return { schemaVersion: 1, migratedFromLegacyPromptStore: false };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = LibraryStoreMetaSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
  } catch {
    // fall through
  }

  return { schemaVersion: 1, migratedFromLegacyPromptStore: false };
}

function writeMeta(meta: LibraryStoreMeta): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(LIBRARY_META_KEY, JSON.stringify(meta));
}

function readItems(): LibraryItem[] {
  if (!hasStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(LIBRARY_ITEMS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const validated = parsed
      .map((entry) => LibraryItemSchema.safeParse(entry))
      .filter((result): result is { success: true; data: LibraryItem } => result.success)
      .map((result) => result.data);

    return validated.map((item) => (item.type === 'skill' ? hydrateSparseLegacySkill(item) : item));
  } catch {
    return [];
  }
}

function isLegacyPlaceholderSkill(spec: SkillSpec): boolean {
  const step = spec.steps[0]?.trim().toLowerCase() ?? '';
  const isPlaceholderStep =
    spec.steps.length === 1 &&
    (step === 'review imported skill and define implementation workflow.' ||
      step === 'describe the first implementation step.');

  return (
    isPlaceholderStep &&
    spec.inputs.length === 0 &&
    spec.outputs.length === 0 &&
    spec.verification.length === 0
  );
}

function buildYoutubeAnalyzerSkillSpec(name: string, description: string): SkillSpec {
  return {
    name,
    description:
      description ||
      'Analyze one or more YouTube videos and return concise insights, structure, and actionable takeaways.',
    whenToUse:
      'Use when you need summaries, timestamps, topic extraction, sentiment, or content strategy insights from video transcripts.',
    inputs: [
      {
        id: 'input-video-url',
        name: 'Video URL(s)',
        description: 'One or more YouTube links to analyze.',
        required: true,
      },
      {
        id: 'input-goal',
        name: 'Analysis goal',
        description: 'What the analysis should optimize for (learning, SEO, script extraction, competitive research).',
        required: true,
      },
      {
        id: 'input-audience',
        name: 'Target audience',
        description: 'Who the report is for and preferred depth/tone.',
        required: false,
      },
      {
        id: 'input-output-format',
        name: 'Output format',
        description: 'Requested output style: bullets, table, JSON, or structured report.',
        required: false,
      },
    ],
    steps: [
      'Validate URLs and collect metadata (title, channel, duration, publish date).',
      'Extract transcript or captions and split into logical sections.',
      'Identify major themes, claims, and supporting examples with timestamps.',
      'Summarize each section and synthesize overall narrative and key insights.',
      'Generate actionable recommendations tailored to the requested analysis goal.',
      'Return structured output with assumptions, confidence notes, and gaps.',
    ],
    outputs: [
      'Structured video summary with timestamped sections',
      'Key insights and recurring themes',
      'Actionable recommendations aligned to the analysis goal',
      'Open questions or uncertain areas due to missing transcript context',
    ],
    verification: [
      'All requested video URLs were analyzed or clearly flagged as inaccessible',
      'Timestamp references are present for major claims',
      'Summary reflects both high-level narrative and specific details',
      'Recommendations are tied to evidence from transcript content',
    ],
    notes:
      'If transcript quality is poor, state limitations explicitly and avoid fabricated details.',
  };
}

function buildGenericUpgradedSkillSpec(name: string, description: string): SkillSpec {
  const base = createDefaultSkillSpec();
  return {
    ...base,
    name,
    description: description || base.description,
  };
}

function hydrateSparseLegacySkill(item: SkillLibraryItem): SkillLibraryItem {
  const spec = item.payload.skillSpec;
  if (!isLegacyPlaceholderSkill(spec)) {
    return item;
  }

  const name = spec.name?.trim() || item.title || 'Untitled Skill';
  const description = spec.description?.trim() || item.description || '';
  const isYoutubeAnalyzer = /youtube/i.test(name) && /analy/i.test(name);
  const upgraded = isYoutubeAnalyzer
    ? buildYoutubeAnalyzerSkillSpec(name, description)
    : buildGenericUpgradedSkillSpec(name, description);

  return {
    ...item,
    description: description || upgraded.description,
    payload: {
      ...item.payload,
      skillSpec: {
        ...upgraded,
        notes: spec.notes || upgraded.notes,
      },
    },
  };
}

function writeItems(items: LibraryItem[]): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(LIBRARY_ITEMS_KEY, JSON.stringify(items));
}

export function replaceAllItems(nextItems: LibraryItem[]): void {
  const parsed = nextItems.map((item) => LibraryItemSchema.parse(item));
  writeItems(parsed);
  emitChange();
}

function mirrorCloudSafely(action: (runtime: NonNullable<ReturnType<typeof getCloudSyncRuntime>>) => Promise<void>): void {
  const runtime = getCloudSyncRuntime();
  if (!runtime || !runtime.isActive()) {
    return;
  }

  void action(runtime).catch(() => {
    // Cloud errors are surfaced by sync UI status and should not break local-first writes.
  });
}

function createPromptItemFromPromptSpec(specTitle: string, specDescription: string, promptSpec: unknown): PromptLibraryItem | null {
  const parsed = PromptSpecSchema.safeParse(promptSpec);
  if (!parsed.success) {
    return null;
  }

  const timestamp = now();

  return {
    id: generateId('prompt'),
    type: 'prompt',
    title: specTitle,
    description: specDescription,
    tags: ['migrated', 'prompt-builder'],
    targets: ['codex', 'chatgpt'],
    status: 'draft',
    favorite: false,
    archived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: timestamp,
    payload: {
      promptSpec: parsed.data,
      source: 'prompt-builder',
    },
  };
}

export function migrateLegacyPromptStorageIfNeeded(): void {
  if (!hasStorage()) {
    return;
  }

  const meta = readMeta();
  if (meta.migratedFromLegacyPromptStore) {
    return;
  }

  const items = readItems();
  const migratedItems: LibraryItem[] = [];

  const legacyDraftRaw = window.localStorage.getItem(LEGACY_DRAFT_KEY);
  if (legacyDraftRaw) {
    try {
      const parsedDraft = JSON.parse(legacyDraftRaw) as unknown;
      const title =
        typeof parsedDraft === 'object' && parsedDraft && 'title' in parsedDraft
          ? String((parsedDraft as { title?: string }).title || 'Migrated Draft Prompt')
          : 'Migrated Draft Prompt';
      const description = 'Migrated from legacy draft storage';
      const item = createPromptItemFromPromptSpec(title, description, parsedDraft);
      if (item) {
        migratedItems.push(item);
      }
    } catch {
      // ignore legacy parse failures
    }
  }

  const legacyPresetRaw = window.localStorage.getItem(LEGACY_CUSTOM_PRESETS_KEY);
  if (legacyPresetRaw) {
    try {
      const parsedPreset = JSON.parse(legacyPresetRaw) as unknown;
      if (Array.isArray(parsedPreset)) {
        parsedPreset.forEach((preset) => {
          const parsed = PromptPresetSchema.safeParse(preset);
          if (!parsed.success) {
            return;
          }

          const item = createPromptItemFromPromptSpec(
            `Preset: ${parsed.data.name}`,
            parsed.data.description,
            parsed.data.spec
          );
          if (item) {
            item.tags = [...item.tags, 'preset'];
            migratedItems.push(item);
          }
        });
      }
    } catch {
      // ignore legacy parse failures
    }
  }

  if (migratedItems.length > 0) {
    writeItems([...items, ...migratedItems]);
  }

  writeMeta({
    schemaVersion: 1,
    migratedFromLegacyPromptStore: true,
  });

  emitChange();
}

export function seedDefaultSalesforceSkillsIfMissing(): void {
  if (!hasStorage()) {
    return;
  }

  const items = readItems();
  const existingSkillIds = new Set(
    items.filter((item) => item.type === 'skill').map((item) => item.id)
  );
  const existingSkillTitles = new Set(
    items
      .filter((item) => item.type === 'skill')
      .map((item) => item.title.trim().toLowerCase())
  );

  const additions = DEFAULT_SALESFORCE_SKILLS.filter(
    (skill) => !existingSkillIds.has(skill.id) && !existingSkillTitles.has(skill.title.trim().toLowerCase())
  ).map((skill) =>
    createSkillLibraryItem({
      id: skill.id,
      title: skill.title,
      description: skill.description,
      tags: [...skill.tags],
      targets: ['claude', 'codex', 'chatgpt'],
      status: 'stable',
      payload: {
        skillSpec: skill.skillSpec,
      },
    })
  );

  if (additions.length === 0) {
    return;
  }

  writeItems([...items, ...additions]);
  emitChange();
}

export function seedDefaultExampleSkillsIfMissing(): void {
  if (!hasStorage()) {
    return;
  }

  const items = readItems();
  const existingSkillIds = new Set(items.filter((item) => item.type === 'skill').map((item) => item.id));
  const existingSkillTitles = new Set(
    items
      .filter((item) => item.type === 'skill')
      .map((item) => item.title.trim().toLowerCase())
  );

  const additions = DEFAULT_EXAMPLE_SKILLS.filter(
    (skill) => !existingSkillIds.has(skill.id) && !existingSkillTitles.has(skill.title.trim().toLowerCase())
  ).map((skill) =>
    createSkillLibraryItem({
      id: skill.id,
      title: skill.title,
      description: skill.description,
      tags: [...skill.tags],
      targets: ['claude', 'codex', 'chatgpt'],
      status: 'stable',
      payload: {
        skillSpec: skill.skillSpec,
        sourceFiles: skill.sourceFiles ?? [],
      },
    })
  );

  const seededById = new Map(DEFAULT_EXAMPLE_SKILLS.map((skill) => [skill.id, skill] as const));
  let didBackfill = false;
  const updates = items.map((item) => {
    if (item.type !== 'skill') {
      return item;
    }

    const seeded = seededById.get(item.id);
    if (!seeded || (item.payload.sourceFiles?.length ?? 0) > 0 || (seeded.sourceFiles?.length ?? 0) === 0) {
      return item;
    }

    didBackfill = true;
    return {
      ...item,
      updatedAt: now(),
      payload: {
        ...item.payload,
        sourceFiles: seeded.sourceFiles ?? [],
      },
    };
  });

  if (additions.length === 0 && !didBackfill) {
    return;
  }

  const merged = [...updates, ...additions];
  writeItems(merged);
  emitChange();
}

export interface ListItemsOptions {
  type?: LibraryItemType;
  includeArchived?: boolean;
  query?: string;
  favoriteOnly?: boolean;
}

export function listItems(options: ListItemsOptions = {}): LibraryItem[] {
  const includeArchived = options.includeArchived ?? false;
  const query = options.query?.trim().toLowerCase();

  return readItems()
    .filter((item) => (options.type ? item.type === options.type : true))
    .filter((item) => (includeArchived ? true : !item.archived))
    .filter((item) => (options.favoriteOnly ? item.favorite : true))
    .filter((item) => {
      if (!query) {
        return true;
      }

      const haystack = [item.title, item.description ?? '', ...item.tags].join(' ').toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => right.updatedAt - left.updatedAt);
}

export function getItem(id: string): LibraryItem | null {
  return readItems().find((item) => item.id === id) ?? null;
}

export function upsertItem(item: LibraryItem): LibraryItem {
  const parsed = LibraryItemSchema.parse(item);
  const items = readItems();
  const index = items.findIndex((existing) => existing.id === parsed.id);

  if (index === -1) {
    items.push(parsed);
  } else {
    items[index] = parsed;
  }

  writeItems(items);
  emitChange();
  mirrorCloudSafely((runtime) => runtime.onUpsert(parsed));
  return parsed;
}

export function deleteItem(id: string): void {
  const next = readItems().filter((item) => item.id !== id);
  writeItems(next);
  emitChange();
  mirrorCloudSafely((runtime) => runtime.onDelete(id));
}

export function touchLastUsed(id: string): void {
  const timestamp = now();
  const next = readItems().map((item) =>
    item.id === id
      ? {
          ...item,
          lastUsedAt: timestamp,
        }
      : item
  );

  writeItems(next);
  emitChange();
  mirrorCloudSafely((runtime) => runtime.onTouchLastUsed(id));
}

export function toggleFavorite(id: string): void {
  const timestamp = now();
  const next = readItems().map((item) =>
    item.id === id
      ? {
          ...item,
          favorite: !item.favorite,
          updatedAt: timestamp,
        }
      : item
  );

  writeItems(next);
  emitChange();
  mirrorCloudSafely((runtime) => runtime.onToggleFavorite(id));
}

export function toggleArchived(id: string): void {
  const timestamp = now();
  const next = readItems().map((item) =>
    item.id === id
      ? {
          ...item,
          archived: !item.archived,
          updatedAt: timestamp,
        }
      : item
  );

  writeItems(next);
  emitChange();
  mirrorCloudSafely((runtime) => runtime.onToggleArchived(id));
}

export function duplicateItem(id: string): LibraryItem | null {
  const source = getItem(id);
  if (!source) {
    return null;
  }

  const timestamp = now();
  const duplicate: LibraryItem = {
    ...source,
    id: generateId(source.type),
    title: `${source.title} Copy`,
    favorite: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: timestamp,
  };

  upsertItem(duplicate);
  return duplicate;
}

type CreateSkillLibraryItemInput = Omit<Partial<SkillLibraryItem>, 'payload'> & {
  payload?: {
    skillSpec?: SkillSpec;
    sourceFiles?: SkillSourceFile[];
  };
};

type CreateAnatomyLibraryItemInput = Omit<Partial<AnatomyLibraryItem>, 'payload' | 'title'> & {
  title: string;
  payload: {
    forgeState: AnatomyForgeState;
    promptText: string;
    selectedPresetId?: string;
  };
};

export function createSkillLibraryItem(partial?: CreateSkillLibraryItemInput): SkillLibraryItem {
  const timestamp = now();
  const defaultSkill = createDefaultSkillSpec();

  return {
    id: partial?.id ?? generateId('skill'),
    type: 'skill',
    title: partial?.title ?? defaultSkill.name,
    description: partial?.description ?? defaultSkill.description,
    tags: partial?.tags ?? ['skill'],
    targets: partial?.targets ?? ['claude'],
    status: partial?.status ?? 'draft',
    favorite: partial?.favorite ?? false,
    archived: partial?.archived ?? false,
    createdAt: partial?.createdAt ?? timestamp,
    updatedAt: partial?.updatedAt ?? timestamp,
    lastUsedAt: partial?.lastUsedAt ?? timestamp,
    payload: {
      skillSpec: partial?.payload?.skillSpec ?? defaultSkill,
      sourceFiles: partial?.payload?.sourceFiles ?? [],
    },
  };
}

export function createPromptLibraryItemFromPromptSpec(
  title: string,
  promptSpec = createDefaultPromptSpec(),
  tags: string[] = [],
  options?: {
    source?: 'prompt-builder' | 'ui-builder';
    uiPromptSpec?: UiPromptSpec;
  }
): PromptLibraryItem {
  const timestamp = now();

  return {
    id: generateId('prompt'),
    type: 'prompt',
    title,
    description: promptSpec.goal,
    tags: ['prompt', ...tags],
    targets: ['codex', 'chatgpt'],
    status: 'draft',
    favorite: false,
    archived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: timestamp,
    payload: {
      promptSpec,
      source: options?.source ?? 'prompt-builder',
      uiPromptSpec: options?.uiPromptSpec,
    },
  };
}

export function createAnatomyLibraryItem(input: CreateAnatomyLibraryItemInput): AnatomyLibraryItem {
  const timestamp = now();

  return {
    id: input.id ?? generateId('anatomy'),
    type: 'anatomy',
    title: input.title,
    description: input.description,
    tags: input.tags ?? ['anatomy', 'prompt-forge'],
    targets: input.targets ?? ['claude', 'chatgpt', 'codex'],
    status: input.status ?? 'draft',
    favorite: input.favorite ?? false,
    archived: input.archived ?? false,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
    lastUsedAt: input.lastUsedAt ?? timestamp,
    payload: {
      forgeState: input.payload.forgeState,
      promptText: input.payload.promptText,
      selectedPresetId: input.payload.selectedPresetId,
    },
  };
}
