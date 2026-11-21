/** Reject malformed or accidentally broadcast project updates before persisting them. */
export function validateProjects(value: unknown): string | null {
  if (!Array.isArray(value) || value.length === 0) return 'invalid_payload';
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const descriptions = new Map<string, number>();
  const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
  const bilingual = (v: unknown) => record(v) && typeof v.el === 'string' && typeof v.en === 'string';
  const strings = (v: unknown) => Array.isArray(v) && v.every(x => typeof x === 'string');

  for (const p of value) {
    if (!record(p) || typeof p.id !== 'string' || !p.id || typeof p.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) return 'invalid_project';
    if (ids.has(p.id) || slugs.has(p.slug)) return 'duplicate_project';
    ids.add(p.id);
    slugs.add(p.slug);
    if (typeof p.name !== 'string' || !p.name.trim() || typeof p.category !== 'string' || typeof p.enabled !== 'boolean') return 'invalid_project';
    if (!bilingual(p.description) || !bilingual(p.body) || !record(p.features) || !strings(p.features.el) || !strings(p.features.en) || !strings(p.tags) || !strings(p.screenshots)) return 'invalid_content';
    if (typeof p.downloadUrl === 'string' && /\.(apk|exe|zip)(?:[?#]|$)/i.test(p.downloadUrl) && ['websites', 'repairs'].includes(p.category)) return 'unexpected_download';
    const fingerprint = JSON.stringify(p.description);
    descriptions.set(fingerprint, (descriptions.get(fingerprint) || 0) + 1);
  }

  // A repeated description across most of a large catalogue usually means a script
  // updated an entire array instead of the intended record. Do not silently save it.
  if (value.length >= 6 && Math.max(...descriptions.values()) > value.length / 2) return 'repeated_content';
  return null;
}
