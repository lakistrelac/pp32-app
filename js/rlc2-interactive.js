/* PP32 – pilot interactive line diagram for RLC2, PBA-1 Ruma.
   Reconstructed vector scene, NOT an embedded PDF. Saved to rlc_line_items.
   Trench/cabling is 60% of work; 17 other map items share remaining 40%.
*/
(function(){
'use strict';
const I=window.PP32InteractiveLine={};
const TARGET='RLC2';
const q=x=>encodeURIComponent(String(x));
const E=s=>esc(s==null?'':s);
const num=n=>Number(n||0);
const fmt=n=>new Intl.NumberFormat('sr-RS',{maximumFractionDigits:1}).format(n);
const stateText={not_started:'Bez statusa',prepared:'Pripremljen',done:'Urađen'};
const icon={trench:'↝',sensor:'◇',signal:'◉',barrier:'╞',cabinet:'▦',light:'✦',other:'◉'};
const itemsMap={
 'sensor-k1':{x:160,y:144,label:'K1/11',pos:'above'},
 'signal-ks1':{x:280,y:144,label:'KS1',pos:'below'},
 'sensor-k3-1':{x:500,y:144,label:'K3/13_1',pos:'above'},
 'sensor-k3-2':{x:726,y:144,label:'K3/13_2',pos:'above'},
 'signal-ks2':{x:912,y:144,label:'KS2',pos:'below'},
 'sensor-k2':{x:1090,y:144,label:'K2/12',pos:'above'},
 'signal-ps1':{x:415,y:362,label:'PS1',pos:'above'},
 'signal-ps2':{x:790,y:362,label:'PS2',pos:'above'},
 'barrier-mb1':{x:402,y:447,label:'MB1',pos:'below'},
 'barrier-mb2':{x:805,y:447,label:'MB2',pos:'below'},
 'cabinet-bk':{x:600,y:420,label:'BK PBA-1',pos:'right'},
 'cabinet-energy':{x:600,y:515,label:'Energ. orman',pos:'right'},
 'cabinet-lob':{x:996,y:455,label:'LOB',pos:'below'},
 'light-os1':{x:280,y:562,label:'OS1',pos:'above'},
 'light-os2':{x:280,y:627,label:'OS2',pos:'above'},
 'light-os3':{x:945,y:562,label:'OS3',pos:'above'},
 'light-os4':{x:945,y:627,label:'OS4',pos:'above'}
};
const stateClass=s=>'il-'+(s==='done'?'done':s==='prepared'?'prepared':'unmarked');
function getProgress(data){
 const trench=data.find(x=>x.item_key==='trench');
 const others=data.filter(x=>x.item_key!=='trench');
 const done=others.filter(x=>x.status==='done').length;
 const prepared=others.filter(x=>x.status==='prepared').length;
 const trenchDone=trench?.status==='done';
 const excavation=trenchDone?60:0;
 const otherPart=others.length?(40*done/others.length):0;
 return {total:Math.round((excavation+otherPart)*10)/10,excavation,other:Math.round(otherPart*10)/10,
   totalOther:others.length,done,prepared,unmarked:others.length-done-prepared,
   trenchStatus:trench?.status||'not_started'};
}
I.progress=getProgress;
I.load=async rlcId=>{
 const rows=await api('/rest/v1/rlc_line_items?rlc_id=eq.'+q(rlcId)+'&select=*&order=sort_order.asc&limit=250');
 if(!rows.some(x=>x.item_key==='trench'))throw Error('Interaktivna šema još nije pripremljena za ovaj RLC.');
 return rows;
};
function spot(item){
 const p=itemsMap[item.item_key];if(!p)return'';
 const {x,y,label,pos}=p;
 let primitive='';
 if(item.item_type==='sensor'){
  primitive='<path class="il-symbol" d="M'+x+' '+(y-13)+' L'+(x+12)+' '+y+' L'+x+' '+(y+13)+' L'+(x-12)+' '+y+' Z"/>'+
  '<circle class="il-symbol-dot" cx="'+x+'" cy="'+y+'" r="3"/>';
 }else if(item.item_type==='signal'){
  primitive='<path class="il-line-symbol" d="M'+x+' '+(y-18)+'v36"/>'+
  '<circle class="il-symbol" cx="'+x+'" cy="'+(y-7)+'" r="9"/>'+
  '<circle class="il-symbol-dot" cx="'+x+'" cy="'+(y-7)+'" r="3"/>';
 }else if(item.item_type==='barrier'){
  primitive='<rect class="il-symbol" x="'+(x-10)+'" y="'+(y-11)+'" width="20" height="22" rx="2"/>'+
  '<path class="il-line-symbol" d="M'+(x-4)+' '+(y-4)+' L'+(x+33)+' '+(y-25)+'"/>';
 }else if(item.item_type==='cabinet'){
  primitive='<rect class="il-symbol" x="'+(x-16)+'" y="'+(y-17)+'" width="32" height="34" rx="3"/>'+
  '<path class="il-line-symbol" d="M'+(x-8)+' '+(y-8)+'h16 M'+(x-8)+' '+y+'h16 M'+(x-8)+' '+(y+8)+'h16"/>';
 }else if(item.item_type==='light'){
  primitive='<circle class="il-symbol" cx="'+x+'" cy="'+y+'" r="12"/>'+
  '<path class="il-line-symbol" d="M'+x+' '+(y-22)+'v7 M'+x+' '+(y+15)+'v7 M'+(x-22)+' '+y+'h7 M'+(x+15)+' '+y+'h7"/>';
 }else{
  primitive='<circle class="il-symbol" cx="'+x+'" cy="'+y+'" r="12"/>';
 }
 let tx=x,ty=y-28,anchor='middle';
 if(pos==='below')ty=y+41;
 if(pos==='right'){tx=x+29;ty=y+5;anchor='start';}
 return '<g class="il-spot '+stateClass(item.status)+'" data-il="'+E(item.item_key)+'" role="button" tabindex="0" focusable="true" aria-label="'+E(item.label)+': '+stateText[item.status]+'">'+
 '<circle class="il-hotspot" cx="'+x+'" cy="'+y+'" r="28"/>'+primitive+
 '<text class="il-spot-label" x="'+tx+'" y="'+ty+'" text-anchor="'+anchor+'">'+E(label)+'</text>'+
 '</g>';
}
function svg(data){
 const byKey=new Map(data.map(x=>[x.item_key,x]));
 const trench=byKey.get('trench');
 const places=Object.values(data).filter(x=>x.item_key!=='trench').map(spot).join('');
 const trenchD='M115 287 H570 V258 H1089 V144';
 return '<svg class="il-svg" viewBox="0 0 1240 708" width="1240" height="708" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Interaktivna linijska situacija RLC 2 PBA-1 Ruma – klikni element za status">'+
 '<defs><pattern id="ilGrid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0 H0 V42" fill="none" stroke="#d8e8ed" stroke-width="1"/></pattern>'+
 '<linearGradient id="ilTrench" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2190aa"/><stop offset="1" stop-color="#55bfc0"/></linearGradient></defs>'+
 '<rect x="0" y="0" width="1240" height="708" rx="14" fill="#f7fbfc"/><rect x="0" y="0" width="1240" height="708" fill="url(#ilGrid)" opacity=".49"/>'+
 '<text x="37" y="39" class="il-map-heading">PBA-1 RUMA <tspan class="il-km-mark">/ KM 3+285</tspan></text>'+
 '<text x="1200" y="38" text-anchor="end" class="il-map-corner">SS PROJEKAT · INTERAKTIVNA REKONSTRUKCIJA</text>'+
 '<path d="M60 144 H1180" stroke="#344e63" stroke-width="5" stroke-linecap="round"/>'+
 '<path d="M60 130 H1180 M60 158 H1180" stroke="#77929e" stroke-width="2"/>'+
 Array.from({length:41},(_,i)=>{const x=70+i*27;return '<path d="M'+x+' 126v36" stroke="#607c8a" stroke-width="3" opacity=".73"/>'}).join('')+
 '<rect x="574" y="76" width="54" height="224" rx="4" fill="#f0f4f7" stroke="#a8bac7" stroke-width="1.6"/>'+
 '<path d="M586 82 L615 122 M584 133 L618 182 M584 196 L618 240 M584 257 L610 293" stroke="#c08c65" stroke-width="3.5" opacity=".56"/>'+
 '<rect x="580" y="119" width="43" height="50" fill="#f6dfd8" opacity=".8" stroke="#d36e64" stroke-width="1"/>'+
 '<path d="M560 118h83 M560 170h83" stroke="#cb5157" stroke-width="6" stroke-linecap="round"/>'+
 '<text x="600" y="90" text-anchor="middle" class="il-cross-label">PP</text>'+
 '<path d="M602 300V680" stroke="#80bcb4" stroke-width="2" stroke-dasharray="9 8" opacity=".8"/>'+
 '<path d="M400 428H562 M642 428H809 M410 355H550 M655 355H780 M280 563 H540 M662 563H940 M280 627H540 M662 627H940" stroke="#84b1c0" stroke-width="1.8" opacity=".68" fill="none"/>'+
 '<g class="il-trench '+stateClass(trench?.status||'not_started')+'" data-il="trench" role="button" tabindex="0" focusable="true" aria-label="Trasa rov i polaganje kablova: '+stateText[trench?.status||'not_started']+'">'+
 '<path d="'+trenchD+'" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>'+
 '<path class="il-trench-line" d="'+trenchD+'" fill="none" stroke="url(#ilTrench)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="18 8"/>'+
 '<path class="il-trench-hit" d="'+trenchD+'" fill="none" stroke="transparent" stroke-width="35" stroke-linecap="round" stroke-linejoin="round"/>'+
 '<rect class="il-trench-label-bg" x="285" y="243" width="203" height="30" rx="15"/>'+
 '<text x="386" y="263" text-anchor="middle" class="il-trench-label">ROV + POLAGANJE · 60%</text>'+
 '</g>'+
 '<g class="il-station"><rect x="42" y="258" width="134" height="54" rx="9"/><text x="109" y="280" text-anchor="middle">STANICA RUMA</text><text x="109" y="298" text-anchor="middle" class="il-station-small">NAPAJANJE / PP41</text><circle cx="115" cy="287" r="5"/></g>'+
 '<g class="il-sensor-destination"><text x="1100" y="211" text-anchor="middle">KRAJNJI SENZOR</text><path d="M1090 178V194" stroke="#5c8597" stroke-width="1.5"/></g>'+
 '<g><rect x="538" y="301" width="127" height="47" rx="8" fill="#dff0ed" stroke="#78b4aa" stroke-width="1.5"/><text x="602" y="322" text-anchor="middle" class="il-road-title">PBA-1</text><text x="602" y="339" text-anchor="middle" class="il-road-sub">PUTNI PRELAZ</text></g>'+
 '<text x="48" y="91" class="il-side-label">PRAVAC RUMA</text><text x="1190" y="91" text-anchor="end" class="il-side-label">PRAVAC ŠABAC / DONJA BORINA</text>'+
 '<path d="M98 142l-13 0m0 0l7-5m-7 5l7 5 M1140 142l16 0m0 0l-7-5m7 5l-7 5" stroke="#244f68" stroke-width="2" fill="none"/>'+
 places+
 '<text x="44" y="682" class="il-map-note">ŠEMA IZRAĐENA PREMA DOSTAVLJENOM PROJEKTANTSKOM PDF-U · POLOŽAJI SU ILUSTRATIVNI (NIJE CAD RAZMERA)</text>'+
 '<text x="1191" y="682" text-anchor="end" class="il-map-note">RLC2 / V1</text>'+
 '</svg>';
}
function stageInfo(progress){
 const percent=Math.min(100,Math.max(0,progress.total));
 return '<section class="il-progress-panel">'+
 '<div class="il-progress-summary"><div><span>UKUPNA REALIZACIJA RLC 2</span><strong>'+fmt(percent)+'%</strong></div>'+
 '<div class="il-progress-description">Obračun samo po interaktivnoj linijskoj situaciji · status „Urađen“</div></div>'+
 '<div class="il-progress-bar"><span style="width:'+percent+'%"></span></div>'+
 '<div class="il-progress-parts">'+
 '<div><span>ROV I KABLOVI · 60%</span><b>'+fmt(progress.excavation)+' / 60%</b><small>'+stateText[progress.trenchStatus]+'</small></div>'+
 '<div><span>OSTALI ELEMENTI · 40%</span><b>'+fmt(progress.other)+' / 40%</b><small>'+progress.done+' od '+progress.totalOther+' urađeno · '+progress.prepared+' pripremljeno</small></div></div>'+
 '</section>';
}
function list(data){
 return '<div class="il-list-header"><div><span>ELEMENTI LINIJ­SKE SITUACIJE</span><h2>Odaberi element</h2></div><small>'+data.filter(x=>x.status==='done').length+' / '+data.length+' završeno</small></div>'+
 '<div class="il-list-items">'+data.map(x=>
 '<button type="button" class="il-list-item '+stateClass(x.status)+'" data-il="'+E(x.item_key)+'">'+
 '<span class="il-list-symbol">'+(icon[x.item_type]||'◉')+'</span>'+
 '<span class="il-list-copy"><strong>'+E(x.label)+'</strong><small>'+E(x.item_type==='trench'?'Kopanje i polaganje kablova · 60%':x.detail||'')+'</small></span>'+
 '<span class="il-list-status">'+stateText[x.status]+'</span></button>').join('')+'</div>';
}
function dialog(item){
 const editable=canEdit();
 return '<div class="il-dialog" id="ilDialog" hidden><div class="il-dialog-scrim" data-ilclose="1"></div>'+
 '<section class="il-dialog-pane" role="dialog" aria-modal="true" aria-labelledby="ilDialogName">'+
 '<div class="il-dialog-top"><span>FAZA RADOVA · '+E(item.item_type==='trench'?'TRASA 60%':'ELEMENT')+'</span><button type="button" id="ilClose" aria-label="Zatvori">×</button></div>'+
 '<h2 id="ilDialogName">'+E(item.label)+'</h2><p>'+E(item.detail)+'</p>'+
 '<div class="il-current-status">Trenutno: <b class="'+stateClass(item.status)+'">'+stateText[item.status]+'</b></div>'+
 (editable?
 '<div class="il-status-actions"><button type="button" class="il-set il-set-prepared" data-ilset="prepared">◷ Pripremljen</button>'+
 '<button type="button" class="il-set il-set-done" data-ilset="done">✓ Urađen</button></div>'+
 '<button type="button" class="il-reset" data-ilset="not_started">Poništi oznaku</button><p class="il-dialog-foot">Promena se čuva odmah u zajedničkoj bazi.</p>':
 '<p class="il-viewer-tip">Imaš pravo pregleda. Za izmenu je potreban aktivan nalog sa pravom uređivanja.</p>')+
 '<p role="status" id="ilMessage"></p></section></div>';
}
function normalizeProgressIntoRlcHero(value){
 const hero=document.querySelector('.wrap > .hero .big');if(hero)hero.textContent=fmt(value)+'%';
}
function selectorKeys(){
 return [...document.querySelectorAll('[data-il]')];
}
I.open=async function(rlcId){
 let r=await api('/rest/v1/rlcs?id=eq.'+q(rlcId)+'&select=*');
 if(!r[0]||r[0].code!==TARGET)throw Error('Pilot interaktivne linijske situacije je trenutno dostupan samo za RLC2.');
 const data=await I.load(rlcId);
 I.page={rlcId,rlc:r[0],data,scale:window.innerWidth<800?.86:1,active:null};
 I.render();
};
I.render=function(){
 const s=I.page;if(!s)return;
 const pr=getProgress(s.data);
 shell('<main class="wrap il-page">'+
 '<div class="il-top"><button type="button" class="il-back" id="ilBack">← '+E(s.rlc.code)+' · Moduli</button>'+
 '<span class="il-pilot-badge"><i></i> PILOT / INTERAKTIVNA LINIJSKA</span></div>'+
 '<header class="il-hero"><div><div class="il-overline">PP32 · VIZUELNA EVIDENCIJA IZVOĐENJA</div>'+
 '<h1>PBA-1 <em>Ruma</em> <span>· RLC 2</span></h1>'+
 '<p>'+E(s.rlc.chainage||'km 3+285')+' · '+E(s.rlc.railway_line||'Ruma–Šabac–Donja Borina')+'</p></div>'+
 '<div class="il-hero-progress"><strong>'+fmt(pr.total)+'%</strong><span>UKUPAN NAPREDAK</span></div></header>'+
 stageInfo(pr)+
 '<div class="il-workbench"><div class="il-diagram-panel">'+
 '<div class="il-diagram-toolbar"><div><b>Interaktivna linijska situacija</b><p>Dodirni element ili trasu za promenu statusa.</p></div>'+
 '<div class="il-diagram-controls"><button type="button" data-ilzoom=".8" aria-label="Smanji">−</button><span id="ilZoomText">'+Math.round(s.scale*100)+'%</span><button type="button" data-ilzoom="1.2" aria-label="Uvećaj">＋</button><button type="button" id="ilZoomFit">100%</button></div></div>'+
 '<div class="il-legend"><span><i class="il-legend-neutral"></i> Bez statusa</span><span><i class="il-legend-prepared"></i> Pripremljen</span><span><i class="il-legend-done"></i> Urađen</span></div>'+
 '<div class="il-svg-scroll" id="ilSvgScroll">'+svg(s.data)+'</div>'+
 '<div class="il-diagram-foot"><span>Stanica Ruma → K2/12-PBA-1</span><span>Interaktivna SVG šema, nije podloga PDF-a</span></div></div>'+
 '<aside class="il-sidebar">'+list(s.data)+'</aside></div>'+
 '<section class="il-method"><b>METOD OBRAČUNA</b><p>Jedinstvena trasa rova i polaganja kablova nosi <strong>60%</strong> kada dobije status „Urađen“. Ostalih '+pr.totalOther+' elemenata zajedno nose <strong>40%</strong> (svaki '+fmt(40/pr.totalOther)+' procentnih poena). Status „Pripremljen“ služi za praćenje pripreme, ali ne povećava procenat izvedenih radova.</p>'+
 '<p class="il-caution">Napojni kabl od stanice Ruma označen je na projektnoj linijskoj situaciji kao PP41 4×6 mm², 3.500 m. To je dužina kabla u šemi, a ne potvrđena dužina iskopanog rova. Položaji na ovoj interaktivnoj šemi su orijentacioni, ne geodetski.</p></section>'+
 '<div id="ilModalRoot"></div></main>');
 document.getElementById('ilBack').onclick=()=>window.rlc(s.rlcId).catch(reportError);
 const svgEl=document.querySelector('.il-svg');
 const setScale=scale=>{s.scale=Math.min(1.6,Math.max(.55,Math.round(scale*100)/100));svgEl.style.width=Math.round(1240*s.scale)+'px';svgEl.style.height=Math.round(708*s.scale)+'px';document.getElementById('ilZoomText').textContent=Math.round(s.scale*100)+'%';};
 setScale(s.scale);
 document.querySelectorAll('[data-ilzoom]').forEach(btn=>btn.onclick=()=>setScale(s.scale+Number(btn.dataset.ilzoom)-1));
 document.getElementById('ilZoomFit').onclick=()=>setScale(1);
 const board=document.querySelector('#ilSvgScroll');
 if(window.innerWidth<800)board.scrollLeft=Math.round(1240*s.scale*.19);
 function activate(key){const item=s.data.find(x=>x.item_key===key);if(!item)return;s.active=key;
  const root=document.getElementById('ilModalRoot');root.innerHTML=dialog(item);
  const modal=document.getElementById('ilDialog');modal.hidden=false;
  const close=()=>{root.innerHTML='';s.active=null};
  document.getElementById('ilClose').onclick=close;
  modal.querySelector('[data-ilclose]').onclick=close;
  modal.querySelectorAll('[data-ilset]').forEach(b=>b.onclick=async()=>{
   const next=b.dataset.ilset;if(next===item.status)return close();
   b.disabled=true;
   const notice=document.getElementById('ilMessage');if(notice)notice.textContent='Čuvanje...';
   try{
    const saved=await api('/rest/v1/rlc_line_items?id=eq.'+q(item.id),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status:next,updated_at:new Date().toISOString()})});
    if(!saved?.length)throw Error('Promena nije upisana u bazu. Proveri prava pristupa.');
    const oldScroll=board.scrollLeft,oldTop=board.scrollTop;
    item.status=next;
    I.render();
    const fresh=document.getElementById('ilSvgScroll');if(fresh){fresh.scrollLeft=oldScroll;fresh.scrollTop=oldTop}
   }catch(err){if(notice)notice.textContent=err?.message||String(err);b.disabled=false;}
  });
 }
 selectorKeys().forEach(node=>{
  node.addEventListener('click',event=>{event.preventDefault();activate(node.dataset.il)});
  node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate(node.dataset.il);}});
 });
};
function reportError(err){alert('Interaktivna linijska: '+(err?.message||String(err)))}
const oldRlc=window.rlc;
if(typeof oldRlc==='function'){
 window.rlc=async function(id){
  await oldRlc(id);
  if(currentProject?.code!=='pp32'||currentRlc?.code!==TARGET)return;
  const tile=document.querySelector('[data-mod="line"]');
  if(tile){
   tile.classList.add('il-launch-tile','il-feature-tile');
   tile.innerHTML='<div class="il-feature-top"><span class="il-feature-icon" aria-hidden="true">⌁</span><span class="il-feature-badge"><span class="il-feature-dot"></span> INTERAKTIVNO</span></div>'+
   '<b class="il-feature-name">Linijska situacija</b>'+
   '<span class="il-feature-desc">Klikni element i označi njegovu fazu radova</span>'+
   '<div class="il-feature-footer"><span>TRASA <b>60%</b> <i>·</i> ELEMENTI <b>40%</b></span><span class="il-feature-arrow" aria-hidden="true">↗</span></div>';
   tile.setAttribute('role','button');tile.tabIndex=0;
   tile.onclick=()=>I.open(id).catch(reportError);
   tile.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();tile.click()}};
  }
  try{
   const items=await I.load(id),pct=getProgress(items);
   normalizeProgressIntoRlcHero(pct.total);
   const hero=document.querySelector('.wrap > .hero');
   if(hero)hero.insertAdjacentHTML('beforeend','<span class="il-rlc-progress-explain">Napredak iz interaktivne linijske situacije · rov 60% + elementi 40%</span>');
  }catch(e){reportError(e)}
 };
}
const oldProject=window.project;
if(typeof oldProject==='function'){
 window.project=async function(id){
  await oldProject(id);
  if(currentProject?.code!=='pp32')return;
  const card=[...document.querySelectorAll('.rlcgrid [data-r]')].find(c=>c.querySelector('.rg-code')?.textContent.replace(/\s/g,'')==='RLC2');
  if(!card)return;
  try{
   const items=await I.load(card.dataset.r),p=getProgress(items);
   const meter=card.querySelector('.rg-progress i');if(meter)meter.style.width=p.total+'%';
   const pct=card.querySelector('.rg-progress-caption b');if(pct)pct.textContent=fmt(p.total)+'%';
   if(!card.querySelector('.il-card-tag')){const status=card.querySelector('.rg-route');if(status)status.insertAdjacentHTML('beforeend','<span class="il-card-tag">● Interaktivno</span>')}
  }catch(e){reportError(e)}
 };
}
const oldReport=window.report;
if(typeof oldReport==='function'){
 window.report=async function(){
  await oldReport();
  if(currentProject?.code!=='pp32'||currentRlc?.code!==TARGET)return;
  try{
   const data=await I.load(currentRlc.id),p=getProgress(data);
   const big=document.querySelector('.wrap > .hero .big');if(big)big.textContent=fmt(p.total)+'%';
   const hero=document.querySelector('.wrap > .hero');
   if(hero)hero.insertAdjacentHTML('afterend','<p class="il-report-info">Ukupni napredak na osnovu interaktivne linijske: '+fmt(p.total)+'% (rov i kablovi '+fmt(p.excavation)+'/60%, ostali elementi '+fmt(p.other)+'/40%). Zadaci komponenti prikazani ispod su zasebna evidencija.</p>');
  }catch(e){reportError(e)}
 };
}
})();
