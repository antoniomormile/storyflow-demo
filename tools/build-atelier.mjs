/** Rebuild all actual HTML pages, without routing shims, archives or dependencies.
 * Usage: node tools/build-atelier.mjs   or   node tools/build-atelier.mjs --check
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = vm.createContext({console});
for (const file of ['data.js','views.js','atelier.js']) vm.runInContext(fs.readFileSync(path.join(root,'assets/js',file),'utf8'),sandbox,{filename:file});
const SF = sandbox.SF;
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
if (!process.argv.includes('--check')) {
  for (const p of SF.pages) {
    const c = SF.context(p.id,{},SF.initialState());
    const html = `<!doctype html>
<html lang="it"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#100c10">
<meta name="color-scheme" content="dark">
<meta name="description" content="${SF.escape(p.description)} StoryFlow · Atelier 2.0, prototipo dimostrativo.">
<title>${SF.escape(p.title.replace('StoryFlow Premium','Atelier Premium'))} · StoryAtelier</title>
<link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/css/styles.css?v=atelier-2">
<link rel="stylesheet" href="assets/css/atelier.css?v=atelier-2">
<script src="assets/js/data.js" defer></script>
<script src="assets/js/views.js" defer></script>
<script src="assets/js/atelier.js?v=atelier-2" defer></script>
<script src="assets/js/app.js" defer></script>
</head><body data-page="${p.id}">
<!-- Real HTML snapshot. Rebuild with node tools/build-atelier.mjs. -->
<div id="app">${SF.render(c)}</div>
<noscript><div class="notice"><p>Puoi consultare pagine e collegamenti senza JavaScript. Le interazioni dimostrative richiedono JavaScript.</p></div></noscript>
</body></html>\n`;
    fs.writeFileSync(path.join(root,p.id+'.html'),html.replace(/></g,'>\n<'));
  }
  fs.writeFileSync(path.join(root,'.nojekyll'),'');
}
const errors = [], pages = [];
for (const p of SF.pages) {
  const f = p.id+'.html', text = fs.readFileSync(path.join(root,f),'utf8');
  if (!text.includes('assets/css/atelier.css') || !text.includes('assets/js/atelier.js')) errors.push(f+': missing theme');
  const urls = [...text.matchAll(/(?:href|src)="([^"]+)"/g)].map(m=>m[1]);
  for (const url of urls) {
    if (/^(?:https?:|data:|mailto:|tel:|#)/.test(url)) continue;
    const clean = decodeURIComponent(url.split(/[?#]/)[0]);
    if (clean.startsWith('/') || !fs.existsSync(path.join(root,clean))) errors.push(f+': '+url);
  }
  pages.push({page:f,title:p.title,group:p.group,theme:true,localReferences:urls.length});
}
const report = {theme:'Atelier 2.0',pages:pages.length,errors,details:pages};
fs.writeFileSync(path.join(root,'docs/ATELIER_PAGE_AUDIT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pages:pages.length,brokenReferences:errors.length}));
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
