import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { upsertItem } from '@/lib/library';
import { createDefaultPromptSpec, toCustomPreset, upsertCustomPreset } from '@/lib/prompt';

interface ArchetypeRow {
  name: string;
  trait: string;
}

interface PromptForgeState {
  agentName: string;
  tagline: string;
  identityIntro: string;
  coreBehavior: string;
  rules: string;
  outputFormat: string;
  githubRepoUrls: string;
  githubFocusFiles: string;
  githubAlignmentRules: string;
  archetypes: ArchetypeRow[];
}

const SALESFORCE_FORGE_PRESET: PromptForgeState = {
  agentName: 'SalesforceForge',
  tagline:
    'the ultimate Salesforce full-stack development agent, combining architectural mastery, rigorous validation, and pragmatic execution for production-ready solutions.',
  identityIntro:
    'Your instinct for Salesforce runs deep. You prioritize declarative solutions, maximize Lightning base components with SLDS/SLDS 2 and design tokens, align with existing repo architecture, and treat testing as non-negotiable.',
  coreBehavior: `Strict loop for every input (requirements + optional GitHub URLs/code):
1. <thinking>Parse requirements fully and extract implicit dependencies.</thinking>
2. Prioritize declarative -> base components -> custom LWC -> Apex only when essential.
3. Reuse existing repo patterns exactly.
4. Generate implementation and tests in parallel.
5. Validate against requirements and org standards.
6. <reflection>Self-critique gaps, over-engineering, and risk.</reflection>
7. Ask clarifying questions only when needed.`,
  rules: `- API 62.0+ (Spring '26)
- Security first (CRUD/FLS/with sharing)
- No SOQL/DML in loops
- No hardcoded IDs
- SFDX-ready file paths
- High-coverage Apex + LWC Jest tests required`,
  outputFormat: `1. ## Requirements Breakdown
2. ## GitHub Repo Analysis
3. ## Architecture & Tool Choices
4. ## Implementation Plan
5. ## Required Metadata/Components
6. ## Code & Metadata Generation
7. ## Validation & Scoring
8. ## Testing Strategy & Deployment
9. ## Clarifying Questions
10. ## Final Recommendation`,
  githubRepoUrls: '',
  githubFocusFiles: '',
  githubAlignmentRules:
    'Match existing repo naming, layering, and test conventions. If repo context is incomplete, ask for specific file links or tree output.',
  archetypes: [
    { name: 'Sherlock Holmes', trait: 'forensic analysis of requirements and edge cases' },
    { name: 'Ada Lovelace', trait: 'elegant and scalable design precision' },
    { name: 'JARVIS', trait: 'seamless orchestration across LWC/Apex/Flow/declarative' },
    { name: 'Hermione Granger', trait: 'rigorous standards, security, and test quality' },
    { name: 'Yoda', trait: 'wise long-term maintainability decisions' },
  ],
};

const APEX_GUARD_PRESET: PromptForgeState = {
  agentName: 'ApexGuard',
  tagline: 'a senior Salesforce architect and meticulous code guardian for Apex and tests.',
  identityIntro:
    'Your instinct for Salesforce architecture runs deep. You detect governor-limit risk, enforce security, and require meaningful test coverage.',
  coreBehavior: `Strict loop for each review:
1. <thinking>Read full Apex/Trigger/Test context.</thinking>
2. Analyze limits, CRUD/FLS, with sharing, bulkification, and test quality.
3. Prioritize [BLOCKER] to [SUGGESTION].
4. Provide minimal diffs with Salesforce-specific rationale.
5. <reflection>Re-check for missed context or over-suggested changes.</reflection>`,
  rules: `- API 62.0+
- Enforce CRUD/FLS and with sharing
- Block SOQL/DML in loops
- No hardcoded IDs
- Require bulk-safe tests and meaningful assertions`,
  outputFormat: `1. ## Summary
2. ## Critical Issues
3. ## Issues & Suggestions
4. ## Positive Highlights
5. ## Recommendations
6. ## Questions
7. ## Final Verdict`,
  githubRepoUrls: '',
  githubFocusFiles: '',
  githubAlignmentRules:
    'Match existing Apex architecture (Selector/Service/Domain/TAF), test factories, and naming conventions.',
  archetypes: [
    { name: 'Sherlock Holmes', trait: 'forensic bug and risk detection' },
    { name: 'Ada Lovelace', trait: 'elegant Apex logic and query clarity' },
    { name: 'JARVIS', trait: 'pattern-driven Salesforce architecture execution' },
    { name: 'Hermione Granger', trait: 'strict standards and test discipline' },
  ],
};

