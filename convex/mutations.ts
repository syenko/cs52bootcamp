import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createGroup = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!existingUser) {
      throw new Error("User not found");
    }

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      createdAt: Date.now(),
      memberIds: [existingUser._id],
    });

    ctx.db.patch(existingUser._id, {
      groups: [...existingUser.groups, groupId],
    });

    return groupId;
  },
});

export const joinGroup = mutation({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!existingUser) {
      throw new Error("User not found");
    }

    const existingGroup = await ctx.db.get(args.groupId);

    if (!existingGroup) {
      throw new Error("Group not found");
    }

    if (existingGroup.memberIds.includes(existingUser._id)) {
      throw new Error("User already in group");
    }

    ctx.db.patch(args.groupId, {
      memberIds: [...existingGroup.memberIds, existingUser._id],
    });

    ctx.db.patch(existingUser._id, {
      groups: [...existingUser.groups, args.groupId],
    });

    return existingGroup._id;
  },
});

export const leaveGroup = mutation({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!existingUser) {
      throw new Error("User not found");
    }

    const existingGroup = await ctx.db.get(args.groupId);

    if (!existingGroup) {
      throw new Error("Group not found");
    }

    if (!existingGroup.memberIds.includes(existingUser._id)) {
      throw new Error("User not in group");
    }

    ctx.db.patch(args.groupId, {
      memberIds: existingGroup.memberIds.filter(
        (id) => id !== existingUser._id
      ),
    });

    if (existingGroup.memberIds.length === 0) {
      await ctx.db.delete(args.groupId);
    }

    ctx.db.patch(existingUser._id, {
      groups: existingUser.groups.filter((id) => id !== args.groupId),
    });

    return existingGroup._id;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      clerkId: identity.subject,
      createdAt: Date.now(),
      groups: [],
    });

    return userId;
  },
});

export const createMessage = mutation({
  args: {
    content: v.string(),
    sender: v.union(v.literal("user"), v.literal("komodo")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Create message
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      sender: args.sender,
      userId: user._id,
      userName: user.name,
      createdAt: Date.now(),
    });

    return messageId;
  },
});
