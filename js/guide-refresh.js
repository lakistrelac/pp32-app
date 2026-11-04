/* PP32 Guide experience. Presentation-only layer; existing calculators and data stay intact. */
(function(){
'use strict';
const previousHome=window.home;
const previousGuideItem=window.guideItem;
const previousGuideItemForm=window.guideItemForm;
const kinds={
 'pravilnici':{mark:'§',kind:'docs',tag:'DOKUMENTACIJA',action:'Pregledaj oblast',accent:'blue'},
 'ukljucne-tacke':{mark:'↔',kind:'tools',tag:'PRORAČUN',action:'Pokreni proračun',accent:'teal'},
 'pad-napona':{mark:'ΔU',kind:'tools',tag:'KALKULATOR',action:'Pokreni kalkulator',accent:'amber'},
 'ugradnja-elemenata':{mark:'▤',kind:'docs',tag:'PRAKTIČNO UPUTSTVO',action:'Pogledaj postupke',accent:'blue'},
 'opremanje-stanice':{mark:'◉',kind:'tools',tag:'INTERAKTIVNI PRIKAZ',action:'Otvori prikaz',accent:'green'},
 'temelji':{mark:'▦',kind:'tools',tag:'INTERAKTIVNI ALAT',action:'Otvori alat',accent:'teal'}
};
const railArt='<svg class="gd-rail-art" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
 '<g stroke="currentColor" opacity=".16"><path d="M0 25H280M0 55H280M0 85H280M0 115H280M35 0V150M85 0V150M135 0V150M185 0V150M235 0V150"/></g>'+
 '<path d="M-10 110H290M-10 121H290" stroke="#9bdce2" stroke-width="3" opacity=".65"/>'+
 '<path d="M25 118 67 78H128L167 40H251" stroke="#7cd7d7" stroke-width="2.8" stroke-linecap="round"/>'+
 '<path d="M82 78H128L165 115H261" stroke="#71a9c7" stroke-width="2" stroke-dasharray="5 7"/>'+
 '<g fill="#11384d" stroke="#a9ebea" stroke-width="2.4"><circle cx="67" cy="78" r="6"/><circle cx="128" cy="78" r="6"/><circle cx="167" cy="40" r="6"/><circle cx="165" cy="115" r="6"/></g>'+
 '<g stroke="#88c2d1" opacity=".7"><path d="M231 32V109M239 32V109"/><path d="M215 32H255M215 109H255"/></g>'+
 '<circle cx="251" cy="40" r="6" fill="#8de5bd"/><circle cx="251" cy="40" r="12" stroke="#8de5bd" opacity=".35"/>'+
 '<text x="22" y="20" fill="#8fcbd6" font-family="Arial,sans-serif" font-size="9" letter-spacing="2">SIGNAL / SISTEM</text>'+
 '</svg>';
function details(slug){return kinds[slug]||{mark:'◇',kind:'docs',tag:'TEHNIČKA OBLAST',action:'Otvori oblast',accent:'blue'};}
function norm(s){return String(s||'').toLocaleLowerCase('sr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'dj');}
function openSection(slug,id){
 if(slug==='pad-napona'&&typeof window.voltageDropCalculator==='function')return window.voltageDropCalculator();
 if(slug==='ukljucne-tacke'&&typeof window.inclusionPointCalculator==='function')return window.inclusionPointCalculator();
 if(slug==='opremanje-stanice'&&typeof window.stationSSGuide==='function')return window.stationSSGuide();
 if(slug==='temelji'&&typeof window.foundationCalculator==='function')return window.foundationCalculator();
 return window.guideSection(id);
}
if(typeof previousHome==='function'){
 window.home=async function(){
  await previousHome();
  const banner=document.getElementById('guideBtn');
  if(!banner)return;
  banner.classList.add('gd-home-banner');
  banner.setAttribute('role','button');banner.setAttribute('tabindex','0');
  banner.setAttribute('aria-label','Otvori tehničku biblioteku i uputstva');
  banner.innerHTML='<div class="gd-home-icon" aria-hidden="true"><span>SS</span><i></i></div>'+
   '<div class="gd-home-copy"><div class="gd-home-kicker"><span class="gd-home-dot"></span> TEHNIČKA BIBLIOTEKA / BAZA ZNANJA</div>'+
   '<h2>Uputstvo <span>za rad na pruzi.</span></h2>'+
   '<p>Pravilnici, stručni proračuni i praktična uputstva za signalno-sigurnosne sisteme — na jednom mestu.</p>'+
   '<div class="gd-home-tags"><span>Pravilnici</span><span>Proračuni</span><span>Montaža</span></div>'+
   '<span class="gd-home-cta">Istraži biblioteku <b aria-hidden="true">↗</b></span></div>'+
   '<div class="gd-home-visual" aria-hidden="true">'+railArt+
   '<div class="gd-home-visual-footer"><span>TEHNIČKI CENTAR</span><i></i><span>PP32 / SS</span></div></div>';
  banner.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();banner.click();}});
 };
}
window.guideHome=async function(){
 const sections=await api('/rest/v1/guide_sections?select=*&order=sort_order.asc');
 const toolCount=sections.filter(s=>details(s.slug).kind==='tools').length;
 let h='<main class="wrap gd-page">'+
 '<button class="gd-breadcrumb" type="button" id="gdGoBack"><span aria-hidden="true">←</span> Početna strana <span class="gd-breadcrumb-divider">/</span> Tehnička biblioteka</button>'+
 '<section class="gd-hero"><div class="gd-hero-copy">'+
 '<div class="gd-eyebrow"><span class="gd-pulse"></span> PP32 CENTRAL / BAZA ZNANJA</div>'+
 '<h1>Tehnička <em>biblioteka.</em></h1>'+
 '<p>Znanje i alati za svakodnevni rad na železničkoj infrastrukturi. Pronađi stručne postupke, proračune i interaktivne prikaze.</p>'+
 '<div class="gd-hero-stats"><span><strong>'+sections.length+'</strong> oblasti</span><span><strong>'+toolCount+'</strong> interaktivna alata</span></div>'+
 '</div><div class="gd-hero-art" aria-hidden="true"><div class="gd-hero-art-head"><span>SS / TEHNIČKA PODRŠKA</span><i></i></div>'+railArt+'<div class="gd-hero-art-foot">SIGNALIZACIJA <span>◉</span> DOKUMENTACIJA</div></div></section>'+
 '<section class="gd-content"><div class="gd-content-heading"><div><span class="gd-mini-label">IZABERI OBLAST</span><h2>Istraži sadržaj</h2><p>Brz pristup tehničkoj dokumentaciji i specijalizovanim alatima.</p></div><span class="gd-counter" id="gdCounter">'+sections.length+' oblasti</span></div>'+
 '<div class="gd-toolbar"><label class="gd-search"><span class="gd-search-icon" aria-hidden="true">⌕</span><span class="gd-visually-hidden">Pretraži oblasti</span><input id="gdSearch" type="search" placeholder="Pretraži oblasti, proračune, pravilnike…" autocomplete="off"></label>'+
 '<div class="gd-filters" role="group" aria-label="Vrsta sadržaja"><button type="button" data-filter="all" aria-pressed="true" class="gd-filter is-active">Sve oblasti</button><button type="button" data-filter="tools" aria-pressed="false" class="gd-filter">Alati</button><button type="button" data-filter="docs" aria-pressed="false" class="gd-filter">Uputstva</button></div></div>'+
 '<div class="gd-grid" id="gdGrid">';
 sections.forEach(function(s,i){
   const d=details(s.slug);
   h+='<button type="button" class="gd-card gd-accent-'+d.accent+'" data-gs="'+esc(s.id)+'" data-gslug="'+esc(s.slug||'')+'" data-kind="'+d.kind+'" data-search="'+esc(norm(s.title+' '+(s.description||'')+' '+d.tag))+'">'+
    '<span class="gd-card-head"><span class="gd-card-mark" aria-hidden="true">'+d.mark+'</span><span class="gd-card-index">'+String(i+1).padStart(2,'0')+' / '+String(sections.length).padStart(2,'0')+'</span></span>'+
    '<span class="gd-card-tag">'+d.tag+'</span>'+
    '<strong class="gd-card-title">'+esc(s.title)+'</strong>'+
    '<span class="gd-card-desc">'+esc(s.description||'Otvori oblast i pregledaj sadržaj.')+'</span>'+
    '<span class="gd-card-foot"><span>'+d.action+'</span><span class="gd-card-arrow" aria-hidden="true">↗</span></span>'+
   '</button>';
 });
 h+='</div><div class="gd-no-results" id="gdEmpty" hidden><span aria-hidden="true">⌕</span><strong>Nema pronađenih oblasti</strong><p>Probaj drugačiji pojam ili izaberi drugi filter.</p></div>'+
 '</section><p class="gd-bottom-note">Interna tehnička biblioteka · PP32 Central</p></main>';
 shell(h);
 document.getElementById('gdGoBack').onclick=home;
 document.querySelectorAll('.gd-card').forEach(el=>el.addEventListener('click',()=>openSection(el.dataset.gslug,el.dataset.gs)));
 let selected='all';
 const search=document.getElementById('gdSearch');
 const cards=[...document.querySelectorAll('.gd-card')];
 const counter=document.getElementById('gdCounter');
 const empty=document.getElementById('gdEmpty');
 function filter(){
  const q=norm(search.value.trim());
  let visible=0;
  cards.forEach(card=>{
   const show=(selected==='all'||card.dataset.kind===selected)&&(!q||card.dataset.search.includes(q));
   card.hidden=!show;if(show)visible++;
  });
  counter.textContent=visible+' od '+cards.length+' oblasti';
  empty.hidden=visible!==0;
 }
 search.addEventListener('input',filter);
 document.querySelectorAll('.gd-filter').forEach(btn=>btn.addEventListener('click',()=>{
  selected=btn.dataset.filter;
  document.querySelectorAll('.gd-filter').forEach(b=>{const active=b===btn;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',active?'true':'false');});
  filter();
 }));
};
window.guideSection=async function(id){
 const result=await Promise.all([
  api('/rest/v1/guide_sections?id=eq.'+encodeURIComponent(id)+'&select=*'),
  api('/rest/v1/guide_items?section_id=eq.'+encodeURIComponent(id)+'&select=*&order=sort_order.asc,created_at.asc')
 ]);
 const sec=result[0][0],items=result[1];
 if(!sec){return guideHome();}
 const d=details(sec.slug);
 let h='<main class="wrap gd-page gd-section-page"><button class="gd-breadcrumb" id="gdGoBack" type="button"><span aria-hidden="true">←</span> Sve oblasti <span class="gd-breadcrumb-divider">/</span> '+esc(sec.title)+'</button>'+
 '<section class="gd-section-hero gd-accent-'+d.accent+'"><div class="gd-section-hero-text"><span class="gd-eyebrow">'+d.tag+' / PP32 CENTRAL</span><h1>'+esc(sec.title)+'</h1><p>'+esc(sec.description||'Tehnička oblast i prateća dokumentacija.')+'</p><span class="gd-section-meta">'+items.length+' '+(items.length===1?'stavka':'stavki')+' u biblioteci</span></div><div class="gd-section-emblem" aria-hidden="true">'+d.mark+'</div></section>'+
 '<div class="gd-section-heading"><div><span class="gd-mini-label">DOKUMENTACIJA</span><h2>Sadržaj oblasti</h2></div>'+(isAdmin()?'<button type="button" class="gd-add-btn" id="guideAdd">＋ Dodaj sadržaj</button>':'')+'</div>';
 if(items.length){
  h+='<div class="gd-entries">';
  items.forEach((x,i)=>{h+='<button type="button" class="gd-entry" data-gi="'+esc(x.id)+'"><span class="gd-entry-num">'+String(i+1).padStart(2,'0')+'</span><span class="gd-entry-copy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.description||'Otvori sadržaj i detalje.')+'</small></span><span class="gd-entry-arrow" aria-hidden="true">↗</span></button>';});
  h+='</div>';
 }else{
  h+='<div class="gd-blank"><span class="gd-blank-icon" aria-hidden="true">▤</span><strong>Ova oblast čeka svoj prvi sadržaj.</strong><p>Trenutno nema unetih dokumenata ili uputstava u ovoj kategoriji.</p></div>';
 }
 h+='<button class="gd-secondary-back" type="button" id="gdBottomBack">← Nazad na sve oblasti</button></main>';
 shell(h);
 document.getElementById('gdGoBack').onclick=guideHome;
 document.getElementById('gdBottomBack').onclick=guideHome;
 document.querySelectorAll('[data-gi]').forEach(el=>el.onclick=()=>guideItem(el.dataset.gi));
 if(isAdmin())document.getElementById('guideAdd').onclick=()=>guideItemForm(sec);
};
if(typeof previousGuideItem==='function'){
 window.guideItem=async function(id){
  await previousGuideItem(id);
  const wrap=document.querySelector('.wrap');
  if(wrap&&wrap.querySelector(':scope > .form')&&wrap.querySelector(':scope > h1')){
   wrap.classList.add('gd-article-page');
   const back=wrap.querySelector(':scope > .back');
   if(back)back.classList.add('gd-breadcrumb');
  }
 };
}
if(typeof previousGuideItemForm==='function'){
 window.guideItemForm=function(sec){
  previousGuideItemForm(sec);
  const wrap=document.querySelector('.wrap');
  if(wrap)wrap.classList.add('gd-edit-page');
 };
}
})();