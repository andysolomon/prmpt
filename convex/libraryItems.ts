import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

async function requireUserId(ctx: Parameters<typeof query>[0]['handler'] extends (ctx: infer T, ...args: never[]) => unknown ? T : never): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }
  return identity.subject;
}

export const listLibraryItems = query({
  args: {
    type: v.optional(v.union(v.literal('prompt'), v.literal('skill'), v.literal('anatomy'))),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    let results = await ctx.db.query('libraryItems').withIndex('byUser', (q) => q.eq('userId', userId)).collect();

    if (!args.includeArchived) {
      results = results.filter((item) => !item.archived);
    }
    if (args.type) {
      results = results.filter((item) => item.type === args.type);
    }
    return results.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getLibraryItem = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query('libraryItems')
      .withIndex('byUserAndId', (q) => q.eq('userId', userId).eq('id', args.id))
      .first();
  },
});

export const upsertLibraryItem = mutation({
  args: {
    item: v.object({
      id: v.string(),
      type: v.union(v.literal('prompt'), v.literal('skill'), v.literal('anatomy')),
      title: v.string(),
      description: v.optional(v.string()),
      tags: v.array(v.string()),
      targets: v.array(v.string()),
      status: v.union(v.literal('draft'), v.literal('stable'), v.literal('deprecated')),
      favorite: v.boolean(),
      archived: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
      lastUsedAt: v.number(),
      schemaVersion: v.number(),
      spec: v.any(),
      contentSearch: v.string(),
      source: v.optional(
        v.object({
          kind: v.union(v.literal('manual'), v.literal('github')),
          url: v.optional(v.string()),
          ref: v.optional(v.string()),
          path: v.optional(v.string()),
          importedAt: v.optional(v.number()),
          contentHash: v.optional(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query('libraryItems')
      .withIndex('byUserAndId', (q) => q.eq('userId', userId).eq('id', args.item.id))
      .first();

    if (!existing) {
      await ctx.db.insert('libraryItems', {
        userId,
        ...args.item,
      });
      return;
    }

    // Last-write-wins based on updatedAt.
    if (existing.updatedAt > args.item.updatedAt) {
      return;
    }

    await ctx.db.patch(existing._id, {
      ...args.item,
      userId,
    });
  },
});

export const deleteLibraryItem = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query('libraryItems')
      .withIndex('byUserAndId', (q) => q.eq('userId', userId).eq('id', args.id))
      .first();
    if (!existing) {
      return;
    }
    await ctx.db.delete(existing._id);
  },
});

export const touchLastUsed = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query('libraryItems')
      .withIndex('byUserAndId', (q) => q.eq('userId', userId).eq('id', args.id))
      .first();
    if (!existing) {
      return;
    }
    await ctx.db.patch(existing._id, {
      lastUsedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const toggleFavorite = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query('libraryItems')
      .withIndex('byUserAndId', (q) => q.eq('userId', userId).eq('id', args.id))
      .first();
    if (!existing) {
      return;
    }
    await ctx.db.patch(existing._id, {
      favorite: !existing.favorite,
      updatedAt: Date.now(),
    });
  },
});

export const toggleArchived = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query('libraryItems')
      .withIndex('byUserAndId', (q) => q.eq('userId', userId).eq('id', args.id))
      .first();
    if (!existing) {
      return;
    }
    await ctx.db.patch(existing._id, {
      archived: !existing.archived,
      updatedAt: Date.now(),
    });
  },
});
