import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    updated: z.string().optional(),
    category: z.string(),
    author: z.string().default("zozindev"),
    indexable: z.boolean().default(true),
    priority: z.number().default(0.7),
    includeAdsenseScript: z.boolean().optional(),
  }),
});

export const collections = { posts };
