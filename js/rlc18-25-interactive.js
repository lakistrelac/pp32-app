/* PP32 · Interactive cable-plan schematics RLC18–25.
   Source data: project cable-plan PDFs, mapped in rlc18-25-sites.js.
   Classic SVG layout follows the source project device sequence.
   It does not constitute a geodetic drawing or original DWG file.
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
/* Classic RLC2-9 presentation; the source-based relative order is retained. */
function map(rows,site){
 return window.PP32ClassicMap.draw(rows,site);
}
N.map=map; // Read-only SVG renderer, also used by automated layout checks.
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
 '<p>Pregledna šema po principu RLC 2–9; redosled opreme je prema projektu, a razmaci su šematski.</p></div>'+
 '<div class="il-diagram-controls"><button type="button" data-r18zoom="-0.2">−</button><span id="r18ZoomText">'+Math.round(p.zoom*100)+'%</span>'+
 '<button type="button" data-r18zoom="0.2">＋</button><button id="r18ZoomFit" type="button">100%</button></div></div>'+
 '<div class="il-legend"><span><i class="il-legend-neutral"></i> Bez statusa</span>'+
 '<span><i class="il-legend-prepared"></i> Pripremljen 50%</span><span><i class="il-legend-done"></i> Urađen 100%</span></div>'+
 '<div id="r18Map" class="il-svg-scroll"></div><div class="il-diagram-foot"><span>'+E(site.tag)+' · km '+E(site.km)+'</span>'+
 '<span>Redosled opreme po projektu · nije DWG razmera</span></div></div>'+
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
  if(svg){svg.style.width=Math.round(1240*p.zoom)+'px';svg.style.height=Math.round(770*p.zoom)+'px'}
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
    row.status=btn.dataset.r18set;
    const oldBoard=document.getElementById('r18Map');
    const oldLeft=oldBoard?.scrollLeft||0,oldTop=oldBoard?.scrollTop||0;
    clear();N.render();
    const newBoard=document.getElementById('r18Map');
    if(newBoard){newBoard.scrollLeft=oldLeft;newBoard.scrollTop=oldTop}
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