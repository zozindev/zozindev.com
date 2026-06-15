import { getCollection } from "astro:content";
import { projects } from "../data/projects";
import { canonicalUrl, postUrl, sortPostsByDate } from "../lib/site";

const staticPages = [
  { path: "/", lastmod: "2026-06-11", changefreq: "monthly", priority: "1.0" },
  { path: "/blog/", lastmod: "2026-06-11", changefreq: "weekly", priority: "0.8" },
  { path: "/projects/", lastmod: "2026-06-11", changefreq: "monthly", priority: "0.8" },
  { path: "/about/", lastmod: "2026-06-15", changefreq: "monthly", priority: "0.6" },
  { path: "/contact/", lastmod: "2026-06-15", changefreq: "yearly", priority: "0.4" },
  { path: "/privacy/", lastmod: "2026-06-11", changefreq: "yearly", priority: "0.3" },
];

function urlEntry(page: { path: string; lastmod: string; changefreq: string; priority: string }) {
  return `  <url>
    <loc>${canonicalUrl(page.path)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
}

export async function GET() {
  const posts = sortPostsByDate(await getCollection("posts"));
  const postPages = posts.map((post) => ({
    path: postUrl(post),
    lastmod: post.data.date,
    changefreq: "monthly",
    priority: post.data.priority.toFixed(1),
  }));
  const projectPages = projects.map((project) => ({
    path: project.detailUrl,
    lastmod: "2026-06-11",
    changefreq: "monthly",
    priority: "0.7",
  }));

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...postPages, ...projectPages].map(urlEntry).join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
