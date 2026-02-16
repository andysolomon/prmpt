import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import { initVimMode } from 'monaco-vim';
import { VimMode } from 'monaco-vim';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/components/ui/notifications';
import {
  LibraryStatus,
  SkillLibraryItem,
  createEmptySkillInput,
  deleteItem,
  duplicateItem,
  getItem,
  toggleFavorite,
  touchLastUsed,
  upsertItem,
} from '@/lib/library';
import { renderSkillToClaudeMarkdown, renderSkillToClaudeMarkdownWithSources } from '@/lib/skill/formatters';
import {
  SkillDocument,
  fetchGithubFilesFromReference,
  parseGithubSkillReferenceNote,
} from '@/lib/skill/import';

type SkillTab = 'overview' | 'edit' | 'export';
let vimWriteCommandsRegistered = false;
const vimExApi = VimMode as unknown as {
  Vim: {
    defineEx: (name: string, shorthand: string, callback: () => void) => void;
  };
};

function normalizeSourceMarkdownForPreview(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const frontmatterMatch = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/m.exec(normalized);
  if (!frontmatterMatch) {
    return normalized;
  }

  const frontmatter = frontmatterMatch[1] ?? '';
  const body = (frontmatterMatch[2] ?? '').trimStart();

  const extractField = (field: 'name' | 'description') => {
    const pattern = new RegExp(`(^|\\n)${field}\\s*:\\s*(.+)`, 'i');
    const matched = pattern.exec(frontmatter);
    return matched?.[2]?.trim().replace(/^['"]|['"]$/g, '');
  };

  const name = extractField('name');
  const description = extractField('description');
  const hasHeading = /^#\s+.+/m.test(body);

  const headerParts: string[] = [];
  if (!hasHeading && name) {
    headerParts.push(`# ${name}`);
  }
  if (description) {
    headerParts.push(description);
  }

  if (headerParts.length === 0) {
    return body;
  }

  return `${headerParts.join('\n\n')}\n\n${body}`.trim();
}

function defaultSourceFileDescription(path: string): string {
  return `How this file supports the skill and how to run/use it: ${path}`;
}

function getMonacoLanguage(path: string): string {
  const normalized = path.toLowerCase();
  if (normalized.endsWith('.ts') || normalized.endsWith('.tsx')) return 'typescript';
  if (normalized.endsWith('.js') || normalized.endsWith('.jsx') || normalized.endsWith('.mjs')) return 'javascript';
  if (normalized.endsWith('.json')) return 'json';
  if (normalized.endsWith('.md')) return 'markdown';
  if (normalized.endsWith('.py')) return 'python';
  if (normalized.endsWith('.sh') || normalized.endsWith('.bash') || normalized.endsWith('.zsh')) return 'shell';
  if (normalized.endsWith('.sql')) return 'sql';
  if (normalized.endsWith('.xml')) return 'xml';
  if (normalized.endsWith('.yaml') || normalized.endsWith('.yml')) return 'yaml';
  if (normalized.endsWith('.css') || normalized.endsWith('.scss')) return 'css';
  if (normalized.endsWith('.html')) return 'html';
  return 'plaintext';
}

function toDirtyComparable(item: SkillLibraryItem) {
  return {
    title: item.title,
    description: item.description ?? '',
    tags: item.tags,
    targets: item.targets,
    status: item.status,
    favorite: item.favorite,
    archived: item.archived,
    payload: item.payload,
  };
}

export function SkillDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SkillTab>('overview');
  const [item, setItem] = useState<SkillLibraryItem | null>(null);
  const [sourceFiles, setSourceFiles] = useState<SkillDocument[]>([]);
  const [selectedAttachedFilePath, setSelectedAttachedFilePath] = useState<string>('');
  const [newSourceFilePath, setNewSourceFilePath] = useState('');
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [savedComparable, setSavedComparable] = useState('');
  const [savedSnapshot, setSavedSnapshot] = useState<SkillLibraryItem | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<SkillLibraryItem | null>(null);
  const { success, error } = useNotifications();
  const vimModeRef = useRef<{ dispose: () => void } | null>(null);
  const vimStatusRef = useRef<HTMLDivElement | null>(null);
  const vimSaveHandlerRef = useRef<(() => void) | null>(null);

  const skillId = params.id;

  useEffect(() => {
    if (!skillId) {
      return;
    }

    const found = getItem(skillId);
    if (!found || found.type !== 'skill') {
      setItem(null);
      return;
    }

    setItem(found);
    setSavedComparable(JSON.stringify(toDirtyComparable(found)));
    setSavedSnapshot(found);
    touchLastUsed(found.id);
  }, [skillId]);

  const overviewText = useMemo(
    () => (item ? renderSkillToClaudeMarkdown(item.payload.skillSpec, item.payload.sourceFiles ?? []) : ''),
    [item]
  );
  const exportText = useMemo(
    () =>
      item
        ? renderSkillToClaudeMarkdownWithSources(item.payload.skillSpec, item.payload.sourceFiles ?? [])
        : '',
    [item]
  );
  const githubReference = useMemo(
    () => parseGithubSkillReferenceNote(item?.payload.skillSpec.notes),
    [item]
  );
  const sourceSkillMarkdown = useMemo(() => {
    if (!githubReference) {
      return null;
    }

    const source = sourceFiles.find((file) => file.path === githubReference.skillPath)?.content ?? null;
    return source ? normalizeSourceMarkdownForPreview(source) : null;
  }, [githubReference, sourceFiles]);
  const previewMarkdown = sourceSkillMarkdown ?? overviewText;
  const attachedSourceFiles =
    (item?.payload.sourceFiles?.length ?? 0) > 0
      ? item?.payload.sourceFiles ?? []
      : githubReference
        ? sourceFiles
        : [];
  const selectedAttachedFile = useMemo(
    () =>
      attachedSourceFiles.find((file) => file.path === selectedAttachedFilePath) ?? attachedSourceFiles[0] ?? null,
    [attachedSourceFiles, selectedAttachedFilePath]
  );
  const selectedAttachedFileDescription =
    selectedAttachedFile && 'description' in selectedAttachedFile && typeof selectedAttachedFile.description === 'string'
      ? selectedAttachedFile.description
      : '';
  const savedSkill = savedSnapshot?.payload.skillSpec;
  const savedSourceFiles = savedSnapshot?.payload.sourceFiles ?? [];
  const selectedSourceIndex = selectedAttachedFile
    ? attachedSourceFiles.findIndex((file) => file.path === selectedAttachedFile.path)
    : -1;
  const selectedSavedSourceFile =
    selectedSourceIndex >= 0 ? (savedSourceFiles[selectedSourceIndex] ?? null) : null;
  const hasUnsavedChanges =
    !!item && savedComparable.length > 0 && JSON.stringify(toDirtyComparable(item)) !== savedComparable;
  const sourceFilesDirty =
    JSON.stringify(item?.payload.sourceFiles ?? []) !== JSON.stringify(savedSnapshot?.payload.sourceFiles ?? []);
  const skillNameDirty = (item?.payload.skillSpec.name ?? '') !== (savedSkill?.name ?? '');
  const skillDescriptionDirty = (item?.payload.skillSpec.description ?? '') !== (savedSkill?.description ?? '');
  const targetsDirty = (item?.targets.join(', ') ?? '') !== (savedSnapshot?.targets.join(', ') ?? '');
  const tagsDirty = (item?.tags.join(', ') ?? '') !== (savedSnapshot?.tags.join(', ') ?? '');
  const selectedFilePathDirty = selectedAttachedFile
    ? selectedAttachedFile.path !== (selectedSavedSourceFile?.path ?? '')
    : false;
  const selectedFileDescriptionDirty = selectedAttachedFile
    ? selectedAttachedFileDescription !== (selectedSavedSourceFile?.description ?? '')
    : false;
  const selectedFileContentDirty = selectedAttachedFile
    ? selectedAttachedFile.content !== (selectedSavedSourceFile?.content ?? '')
    : false;

  const refreshSourceFiles = async () => {
    if (!githubReference) {
      return;
    }

    setSourceLoading(true);
    setSourceError(null);
    try {
      const files = await fetchGithubFilesFromReference(githubReference);
      setSourceFiles(files);
      setItem((current) => {
        if (!current || current.type !== 'skill') {
          return current;
        }
        if ((current.payload.sourceFiles?.length ?? 0) > 0) {
          return current;
        }

        const updated: SkillLibraryItem = {
          ...current,
          updatedAt: Date.now(),
          payload: {
            ...current.payload,
            sourceFiles: files,
          },
        };
        upsertItem(updated);
        setSavedComparable(JSON.stringify(toDirtyComparable(updated)));
        setSavedSnapshot(updated);
        return updated;
      });
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : 'Unable to load source files.');
    } finally {
      setSourceLoading(false);
    }
  };

  useEffect(() => {
    if (!githubReference || sourceFiles.length > 0 || sourceLoading || sourceError) {
      return;
    }

    void refreshSourceFiles();
  }, [githubReference, sourceFiles.length, sourceLoading, sourceError]);

  useEffect(() => {
    if (attachedSourceFiles.length === 0) {
      if (selectedAttachedFilePath) {
        setSelectedAttachedFilePath('');
      }
      return;
    }

    if (!attachedSourceFiles.some((file) => file.path === selectedAttachedFilePath)) {
      setSelectedAttachedFilePath(attachedSourceFiles[0].path);
    }
  }, [attachedSourceFiles, selectedAttachedFilePath]);

  useEffect(
    () => () => {
      vimModeRef.current?.dispose();
    },
    []
  );

  useEffect(() => {
    if (vimWriteCommandsRegistered) {
      return;
    }
    vimWriteCommandsRegistered = true;

    vimExApi.Vim.defineEx('write', 'w', () => {
      vimSaveHandlerRef.current?.();
    });
    vimExApi.Vim.defineEx('wq', 'wq', () => {
      vimSaveHandlerRef.current?.();
    });
    vimExApi.Vim.defineEx('xit', 'x', () => {
      vimSaveHandlerRef.current?.();
    });
  }, []);

  if (!item) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm">Skill not found.</p>
          <Button className="mt-3" asChild>
            <Link to="/library/skills">Back to Skills</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const save = () => {
    try {
      const previous = getItem(item.id);
      if (previous && previous.type === 'skill') {
        setUndoSnapshot(previous);
      }

      const timestamp = Date.now();
      const normalized: SkillLibraryItem = {
        ...item,
        title: item.payload.skillSpec.name || item.title,
        updatedAt: timestamp,
      };

      upsertItem(normalized);
      setItem(normalized);
      setSavedComparable(JSON.stringify(toDirtyComparable(normalized)));
      setSavedSnapshot(normalized);
      success('Skill saved', `"${normalized.title}" was saved successfully.`);
    } catch (saveError) {
      error('Save failed', saveError instanceof Error ? saveError.message : 'Unable to save this skill.');
    }
  };

  const saveSourceFiles = () => {
    if (githubReference) {
      error('Read-only source files', 'GitHub-referenced source files cannot be edited here. Re-import from GitHub.');
      return;
    }
    if (!sourceFilesDirty) {
      success('No script changes', 'Source files are already up to date.');
      return;
    }

    try {
      const persisted = getItem(item.id);
      if (!persisted || persisted.type !== 'skill') {
        throw new Error('Unable to resolve persisted skill item.');
      }
      setUndoSnapshot(persisted);

      const timestamp = Date.now();
      const normalized: SkillLibraryItem = {
        ...persisted,
        updatedAt: timestamp,
        payload: {
          ...persisted.payload,
          sourceFiles: item.payload.sourceFiles ?? [],
        },
      };

      upsertItem(normalized);
      setItem((current) =>
        current
          ? {
              ...current,
              updatedAt: timestamp,
              payload: {
                ...current.payload,
                sourceFiles: normalized.payload.sourceFiles,
              },
            }
          : current
      );
      setSavedComparable(JSON.stringify(toDirtyComparable(normalized)));
      setSavedSnapshot(normalized);
      success('Source files saved', 'Script changes were saved independently.');
    } catch (saveError) {
      error('Save failed', saveError instanceof Error ? saveError.message : 'Unable to save source files.');
    }
  };

  const undoLastSave = () => {
    if (!undoSnapshot) {
      return;
    }

    try {
      upsertItem(undoSnapshot);
      setItem(undoSnapshot);
      setSavedComparable(JSON.stringify(toDirtyComparable(undoSnapshot)));
      setSavedSnapshot(undoSnapshot);
      setUndoSnapshot(null);
      success('Save undone', 'Reverted to the previous saved version.');
    } catch (undoError) {
      error('Undo failed', undoError instanceof Error ? undoError.message : 'Unable to undo last save.');
    }
  };

  vimSaveHandlerRef.current = saveSourceFiles;

  const updateSkill = (updater: (current: SkillLibraryItem) => SkillLibraryItem) => {
    setItem((current) => (current ? updater(current) : current));
  };

  const getSourceFileType = (path: string) => {
    const normalized = path.toLowerCase();
    if (normalized.endsWith('.md')) return 'markdown';
    if (
      normalized.endsWith('.ts') ||
      normalized.endsWith('.tsx') ||
      normalized.endsWith('.js') ||
      normalized.endsWith('.jsx') ||
      normalized.endsWith('.py') ||
      normalized.endsWith('.sh') ||
      normalized.endsWith('.bash') ||
      normalized.endsWith('.zsh') ||
      normalized.endsWith('.sql')
    ) {
      return 'script';
    }
    if (
      normalized.endsWith('.json') ||
      normalized.endsWith('.yaml') ||
      normalized.endsWith('.yml') ||
      normalized.endsWith('.toml') ||
      normalized.endsWith('.ini')
    ) {
      return 'config';
    }
    return 'text';
  };

  const updateSourceFiles = (
    updater: (files: SkillLibraryItem['payload']['sourceFiles']) => SkillLibraryItem['payload']['sourceFiles']
  ) => {
    if (githubReference) {
      error('Read-only source files', 'GitHub-referenced source files cannot be edited here. Re-import from GitHub.');
      return;
    }

    updateSkill((current) => ({
      ...current,
      payload: {
        ...current.payload,
        sourceFiles: updater(current.payload.sourceFiles ?? []),
      },
    }));
  };

  const onEditorMount: OnMount = (editor) => {
    vimModeRef.current?.dispose();
    if (!vimStatusRef.current) {
      return;
    }
    vimModeRef.current = initVimMode(editor, vimStatusRef.current);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
          <p className="text-sm text-muted-foreground">Skill detail and editor.</p>
          {hasUnsavedChanges ? (
            <p className="mt-1 text-xs font-medium text-amber-300">Unsaved changes</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">All changes saved</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setTab('export')}>
            Export
          </Button>
          <Button variant="outline" onClick={() => toggleFavorite(item.id)}>
            {item.favorite ? 'Unfavorite' : 'Favorite'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const copy = duplicateItem(item.id);
              if (copy) {
                navigate(`/library/skills/${copy.id}`);
              }
            }}
          >
            Duplicate
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              const confirmed = window.confirm('Delete this skill?');
              if (!confirmed) {
                return;
              }
              deleteItem(item.id);
              navigate('/library/skills');
            }}
          >
            Delete
          </Button>
          <Button onClick={save} disabled={!hasUnsavedChanges}>
            Save
          </Button>
          <Button variant="outline" onClick={undoLastSave} disabled={!undoSnapshot}>
            Undo Save
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-2 pt-6">
          <Button variant={tab === 'overview' ? 'default' : 'outline'} onClick={() => setTab('overview')}>
            Overview
          </Button>
          <Button variant={tab === 'edit' ? 'default' : 'outline'} onClick={() => setTab('edit')}>
            Edit
          </Button>
          <Button variant={tab === 'export' ? 'default' : 'outline'} onClick={() => setTab('export')}>
            Export
          </Button>
          <Button asChild variant="outline">
            <Link to="/library/skills">Back to list</Link>
          </Button>
        </CardContent>
      </Card>

      {tab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <details className="rounded-md border border-input bg-muted" open>
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium">
                  SKILL.md Preview {sourceSkillMarkdown ? '(Source)' : '(Generated)'}
                </summary>
                <div className="max-h-[45vh] overflow-auto border-t border-input p-3 text-sm text-foreground">
                  <article
                    className="
                      space-y-2
                      [&_h1]:text-xl [&_h1]:font-semibold
                      [&_h2]:pt-2 [&_h2]:text-lg [&_h2]:font-semibold
                      [&_h3]:text-base [&_h3]:font-semibold
                      [&_p]:leading-6
                      [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6
                      [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6
                      [&_li]:leading-6
                      [&_code]:rounded [&_code]:bg-background [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs
                      [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-background [&_pre]:p-3
                      [&_pre_code]:bg-transparent [&_pre_code]:p-0
                      [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
                      [&_th]:border [&_th]:border-border [&_th]:bg-background [&_th]:px-2 [&_th]:py-1 [&_th]:text-left
                      [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1
                      [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground
                    "
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewMarkdown}</ReactMarkdown>
                  </article>
                </div>
              </details>
            </div>
            <div className="rounded-md border border-input">
              <div className="border-b border-input px-3 py-2">
                <p className="text-sm font-medium">Attached Source Files ({attachedSourceFiles.length})</p>
              </div>
              {attachedSourceFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
                  <div className="max-h-[45vh] overflow-auto border-b border-input p-2 md:border-b-0 md:border-r">
                    <div className="space-y-1">
                      {attachedSourceFiles.map((file) => (
                        <button
                          key={file.path}
                          type="button"
                          className={`w-full rounded px-2 py-1.5 text-left text-xs ${
                            selectedAttachedFile?.path === file.path
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedAttachedFilePath(file.path)}
                        >
                          {file.path}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="max-h-[45vh] overflow-auto p-3">
                    {selectedAttachedFile ? (
                      <pre className="whitespace-pre-wrap rounded border border-input bg-muted p-3 text-xs">
                        {selectedAttachedFile.content}
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground">Select a file to preview its content.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="px-3 py-4 text-sm text-muted-foreground">
                  No source files are attached to this skill yet.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <div className="flex gap-2">
                <input
                  className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${
                    skillNameDirty ? 'border-amber-500/70' : 'border-input'
                  }`}
                  value={item.payload.skillSpec.name}
                  onChange={(event) =>
                    updateSkill((current) => ({
                      ...current,
                      payload: {
                        ...current.payload,
                        skillSpec: {
                          ...current.payload.skillSpec,
                          name: event.target.value,
                        },
                      },
                    }))
                  }
                />
                <Button type="button" variant="outline" onClick={save} disabled={!skillNameDirty}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!skillNameDirty}
                  onClick={() =>
                    updateSkill((current) => ({
                      ...current,
                      payload: {
                        ...current.payload,
                        skillSpec: {
                          ...current.payload.skillSpec,
                          name: savedSkill?.name ?? current.payload.skillSpec.name,
                        },
                      },
                    }))
                  }
                >
                  Undo
                </Button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <div className="space-y-2">
                <textarea
                  className={`min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ${
                    skillDescriptionDirty ? 'border-amber-500/70' : 'border-input'
                  }`}
                  value={item.payload.skillSpec.description}
                  onChange={(event) =>
                    updateSkill((current) => ({
                      ...current,
                      description: event.target.value,
                      payload: {
                        ...current.payload,
                        skillSpec: {
                          ...current.payload.skillSpec,
                          description: event.target.value,
                        },
                      },
                    }))
                  }
                />
                <Button type="button" variant="outline" onClick={save} disabled={!skillDescriptionDirty}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!skillDescriptionDirty}
                  onClick={() =>
                    updateSkill((current) => ({
                      ...current,
                      description: savedSkill?.description ?? current.description,
                      payload: {
                        ...current.payload,
                        skillSpec: {
                          ...current.payload.skillSpec,
                          description: savedSkill?.description ?? current.payload.skillSpec.description,
                        },
                      },
                    }))
                  }
                >
                  Undo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={item.status}
                  onChange={(event) =>
                    updateSkill((current) => ({
                      ...current,
                      status: event.target.value as LibraryStatus,
                    }))
                  }
                >
                  <option value="draft">draft</option>
                  <option value="stable">stable</option>
                  <option value="deprecated">deprecated</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Targets (comma)</label>
                <div className="flex gap-2">
                <input
                  className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${
                    targetsDirty ? 'border-amber-500/70' : 'border-input'
                  }`}
                  value={item.targets.join(', ')}
                  onChange={(event) =>
                    updateSkill((current) => ({
                      ...current,
                      targets: event.target.value
                        .split(',')
                        .map((value) => value.trim())
                        .filter(Boolean),
                    }))
                  }
                />
                <Button type="button" variant="outline" onClick={save} disabled={!targetsDirty}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!targetsDirty}
                  onClick={() =>
                    updateSkill((current) => ({
                      ...current,
                      targets: savedSnapshot?.targets ?? current.targets,
                    }))
                  }
                >
                  Undo
                </Button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tags (comma)</label>
                <div className="flex gap-2">
                <input
                  className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${
                    tagsDirty ? 'border-amber-500/70' : 'border-input'
                  }`}
                  value={item.tags.join(', ')}
                  onChange={(event) =>
                    updateSkill((current) => ({
                      ...current,
                      tags: event.target.value
                        .split(',')
                        .map((value) => value.trim())
                        .filter(Boolean),
                    }))
                  }
                />
                <Button type="button" variant="outline" onClick={save} disabled={!tagsDirty}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!tagsDirty}
                  onClick={() =>
                    updateSkill((current) => ({
                      ...current,
                      tags: savedSnapshot?.tags ?? current.tags,
                    }))
                  }
                >
                  Undo
                </Button>
                </div>
              </div>
            </div>

            {githubReference ? (
              <div className="rounded border p-3">
                <p className="text-sm font-medium">GitHub Reference</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This skill is referenced from GitHub and not stored as full local content.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Repo: {githubReference.owner}/{githubReference.repo}</p>
                <p className="text-xs text-muted-foreground">Branch: {githubReference.branch}</p>
                <p className="text-xs text-muted-foreground">Skill file: {githubReference.skillPath}</p>
                <p className="text-xs text-muted-foreground">Files in skill folder: {githubReference.files.length}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {tab === 'edit' && !githubReference && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Skill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">Inputs</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateSkill((current) => ({
                      ...current,
                      payload: {
                        ...current.payload,
                        skillSpec: {
                          ...current.payload.skillSpec,
                          inputs: [...current.payload.skillSpec.inputs, createEmptySkillInput()],
                        },
                      },
                    }))
                  }
                >
                  Add input
                </Button>
              </div>
              {item.payload.skillSpec.inputs.map((input, index) => {
                const inputDirty =
                  input.name !== (savedSkill?.inputs[index]?.name ?? '') ||
                  (input.description ?? '') !== (savedSkill?.inputs[index]?.description ?? '');

                return (
                  <div key={input.id} className="mb-2 grid grid-cols-1 gap-2 rounded border p-2 md:grid-cols-[1fr_2fr_auto]">
                  <input
                    className={`h-10 rounded-md border bg-background px-3 text-sm ${
                      input.name !== (savedSkill?.inputs[index]?.name ?? '') ? 'border-amber-500/70' : 'border-input'
                    }`}
                    placeholder="Input name"
                    value={input.name}
                    onChange={(event) =>
                      updateSkill((current) => {
                        const next = [...current.payload.skillSpec.inputs];
                        next[index] = { ...next[index], name: event.target.value };
                        return {
                          ...current,
                          payload: {
                            ...current.payload,
                            skillSpec: { ...current.payload.skillSpec, inputs: next },
                          },
                        };
                      })
                    }
                  />
                  <input
                    className={`h-10 rounded-md border bg-background px-3 text-sm ${
                      (input.description ?? '') !== (savedSkill?.inputs[index]?.description ?? '')
                        ? 'border-amber-500/70'
                        : 'border-input'
                    }`}
                    placeholder="Description"
                    value={input.description ?? ''}
                    onChange={(event) =>
                      updateSkill((current) => {
                        const next = [...current.payload.skillSpec.inputs];
                        next[index] = { ...next[index], description: event.target.value };
                        return {
                          ...current,
                          payload: {
                            ...current.payload,
                            skillSpec: { ...current.payload.skillSpec, inputs: next },
                          },
                        };
                      })
                    }
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      updateSkill((current) => {
                        const next = current.payload.skillSpec.inputs.filter((_, idx) => idx !== index);
                        return {
                          ...current,
                          payload: {
                            ...current.payload,
                            skillSpec: { ...current.payload.skillSpec, inputs: next },
                          },
                        };
                      })
                    }
                  >
                    Remove
                  </Button>
                  <Button size="sm" variant="outline" onClick={save} disabled={!inputDirty}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!inputDirty}
                    onClick={() =>
                      updateSkill((current) => {
                        const next = [...current.payload.skillSpec.inputs];
                        const saved = savedSkill?.inputs[index];
                        if (saved) {
                          next[index] = { ...saved };
                        } else {
                          next.splice(index, 1);
                        }
                        return {
                          ...current,
                          payload: {
                            ...current.payload,
                            skillSpec: { ...current.payload.skillSpec, inputs: next },
                          },
                        };
                      })
                    }
                  >
                    Undo
                  </Button>
                </div>
                );
              })}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">Steps</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateSkill((current) => ({
                      ...current,
                      payload: {
                        ...current.payload,
                        skillSpec: {
                          ...current.payload.skillSpec,
                          steps: [...current.payload.skillSpec.steps, 'New step'],
                        },
                      },
                    }))
                  }
                >
                  Add step
                </Button>
              </div>
              {item.payload.skillSpec.steps.map((step, index) => {
                const stepDirty = step !== (savedSkill?.steps[index] ?? '');
                return (
                  <div key={`step-${index}`} className="mb-2 rounded border p-2">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Step {index + 1}</p>
                  <textarea
                    className={`min-h-[70px] w-full rounded-md border bg-background px-3 py-2 text-sm ${
                      step !== (savedSkill?.steps[index] ?? '') ? 'border-amber-500/70' : 'border-input'
                    }`}
                    value={step}
                    onChange={(event) =>
                      updateSkill((current) => {
                        const next = [...current.payload.skillSpec.steps];
                        next[index] = event.target.value;
                        return {
                          ...current,
                          payload: {
                            ...current.payload,
                            skillSpec: { ...current.payload.skillSpec, steps: next },
                          },
                        };
                      })
                    }
                  />
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={index === 0}
                      onClick={() =>
                        updateSkill((current) => {
                          const next = [...current.payload.skillSpec.steps];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return {
                            ...current,
                            payload: {
                              ...current.payload,
                              skillSpec: { ...current.payload.skillSpec, steps: next },
                            },
                          };
                        })
                      }
                    >
                      Move up
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={index === item.payload.skillSpec.steps.length - 1}
                      onClick={() =>
                        updateSkill((current) => {
                          const next = [...current.payload.skillSpec.steps];
                          [next[index + 1], next[index]] = [next[index], next[index + 1]];
                          return {
                            ...current,
                            payload: {
                              ...current.payload,
                              skillSpec: { ...current.payload.skillSpec, steps: next },
                            },
                          };
                        })
                      }
                    >
                      Move down
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        updateSkill((current) => {
                          const next = current.payload.skillSpec.steps.filter((_, idx) => idx !== index);
                          return {
                            ...current,
                            payload: {
                              ...current.payload,
                              skillSpec: {
                                ...current.payload.skillSpec,
                                steps: next.length > 0 ? next : ['New step'],
                              },
                            },
                          };
                        })
                      }
                    >
                      Remove
                    </Button>
                    <Button size="sm" variant="outline" onClick={save} disabled={!stepDirty}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!stepDirty}
                      onClick={() =>
                        updateSkill((current) => {
                          const next = [...current.payload.skillSpec.steps];
                          const saved = savedSkill?.steps[index];
                          if (saved !== undefined) {
                            next[index] = saved;
                          } else {
                            next.splice(index, 1);
                          }
                          return {
                            ...current,
                            payload: {
                              ...current.payload,
                              skillSpec: {
                                ...current.payload.skillSpec,
                                steps: next.length > 0 ? next : ['New step'],
                              },
                            },
                          };
                        })
                      }
                    >
                      Undo
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>

            {(['outputs', 'verification'] as const).map((fieldName) => (
              <div key={fieldName}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium">{fieldName === 'outputs' ? 'Outputs' : 'Verification checklist'}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateSkill((current) => ({
                        ...current,
                        payload: {
                          ...current.payload,
                          skillSpec: {
                            ...current.payload.skillSpec,
                            [fieldName]: [...current.payload.skillSpec[fieldName], 'New item'],
                          },
                        },
                      }))
                    }
                  >
                    Add item
                  </Button>
                </div>

                {item.payload.skillSpec[fieldName].map((value, index) => {
                  const rowDirty = value !== (savedSkill?.[fieldName]?.[index] ?? '');

                  return (
                    <div key={`${fieldName}-${index}`} className="mb-2 flex gap-2">
                    <input
                      className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${
                        value !== (savedSkill?.[fieldName]?.[index] ?? '') ? 'border-amber-500/70' : 'border-input'
                      }`}
                      value={value}
                      onChange={(event) =>
                        updateSkill((current) => {
                          const next = [...current.payload.skillSpec[fieldName]];
                          next[index] = event.target.value;
                          return {
                            ...current,
                            payload: {
                              ...current.payload,
                              skillSpec: {
                                ...current.payload.skillSpec,
                                [fieldName]: next,
                              },
                            },
                          };
                        })
                      }
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        updateSkill((current) => {
                          const next = current.payload.skillSpec[fieldName].filter((_, idx) => idx !== index);
                          return {
                            ...current,
                            payload: {
                              ...current.payload,
                              skillSpec: {
                                ...current.payload.skillSpec,
                                [fieldName]: next,
                              },
                            },
                          };
                        })
                      }
                    >
                      Remove
                    </Button>
                    <Button size="sm" variant="outline" onClick={save} disabled={!rowDirty}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!rowDirty}
                      onClick={() =>
                        updateSkill((current) => {
                          const next = [...current.payload.skillSpec[fieldName]];
                          const saved = savedSkill?.[fieldName]?.[index];
                          if (saved !== undefined) {
                            next[index] = saved;
                          } else {
                            next.splice(index, 1);
                          }
                          return {
                            ...current,
                            payload: {
                              ...current.payload,
                              skillSpec: {
                                ...current.payload.skillSpec,
                                [fieldName]: next,
                              },
                            },
                          };
                        })
                      }
                    >
                      Undo
                    </Button>
                  </div>
                  );
                })}
              </div>
            ))}

            <div className="space-y-3 rounded border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">Source files</p>
                  {sourceFilesDirty ? (
                    <p className="text-xs font-medium text-cyan-300">Unsaved script changes</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Scripts saved</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!sourceFilesDirty || !!githubReference}
                    onClick={saveSourceFiles}
                  >
                    Save Source Files
                  </Button>
                  <Button type="button" variant="outline" onClick={undoLastSave} disabled={!undoSnapshot}>
                    Undo Save
                  </Button>
                  <label className="inline-flex cursor-pointer items-center rounded-md border border-input px-3 py-2 text-sm hover:bg-muted">
                    Upload file
                    <input
                      type="file"
                      className="hidden"
                      accept=".md,.txt,.json,.yaml,.yml,.toml,.ini,.py,.js,.jsx,.ts,.tsx,.sh,.bash,.zsh,.sql,.xml,.csv,.html,.css"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }
                        const content = await file.text();
                        updateSourceFiles((currentFiles) => {
                          const existingIndex = currentFiles.findIndex((itemFile) => itemFile.path === file.name);
                          if (existingIndex >= 0) {
                            const next = [...currentFiles];
                            next[existingIndex] = {
                              ...next[existingIndex],
                              path: file.name,
                              content,
                              description:
                                next[existingIndex].description?.trim() ||
                                defaultSourceFileDescription(file.name),
                            };
                            return next;
                          }
                          return [
                            ...currentFiles,
                            {
                              path: file.name,
                              description: defaultSourceFileDescription(file.name),
                              content,
                            },
                          ];
                        });
                        setSelectedAttachedFilePath(file.name);
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <input
                  className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="New file path (e.g. scripts/analyze.py)"
                  value={newSourceFilePath}
                  onChange={(event) => setNewSourceFilePath(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const path = newSourceFilePath.trim();
                    if (!path) {
                      return;
                    }
                    updateSourceFiles((currentFiles) => {
                      if (currentFiles.some((file) => file.path === path)) {
                        return currentFiles;
                      }
                      return [
                        ...currentFiles,
                        {
                          path,
                          description: defaultSourceFileDescription(path),
                          content: '',
                        },
                      ];
                    });
                    setSelectedAttachedFilePath(path);
                    setNewSourceFilePath('');
                  }}
                >
                  Add file
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!selectedAttachedFile}
                  onClick={() => {
                    const targetPath = selectedAttachedFile?.path;
                    if (!targetPath) {
                      return;
                    }
                    updateSourceFiles((currentFiles) => currentFiles.filter((file) => file.path !== targetPath));
                    setSelectedAttachedFilePath('');
                  }}
                >
                  Remove selected
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[300px_1fr]">
                <div className="space-y-2 rounded border border-input p-2">
                  <p className="px-1 text-xs font-medium text-muted-foreground">
                    File list ({item.payload.sourceFiles?.length ?? 0})
                  </p>
                  <div className="max-h-60 space-y-1 overflow-auto">
                    {(item.payload.sourceFiles ?? []).map((file) => (
                      <button
                        key={file.path}
                        type="button"
                        className={`w-full rounded border px-2 py-1.5 text-left text-xs ${
                          selectedAttachedFile?.path === file.path ? 'border-accent bg-accent/20' : 'border-input'
                        }`}
                        onClick={() => setSelectedAttachedFilePath(file.path)}
                      >
                        <p className="font-medium">{file.path}</p>
                        {file.description?.trim() ? (
                          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{file.description}</p>
                        ) : null}
                        <p className="text-[11px] text-muted-foreground">type: {getSourceFileType(file.path)}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedAttachedFile ? (
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">File path</p>
                      <input
                        className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${
                          selectedFilePathDirty ? 'border-cyan-500/70' : 'border-input'
                        }`}
                        placeholder="scripts/analyze.py"
                        value={selectedAttachedFile.path}
                        onChange={(event) => {
                          const nextPath = event.target.value;
                          const currentPath = selectedAttachedFile.path;
                          updateSourceFiles((currentFiles) => {
                            const normalizedNextPath = nextPath.trim();
                            if (!normalizedNextPath) {
                              return currentFiles;
                            }
                            const pathConflict = currentFiles.some(
                              (file) => file.path === normalizedNextPath && file.path !== currentPath
                            );
                            if (pathConflict) {
                              error('Duplicate file path', `A source file with path "${normalizedNextPath}" already exists.`);
                              return currentFiles;
                            }
                            const nextFiles = currentFiles.map((file) =>
                              file.path === currentPath ? { ...file, path: normalizedNextPath } : file
                            );
                            setSelectedAttachedFilePath(normalizedNextPath);
                            return nextFiles;
                          });
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!selectedFilePathDirty}
                        onClick={() =>
                          updateSourceFiles((currentFiles) => {
                            if (selectedSourceIndex < 0 || !selectedSavedSourceFile) {
                              return currentFiles;
                            }
                            const next = [...currentFiles];
                            next[selectedSourceIndex] = {
                              ...next[selectedSourceIndex],
                              path: selectedSavedSourceFile.path,
                            };
                            setSelectedAttachedFilePath(selectedSavedSourceFile.path);
                            return next;
                          })
                        }
                      >
                        Undo
                      </Button>
                    </div>
                  ) : null}
                  {selectedAttachedFile ? (
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">File description</p>
                      <div className="flex gap-2">
                      <input
                        className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${
                          selectedFileDescriptionDirty ? 'border-cyan-500/70' : 'border-input'
                        }`}
                        placeholder="Explain how this file relates to the skill and how to run/use it"
                        value={selectedAttachedFileDescription}
                        onChange={(event) => {
                          const selectedPath = selectedAttachedFile.path;
                          const nextDescription = event.target.value;
                          updateSourceFiles((currentFiles) =>
                            currentFiles.map((file) =>
                              file.path === selectedPath ? { ...file, description: nextDescription } : file
                            )
                          );
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={saveSourceFiles}
                        disabled={!selectedFileDescriptionDirty || !!githubReference}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!selectedFileDescriptionDirty}
                        onClick={() =>
                          updateSourceFiles((currentFiles) => {
                            if (selectedSourceIndex < 0 || !selectedSavedSourceFile) {
                              return currentFiles;
                            }
                            const next = [...currentFiles];
                            next[selectedSourceIndex] = {
                              ...next[selectedSourceIndex],
                              description: selectedSavedSourceFile.description,
                            };
                            return next;
                          })
                        }
                      >
                        Undo
                      </Button>
                      </div>
                    </div>
                  ) : null}
                  <p className="text-xs font-medium text-muted-foreground">
                    File content editor {selectedAttachedFile ? `(${selectedAttachedFile.path})` : ''}
                  </p>
                  {selectedAttachedFile ? (
                    <div
                      className={`rounded-md border bg-background p-2 ${
                        selectedFileContentDirty ? 'border-cyan-500/70' : 'border-input'
                      }`}
                    >
                      <MonacoEditor
                        key={selectedAttachedFile.path}
                        height="320px"
                        language={getMonacoLanguage(selectedAttachedFile.path)}
                        value={selectedAttachedFile.content}
                        onMount={onEditorMount}
                        onChange={(nextContent) => {
                          const selectedPath = selectedAttachedFile.path;
                          updateSourceFiles((currentFiles) =>
                            currentFiles.map((file) =>
                              file.path === selectedPath ? { ...file, content: nextContent ?? '' } : file
                            )
                          );
                        }}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 12,
                          wordWrap: 'on',
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                          lineNumbers: 'on',
                        }}
                      />
                      <div
                        ref={vimStatusRef}
                        className="mt-2 rounded border border-input bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground"
                      />
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
                      Select or add a file to edit its contents.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'edit' && githubReference && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Skill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This skill is GitHub-referenced. Edit the source files in the repository and re-import to sync.
            </p>
            <Button variant="outline" onClick={() => setTab('export')}>
              View Source Representation
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 'export' && (
        <Card>
          <CardHeader>
            <CardTitle>Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {githubReference ? (
              <div className="space-y-3 rounded border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">GitHub Source Files</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => void refreshSourceFiles()}>
                    Refresh from GitHub
                  </Button>
                </div>
                {sourceLoading ? <p className="text-sm text-muted-foreground">Loading source files...</p> : null}
                {sourceError ? <p className="text-sm text-red-400">{sourceError}</p> : null}
                {sourceFiles.map((file) => (
                  <details key={file.path} className="rounded border p-2">
                    <summary className="cursor-pointer text-xs font-medium">{file.path}</summary>
                    <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                      {file.content}
                    </pre>
                  </details>
                ))}
              </div>
            ) : null}
            <textarea
              className="min-h-[360px] w-full rounded-md border border-input bg-muted p-3 font-mono text-xs text-foreground"
              value={exportText}
              readOnly
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.clipboard) {
                    void navigator.clipboard.writeText(exportText);
                  }
                }}
              >
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([exportText], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${item.payload.skillSpec.name.toLowerCase().replace(/\s+/g, '-')}.md`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
              >
                Download SKILL.md
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
