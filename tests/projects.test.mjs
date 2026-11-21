import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProjects } from '../src/lib/project-validation.ts';
import { defaultProjects } from '../src/data/projects.ts';

test('existing catalogue and custom pricing fields remain valid', () => {
  const catalogue = structuredClone(defaultProjects);
  catalogue[0].pricing = { customFutureField: true };
  assert.equal(validateProjects(catalogue), null);
});
test('rejects a PowerShell wrapped array, duplicate slugs and mixed-up APK links', () => {
  assert.equal(validateProjects([{ value: defaultProjects, Count: defaultProjects.length }]), 'invalid_project');
  assert.equal(validateProjects([defaultProjects[0], defaultProjects[0]]), 'duplicate_project');
  assert.equal(validateProjects([{ ...defaultProjects[0], downloadUrl: 'https://example.com/game.apk' }]), 'unexpected_download');
});
test('rejects broadcast content corruption while allowing legitimate game entries', () => {
  const catalogue = structuredClone(defaultProjects);
  catalogue.forEach(p => { p.description = { el: 'Ένα παιχνίδι', en: 'A game' }; });
  assert.equal(validateProjects(catalogue), 'repeated_content');
  assert.equal(validateProjects([defaultProjects.find(p => p.slug === 'atelioto')]), null);
});
