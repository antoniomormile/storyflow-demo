/* StoryFlow / Atelier 2.0 — visual layer only. Existing data, entitlements,
   prices, demo state and event handlers remain in data.js / app.js. */
(function (root) {
  'use strict';
  const SF = root.SF;
  const e = SF.escape, i = SF.icon, u = SF.url;
  SF.atelierVersion = '2.0.0';
  const artwork = (s, cls = '') => `<img class="${cls}" src="assets/images/${e(s.hero || s.art)}.webp" alt="Illustrazione di ${e(s.title)}" decoding="async">`;
  const link = (text, page, cls = 'text-link', params = {}, icon = 'arrow') => `<a class="${cls}" href="${u(page, params)}"><span>${text}</span>${i(icon)}</a>`;
  const action = (text, name, s, ch, cls = 'button primary full') => `<button type="button" class="${cls}" data-action="${name}" data-sid="${e(s.id)}" data-ch="${ch}"><span>${text}</span>${i('arrow')}</button>`;
  const title = (s, ch) => e(SF.chapterTitles[(ch - 1) % SF.chapterTitles.length]);
  const tags = s => `<div class="hero-tags">${s.genres.map(g => `<span class="badge outline">${e(g)}</span>`).join('')}</div>`;
  const heading = (over, main, sub) => `<header class="page-heading atelier-heading"><div><p class="eyebrow">${over}</p><h1>${main}</h1><p class="lede">${sub}</p></div></header>`;
  const alternative = (ic, name, detail, page, params) => `<a class="atelier-option" href="${u(page, params)}"><span class="option-icon">${i(ic)}</span><span class="option-copy"><strong>${name}</strong><small>${detail}</small></span>${i('chevron')}</a>`;
  function alternatives(c, s, ch) {
    return `<div class="atelier-options">${s.pass ? alternative('ticket', 'Usa Free Pass', c.s.passCount > 0 ? `${c.s.passCount} disponibile · accesso per ${SF.config.passAccessHours} ore` : 'Scopri quando arriva il prossimo pass', c.s.passCount > 0 ? 'free-pass' : 'free-pass-waiting', {sid:s.id,ch}) : ''}${alternative('play', 'Guarda un annuncio', `Demo facoltativa · +${SF.config.adReward} Credits bonus`, 'rewarded-ad', {sid:s.id,ch,mode:'credits'})}</div>`;
  }
  function volume(c, s, ch, resume = false) {
    const n = c.s.progress[s.id] || 0, percent = Math.round(n / s.chapters * 100);
    return `<article class="atelier-volume"><div class="volume-art">${artwork(s)}<div class="volume-shade"></div><span class="volume-label">${resume ? 'LA TUA STORIA IN LETTURA' : 'IL PROSSIMO CAPITOLO'}</span><a href="${u('series',{sid:s.id})}" class="volume-series">${e(s.title)}</a><button type="button" class="volume-bookmark" data-action="save" data-sid="${e(s.id)}" aria-label="${c.s.saved.includes(s.id) ? 'Rimuovi' : 'Salva'} ${e(s.title)} in libreria" aria-pressed="${c.s.saved.includes(s.id)}">${i('book')}<span>${String(ch).padStart(2,'0')}</span></button></div><div class="volume-info"><div class="volume-meta"><span>${e(s.format)} · ${ch % 2 + 3} MIN DI LETTURA</span><span>${String(ch).padStart(2,'0')} / ${s.chapters}</span></div><h2>Capitolo ${ch}</h2><h3>${title(s,ch)}</h3><p>${e(s.tagline)}</p>${tags(s)}${resume ? `<div class="volume-progress"><div class="progress" role="progressbar" aria-label="Avanzamento della serie" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${percent}%"></span></div><small>${n} di ${s.chapters} capitoli letti</small></div>${action(n ? 'Continua a leggere' : 'Inizia a leggere','open-chapter',s,ch)}` : ''}</div></article>`;
  }
  const oldHome = SF.views.index;
  SF.views.index = c => {
    const s = SF.series.find(x => (c.s.progress[x.id] || 0) > 0 && (c.s.progress[x.id] || 0) < x.chapters) || SF.series[0];
    const ch = Math.max(1,c.s.progress[s.id] || 1), next = Math.min(ch + 1,s.chapters);
    const original = oldHome(c), start = original.indexOf('<div class="genre-pills">');
    return `${heading('LA TUA BIBLIOTECA, VIVA.','Continua la <em>storia.</em>','Le emozioni più belle meritano di andare oltre.')}<div class="atelier-home"><section>${volume(c,s,ch,true)}</section><aside class="atelier-home-side">${alternatives(c,s,next)}<div class="atelier-note"><span class="eyebrow">UN CAPITOLO ALLA VOLTA</span><h2>Ogni storia.<br>Un mondo <em>tuo.</em></h2><p>Leggi, ritrova i tuoi preferiti, scopri la prossima emozione.</p>${link('La tua libreria','library')}${link('Scopri Premium','premium','text-link',{},'crown')}</div></aside></div><div class="atelier-quicklinks">${link('Classifiche','ranking','chip',{},'star')}${link('Rewards','rewards','chip',{},'gift')}${link('Shorts · concept','shorts','chip',{},'play')}</div>${start >= 0 ? original.slice(start) : original}`;
  };
  SF.views.paywall = c => {
    const s = c.series, amount = c.s.paid + c.s.bonus, missing = Math.max(0,c.cost - amount);
    return `${link('Torna alla serie','series','back-link',{sid:s.id},'back')}${heading('ANCORA UN CAPITOLO','Continua la <em>storia.</em>','Scegli il tuo ritmo. La storia ti aspetta.')}<div class="atelier-paywall"><section>${volume(c,s,c.ch)}</section><section class="atelier-unlock-stack"><div class="atelier-unlock"><div class="unlock-caption"><span class="eyebrow">SBLOCCO SINGOLO</span>${i('lock')}</div><div class="unlock-title"><h2>Sblocca ora</h2><span class="atelier-price">${i('coin')}<strong>${c.cost}</strong><small>Credits</small></span></div><p>Leggi subito il Capitolo ${c.ch}</p><div class="atelier-balance"><span>Il tuo saldo</span><strong>${amount} Credits</strong></div>${missing ? `<p class="atelier-shortfall">Ti mancano ${missing} Credits. Nessun addebito automatico.</p>` : `<p class="atelier-shortfall">${c.s.premium ? 'Prezzo Premium applicato.' : 'Il saldo è sufficiente per questo capitolo.'}</p>`}${action(`Sblocca con ${c.cost} Credits`,'unlock',s,c.ch)}<small class="unlock-fineprint">Sblocco senza scadenza nella demo. Acquisti simulati.</small></div>${alternatives(c,s,c.ch)}<div class="atelier-secondary">${link('Ottieni più Credits','credit-shop','button secondary full',{sid:s.id,ch:c.ch},'coin')}${link('Bundle di capitoli','bundles','text-link',{sid:s.id,ch:c.ch},'layers')}${link('Rewards e missioni','rewards','text-link',{},'gift')}${link('Vantaggi Premium','premium','text-link',{},'crown')}</div></section></div>`;
  };
  const logo = `<svg class="brand-mark atelier-quill" viewBox="0 0 40 48" fill="none" aria-hidden="true"><path d="M9 40C15 24 23 12 34 4c0 14-5 26-21 29" fill="currentColor" opacity=".15"/><path d="M6 45C13 28 22 15 34 4c0 14-5 26-21 29M17 27l-1-10M22 21l0-11M26 17l7-1M12 36l9-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="brand-type"><span class="brand-name">Story<em>Atelier</em></span><small>STORIE CHE TI FANNO SENTIRE</small></span>`;
  const originalRender = SF.render;
  SF.render = c => {
    let html = originalRender(c);
    html = html.replace(/<svg class="brand-mark"[\s\S]*?<\/svg><span>StoryFlow<span class="brand-dot">\.<\/span><\/span>/g,logo);
    html = html.replace(/aria-label="StoryFlow Home"/g,'aria-label="StoryAtelier Home"');
    html = html.replace(/StoryFlow Premium/g,'Atelier Premium');
    html = html.replace(/<strong>(\d+)<\/strong><span class="wallet-plus">/g,'<strong>$1</strong><span class="wallet-unit">Credits</span><span class="wallet-plus">');
    const nav = ['index','explore','library','rewards','profile'];
    let active = nav.includes(c.page) ? c.page : ['search','ranking','series','shorts'].includes(c.page) ? 'explore' : ['favorites','history','downloads','empty-library'].includes(c.page) ? 'library' : ['daily-reward','rewarded-ad','missions','free-pass','free-pass-waiting'].includes(c.page) ? 'rewards' : 'profile';
    if (['paywall','chapter-end','series-complete','reader','reader-manga','reader-settings','interactive-reader','bundles','sequential-unlock','insufficient-credits'].includes(c.page)) active = 'index';
    html = html.replace(/<nav class="bottom-nav"[\s\S]*?<\/nav>/,`<nav class="bottom-nav" aria-label="Navigazione mobile">${SF.nav.map(([p,t,ic]) => `<a href="${u(p)}" class="${p === active ? 'active' : ''}" ${p === active ? 'aria-current="page"' : ''}>${i(ic)}<span>${t}</span></a>`).join('')}</nav>`);
    if (c.page === 'components') {
      const colors = {'#0c0b10':'#100c10','#16141d':'#1b141a','#211d29':'#281c24','#fa8abb':'#ee91aa','#f7f1f5':'#f7eee4','#b1a7b7':'#c3b4b6','#96cee6':'#b7ced5','#e9c38c':'#dfbc83'};
      for (const [old,value] of Object.entries(colors)) html = html.split(old).join(value);
      html = html.replace('DESIGN SYSTEM / 1.0','DESIGN SYSTEM / ATELIER 2.0').replace('La notte, con un accento rosa.','Inchiostro, rubino e oro caldo.');
    }
    if (c.page === 'prototype') html = html.replace('STORYFLOW / PRODUCT PROTOTYPE 1.0','STORYFLOW / ATELIER 2.0').replace(/Le 10 immagini del mockup iniziale[\s\S]*?<\/p>/,'La documentazione della nuova identità è in <code>docs/ATELIER.md</code>. Tutte le pagine sono HTML reali; gli acquisti e gli accessi restano dimostrativi.</p>');
    return html;
  };
})(typeof window !== 'undefined' ? window : globalThis);