const COMPONENT_FORGE_PRESET: PromptForgeState = {
  agentName: 'ComponentForge',
  tagline: 'a Lightning Web Components specialist for reusable, accessible UI.',
  identityIntro:
    'You prioritize Lightning base components, SLDS/SLDS 2 utility classes, and design tokens for native, theme-aware UI.',
  coreBehavior: `Strict loop for each requirement:
1. <thinking>Parse data, UX, interaction, and placement needs.</thinking>
2. Generate modular LWC (html/js/xml) with robust loading/error states.
3. Prefer @wire + refreshApex and base Lightning components.
4. Add Jest tests for rendering and event behavior.
5. <reflection>Trim over-engineering and re-check accessibility.</reflection>`,
  rules: `- API 62.0+
- Prefer lightning-* base components over custom HTML
- Use SLDS/SLDS 2 utility classes and design tokens
- Enforce accessibility and LWR compatibility
- Include Jest tests for each component`,
  outputFormat: `1. ## Component Overview
2. ## Component HTML
3. ## Component JavaScript
4. ## Component Meta XML
5. ## Jest Tests
6. ## Usage Notes`,
  githubRepoUrls: '',
  githubFocusFiles: '',
  githubAlignmentRules: 'Match existing LWC folder structure, naming, and token usage from the repository.',
  archetypes: [
    { name: 'Ada Lovelace', trait: 'elegant component architecture' },
    { name: 'JARVIS', trait: 'seamless tool and metadata orchestration' },
    { name: 'Sherlock Holmes', trait: 'anticipation of edge-case UI failures' },
    { name: 'Hermione Granger', trait: 'rigorous standards, security, and test quality' },
  ],
};

const PROMPT_FORGE_PRESETS = [
  { id: 'salesforce-forge', label: 'SalesforceForge', description: 'Full-stack Salesforce implementation agent', state: SALESFORCE_FORGE_PRESET },
  { id: 'apex-guard', label: 'ApexGuard', description: 'Apex code review and refactoring agent', state: APEX_GUARD_PRESET },
  { id: 'component-forge', label: 'ComponentForge', description: 'LWC generation and UI quality agent', state: COMPONENT_FORGE_PRESET },
] as const;

const ROLE_AREAS = [
  { name: 'Orchestration', description: 'High-level planning & sequencing', lineClass: 'bg-violet-500/15 text-violet-100', chipClass: 'bg-violet-500/20 text-violet-100 border-violet-400/40' },
  { name: 'Delegation', description: 'Task handoff to sub-agents/tools', lineClass: 'bg-pink-500/15 text-pink-100', chipClass: 'bg-pink-500/20 text-pink-100 border-pink-400/40' },
  { name: 'Memory', description: 'Context retention across sessions', lineClass: 'bg-blue-500/15 text-blue-100', chipClass: 'bg-blue-500/20 text-blue-100 border-blue-400/40' },
  { name: 'Awareness', description: 'Sensing environment/user state', lineClass: 'bg-cyan-500/15 text-cyan-100', chipClass: 'bg-cyan-500/20 text-cyan-100 border-cyan-400/40' },
  { name: 'Persistence', description: 'Follow-through on long tasks', lineClass: 'bg-green-500/15 text-green-100', chipClass: 'bg-green-500/20 text-green-100 border-green-400/40' },
  { name: 'Autonomy', description: 'Self-directed decisions', lineClass: 'bg-orange-500/15 text-orange-100', chipClass: 'bg-orange-500/20 text-orange-100 border-orange-400/40' },
  { name: 'Error Recovery', description: 'Diagnose & retry failures', lineClass: 'bg-red-500/15 text-red-100', chipClass: 'bg-red-500/20 text-red-100 border-red-400/40' },
  { name: 'Escalation', description: 'Human handoff when needed', lineClass: 'bg-yellow-500/15 text-yellow-100', chipClass: 'bg-yellow-500/20 text-yellow-100 border-yellow-400/40' },
  { name: 'Reflection', description: 'Self-critique & learning', lineClass: 'bg-indigo-500/15 text-indigo-100', chipClass: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/40' },
  { name: 'Adaptation', description: 'Evolve based on feedback', lineClass: 'bg-teal-500/15 text-teal-100', chipClass: 'bg-teal-500/20 text-teal-100 border-teal-400/40' },
] as const;

function cloneState(state: PromptForgeState): PromptForgeState {
  return {
    ...state,
    archetypes: state.archetypes.map((row) => ({ ...row })),
  };
}

function normalizeList(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .map((line) => line.replace(/^([*\-•]|\d+[.)])\s+/, '').trim())
    .filter(Boolean);
}

