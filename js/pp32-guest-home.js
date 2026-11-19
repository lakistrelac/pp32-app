/* Gost32 uses its own homepage; all other roles keep the original. */
(function(){
'use strict';
const previousHome=window.home,previousGuide=window.guideHome;
const isGuest=()=>profile?.active===true&&profile.role==='guest_pp32';
const e=s=>esc(s==null?'':String(s));
const scene="<div class=\"gph-scene-heading\"><span>PP32 / PUTNI PRELAZI</span><span>SIMBOLIČAN PRIKAZ</span></div>\n<svg class=\"gph-svg\" viewBox=\"0 0 720 320\" role=\"img\" aria-label=\"Animirani putni prelaz sa vozom, svetlima i polubranicima\" xmlns=\"http://www.w3.org/2000/svg\">\n<defs><linearGradient id=\"gph-sky\" x2=\"0\" y2=\"1\"><stop stop-color=\"#15415a\"/><stop offset=\"1\" stop-color=\"#366e76\"/></linearGradient><linearGradient id=\"gph-metal\" x2=\"0\" y2=\"1\"><stop stop-color=\"#d5f4f1\"/><stop offset=\"1\" stop-color=\"#4f91a1\"/></linearGradient></defs>\n<rect width=\"720\" height=\"320\" fill=\"url(#gph-sky)\"/>\n<path d=\"M0 168Q120 132 250 159T520 161T720 145V320H0Z\" fill=\"#235b68\"/>\n<path d=\"M0 192Q135 175 250 189T520 188T720 179V320H0Z\" fill=\"#30716a\"/>\n<g fill=\"#5b9b7c\"><circle cx=\"52\" cy=\"172\" r=\"30\"/><circle cx=\"92\" cy=\"181\" r=\"28\"/><circle cx=\"648\" cy=\"169\" r=\"29\"/><circle cx=\"693\" cy=\"184\" r=\"26\"/></g>\n<path d=\"M316 0H432L490 320H286Z\" fill=\"#283c4e\"/>\n<path d=\"M374 0V131M390 235V320\" stroke=\"#d6e7e5\" stroke-width=\"3\" stroke-dasharray=\"16 13\" opacity=\".6\"/>\n<path d=\"M0 135H720V225H0Z\" fill=\"#233f50\"/>\n<g stroke=\"#78b6b5\" stroke-width=\"6\" opacity=\".6\"><path d=\"M20 145L6 213M70 145L56 213M120 145L106 213M170 145L156 213M220 145L206 213M270 145L256 213M320 145L306 213M370 145L356 213M420 145L406 213M470 145L456 213M520 145L506 213M570 145L556 213M620 145L606 213M670 145L656 213M720 145L706 213\"/></g>\n<path d=\"M0 156H720M0 202H720\" stroke=\"#d5edf1\" stroke-width=\"5\"/>\n<rect x=\"45\" y=\"104\" width=\"108\" height=\"68\" rx=\"7\" fill=\"#102b3f\" stroke=\"#a6dcde\" stroke-width=\"2\"/>\n<text x=\"58\" y=\"124\" fill=\"#a9e5e1\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"700\">PP KUĆICA</text>\n<text x=\"59\" y=\"155\" fill=\"#f1ffff\" font-family=\"Arial,sans-serif\" font-size=\"23\" font-weight=\"800\">RLC</text>\n<g class=\"gph-train\">\n<path d=\"M3 101Q4 90 18 90H374Q396 90 405 109V165H3Z\" fill=\"url(#gph-metal)\" stroke=\"#b3e7e8\" stroke-width=\"2\"/>\n<path d=\"M6 139H405V154H6Z\" fill=\"#1d6684\"/>\n<g fill=\"#164156\" stroke=\"#c9eeee\" stroke-width=\"1.5\"><rect x=\"26\" y=\"101\" width=\"55\" height=\"27\" rx=\"3\"/><rect x=\"95\" y=\"101\" width=\"55\" height=\"27\" rx=\"3\"/><rect x=\"164\" y=\"101\" width=\"55\" height=\"27\" rx=\"3\"/><rect x=\"233\" y=\"101\" width=\"55\" height=\"27\" rx=\"3\"/><rect x=\"302\" y=\"101\" width=\"55\" height=\"27\" rx=\"3\"/></g>\n<g fill=\"#173449\" stroke=\"#7198a5\"><circle cx=\"66\" cy=\"167\" r=\"10\"/><circle cx=\"163\" cy=\"167\" r=\"10\"/><circle cx=\"259\" cy=\"167\" r=\"10\"/><circle cx=\"357\" cy=\"167\" r=\"10\"/></g></g>\n<rect x=\"248\" y=\"188\" width=\"8\" height=\"103\" rx=\"3\" fill=\"#aac8cf\"/>\n<rect x=\"231\" y=\"174\" width=\"40\" height=\"48\" rx=\"8\" fill=\"#132b3d\" stroke=\"#aee4e4\" stroke-width=\"2\"/>\n<circle class=\"gph-red gph-red-a\" cx=\"243\" cy=\"197\" r=\"7\" fill=\"#ff565b\"/>\n<circle class=\"gph-red gph-red-b\" cx=\"260\" cy=\"197\" r=\"7\" fill=\"#ff565b\"/>\n<g class=\"gph-boom gph-left-boom\"><rect x=\"252\" y=\"226\" width=\"131\" height=\"10\" rx=\"5\" fill=\"#f5eeee\"/><path d=\"M272 226v10M305 226v10M338 226v10M370 226v10\" stroke=\"#d3323c\" stroke-width=\"13\"/></g>\n<rect x=\"469\" y=\"188\" width=\"8\" height=\"103\" rx=\"3\" fill=\"#aac8cf\"/>\n<rect x=\"452\" y=\"174\" width=\"40\" height=\"48\" rx=\"8\" fill=\"#132b3d\" stroke=\"#aee4e4\" stroke-width=\"2\"/>\n<circle class=\"gph-red gph-red-b\" cx=\"464\" cy=\"197\" r=\"7\" fill=\"#ff565b\"/>\n<circle class=\"gph-red gph-red-a\" cx=\"481\" cy=\"197\" r=\"7\" fill=\"#ff565b\"/>\n<g class=\"gph-boom gph-right-boom\"><rect x=\"343\" y=\"226\" width=\"131\" height=\"10\" rx=\"5\" fill=\"#f5eeee\"/><path d=\"M360 226v10M395 226v10M427 226v10M460 226v10\" stroke=\"#d3323c\" stroke-width=\"13\"/></g>\n<text x=\"24\" y=\"308\" font-family=\"Arial,sans-serif\" fill=\"#b9e0df\" font-size=\"11\" font-weight=\"700\" letter-spacing=\"2\">PUTNI PRELAZ · PP32</text>\n</svg><div class=\"gph-scene-footer\"><span><i></i> PROJEKTNA DOKUMENTACIJA</span><span>32 RLC-A</span></div>";
async function guestHome(){
 const projects=await api('/rest/v1/projects?code=eq.pp32&select=id,code,name,description&limit=1');
 const p=projects?.[0];
 if(!p)throw Error('Projekat PP32 nije dostupan.');
 currentProject=null;currentRlc=null;
 const out='<main class="wrap home-page gph-home">'+
 '<section class="gph-hero"><div class="gph-hero-copy">'+
 '<div class="gph-eyebrow"><i></i> SIGNALNO-SIGURNOSNI SISTEMI / PP32</div>'+
 '<h1>32 putna prelaza.<span> Sve na jednom mestu.</span></h1>'+
 '<p>Lokacije prelaza, projektne sveske i proračuni uključnih tačaka — pristup dokumentaciji za svaki RLC.</p>'+
 '<div class="gph-hero-actions"><button type="button" id="gphGoProject" class="gph-primary">Otvori putne prelaze <b>↗</b></button>'+
 '<button type="button" id="gphGoMap" class="gph-secondary">Pogledaj mapu</button></div>'+
 '<div class="gph-hero-tags"><span>32 PUTNA PRELAZA</span><span>PROJEKTNA DOKUMENTACIJA</span></div></div>'+
 '<div class="gph-visual">'+scene+'</div></section>'+
 '<section class="gf-feedback gf-home-feedback" aria-label="Primedbe i komentari">'+
  '<span class="gf-symbol" aria-hidden="true">✎</span>'+
  '<div class="gf-copy"><span class="gf-eyebrow">DIREKTNA KOMUNIKACIJA</span>'+
   '<h2>Primedbe i komentari</h2>'+
   '<p>Imaš komentar, predlog ili tehničko zapažanje za PP32? Pošalji poruku i prati njen status.</p></div>'+
  '<button type="button" class="gf-action" id="gfHomeRemarks">Napiši primedbu ili komentar <b aria-hidden="true">↗</b></button>'+
 '</section>'+
 '<section class="gph-workspace">'+
 '<div class="gph-map-card"><div class="gph-section-header"><div><span>TERENSKI PREGLED / LOKACIJE</span>'+
 '<h2>Mapa putnih prelaza</h2><p>Pregled lokacija i izbor odgovarajućeg prelaza.</p></div>'+
 '<button type="button" class="gph-map-open" id="gphFullMap">Cela mapa ↗</button></div>'+
 '<div id="gphMap" class="gph-map"><div class="ppmap-fallback">Učitavanje mape…</div></div>'+
 '<div class="gph-map-details"><strong id="gphMapCount">Učitavanje lokacija…</strong>'+
 '<div id="gphQuick" class="gph-map-quick"></div></div></div>'+
 '<article class="gph-project-card"><div class="gph-project-top"><span>PP32 / JEDAN PROJEKAT</span><span>PROJEKAT</span></div>'+
 '<div class="gph-project-emblem">32<span>PP</span></div>'+
 '<h2>'+e(p.name)+'</h2>'+
 '<p>Dokumentacija i proračun uključnih tačaka za svaki pojedinačni putni prelaz.</p>'+
 '<div class="gph-project-services"><span>▤ Sveska 0, 5 i 8</span><span>∑ Proračun svakog RLC-a</span>'+
 '<span>⌖ Prikaz putnih prelaza</span></div>'+
 '<button type="button" class="gph-project-button" id="gphProject">Otvori 32 putna prelaza <b>↗</b></button></article>'+
 '</section></main>';
 shell(out);
 const project=()=>window.project(p.id);
 document.getElementById('gphGoProject').onclick=project;
 document.getElementById('gphProject').onclick=project;
 document.getElementById('gfHomeRemarks').onclick=()=>{
  if(!window.PP32Remarks?.open)return alert('Primedbe i komentari trenutno nisu dostupni. Osveži stranicu.');
  window.PP32Remarks.open(p.id);
 };
 const map=()=>window.PP32GeoMap?.open();
 document.getElementById('gphGoMap').onclick=map;
 document.getElementById('gphFullMap').onclick=map;
 try{
  await window.PP32GeoMap.mountGuestPreview(
   document.getElementById('gphMap'),
   document.getElementById('gphQuick'),
   document.getElementById('gphMapCount'));
 }catch(err){
  const el=document.getElementById('gphMap');
  if(el)el.innerHTML='<div class="ppmap-fallback">Mapa trenutno nije dostupna. '+e(err?.message||String(err))+'</div>';
 }
}
window.home=async function(){
 if(!isGuest())return previousHome();
 return guestHome();
};
if(typeof previousGuide==='function'){
 window.guideHome=function(...args){
  if(isGuest())return window.home();
  return previousGuide.apply(this,args);
 };
}
})();