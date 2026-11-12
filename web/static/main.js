// Entry point: registers the pages (loaded on first visit) and starts the router.
import { lazy, start, isStatic, $ } from './core.js';

lazy({
  home: () => import('./home.js'),
  play: () => import('./play.js'),
  watch: () => import('./watch.js'),
  rules: () => import('./rules.js'),
  lab: () => import('./lab.js'),
  about: () => import('./about.js'),
});
$('#mode').textContent = isStatic() ? 'static site: the game runs in your browser' : 'local app (Python server)';
start();