function composePrompt(state: PromptForgeState): string {
  const archetypeLines = state.archetypes
    .filter((row) => row.name.trim().length > 0)
    .map((row) => `• ${row.name.trim()} — ${row.trait.trim() || 'specialized execution trait'}`)
    .join('\n');
  const repoUrls = normalizeList(state.githubRepoUrls);
  const focusFiles = normalizeList(state.githubFocusFiles);
  const alignmentRules = state.githubAlignmentRules.trim();

  const githubContextBlock =
    repoUrls.length > 0 || focusFiles.length > 0 || alignmentRules.length > 0
      ? `

<github_context>
${repoUrls.length > 0 ? `Repositories:\n${repoUrls.map((url) => `- ${url}`).join('\n')}\n` : ''}${focusFiles.length > 0 ? `Pattern anchors / focus files:\n${focusFiles.map((path) => `- ${path}`).join('\n')}\n` : ''}${alignmentRules.length > 0 ? `Alignment rules:\n${alignmentRules}` : ''}
</github_context>`
      : '';

  return `You are ${state.agentName.trim() || 'Agent'} — ${state.tagline.trim() || 'a high-rigor implementation assistant.'}

<identity>
You blend these archetypes:
${archetypeLines}

${state.identityIntro.trim()}
</identity>

<core_behavior>
${state.coreBehavior.trim()}
</core_behavior>

<rules>
${state.rules.trim()}
</rules>

<output_format>
${state.outputFormat.trim()}
</output_format>

${githubContextBlock}

You are now ${state.agentName.trim() || 'Agent'}. Wait for requirements and optional GitHub context.`;
}

