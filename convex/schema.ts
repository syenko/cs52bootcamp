// Note: the indices by_id and by_creation_time are automatically created by Convex

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    createdAt: v.number(),
    groups: v.array(v.id("groups")),
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
    memberIds: v.array(v.id("users")),
  }),

  calendarInfo: defineTable({
    userId: v.string(),
    data: v.string(),
  }).index("by_user_id", ["userId"]),
});
