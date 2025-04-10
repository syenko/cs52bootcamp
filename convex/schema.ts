// Note: the indices by_id and by_creation_time are automatically created by Convex

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    createdAt: v.number(),
    groups: v.array(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  messages: defineTable({
    content: v.string(),
    sender: v.union(v.literal("user"), v.literal("komodo")),
    userId: v.string(),
    userName: v.string(),
    createdAt: v.number(),
  }).index("by_user_id", ["userId"]),

  groups: defineTable({
    name: v.string(),
    createdAt: v.number(),
    memberIds: v.array(v.string()),
  }),

  freeTimes: defineTable({
    userId: v.string(),
    times: v.array(v.array(v.array(v.float64())))
  }).index("by_user_id", ["userId"]),

});
