import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
    authorId: v.id("users"),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
