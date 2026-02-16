import { useEffect, useState } from 'react';

import { LibraryItem, ListItemsOptions, listItems, subscribeLibrary } from '@/lib/library';

export function useLibraryItems(options: ListItemsOptions = {}): LibraryItem[] {
  const [items, setItems] = useState<LibraryItem[]>(() => listItems(options));

  useEffect(() => {
    setItems(listItems(options));

    return subscribeLibrary(() => {
      setItems(listItems(options));
    });
  }, [options.favoriteOnly, options.includeArchived, options.query, options.type]);

  return items;
}
