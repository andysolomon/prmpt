import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LibraryStatus,
  deleteItem,
  duplicateItem,
  toggleArchived,
  toggleFavorite,
} from '@/lib/library';

import { useLibraryItems } from './useLibraryItems';

function renderTagSummary(tags: string[]): string {
  if (tags.length === 0) {
    return '-';
  }
  if (tags.length <= 3) {
    return tags.join(', ');
  }
  return `${tags.slice(0, 3).join(', ')} +${tags.length - 3}`;
}

export function AnatomiesListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | LibraryStatus>('all');

  const anatomyItems = useLibraryItems({ type: 'anatomy', query, favoriteOnly, includeArchived: true });
  const filtered = useMemo(
    () => anatomyItems.filter((item) => (statusFilter === 'all' ? true : item.status === statusFilter)),
    [anatomyItems, statusFilter]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anatomy Library</h1>
          <p className="text-sm text-muted-foreground">Manage Prompt Forge anatomy documents independently of prompts.</p>
        </div>
        <Button asChild>
          <Link to="/anatomy">New Anatomy</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-2 pt-6">
          <input
            className="h-10 min-w-[220px] rounded-md border border-input bg-background px-3 text-sm"
            placeholder="Search by title, description, or tags"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button variant={favoriteOnly ? 'default' : 'outline'} onClick={() => setFavoriteOnly((value) => !value)}>
            Favorites
          </Button>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | LibraryStatus)}
          >
            <option value="all">All status</option>
            <option value="draft">Draft</option>
            <option value="stable">Stable</option>
            <option value="deprecated">Deprecated</option>
          </select>
          <Button asChild variant="outline">
            <Link to="/library">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anatomies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Title</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Targets</th>
                  <th className="p-2">Tags</th>
                  <th className="p-2">Updated</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      <button className="font-medium hover:underline" onClick={() => navigate(`/anatomy?itemId=${item.id}`)}>
                        {item.title}
                      </button>
                      {item.archived && <p className="text-xs text-muted-foreground">Archived</p>}
                    </td>
                    <td className="p-2">{item.status}</td>
                    <td className="p-2">{item.targets.join(', ') || '-'}</td>
                    <td className="p-2">{renderTagSummary(item.tags)}</td>
                    <td className="p-2">{new Date(item.updatedAt).toLocaleDateString()}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/anatomy?itemId=${item.id}`)}>
                          Open
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleFavorite(item.id)}>
                          {item.favorite ? 'Unfavorite' : 'Favorite'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleArchived(item.id)}>
                          {item.archived ? 'Unarchive' : 'Archive'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const copy = duplicateItem(item.id);
                            if (copy && copy.type === 'anatomy') {
                              navigate(`/anatomy?itemId=${copy.id}`);
                            }
                          }}
                        >
                          Duplicate
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const confirmed = window.confirm('Delete this anatomy?');
                            if (!confirmed) {
                              return;
                            }
                            deleteItem(item.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="pt-4 text-sm text-muted-foreground">No anatomies match the current filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
