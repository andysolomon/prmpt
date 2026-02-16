import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LibraryItem,
  createSkillLibraryItem,
  touchLastUsed,
  upsertItem,
} from '@/lib/library';

import { useLibraryItems } from './useLibraryItems';

function itemPath(item: LibraryItem): string {
  if (item.type === 'skill') {
    return `/library/skills/${item.id}`;
  }
  if (item.type === 'anatomy') {
    return `/anatomy?itemId=${item.id}`;
  }
  return `/library/prompts/${item.id}`;
}

export function LibraryDashboardPage() {
  const navigate = useNavigate();
  const allItems = useLibraryItems();

  const continueItem = useMemo(
    () => [...allItems].sort((left, right) => right.lastUsedAt - left.lastUsedAt)[0] ?? null,
    [allItems]
  );
  const recents = useMemo(
    () => [...allItems].sort((left, right) => right.lastUsedAt - left.lastUsedAt).slice(0, 10),
    [allItems]
  );
  const favorites = useMemo(() => allItems.filter((item) => item.favorite).slice(0, 10), [allItems]);

  const openItem = (item: LibraryItem) => {
    touchLastUsed(item.id);
    navigate(itemPath(item));
  };

  const createSkill = () => {
    const skill = createSkillLibraryItem();
    upsertItem(skill);
    navigate(`/library/skills/${skill.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library Dashboard</h1>
          <p className="text-sm text-muted-foreground">Continue recent work, open favorites, or create new items.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/library/prompts">Prompt Library</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/library/anatomies">Anatomy Library</Link>
          </Button>
          <Button onClick={createSkill}>New Skill</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Continue</CardTitle>
        </CardHeader>
        <CardContent>
          {continueItem ? (
            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{continueItem.title}</p>
                <p className="text-xs text-muted-foreground">{continueItem.type}</p>
              </div>
              <Button size="sm" onClick={() => openItem(continueItem)}>
                Resume
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No items yet. Create your first prompt or skill.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              recents.map((item) => (
                <button
                  key={item.id}
                  className="w-full rounded border p-3 text-left hover:bg-accent"
                  onClick={() => openItem(item)}
                  type="button"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.type} · {new Date(item.lastUsedAt).toLocaleString()}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Favorites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground">No favorited items yet.</p>
            ) : (
              favorites.map((item) => (
                <button
                  key={item.id}
                  className="w-full rounded border p-3 text-left hover:bg-accent"
                  onClick={() => openItem(item)}
                  type="button"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
