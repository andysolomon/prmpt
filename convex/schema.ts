import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  libraryItems: defineTable({
    userId: v.string(),
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
  })
    .index('byUser', ['userId'])
    .index('byUserAndId', ['userId', 'id'])
    .index('byUserAndType', ['userId', 'type'])
    .index('byUserUpdatedAt', ['userId', 'updatedAt'])
    .index('byUserLastUsedAt', ['userId', 'lastUsedAt'])
    .index('byUserFavorite', ['userId', 'favorite']),
});
