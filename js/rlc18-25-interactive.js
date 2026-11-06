/* PP32 · Interactive cable-plan schematics RLC18–25.
   Source data: project cable-plan PDFs, mapped in rlc18-25-sites.js.
   SVG is a clear illustrative scheme, NOT a geodetic or CAD-accurate drawing.
   Status rows live in Supabase. "Pripremljeno" contributes 50% of each stage.
*/
(function(){
'use strict';
const M=window.PP32NewLineSites||{};
const N=window.PP32NewLines={};
const E=x=>esc(x==null?'':String(x));
const q=x=>encodeURIComponent(String(x));
const fmt=x=>new Intl.NumberFormat('sr-RS',{maximumFractionDigits:1}).format(x);
const statusName={not_started:'Bez statusa',prepared:'Pripremljen',done:'Urađen'};
const symbols={sensor:'◇',signal:'◉',barrier:'╞',cabinet:'▣',trench:'↝'};
const weight=x=>x==='done'?1:x==='prepared'?.5:0;
const state=x=>'il-'+(x==='done'?'done':x==='prepared'?'prepared':'unmarked');
function progress(rows){
 const trench=rows.find(x=>x.item_key==='trench');
 const others=rows.filter(x=>x.item_key!=='trench');
 const t=trench?60*weight(trench.status):0;
 const rest=others.length?40*others.reduce((n,x)=>n+weight(x.status),0)/others.length:0;
 return {total:Math.round((t+rest)*10)/10,trench:Math.round(t*10)/10,rest:Math.round(rest*10)/10,
  prepared:rows.filter(x=>x.status==='prepared').length,done:rows.filter(x=>x.status==='done').length,
  count:rows.length};
}
N.progress=progress;
const coord=(row,rows)=>{
 const group=rows.filter(x=>x.item_type===row.item_type);
 const i=group.findIndex(x=>x.id===row.id),n=group.length;
 if(row.item_type==='sensor')return [130+(i+1)*1000/(n+1),160,'above'];
 if(row.item_type==='signal'){
  if(/^KS|^PKS/.test(row.label)){const k=rows.filter(x=>x.item_type==='signal'&&/^KS|^PKS/.test(x.label));
   return [210+k.findIndex(x=>x.id===row.id)*280,270,'below'];}
  const signals=rows.filter(x=>x.item_type==='signal'&&/^PS/.test(x.label));
  const t=signals.findIndex(x=>x.id===row.id);
  return [[515,725,485,755][t]||790,t<2?345:460,'above'];
 }
 if(row.item_type==='barrier')return [[560,680,550,700][i]||700,i<2?305:455,'below'];
 if(row.item_type==='cabinet')return [870+i*120,410+i*67,'above'];
 return [625,205,'above'];
};
function map(rows,site){
 const markers=rows.filter(x=>x.item_key!=='trench').map(row=>{
  const [x,y,side]=coord(row,rows),status=statusName[row.status]||'Bez statusa';
  let geom='';
  if(row.item_type==='sensor')geom='<path d="M'+x+' '+(y-13)+'l13 13-13 13-13-13Z"/>';
  else if(row.item_type==='signal')geom='<path d="M'+x+' '+(y-15)+'v31"/><circle cx="'+x+'" cy="'+(y-7)+'" r="10"/>';
  else if(row.item_type==='barrier')geom='<rect x="'+(x-12)+'" y="'+(y-12)+'" width="24" height="24" rx="4"/><path d="M'+(x-8)+' '+(y+4)+'l38-28"/>';
  else geom='<rect x="'+(x-17)+'" y="'+(y-19)+'" width="34" height="38" rx="4"/><path d="M'+(x-9)+' '+(y-8)+'h18 M'+(x-9)+' '+y+'h18 M'+(x-9)+' '+(y+8)+'h18"/>';
  return '<g class="il-spot '+state(row.status)+' r18-hit" role="button" tabindex="0" focusable="true"'+
    ' data-r18="'+E(row.item_key)+'" aria-label="'+E(row.label+': '+status)+'">'+
    '<circle class="il-hotspot" cx="'+x+'" cy="'+y+'" r="31"/>'+
    '<g class="r18-marker">'+geom+'</g>'+
    '<text class="r18-marker-name" x="'+x+'" y="'+(y+(side==='above'?-31:43))+'" text-anchor="middle">'+E(row.label)+'</text></g>';
 }).join('');
 const prepared=rows.find(x=>x.item_key==='trench');
 return '<svg class="il-svg r18-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 660" role="img" aria-label="Ilustrativna linijska šema '+E(site.code)+', '+E(site.name)+'">'+
 '<defs><pattern id="r18sleepers" width="23" height="16" patternUnits="userSpaceOnUse"><path d="M7 0v16" stroke="#aac0cb" stroke-width="6"/></pattern></defs>'+
 '<rect width="1240" height="660" fill="#f7fbfd"/>'+
 '<rect x="575" y="65" width="104" height="530" rx="8" fill="#dce7ea"/><path d="M628 69v520" stroke="#fff" stroke-width="4" stroke-dasharray="30 21"/>'+
 '<rect x="52" y="137" width="1135" height="42" rx="3" fill="url(#r18sleepers)"/>'+
 '<path d="M52 144H1187 M52 173H1187" stroke="#668b9a" stroke-width="4"/>'+
 '<text x="57" y="115" class="il-side-label">'+E(site.line)+'</text>'+
 '<text x="1180" y="115" text-anchor="end" class="il-side-label">km '+E(site.km)+'</text>'+
 '<g class="r18-cable '+state(prepared?.status||'not_started')+' r18-hit" data-r18="trench" role="button" tabindex="0">'+
 '<path d="M82 212H1170" stroke-width="12" stroke-dasharray="21 8" stroke-linecap="round"/>'+
 '<text x="95" y="239" class="r18-cable-label">ROV I KABLOVI · 60% PONDERISANOG NAPRETKA</text></g>'+
 markers+
 '<text x="68" y="634" class="il-map-note">PRIKAZ OPREME PREMA DOSTAVLJENOM PROJEKTNOM PDF-U · POLOŽAJI SU ILUSTRATIVNI</text>'+
 '<text x="1181" y="634" text-anchor="end" class="il-map-note">'+E(site.code)+' / EVIDENCIJA 2026</text>'+
 '</svg>';
}
function stages(rows){
 const p=progress(rows);
 return '<section class="il-progress-panel"><div class="il-progress-summary"><div><span>UKUPNA REALIZACIJA · '+E(N.page.site.code)+'</span><strong>'+fmt(p.total)+'%</strong></div>'+
 '<div class="il-progress-description">Svaki pripremljeni element računa se 50%, urađeni 100%. Trasa 60% · ostali uređaji 40%.</div></div>'+
 '<div class="il-progress-bar"><span style="width:'+p.total+'%"></span></div>'+
 '<div class="il-progress-parts"><div><span>ROV I KABLOVI · 60%</span><b>'+fmt(p.trench)+' / 60%</b></div>'+
 '<div><span>OSTALI ELEMENTI · 40%</span><b>'+fmt(p.rest)+' / 40%</b><small>'+p.prepared+' pripremljeno · '+p.done+' urađeno</small></div></div></section>';
}
function listing(rows){
 return '<div class="il-list-header"><div><span>PREGLED POZICIJA</span><h2>Uređaji i radovi</h2></div><small>'+rows.length+' pozicija</small></div>'+
 '<div class="il-list-items">'+rows.map(x=>'<button class="il-list-item '+state(x.status)+'" type="button" data-r18="'+E(x.item_key)+'">'+
 '<span class="il-list-symbol">'+(symbols[x.item_type]||'○')+'</span>'+
 '<span class="il-list-copy"><strong>'+E(x.label)+'</strong><small>'+E(x.item_type==='trench'?'Rov i kablovi – 60%':x.detail||'')+'</small></span>'+
 '<span class="il-list-status">'+statusName[x.status]+'</span></button>').join('')+'</div>';
}
function dialog(row){
 return '<div class="il-dialog" id="r18Modal"><div class="il-dialog-scrim" data-r18close></div>'+
 '<section class="il-dialog-pane" role="dialog" aria-modal="true" aria-labelledby="r18ModalName">'+
 '<div class="il-dialog-top"><span>STATUS ELEMENTA</span><button type="button" id="r18Close">×</button></div>'+
 '<h2 id="r18ModalName">'+E(row.label)+'</h2><p>'+E(row.detail||'Projektna pozicija')+'</p>'+
 '<div class="il-current-status">Trenutno: <b class="'+state(row.status)+'">'+statusName[row.status]+'</b></div>'+
 (canEdit()?'<div class="il-status-actions"><button type="button" class="il-set il-set-prepared" data-r18set="prepared">◷ Pripremljen · 50%</button>'+
 '<button type="button" class="il-set il-set-done" data-r18set="done">✓ Urađen · 100%</button></div>'+
 '<button type="button" class="il-reset" data-r18set="not_started">Bez statusa · 0%</button>':
 '<p class="il-viewer-tip">Za promenu statusa potreban je aktivan nalog sa pravom izmene.</p>')+
 '<p role="status" id="r18Message"></p></section></div>';
}
N.open=async function(rlcId){
 const [rr,items]=await Promise.all([
  api('/rest/v1/rlcs?id=eq.'+q(rlcId)+'&select=*'),
  api('/rest/v1/rlc_line_items?rlc_id=eq.'+q(rlcId)+'&select=*&order=sort_order.asc&limit=250')
 ]);
 const rlc=rr[0];if(!rlc||!M[rlc.code])throw Error('Projektna šema nije spremna za izabrani RLC.');
 if(!items.some(x=>x.item_key==='trench'))throw Error('Nedostaju stavke interaktivne linijske situacije.');
 N.page={id:rlcId,rlc,site:M[rlc.code],items,zoom:window.innerWidth<800?.86:1};
 N.render();
};
N.render=function(){
 const p=N.page;if(!p)return;
 const site=p.site,prog=progress(p.items);
 shell('<main class="wrap il-page r18-page">'+
 '<div class="il-top"><button id="r18Back" class="il-back" type="button">← '+E(site.code)+' · Moduli</button>'+
 '<span class="il-pilot-badge"><i></i> INTERAKTIVNA · '+E(site.code)+'</span></div>'+
 '<header class="il-hero"><div><div class="il-overline">PP32 · EVIDENCIJA RADOVA PREMA PROJEKTNOM PDF-U</div>'+
 '<h1>'+E(site.name)+' <span>· '+E(site.code)+'</span></h1>'+
 '<p>km '+E(site.km)+' · '+E(site.line)+'</p></div>'+
 '<div class="il-hero-progress"><strong>'+fmt(prog.total)+'%</strong><span>UKUPAN NAPREDAK</span></div></header>'+
 '<section class="pp32-pdf-strip"><div class="pp32-pdf-strip-copy"><b>Originalni projektni crtež</b>'+
 '<span>Izvorni PDF sa položajem uređaja i specifikacijom kablova · referentna podloga</span></div>'+
 window.PP32OriginalPDF.controls(p.rlc)+'</section>'+
 stages(p.items)+
 '<div class="il-workbench"><div class="il-diagram-panel">'+
 '<div class="il-diagram-toolbar"><div><b>Interaktivna linijska · '+E(site.tag)+'</b>'+
 '<p>Ilustrativni raspored. Precizne položaje i kilometraže čitaj iz originalnog PDF-a.</p></div>'+
 '<div class="il-diagram-controls"><button type="button" data-r18zoom="-0.2">−</button><span id="r18ZoomText">'+Math.round(p.zoom*100)+'%</span>'+
 '<button type="button" data-r18zoom="0.2">＋</button><button id="r18ZoomFit" type="button">100%</button></div></div>'+
 '<div class="il-legend"><span><i class="il-legend-neutral"></i> Bez statusa</span>'+
 '<span><i class="il-legend-prepared"></i> Pripremljen 50%</span><span><i class="il-legend-done"></i> Urađen 100%</span></div>'+
 '<div id="r18Map" class="il-svg-scroll"></div><div class="il-diagram-foot"><span>'+E(site.tag)+' · km '+E(site.km)+'</span>'+
 '<span>Šematski prikaz, nije CAD niti geodetska razmera</span></div></div>'+
 '<aside class="il-sidebar" id="r18List"></aside></div>'+
 '<section class="il-method"><b>PROJEKTNA SPECIFIKACIJA KABLOVA</b>'+
 '<p>Preuzeti su tip, konstrukcija, projektna dužina L (m) i broj kablova iz tabele dostavljenog PDF-a. '+
 'Kolona L i kolona broj ne množe se međusobno. Neusklađenosti treba proveriti na izvornom crtežu.</p>'+
 '<div class="r18-cable-table"><table><thead><tr><th>Tip kabla</th><th>Konstrukcija</th><th>L (m)</th><th>Br.</th></tr></thead>'+
 site.cables.map(([type,len,count])=>'<tr><td>'+E(/^(4x6mm2|3x1.5mm2)$/.test(type)?'PP41':/^(14x1x0.9|40x1x0.9)$/.test(type)?'A-2Y2YB2Y':'A-2Y(L)2YB2Y')+'</td>'+
 '<td>'+E(type)+'</td><td>'+fmt(len)+'</td><td>'+Number(count)+'</td></tr>').join('')+'</table></div>'+
 (site.notes?'<p class="il-caution">'+E(site.notes)+'</p>':'')+'</section>'+
 '<div id="r18ModalRoot"></div></main>');
 document.getElementById('r18Back').onclick=()=>window.rlc(p.id).catch(e=>alert(e.message));
 window.PP32OriginalPDF.attach(p.rlc,()=>N.open(p.id));
 const board=document.getElementById('r18Map'),label=document.getElementById('r18ZoomText');
 function zoom(delta){
  p.zoom=Math.min(1.7,Math.max(.6,Math.round((p.zoom+delta)*100)/100));
  const svg=board.querySelector('svg');
  if(svg){svg.style.width=Math.round(1240*p.zoom)+'px';svg.style.height=Math.round(660*p.zoom)+'px'}
  label.textContent=Math.round(p.zoom*100)+'%';
 }
 function rerender(){
  const left=board.scrollLeft,top=board.scrollTop;
  board.innerHTML=map(p.items,site);
  document.getElementById('r18List').innerHTML=listing(p.items);
  zoom(0);board.scrollLeft=left;board.scrollTop=top;
  document.querySelectorAll('[data-r18]').forEach(node=>{
   node.onclick=()=>activate(node.dataset.r18);
   if(node.matches('g'))node.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();activate(node.dataset.r18)}
   });
  });
 }
 function activate(key){
  const row=p.items.find(x=>x.item_key===key);if(!row)return;
  const root=document.getElementById('r18ModalRoot');root.innerHTML=dialog(row);
  const clear=()=>root.innerHTML='';
  document.getElementById('r18Close').onclick=clear;
  root.querySelector('[data-r18close]').onclick=clear;
  root.querySelectorAll('[data-r18set]').forEach(btn=>btn.onclick=async()=>{
   btn.disabled=true;const message=document.getElementById('r18Message');message.textContent='Čuvanje…';
   try{
    const response=await api('/rest/v1/rpc/set_rlc_device_status',{method:'POST',
     body:JSON.stringify({p_item:row.id,p_status:btn.dataset.r18set})});
    if(!response||!response.line_items)throw Error('Upis nije potvrđen.');
    row.status=btn.dataset.r18set;clear();
    // Recalculate and redraw without losing list/map selection.
    const previousZoom=p.zoom;N.render();p.zoom=previousZoom;
   }catch(error){message.textContent='Greška: '+(error?.message||String(error));btn.disabled=false}
  });
 }
 rerender();
 document.querySelectorAll('[data-r18zoom]').forEach(btn=>btn.onclick=()=>zoom(Number(btn.dataset.r18zoom)));
 document.getElementById('r18ZoomFit').onclick=()=>{p.zoom=1;zoom(0)};
 if(window.innerWidth<800)board.scrollLeft=Math.round(180*p.zoom);
};
const oldRlc=window.rlc;
if(typeof oldRlc==='function')window.rlc=async function(id){
 await oldRlc(id);
 if(currentProject?.code!=='pp32'||!M[currentRlc?.code])return;
 const tile=document.querySelector('[data-mod="line"]');
 if(tile){
  tile.classList.add('il-launch-tile');
  const caption=tile.querySelector('.sub');if(caption)caption.textContent='Interaktivna · pripremljeno 50%, urađeno 100%';
  tile.onclick=()=>N.open(id).catch(error=>alert(error?.message||String(error)));
 }
 try{
  const rows=await api('/rest/v1/rlc_line_items?rlc_id=eq.'+q(id)+'&select=*&limit=250');
  const pct=progress(rows);
  const big=document.querySelector('.wrap > .hero .big');if(big)big.textContent=fmt(pct.total)+'%';
 }catch(e){console.warn(e)}
};
const oldProject=window.project;
if(typeof oldProject==='function')window.project=async function(id){
 await oldProject(id);
 if(currentProject?.code!=='pp32')return;
 const cards=[...document.querySelectorAll('.rlcgrid [data-r]')].filter(c=>{
  const code=c.querySelector('.rg-code')?.textContent?.replace(/\s/g,'');
  return !!M[code];
 });
 if(!cards.length)return;
 try{
  const ids=cards.map(c=>c.dataset.r);
  const rows=await api('/rest/v1/rlc_line_items?rlc_id=in.('+ids.join(',')+')&select=rlc_id,item_key,status&limit=500');
  const grouped=new Map();
  rows.forEach(row=>{if(!grouped.has(row.rlc_id))grouped.set(row.rlc_id,[]);grouped.get(row.rlc_id).push(row)});
  cards.forEach(card=>{
   const list=grouped.get(card.dataset.r)||[],p=progress(list);
   const bar=card.querySelector('.rg-progress i'),text=card.querySelector('.rg-progress-caption b');
   if(bar)bar.style.width=p.total+'%';
   if(text)text.textContent=fmt(p.total)+'%';
   const tag=card.querySelector('.rg-route');
   if(tag&&!tag.querySelector('.il-card-tag'))tag.insertAdjacentHTML('beforeend','<span class="il-card-tag">● Interaktivno</span>');
  });
 }catch(e){console.warn(e)}
};
})();