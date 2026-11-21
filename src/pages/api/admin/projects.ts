import type { APIRoute } from 'astro';
import { COOKIE_NAME, isValidSession } from '../../../lib/auth';
import { getProjects, saveProjects } from '../../../lib/content';
import type { Project } from '../../../data/projects';
import { validateProjects } from '../../../lib/project-validation';

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!(await isValidSession(cookies.get(COOKIE_NAME)?.value))) {
    return json({ error: 'unauthorized' }, 401);
  }
  return json(await getProjects());
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!(await isValidSession(cookies.get(COOKIE_NAME)?.value))) {
    return json({ error: 'unauthorized' }, 401);
  }

  let body: Project[];
  try {
    body = (await request.json()) as Project[];
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const validationError = validateProjects(body);
  if (validationError) return json({ error: validationError }, 400);

  await saveProjects(body);
  return json({ ok: true });
};
