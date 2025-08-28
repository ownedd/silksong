import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .order("desc")
      .collect();

    return Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          authorName: author?.name || author?.email || "Usuario",
          imageUrl: post.imageId ? await ctx.storage.getUrl(post.imageId) : null,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Debes estar autenticado para crear una entrada");
    }

    return await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      imageId: args.imageId,
      authorId: userId,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Debes estar autenticado para subir imágenes");
    }
    return await ctx.storage.generateUploadUrl();
  },
});