function buildPromptBuilderSpec(state: PromptForgeState, promptText: string) {
  const base = createDefaultPromptSpec();
  const outputRequirements = normalizeList(state.outputFormat).map((line) => line.replace(/^##\s*/, ''));
  const repoUrls = normalizeList(state.githubRepoUrls);
  const focusFiles = normalizeList(state.githubFocusFiles);
  const contextNotes = [...repoUrls.map((url) => `Repository: ${url}`), ...focusFiles.map((path) => `Focus file: ${path}`)];

  if (state.githubAlignmentRules.trim().length > 0) {
    contextNotes.push(`GitHub alignment: ${state.githubAlignmentRules.trim()}`);
  }

  return {
    ...base,
    title: `${state.agentName.trim() || 'Agent'} System Prompt`,
    goal: state.tagline.trim() || 'Generate a production-grade implementation response.',
    persona: state.agentName.trim() || 'Implementation Agent',
    systemPrompt: promptText,
    stackTags: ['prompt-forge', 'agent', 'system-prompt'],
    taskType: 'architecture' as const,
    constraints: normalizeList(state.rules),
    contextNotes,
    outputContract: {
      mode: 'code_plus_explanation' as const,
      requirements:
        outputRequirements.length > 0 ? outputRequirements : ['Follow the required output format and severity structure.'],
    },
  };
}

function getLineHighlightClass(line: string, currentSection: string): string {
  const normalized = line.toLowerCase();
  for (const role of ROLE_AREAS) {
    if (normalized.includes(role.name.toLowerCase())) {
      return role.lineClass;
    }
  }

  if (line.startsWith('<identity>') || line.startsWith('</identity>') || currentSection === 'identity') {
    return 'bg-blue-500/10 text-blue-100';
  }

  if (
    line.startsWith('<core_behavior>') ||
    line.startsWith('</core_behavior>') ||
    currentSection === 'core_behavior'
  ) {
    return 'bg-emerald-500/10 text-emerald-100';
  }

  if (line.startsWith('<rules>') || line.startsWith('</rules>') || currentSection === 'rules') {
    return 'bg-amber-500/10 text-amber-100';
  }

  if (
    line.startsWith('<output_format>') ||
    line.startsWith('</output_format>') ||
    currentSection === 'output_format'
  ) {
    return 'bg-fuchsia-500/10 text-fuchsia-100';
  }

  if (
    line.startsWith('<github_context>') ||
    line.startsWith('</github_context>') ||
    currentSection === 'github_context'
  ) {
    return 'bg-cyan-500/10 text-cyan-100';
  }

  return '';
}

function renderHighlightedPrompt(promptText: string) {
  const lines = promptText.split('\n');
  let currentSection = '';

  return lines.map((line, index) => {
    if (line.startsWith('<identity>')) currentSection = 'identity';
    if (line.startsWith('<core_behavior>')) currentSection = 'core_behavior';
    if (line.startsWith('<rules>')) currentSection = 'rules';
    if (line.startsWith('<output_format>')) currentSection = 'output_format';
    if (line.startsWith('<github_context>')) currentSection = 'github_context';

    const className = getLineHighlightClass(line, currentSection);
    const node = (
      <span key={`prompt-line-${index}`} className={className ? `block rounded px-2 ${className}` : 'block px-2'}>
        {line.length > 0 ? line : ' '}
      </span>
    );

    if (line.startsWith('</identity>')) currentSection = '';
    if (line.startsWith('</core_behavior>')) currentSection = '';
    if (line.startsWith('</rules>')) currentSection = '';
    if (line.startsWith('</output_format>')) currentSection = '';
    if (line.startsWith('</github_context>')) currentSection = '';

    return node;
  });
}

export function AnatomyRoutePage() {
  const navigate = useNavigate();
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PROMPT_FORGE_PRESETS[0].id);
  const [state, setState] = useState<PromptForgeState>(cloneState(PROMPT_FORGE_PRESETS[0].state));
  const [exportStatus, setExportStatus] = useState<string>('');
  const [libraryStatus, setLibraryStatus] = useState<string>('');
  const [highlightPreview, setHighlightPreview] = useState<boolean>(true);

  const promptText = useMemo(() => composePrompt(state), [state]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prompt Forge</h1>
        <p className="text-sm text-muted-foreground">
          Build structured, high-quality agent system prompts with role-aware highlighting, reusable presets, and GitHub context alignment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Composer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Starter Preset</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={selectedPresetId}
                onChange={(event) => {
                  const nextPreset = PROMPT_FORGE_PRESETS.find((item) => item.id === event.target.value);
                  if (!nextPreset) {
                    return;
                  }
                  setSelectedPresetId(nextPreset.id);
                  setState(cloneState(nextPreset.state));
                  setExportStatus('');
                }}
              >
                {PROMPT_FORGE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} - {preset.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const spec = buildPromptBuilderSpec(state, promptText);
                  const presetName = `${state.agentName.trim() || 'Agent'} (Forge)`;
                  upsertCustomPreset(
                    toCustomPreset(presetName, `Generated by Prompt Forge on ${new Date().toLocaleDateString()}`, spec)
                  );
                  setExportStatus(`Saved "${presetName}" to Prompt Builder custom presets.`);
                }}
              >
                Export to Prompt Builder Preset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const spec = buildPromptBuilderSpec(state, promptText);
                  const timestamp = Date.now();
                  const suffix =
                    typeof crypto !== 'undefined' && 'randomUUID' in crypto
                      ? crypto.randomUUID()
                      : Math.random().toString(36).slice(2, 10);

                  upsertItem({
                    id: `prompt-${suffix}`,
                    type: 'prompt',
                    title: `${state.agentName.trim() || 'Agent'} Forge`,
                    description:
                      state.tagline.trim() ||
                      'Generated in Prompt Forge with role-based anatomy and GitHub context alignment.',
                    tags: ['prompt-forge', 'agent', 'anatomy'],
                    targets: ['claude', 'chatgpt', 'codex'],
                    status: 'draft',
                    favorite: false,
                    archived: false,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                    lastUsedAt: timestamp,
                    payload: {
                      promptSpec: spec,
                      source: 'prompt-builder',
                    },
                  });

                  setLibraryStatus(`Saved "${state.agentName.trim() || 'Agent'} Forge" to Library Prompts.`);
                }}
              >
                Save Agent to Library
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/create/prompt')}>
                Open Prompt Builder
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Agent Name</label>
              <Input
                value={state.agentName}
                onChange={(event) => setState((current) => ({ ...current, agentName: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Tagline</label>
              <Input
                value={state.tagline}
                onChange={(event) => setState((current) => ({ ...current, tagline: event.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2 rounded border p-3">
            <p className="text-sm font-medium">Archetypes</p>
            {state.archetypes.map((row, index) => (
              <div key={`archetype-${index}`} className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  placeholder="Archetype"
                  value={row.name}
                  onChange={(event) =>
                    setState((current) => {
                      const next = [...current.archetypes];
                      next[index] = { ...next[index], name: event.target.value };
                      return { ...current, archetypes: next };
                    })
                  }
                />
                <Input
                  placeholder="Trait"
                  value={row.trait}
                  onChange={(event) =>
                    setState((current) => {
                      const next = [...current.archetypes];
                      next[index] = { ...next[index], trait: event.target.value };
                      return { ...current, archetypes: next };
                    })
                  }
                />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Identity Intro</label>
            <Textarea
              rows={4}
              value={state.identityIntro}
              onChange={(event) => setState((current) => ({ ...current, identityIntro: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Core Behavior</label>
            <Textarea
              rows={8}
              value={state.coreBehavior}
              onChange={(event) => setState((current) => ({ ...current, coreBehavior: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Rules</label>
            <Textarea
              rows={8}
              value={state.rules}
              onChange={(event) => setState((current) => ({ ...current, rules: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Output Format</label>
            <Textarea
              rows={8}
              value={state.outputFormat}
              onChange={(event) => setState((current) => ({ ...current, outputFormat: event.target.value }))}
            />
          </div>

          <div className="space-y-2 rounded border p-3">
            <p className="text-sm font-medium">GitHub Context (Optional)</p>
            <div>
              <label className="mb-1 block text-xs font-medium">Repository URLs (one per line)</label>
              <Textarea
                rows={3}
                placeholder="https://github.com/org/repo"
                value={state.githubRepoUrls}
                onChange={(event) => setState((current) => ({ ...current, githubRepoUrls: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Focus Files / Pattern Anchors (one per line)</label>
              <Textarea
                rows={3}
                placeholder="force-app/main/default/classes/AccountSelector.cls"
                value={state.githubFocusFiles}
                onChange={(event) => setState((current) => ({ ...current, githubFocusFiles: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Alignment Rules</label>
              <Textarea
                rows={3}
                value={state.githubAlignmentRules}
                onChange={(event) =>
                  setState((current) => ({ ...current, githubAlignmentRules: event.target.value }))
                }
              />
            </div>
          </div>

          {exportStatus ? (
            <p className="rounded border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
              {exportStatus}
            </p>
          ) : null}
          {libraryStatus ? (
            <p className="rounded border border-sky-900 bg-sky-950/40 px-3 py-2 text-sm text-sky-200">
              {libraryStatus}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg">Generated System Prompt</CardTitle>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={highlightPreview}
                onChange={(event) => setHighlightPreview(event.target.checked)}
              />
              Highlight sections
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {highlightPreview ? (
            <div className="rounded border border-zinc-700 bg-zinc-900/70 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
                Role Areas (Color-Coded)
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {ROLE_AREAS.map((role) => (
                  <div key={role.name} className="flex items-center gap-2 text-xs">
                    <span className={`rounded border px-2 py-1 font-medium ${role.chipClass}`}>{role.name}</span>
                    <span className="text-zinc-400">{role.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {highlightPreview ? (
            <div className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded border border-zinc-700 bg-zinc-950 p-3 font-mono text-sm leading-6 text-zinc-100">
              {renderHighlightedPrompt(promptText)}
            </div>
          ) : (
            <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded border border-zinc-700 bg-zinc-950 p-4 font-mono text-sm leading-6 text-zinc-100">
              {promptText}
            </pre>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (navigator.clipboard) {
                  void navigator.clipboard.writeText(promptText);
                }
              }}
            >
              Copy Prompt
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/create/prompt')}>
              Continue in Prompt Builder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
