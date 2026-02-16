import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { renderSkillToClaudeMarkdown } from '@/lib/skill/formatters';

type SkillTab = 'overview' | 'edit' | 'export';

export function SkillDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SkillTab>('overview');
  const [item, setItem] = useState<SkillLibraryItem | null>(null);

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
    touchLastUsed(found.id);
  }, [skillId]);

  const exportText = useMemo(() => (item ? renderSkillToClaudeMarkdown(item.payload.skillSpec) : ''), [item]);

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
    const timestamp = Date.now();
    const normalized: SkillLibraryItem = {
      ...item,
      title: item.payload.skillSpec.name || item.title,
      updatedAt: timestamp,
    };

    upsertItem(normalized);
    setItem(normalized);
  };

  const updateSkill = (updater: (current: SkillLibraryItem) => SkillLibraryItem) => {
    setItem((current) => (current ? updater(current) : current));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
          <p className="text-sm text-muted-foreground">Skill detail and editor.</p>
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
          <Button onClick={save}>Save</Button>
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
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tags (comma)</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'edit' && (
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
              {item.payload.skillSpec.inputs.map((input, index) => (
                <div key={input.id} className="mb-2 grid grid-cols-1 gap-2 rounded border p-2 md:grid-cols-[1fr_2fr_auto]">
                  <input
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
                </div>
              ))}
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
              {item.payload.skillSpec.steps.map((step, index) => (
                <div key={`step-${index}`} className="mb-2 rounded border p-2">
                  <textarea
                    className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  </div>
                </div>
              ))}
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

                {item.payload.skillSpec[fieldName].map((value, index) => (
                  <div key={`${fieldName}-${index}`} className="mb-2 flex gap-2">
                    <input
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'export' && (
        <Card>
          <CardHeader>
            <CardTitle>Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea className="min-h-[360px] w-full rounded-md border border-input bg-slate-50 p-3 font-mono text-xs" value={exportText} readOnly />
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
