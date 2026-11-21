import type { APIRoute } from 'astro';
import { getProjects } from '../lib/content';

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://eazyfix.gr');

  const pages = [
    '/',
    '/el/',
    '/en/',
    '/templates',
    '/en/templates',
    '/meisitika',
    '/en/meisitika',
    '/privacy',
    '/en/privacy',
    '/cookies',
    '/en/cookies',
    '/terms',
    '/en/terms',
    '/imprint',
    '/en/imprint',
  ];
  const projects = await getProjects();
  projects
    .filter((project) => project.enabled)
    .forEach((project) => {
      pages.push(`/projects/${project.slug}`, `/en/projects/${project.slug}`);
    });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((path) => `  <url><loc>${new URL(path, base).href}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
