import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const pages = [
  ['home', 'index.html'],
  ['work', 'work/index.html'],
  ['approach', 'approach/index.html'],
  ['studio', 'studio/index.html'],
  ['start', 'start/index.html']
];

const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('all five pages have essential document structure and unique titles', () => {
  const titles = new Set();

  for (const [name, path] of pages) {
    const html = read(path);
    assert.match(html, /<!doctype html>/i, `${name} is missing a doctype`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${name} must have exactly one h1`);
    assert.match(html, /<meta name="description" content="[^"]+"/i, `${name} is missing a description`);
    assert.match(html, /<nav class="site-nav"/i, `${name} is missing the primary nav`);
    assert.match(html, /<footer class="site-footer"/i, `${name} is missing the footer`);
    assert.match(html, /href="\/work\/"/i);
    assert.match(html, /href="\/approach\/"/i);
    assert.match(html, /href="\/studio\/"/i);
    assert.match(html, /href="\/start\/"/i);

    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    assert.ok(title, `${name} is missing a title`);
    assert.ok(!titles.has(title), `${name} title is not unique`);
    titles.add(title);
  }
});

test('all referenced root-relative files and page routes exist', () => {
  for (const [, pagePath] of pages) {
    const html = read(pagePath);
    const references = [...html.matchAll(/(?:href|src)="(\/[^"]+)"/g)].map((match) => match[1].split(/[?#]/)[0]);

    for (const reference of references) {
      if (reference === '/') continue;
      const candidate = reference.endsWith('/') ? `${reference.slice(1)}index.html` : reference.slice(1);
      const existsAtRoot = existsSync(resolve(root, candidate));
      const existsInPublic = existsSync(resolve(root, 'public', candidate));
      assert.ok(existsAtRoot || existsInPublic, `${pagePath} references missing ${reference}`);
    }
  }
});

test('visual system contains no gradients and no blue-hued color tokens', () => {
  const css = read('src/styles.css');
  const assets = ['public/favicon.svg', 'public/og-card.svg', 'public/brand/radish-mark-black.svg', 'public/brand/radish-mark-white.svg']
    .map(read)
    .join('\n');
  const visualSource = `${css}\n${assets}`;

  assert.doesNotMatch(visualSource, /gradient\s*\(/i, 'gradients are outside the brand direction');

  const allowedColorHexes = new Set(['#d8344e', '#b62940']);
  const hexes = visualSource.match(/#[\da-f]{6}\b/gi) || [];
  for (const hex of hexes) {
    const normalized = hex.toLowerCase();
    if (allowedColorHexes.has(normalized)) continue;
    const red = Number.parseInt(normalized.slice(1, 3), 16);
    const green = Number.parseInt(normalized.slice(3, 5), 16);
    const blue = Number.parseInt(normalized.slice(5, 7), 16);
    assert.equal(red, green, `${hex} is not a neutral gray or approved brand red`);
    assert.equal(green, blue, `${hex} is not a neutral gray or approved brand red`);
  }
});

test('the site makes no fabricated proof claims', () => {
  const html = pages.map(([, path]) => read(path)).join('\n');
  assert.doesNotMatch(html, /\b\d{2,}[+]\s*(projects|clients|brands|launches)\b/i);
  assert.doesNotMatch(html, /\b\d{2,}(\.\d+)?%\s*(uptime|growth|conversion|satisfaction)\b/i);
  assert.doesNotMatch(html, /class="testimonial/i);
  assert.match(read('studio/index.html'), /None yet\. We will add them when they are earned\./);
  assert.match(read('work/index.html'), /EXAMPLE BUILD \/ NOT A CASE STUDY/);
});

test('the project brief builder is private-by-design and functional', () => {
  const start = read('start/index.html');
  const script = read('src/main.js');
  assert.match(start, /data-brief-form/);
  assert.match(start, /data-copy-brief/);
  assert.match(start, /data-download-brief/);
  assert.match(start, /data-email-brief/);
  assert.doesNotMatch(start, /action="https?:/i);
  assert.match(script, /new FormData\(briefForm\)/);
  assert.match(script, /navigator\.clipboard\.writeText/);
  assert.match(script, /new Blob\(\[generatedBrief\]/);
  assert.match(script, /mailto:\?subject=/);
});
