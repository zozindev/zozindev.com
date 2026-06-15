export const site = {
  name: "zozindev",
  url: "https://zozindev.com",
  adsenseAccount: "ca-pub-5779110294111958",
  githubUrl: "https://github.com/zozindev/",
  instagramUrl: "https://www.instagram.com/zozindev/",
};

export function canonicalUrl(pathname: string) {
  return new URL(pathname, site.url).toString();
}

export function sortPostsByDate<T extends { data: { date: string } }>(posts: T[]) {
  return [...posts].sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export function postSlug(post: { id: string }) {
  return post.id.replace(/\.md$/, "");
}

export function postUrl(post: { id: string }) {
  return `/blog/${postSlug(post)}/`;
}
