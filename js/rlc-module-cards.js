/* PP32 · Unified visual module cards for individual RLCs.
 * Presentation only: all existing click handlers, CRUD, print and role controls stay intact.
 * Applies exclusively to project PP32 after RLC and interactive-line wrappers render.
 */
(function(){
'use strict';
const moduleInfo={
  line:{
    title:'Linijska situacija',kicker:'PROJEKTNI PRILOG',badge:'PLAN',
    description:'Pregled originalne projektne linijske situacije.',
    tags:['Projektni plan','Pregled'],action:'Otvori plan',icon:'line'
  },
  components:{
    title:'Komponente',kicker:'OPREMA NA TERENU',badge:'EVIDENCIJA',
    description:'Pojedinačni elementi, aktivnosti i realizacija radova.',
    tags:['SS elementi','Status zadataka'],action:'Otvori komponente',icon:'components'
  },
  docs:{
    title:'Dokumenta',kicker:'PROJEKTNA DOKUMENTACIJA',badge:'DATOTEKE',
    description:'Projekti, zapisnici, prilozi i prateći dokumenti.',
    tags:['Dokumentacija','Verzije'],action:'Otvori dokumenta',icon:'docs'
  },
  diary:{
    title:'Građevinski dnevnik',kicker:'DNEVNA EVIDENCIJA',badge:'ZAPISI',
    description:'Datum, ekipa, izvedeni radovi i zabeleške sa terena.',
    tags:['Dnevni zapisi','Radovi'],action:'Otvori dnevnik',icon:'diary'
  },
  equipment:{
    title:'Oprema i količine',kicker:'MATERIJALNA EVIDENCIJA',badge:'KOLIČINE',
    description:'Planirano, ugrađeno i preostalo po vrsti opreme.',
    tags:['Planirano','Ugrađeno'],action:'Otvori količine',icon:'equipment'
  },
  report:{
    title:'Izveštaj',kicker:'PREGLED REALIZACIJE',badge:'NAPREDAK',
    description:'Prati status izvedenih radova i rezultate po elementima.',
    tags:['Realizacija','Pregled'],action:'Otvori izveštaj',icon:'report'
  },
  cables:{
    title:'Kablovi',kicker:'KABLOVSKA SPECIFIKACIJA',badge:'KABLOVI',
    description:'Tipovi kablova, konstrukcije, projektne dužine i brojevi.',
    tags:['L (m)','br.'],action:'Otvori kablove',icon:'cables'
  },
  print:{
    title:'PRINT',kicker:'IZVOZ PODATAKA',badge:'EXCEL / PDF',
    description:'Preuzmi detaljne količine i izveštaj za ovaj prelaz.',
    tags:['Excel .xlsx','PDF štampa'],action:'Otvori PRINT',icon:'print'
  }
};
const drawings={
  line:'<path d="M3 9h18M3 15h18M6 6v12M11 6v12M16 6v12M20 6v12"/>',
  components:'<rect x="2" y="9" width="5" height="5" rx="1"/><rect x="17" y="3" width="5" height="5" rx="1"/><rect x="17" y="17" width="5" height="5" rx="1"/><path d="M7 11.5h5v-6h5M12 11.5v8h5"/>',
  docs:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  diary:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3M8 18h8"/>',
  equipment:'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9"/><path d="M7.5 5.5l9 5"/>',
  report:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 16v-4M12 16V8M17 16v-6M7 18h10"/>',
  cables:'<path d="M3 5h5a4 4 0 0 1 4 4v6a4 4 0 0 0 4 4h5"/><path d="M3 11h4a3 3 0 0 1 3 3v2a3 3 0 0 0 3 3"/><circle cx="3" cy="5" r="1.3"/><circle cx="21" cy="19" r="1.3"/>',
  print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/><path d="M18 12h.01"/>'
};
function vector(name){
 return '<svg class="pp32-mod-svg" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.55" aria-hidden="true" focusable="false">'+drawings[name]+'</svg>';
}
function renderCard(id,node){
 const info=moduleInfo[id];if(!info)return;
 node.classList.add('pp32-module-card','pp32-module--'+id);
 if(id==='line'&&node.classList.contains('im-line-card')){
  // This tile already has the specialised interactive design and correct handler.
  return;
 }
 const html=
  '<div class="pp32-mod-top">'+
   '<span class="pp32-mod-icon">'+vector(info.icon)+'</span>'+
   '<span class="pp32-mod-badge">'+info.badge+'</span>'+
  '</div>'+
  '<span class="pp32-mod-kicker">'+info.kicker+'</span>'+
  '<strong class="pp32-mod-title">'+info.title+'</strong>'+
  '<span class="pp32-mod-description">'+info.description+'</span>'+
  '<div class="pp32-mod-tags">'+info.tags.map(tag=>'<span>'+tag+'</span>').join('')+'</div>'+
  '<div class="pp32-mod-footer"><span>'+info.action+'</span><span class="pp32-mod-arrow" aria-hidden="true">↗</span></div>';
 // Replacing children does not replace or disconnect original element and handlers.
 node.innerHTML=html;
 node.dataset.pp32Module=id;
 const alreadyButton=node.tagName==='BUTTON';
 if(!alreadyButton){
  node.setAttribute('role','button');
  node.setAttribute('tabindex','0');
  node.onkeydown=function(event){
   if(event.target!==node)return;
   if(event.key==='Enter'||event.key===' '){event.preventDefault();node.click();}
  };
 }
 node.setAttribute('aria-label',info.action);
}
const previous=window.rlc;
if(typeof previous!=='function')return;
window.rlc=async function(id){
 await previous(id);
 if(currentProject?.code!=='pp32')return;
 const grid=document.querySelector('.tiles');
 if(!grid)return;
 grid.classList.add('pp32-module-grid');
 const cards=[
  ...[...grid.querySelectorAll('[data-mod]')].map(node=>({node,id:node.dataset.mod})),
  ...[...grid.querySelectorAll('.cw-rlc-tile')].map(node=>({node,id:'cables'})),
  ...[...grid.querySelectorAll('.rp-print-tile')].map(node=>({node,id:'print'}))
 ];
 for(const {node,id:moduleId} of cards)renderCard(moduleId,node);
 if(!grid.previousElementSibling?.classList?.contains('pp32-modules-heading')){
  const intro=document.createElement('div');
  intro.className='pp32-modules-heading';
  intro.innerHTML='<div><span class="pp32-module-eyebrow">PP32 / RADNI PROSTOR PRELAZA</span>'+
   '<h2>Moduli <em>putnog prelaza.</em></h2>'+
   '<p>Otvori odgovarajući modul za evidenciju, izvođenje radova ili izvoz podataka.</p></div>'+
   '<span class="pp32-module-count">'+cards.length+' modula</span>';
  grid.parentNode.insertBefore(intro,grid);
 }
};
})();
