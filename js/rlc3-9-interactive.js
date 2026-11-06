/* PP32 – individual interactive line diagrams for RLC3–RLC9.
 * Reconstructed vector schematics, not scanned PDF overlays.
 * Site-specific equipment and feeder notes configured in rlc3-9-sites.js.
 * Every status persisted in rlc_line_items via Supabase PostgREST.
 */
(function(){
'use strict';
const sites=window.PP32LineSites||{};
const allowed=new Set(['RLC3','RLC4','RLC5','RLC6','RLC7','RLC8','RLC9']);
const A=window.PP32LinesMore={};
const E=x=>esc(x==null?'':String(x));
const q=x=>encodeURIComponent(String(x));
const fmt=n=>new Intl.NumberFormat('sr-RS',{maximumFractionDigits:1}).format(n);
const statuses={not_started:'Bez statusa',prepared:'Pripremljen',done:'Urađen'};
const icons={trench:'↝',sensor:'◇',signal:'◉',barrier:'╞',cabinet:'▦',light:'✦'};
const state=s=>'il-'+(s==='done'?'done':s==='prepared'?'prepared':'unmarked');
const progress=items=>window.PP32InteractiveLine.progress(items);
function findCoords(conf,items){
 const mapping={};
 const sensors=items.filter(x=>x.item_type==='sensor');
 const signals=items.filter(x=>x.item_type==='signal'&&/^signal-(?:ks|pks)/.test(x.item_key));
 const ps=items.filter(x=>x.item_type==='signal'&&/^signal-ps/.test(x.item_key));
 const barriers=items.filter(x=>x.item_type==='barrier');
 const cabinet=items.filter(x=>x.item_type==='cabinet');
 const lamps=items.filter(x=>x.item_type==='light');
 const sensorX={'sensor-k1-11':205,'sensor-k3-13-1':500,'sensor-k3-13-2':748,'sensor-k2-12':1100,'sensor-k5-15':78,'sensor-k5-15-2':78};
 sensors.forEach((row,i)=>{const x=sensorX[row.item_key]??(120+i*155);mapping[row.item_key]=[x,146, i%2?'above':'below']});
 const signalPlaces=signals.length===3?[270,805,970]:signals.length===2?[270,970]:[270];
 signals.forEach((row,i)=>{mapping[row.item_key]=[signalPlaces[i]??750,226,'below']});
 if(ps.length===4){ps.forEach(row=>{
  const xy={'signal-ps1':[397,354],'signal-ps2':[852,354],'signal-ps3':[397,291],'signal-ps4':[852,291]}[row.item_key];
  mapping[row.item_key]=[...xy,row.item_key.endsWith('1')||row.item_key.endsWith('2')?'below':'above'];
 });}
 else if(ps.length===3){ps.forEach(row=>{
  const xy={'signal-ps1':[400,354],'signal-ps2':[850,354],'signal-ps3':[400,267]}[row.item_key];
  mapping[row.item_key]=[...xy,'above'];
 });}
 else ps.forEach((row,i)=>mapping[row.item_key]=[i?850:400,334,'above']);
 barriers.forEach((row,i)=>mapping[row.item_key]=[i?848:405,436,i?'right':'left']);
 const cabinetPlaces=[[620,423,'right'],[620,509,'right'],[1030,482,'below']];
 cabinet.forEach((row,i)=>mapping[row.item_key]=cabinetPlaces[i]||[1000,525+i*40,'below']);
 const lampPlaces=[[350,550,'left'],[350,625,'left'],[925,550,'right'],[925,625,'right']];
 lamps.forEach((row,i)=>mapping[row.item_key]=lampPlaces[i]||[770,610,'below']);
 return mapping;
}
function drawShape(row,coord){
 const [x,y,pos]=coord,kind=row.item_type;
 let graphics='';
 if(kind==='sensor')graphics='<path class="il-symbol" d="M'+x+' '+(y-13)+'L'+(x+12)+' '+y+'L'+x+' '+(y+13)+'L'+(x-12)+' '+y+'Z"/><circle class="il-symbol-dot" cx="'+x+'" cy="'+y+'" r="3"/>';
 else if(kind==='signal')graphics='<path class="il-line-symbol" d="M'+x+' '+(y-18)+'V'+(y+18)+'"/><circle class="il-symbol" cx="'+x+'" cy="'+(y-7)+'" r="9"/><circle class="il-symbol-dot" cx="'+x+'" cy="'+(y-7)+'" r="3"/>';
 else if(kind==='barrier')graphics='<rect class="il-symbol" x="'+(x-10)+'" y="'+(y-11)+'" width="20" height="22" rx="2"/><path class="il-line-symbol" d="M'+(x-4)+' '+(y-4)+'L'+(x+32)+' '+(y-25)+'"/>';
 else if(kind==='cabinet')graphics='<rect class="il-symbol" x="'+(x-16)+'" y="'+(y-17)+'" width="32" height="34" rx="3"/><path class="il-line-symbol" d="M'+(x-8)+' '+(y-8)+'h16 M'+(x-8)+' '+y+'h16 M'+(x-8)+' '+(y+8)+'h16"/>';
 else if(kind==='light')graphics='<circle class="il-symbol" cx="'+x+'" cy="'+y+'" r="12"/><path class="il-line-symbol" d="M'+x+' '+(y-22)+'v7 M'+x+' '+(y+15)+'v7 M'+(x-22)+' '+y+'h7 M'+(x+15)+' '+y+'h7"/>';
 let label=row.label;
 if(kind==='sensor')label=row.label.replace(/-(?:PBM|PBE|PBK|PBJ|PBH)-\d+$/,'');
 if(kind==='cabinet'&&row.item_key==='cabinet-energy')label='Energ. orman';
 let tx=x,ty=y-27,anchor='middle';
 if(pos==='below')ty=y+36;
 if(pos==='left'){tx=x-27;ty=y+4;anchor='end'}
 if(pos==='right'){tx=x+27;ty=y+4;anchor='start'}
 return '<g class="il-spot '+state(row.status)+'" data-il="'+E(row.item_key)+'" role="button" tabindex="0" aria-label="'+E(row.label)+': '+statuses[row.status]+'">'+
 '<circle class="il-hotspot" cx="'+x+'" cy="'+y+'" r="29"/>'+graphics+
 '<text class="il-spot-label" x="'+tx+'" y="'+ty+'" text-anchor="'+anchor+'">'+E(label)+'</text></g>';
}
function drawMap(conf,data){
 const coords=findCoords(conf,data);
 const trench=data.find(x=>x.item_key==='trench');
 const routeStart=conf.feedSide==='right'?1078:155;
 const routeEnd=conf.feedSide==='right'?155:1082;
 const routeLabelStart=conf.feedSide==='right'?1105:155;
 const routeLabelEnd=conf.feedSide==='right'?150:1080;
 const landscape=conf.railFeature.includes('rasputnica')||conf.railFeature.includes('Rasputnica')||conf.railFeature.includes('ŽS Loznica');
 const extra=conf.short==='PBM-1'?'<path d="M60 184H360L430 146M60 225H315L400 146" fill="none" stroke="#98acb6" stroke-width="2"/><path d="M61 184l20 0M61 225l20 0" stroke="#748f9b" stroke-width="3"/><text x="75" y="255" class="il-side-label">RASPUTNICA / PERON 100 m</text>':
 conf.short==='PBE-1'?'<path d="M550 190h154" stroke="#91abb8" stroke-width="7"/><text x="627" y="210" text-anchor="middle" class="il-side-label">PERON 31 m</text>':
 conf.short==='PBK-3'?'<path d="M115 183L280 146M115 190L280 146" stroke="#90aeb9" stroke-width="2"/><text x="70" y="222" class="il-side-label">PRAVAC ŽS LOZNICA</text>':
 landscape?'<path d="M75 220H260L318 147" fill="none" stroke="#adc2ca" stroke-width="2"/><text x="75" y="259" class="il-side-label">'+E(conf.railFeature)+'</text>':'';
 const sleeper=Array.from({length:42},(_,i)=>{let x=54+i*28;return '<path d="M'+x+' 133v35" stroke="#93aab6" stroke-width="3"/>'}).join('');
 const spots=data.filter(x=>x.item_key!=='trench').map(row=>drawShape(row,coords[row.item_key]||[600,370,'above'])).join('');
 const labels='Trasa: '+conf.routeFrom+' → '+conf.routeTo;
 const route='<g class="il-trench '+state(trench?.status)+'" data-il="trench" tabindex="0" role="button" aria-label="'+E(labels)+', '+statuses[trench?.status||'not_started']+'">'+
 '<rect class="ilm-route-band" x="42" y="668" width="1158" height="69" rx="14"/>'+
 '<path class="il-trench-line" d="M'+routeStart+' 702H'+routeEnd+'" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="16 7"/>'+
 '<path class="il-trench-hit" d="M'+routeStart+' 702H'+routeEnd+'" fill="none" stroke="transparent" stroke-width="47"/>'+
 '<circle class="ilm-end" cx="'+routeStart+'" cy="702" r="10"/><circle class="ilm-end" cx="'+routeEnd+'" cy="702" r="10"/>'+
 '<text class="ilm-route-start" x="'+routeLabelStart+'" y="685" text-anchor="'+(conf.feedSide==='right'?'end':'start')+'">'+E(conf.routeFrom)+'</text>'+
 '<text class="ilm-route-end" x="'+routeLabelEnd+'" y="685" text-anchor="'+(conf.feedSide==='right'?'start':'end')+'">'+E(conf.routeTo)+'</text>'+
 '<text class="ilm-route-title" x="625" y="707" text-anchor="middle">KOPANJE + POLAGANJE · 60%</text>'+
 '<text class="ilm-route-subtitle" x="625" y="727" text-anchor="middle">KLIKNI ZA STATUS KOMPLETNE TRASE</text></g>';
 return '<svg class="il-svg ilm-svg" viewBox="0 0 1240 770" width="1240" height="770" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Interaktivna linijska situacija '+E(conf.name)+'">'+
 '<defs><pattern id="ilmGrid" width="43" height="43" patternUnits="userSpaceOnUse"><path d="M43 0H0V43" fill="none" stroke="#d5e8ed" stroke-width="1"/></pattern></defs>'+
 '<rect width="1240" height="770" rx="15" fill="#f8fbfc"/><rect width="1240" height="770" fill="url(#ilmGrid)" opacity=".52"/>'+
 '<text x="42" y="38" class="il-map-heading">'+E(conf.short)+' <tspan class="il-km-mark">/ KM '+E(conf.km)+'</tspan></text>'+
 '<text x="1200" y="38" text-anchor="end" class="il-map-corner">REKONSTRUISANA INTERAKTIVNA ŠEMA</text>'+
 '<path d="M42 147H1198" stroke="#405e71" stroke-width="6"/><path d="M42 131H1198M42 165H1198" stroke="#72909f" stroke-width="2.5"/>'+sleeper+extra+
 '<rect x="587" y="72" width="66" height="572" rx="3" fill="#ebf1f2" stroke="#b9cbd0" stroke-width="1.8"/>'+
 '<path d="M620 81V637" stroke="#c6d1d4" stroke-width="3" stroke-dasharray="12 12"/>'+
 '<rect x="578" y="115" width="85" height="65" fill="#f8e3dd" stroke="#ce9188" stroke-width="1.4"/>'+
 '<path d="M569 121H673M569 170H673" stroke="#d06160" stroke-width="5.5"/>'+
 '<text x="620" y="104" text-anchor="middle" class="il-cross-label">PUTNI PRELAZ</text>'+
 '<rect x="548" y="283" width="144" height="45" rx="9" fill="#e6f4f2" stroke="#76b3b0"/>'+
 '<text x="620" y="303" text-anchor="middle" class="il-road-title">'+E(conf.short)+'</text><text x="620" y="320" text-anchor="middle" class="il-road-sub">'+E(conf.km)+'</text>'+
 '<text x="45" y="91" class="il-side-label">PRAVAC RUMA / ŠABAC</text><text x="1199" y="91" text-anchor="end" class="il-side-label">PRAVAC DONJA BORINA</text>'+
 '<path d="M395 350H559M681 350H850M405 437H580M663 437H850M350 550H578M668 550H925M350 625H578M668 625H925" fill="none" stroke="#88b3bf" stroke-width="1.8" opacity=".75"/>'+
 '<g class="ilm-feed"><rect x="'+(conf.feedSide==='right'?1010:40)+'" y="482" width="195" height="42" rx="9"/>'+
 '<text x="'+(conf.feedSide==='right'?1108:137)+'" y="499" text-anchor="middle">IZVOR NAPAJANJA</text>'+
 '<text x="'+(conf.feedSide==='right'?1108:137)+'" y="516" text-anchor="middle" class="ilm-feed-name">'+E(conf.routeFrom)+'</text></g>'+
 spots+route+
 '<text x="43" y="758" class="il-map-note">ŠEMA IZRAĐENA PREMA PROJEKTNOM PDF-U · POLOŽAJI ILUSTRATIVNI, NISU CAD RAZMERA</text>'+
 '<text x="1198" y="758" text-anchor="end" class="il-map-note">'+E(conf.short)+' / PP32</text></svg>';
}
function stages(data){
 const p=progress(data);
 return '<section class="il-progress-panel"><div class="il-progress-summary"><div><span>UKUPNA REALIZACIJA IZ INTERAKTIVNE ŠEME</span><strong>'+fmt(p.total)+'%</strong></div><div class="il-progress-description">Rov i kablovi 60% · ostali elementi 40% · pripremljeno nosi polovinu</div></div>'+
 '<div class="il-progress-bar"><span style="width:'+p.total+'%"></span></div>'+
 '<div class="il-progress-parts"><div><span>ROV I POLAGANJE · 60%</span><b>'+fmt(p.excavation)+' / 60%</b><small>'+statuses[p.trenchStatus]+'</small></div>'+
 '<div><span>OSTALI ELEMENTI · 40%</span><b>'+fmt(p.other)+' / 40%</b><small>'+p.done+' od '+p.totalOther+' urađeno · '+p.prepared+' pripremljeno</small></div></div></section>';
}
function listing(data){
 return '<div class="il-list-header"><div><span>FAZE POJEDINAČNIH ELEMENATA</span><h2>Označi element</h2></div><small>'+data.filter(x=>x.status==='done').length+' / '+data.length+' urađeno</small></div>'+
 '<div class="il-list-items">'+data.map(row=>'<button type="button" class="il-list-item '+state(row.status)+'" data-il="'+E(row.item_key)+'"><span class="il-list-symbol">'+(icons[row.item_type]||'○')+'</span>'+
 '<span class="il-list-copy"><strong>'+E(row.label)+'</strong><small>'+E(row.detail)+'</small></span><span class="il-list-status">'+statuses[row.status]+'</span></button>').join('')+'</div>';
}
function modal(item){
 return '<div class="il-dialog" id="ilmModal"><div class="il-dialog-scrim" data-ilclose="1"></div><section class="il-dialog-pane" role="dialog" aria-modal="true" aria-labelledby="ilmDialogName">'+
 '<div class="il-dialog-top"><span>'+(item.item_key==='trench'?'TRASA / 60%':'FAZA ELEMENTA')+'</span><button type="button" id="ilmClose" aria-label="Zatvori prozor">×</button></div>'+
 '<h2 id="ilmDialogName">'+E(item.label)+'</h2><p>'+E(item.detail)+'</p>'+
 '<div class="il-current-status">Trenutno stanje: <b class="'+state(item.status)+'">'+statuses[item.status]+'</b></div>'+
 (canEdit()?'<div class="il-status-actions"><button class="il-set il-set-prepared" type="button" data-ilset="prepared">◷ Pripremljen</button>'+
 '<button class="il-set il-set-done" type="button" data-ilset="done">✓ Urađen</button></div><button type="button" class="il-reset" data-ilset="not_started">Poništi oznaku</button>'+
 '<p class="il-dialog-foot">Status se odmah čuva u Supabase bazi.</p>':
 '<p class="il-viewer-tip">Pravo izmene imaju korisnici sa dozvolom za uređivanje.</p>')+
 '<p id="ilmMessage" role="status"></p></section></div>';
}
A.open=async function(id){
 const [rlcRows,items]=await Promise.all([
 api('/rest/v1/rlcs?id=eq.'+q(id)+'&select=*'),
 api('/rest/v1/rlc_line_items?rlc_id=eq.'+q(id)+'&select=*&order=sort_order.asc&limit=250')
 ]);
 const rlc=rlcRows[0];if(!rlc||!allowed.has(rlc.code))throw Error('Interaktivna šema nije konfigurisana za traženi RLC.');
 const cfg=sites[rlc.code];if(!cfg)throw Error('Nedostaje konfiguracija šeme za '+rlc.code);
 if(items.length!==cfg.elements.length||!items.some(x=>x.item_key==='trench'))throw Error('Podaci šeme nisu kompletni za '+rlc.code+'. Očekivano: '+cfg.elements.length+', pronađeno: '+items.length);
 const page={id,rlc,cfg,items,zoom:window.innerWidth<800?.86:1};
 const screen='<main class="wrap il-page">'+
 '<div class="il-top"><button id="ilmBack" class="il-back" type="button">← '+E(rlc.code)+' · Moduli</button><span class="il-pilot-badge"><i></i> INTERAKTIVNA · '+E(rlc.code)+'</span></div>'+
 '<header class="il-hero"><div><div class="il-overline">PP32 / INTERAKTIVNA EVIDENCIJA IZVOĐENJA</div><h1>'+E(cfg.name)+' <span>· '+E(rlc.code)+'</span></h1>'+
 '<p>'+E(rlc.chainage||'km '+cfg.km)+' · '+E(rlc.railway_line||'Ruma–Šabac–Donja Borina')+'</p></div>'+
 '<div class="il-hero-progress"><strong id="ilmHeroPct">0%</strong><span>UKUPAN NAPREDAK</span></div></header>'+
 '<section class="pp32-pdf-strip"><div class="pp32-pdf-strip-copy"><b>Originalni projektni crtež</b><span>PDF linijske situacije sa planom uključenja · projektna podloga</span></div>'+
 window.PP32OriginalPDF.controls(rlc)+'</section>'+
 '<div id="ilmStages"></div><div class="il-workbench"><div class="il-diagram-panel"><div class="il-diagram-toolbar"><div><b>Interaktivna linijska situacija · '+E(cfg.short)+'</b>'+
 '<p>Označi element na šemi ili iz liste. Status se čuva po RLC-u.</p></div><div class="il-diagram-controls"><button type="button" data-ilzoom="-0.2">−</button><span id="ilmZoomText">100%</span>'+
 '<button type="button" data-ilzoom="0.2">＋</button><button id="ilmZoomReset" type="button">100%</button></div></div>'+
 '<div class="il-legend"><span><i class="il-legend-neutral"></i> Bez statusa</span><span><i class="il-legend-prepared"></i> Pripremljen</span><span><i class="il-legend-done"></i> Urađen</span></div>'+
 '<div id="ilmMap" class="il-svg-scroll"></div><div class="il-diagram-foot"><span>'+E(cfg.routeFrom)+' → '+E(cfg.routeTo)+'</span><span>Digitalna SVG šema · ne PDF podloga</span></div></div>'+
 '<aside class="il-sidebar" id="ilmList"></aside></div>'+
 '<section class="il-method"><b>OBRAČUN · 60% + 40%</b><p>Jedinstvena trasa rova i polaganja kablova nosi 60% kada je urađena ili 30% kada je pripremljena. Preostalih 40% ravnomerno dele '+(items.length-1)+' elemenata. „Pripremljen“ nosi 50% vrednosti svakog elementa, a „Urađen“ 100%. Kada je sve pripremljeno, realizacija je tačno 50%.</p>'+
 '<p class="il-caution">'+E(cfg.caution)+'</p><p>Napojni kabl: '+E(cfg.feed)+'. Projektne dužine kablova ne predstavljaju automatski dužinu iskopanog rova.</p></section>'+
 '<div id="ilmModalRoot"></div></main>';
 shell(screen);
 document.getElementById('ilmBack').onclick=()=>window.rlc(id).catch(error);
 window.PP32OriginalPDF.attach(rlc,()=>A.open(id));
 const box=document.getElementById('ilmMap'),zoomLabel=document.getElementById('ilmZoomText');
 function zoom(delta){page.zoom=Math.min(1.65,Math.max(.55,Math.round((page.zoom+delta)*100)/100));const s=box.querySelector('svg');if(s){s.style.width=Math.round(1240*page.zoom)+'px';s.style.height=Math.round(770*page.zoom)+'px'}zoomLabel.textContent=Math.round(page.zoom*100)+'%'}
 function refresh(){
  const p=progress(page.items);
  document.getElementById('ilmStages').innerHTML=stages(page.items);
  document.getElementById('ilmHeroPct').textContent=fmt(p.total)+'%';
  box.innerHTML=drawMap(cfg,page.items);zoom(0);
  document.getElementById('ilmList').innerHTML=listing(page.items);
  [...document.querySelectorAll('[data-il]')].forEach(node=>{
   const activate=()=>select(node.dataset.il);
   node.addEventListener('click',activate);
   if(node instanceof SVGElement)node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate()}});
  });
 }
 let updating=false;
 function select(key){
  const row=page.items.find(x=>x.item_key===key);if(!row)return;
  const root=document.getElementById('ilmModalRoot');root.innerHTML=modal(row);
  const overlay=document.getElementById('ilmModal');
  const close=()=>root.innerHTML='';
  overlay.querySelector('#ilmClose').onclick=close;
  overlay.querySelector('[data-ilclose]').onclick=close;
  overlay.querySelectorAll('[data-ilset]').forEach(b=>b.onclick=async()=>{
   if(updating)return;
   const status=b.dataset.ilset;if(status===row.status){close();return}
   updating=true;b.disabled=true;
   document.getElementById('ilmMessage').textContent='Čuvanje…';
   try{
    const saved=await api('/rest/v1/rlc_line_items?id=eq.'+q(row.id),{
     method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status,updated_at:new Date().toISOString()})
    });
    if(!saved?.length)throw Error('Nije potvrđen upis u bazu.');
    row.status=saved[0].status;
    const left=box.scrollLeft,top=box.scrollTop;close();refresh();box.scrollLeft=left;box.scrollTop=top;
   }catch(err){document.getElementById('ilmMessage').textContent=err?.message||String(err);b.disabled=false}
   finally{updating=false}
  });
 }
 refresh();
 document.querySelectorAll('[data-ilzoom]').forEach(b=>b.onclick=()=>zoom(Number(b.dataset.ilzoom)));
 document.getElementById('ilmZoomReset').onclick=()=>{page.zoom=1;zoom(0)};
 if(window.innerWidth<800)box.scrollLeft=Math.round(200*page.zoom);
};
const error=e=>alert('Interaktivna linijska: '+(e?.message||String(e)));
const oldRlc=window.rlc;
if(typeof oldRlc==='function')window.rlc=async function(id){
 await oldRlc(id);
 if(currentProject?.code!=='pp32'||!allowed.has(currentRlc?.code))return;
 const tile=document.querySelector('[data-mod="line"]');
 if(tile){tile.classList.add('il-launch-tile');const caption=tile.querySelector('.sub');if(caption)caption.textContent='Interaktivno · pripremljeno 50%, urađeno 100%';tile.onclick=()=>A.open(id).catch(error)}
 try{
  const rows=await window.PP32InteractiveLine.load(id),p=progress(rows);
  const big=document.querySelector('.wrap > .hero .big');if(big)big.textContent=fmt(p.total)+'%';
  const h=document.querySelector('.wrap > .hero');
  if(h)h.insertAdjacentHTML('beforeend','<span class="il-rlc-progress-explain">Pripremljeno 50%, urađeno 100% · težine 60/40%</span>');
 }catch(err){error(err)}
};
const oldProject=window.project;
if(typeof oldProject==='function')window.project=async function(id){
 await oldProject(id);
 if(currentProject?.code!=='pp32')return;
 const cards=[...document.querySelectorAll('.rlcgrid [data-r]')];
 const matching=cards.filter(card=>allowed.has((card.querySelector('.rg-code')?.textContent||'').replace(/\s/g,'')));
 if(!matching.length)return;
 try{
  const ids=matching.map(card=>card.dataset.r);
  const rows=await api('/rest/v1/rlc_line_items?rlc_id=in.('+ids.join(',')+')&select=rlc_id,item_key,status&limit=500');
  const byRlc=new Map();
  rows.forEach(row=>{if(!byRlc.has(row.rlc_id))byRlc.set(row.rlc_id,[]);byRlc.get(row.rlc_id).push(row)});
  matching.forEach(card=>{
   const values=byRlc.get(card.dataset.r)||[];if(!values.some(x=>x.item_key==='trench'))return;
   const p=progress(values),bar=card.querySelector('.rg-progress i'),text=card.querySelector('.rg-progress-caption b');
   if(bar)bar.style.width=p.total+'%';
   if(text)text.textContent=fmt(p.total)+'%';
   const tag=card.querySelector('.rg-route');
   if(tag&&!tag.querySelector('.il-card-tag'))tag.insertAdjacentHTML('beforeend','<span class="il-card-tag">● Interaktivno</span>');
  });
 }catch(err){error(err)}
};
const oldReport=window.report;
if(typeof oldReport==='function')window.report=async function(){
 await oldReport();
 if(currentProject?.code!=='pp32'||!allowed.has(currentRlc?.code))return;
 try{
  const rows=await window.PP32InteractiveLine.load(currentRlc.id),p=progress(rows);
  const big=document.querySelector('.wrap > .hero .big');if(big)big.textContent=fmt(p.total)+'%';
  const hero=document.querySelector('.wrap > .hero');
  if(hero)hero.insertAdjacentHTML('afterend','<p class="il-report-info">Ukupno po interaktivnoj linijskoj: '+fmt(p.total)+'% (trasa '+fmt(p.excavation)+'/60% + elementi '+fmt(p.other)+'/40%). Zadaci komponenti ispod su posebna evidencija.</p>');
 }catch(err){error(err)}
};
})();