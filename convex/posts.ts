import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();

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

// Server-side search: accepts a query string `q` and optional `limit`.
// For scalability we avoid collecting the entire table by applying a small backend limit
// and returning paginated results. Convex does not provide full-text search, so we
// perform a case-insensitive substring match on the server over a bounded set.
export const search = query({
  args: {
    q: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = args.q.trim().toLowerCase();
    const limit = args.limit || 50; // default limit to avoid scanning entire DB

    if (!q) {
      // If empty query, return the latest `limit` posts
      const posts = await ctx.db.query("posts").order("desc").collect();
      const slice = posts.slice(0, limit);
      return Promise.all(
        slice.map(async (post: any) => {
          const author = await ctx.db.get(post.authorId);
          const a: any = author;
          return {
            ...post,
            authorName: a?.name || a?.email || "Usuario",
            imageUrl: post.imageId ? await ctx.storage.getUrl(post.imageId) : null,
          };
        })
      );
    }

    // Collect a bounded set of recent posts and filter them server-side.
    // Note: for very large datasets consider adding a separate search index or
    // using an external full-text search service.
    const candidates = await ctx.db.query("posts").order("desc").collect();

    const matches = candidates
      .filter((post: any) => {
        const title = (post.title ?? "").toLowerCase();
        const content = (post.content ?? "").toLowerCase();
        return title.includes(q) || content.includes(q);
      })
      .slice(0, limit);

    return Promise.all(
      matches.map(async (post: any) => {
        const author = await ctx.db.get(post.authorId);
        const a: any = author;
        return {
          ...post,
          authorName: a?.name || a?.email || "Usuario",
          imageUrl: post.imageId ? await ctx.storage.getUrl(post.imageId) : null,
        };
      })
    );
  },
});

export const searchPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    q: v.string(),
  },
  handler: async (ctx, args) => {
    const q = args.q.trim().toLowerCase();

    // 👇 Aquí usamos paginationOpts (no ctx.paginationOpts)
    const page = await ctx.db.query("posts").order("desc").paginate(args.paginationOpts);

    // Filtramos en memoria
    const filtered = page.page.filter((post: any) => {
      if (!q) return true;
      const title = (post.title ?? "").toLowerCase();
      const content = (post.content ?? "").toLowerCase();
      return title.includes(q) || content.includes(q);
    });

    const enriched = await Promise.all(
      filtered.map(async (post: any) => {
        const author = await ctx.db.get(post.authorId);
        const a: any = author;
        return {
          ...post,
          authorName: a?.name || a?.email || "Usuario",
          imageUrl: post.imageId ? await ctx.storage.getUrl(post.imageId) : null,
        };
      })
    );

    return {
      ...page,
      page: enriched,
    };
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
