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
/* Exact relative geometry comes from the supplied PDF drawing page,
 * not evenly spaced symbols or an invented route. Label coordinates are
 * source PDF text centers; coloured cable line segments were also measured.
 */
function sourcePoint(row,layout){
 if(row.item_key==='cabinet-energetski-orman')
  return [(layout.g[0]+layout.g[2])/2,layout.g[1]+110];
 if(row.item_key==='cabinet-bk')return layout.p.BK;
 if(row.item_key==='cabinet-lob')return layout.p.LOB;
 const code=row.item_type==='sensor'?row.label.replace(/-(?:PB[A-Z]-\d+).*$/i,'').replace(/^K2-12$/i,'K2/12'):row.label;
 return layout.p[code]||null;
}
function map(rows,site){
 const layout=window.PP32SourceLayout?.[site.code];
 if(!layout)throw Error('Za '+site.code+' nisu učitane koordinate izvornog projekta.');
 const [bx0,by0,bx1,by1]=layout.b;
 const [gx0,gy0,gx1,gy1]=layout.g;
 const mid=(bx0+bx1)/2;
 const trench=rows.find(x=>x.item_key==='trench');
 const trenchStatus=trench?.status||'not_started';
 const path=segments=>segments.map(([x1,y1,x2,y2])=>'M'+x1+' '+y1+'L'+x2+' '+y2).join(' ');
 const cableD=path(layout.l),powerD=path(layout.e);
 const statusBadge=row=>row.status==='done'?'100%':row.status==='prepared'?'50%':'';
 const markers=rows.filter(x=>x.item_key!=='trench').map(row=>{
  const p=sourcePoint(row,layout);
  if(!p)return ''; // No fictitious coordinate when the PDF has no label.
  const [x,y]=p,left=x<mid,code=row.item_type;
  const status=statusName[row.status]||'Bez statusa';
  const label=E(row.label);
  const klass='il-spot r18-hit r18-device '+state(row.status);
  let shape='',name='',hint='';
  if(row.item_key==='cabinet-bk'){
   shape='<rect class="r18-source-icon" x="'+(x-12)+'" y="'+(y-17)+'" width="24" height="24" rx="3"/>';
   name='<text class="r18-source-name" x="'+x+'" y="'+(y+27)+'" text-anchor="middle">BK</text>';
  }else if(row.item_key==='cabinet-energetski-orman'){
   shape='<rect class="r18-energy-icon" x="'+(x-12)+'" y="'+(y-12)+'" width="24" height="24" rx="2"/>';
   name='<text class="r18-source-name" x="'+x+'" y="'+(y+33)+'" text-anchor="middle">NAPAJANJE</text>';
  }else if(code==='cabinet'){
   shape='<rect class="r18-lob-icon" x="'+(x-16)+'" y="'+(y-12)+'" width="32" height="24" rx="2"/>';
   name='<text class="r18-source-name" x="'+x+'" y="'+(y+28)+'" text-anchor="middle">'+label+'</text>';
  }else if(code==='sensor'){
   const sx=x+(left?42:-42),sy=y-6;
   shape='<path class="r18-sensor-icon" d="M'+sx+' '+(sy-8)+'l8 8-8 8-8-8Z"/><circle class="r18-sensor-core" cx="'+sx+'" cy="'+sy+'" r="2.7"/>';
   name='<text class="r18-source-name" x="'+x+'" y="'+(y+14)+'" text-anchor="middle">'+label+'</text>';
  }else if(code==='barrier'){
   const sx=x+(left?22:-22),arm=left?sx-155:sx+155;
   shape='<rect class="r18-barrier-case" x="'+(sx-9)+'" y="'+(y-8)+'" width="18" height="16" rx="2"/>'+
    '<path class="r18-barrier-arm" d="M'+sx+' '+(y-1)+'H'+arm+'"/>'+
    '<path class="r18-barrier-rail" d="M'+sx+' '+(y-1)+'H'+arm+'"/>';
   name='<text class="r18-source-name" x="'+x+'" y="'+(y+19)+'" text-anchor="middle">'+label+'</text>';
  }else if(code==='signal'){
   const isRoad=/^PS/.test(row.label);
   const sx=x+(left?23:-23),sy=y-11;
   shape='<path class="r18-signal-pole" d="M'+sx+' '+(sy-14)+'v27"/><rect class="r18-signal-case" x="'+(sx-4)+'" y="'+(sy-16)+'" width="8" height="13" rx="2"/>'+
    '<circle class="r18-signal-lamp" cx="'+sx+'" cy="'+(sy-12)+'" r="1.7"/>'+
    (isRoad?'<path class="r18-signal-foot" d="M'+(sx-6)+' '+(sy+13)+'h12"/>':'');
   name='<text class="r18-source-name" x="'+x+'" y="'+(y+17)+'" text-anchor="middle">'+label+'</text>';
  }
  const badge=statusBadge(row);
  if(badge){
   const ax=x+(left?-18:18),ay=y-26;
   hint='<g class="r18-source-progress"><rect x="'+(ax-19)+'" y="'+(ay-12)+'" width="38" height="20" rx="9"/>'+
    '<text x="'+ax+'" y="'+(ay+2)+'" text-anchor="middle">'+badge+'</text></g>';
  }
  return '<g class="'+klass+'" role="button" tabindex="0" focusable="true" data-r18="'+E(row.item_key)+'" aria-label="'+E(row.label+': '+status)+'">'+
   '<title>'+E(row.label+' · '+status)+'</title>'+
   '<rect x="'+(x-43)+'" y="'+(y-33)+'" width="86" height="65" class="r18-target"/>'+
   '<circle class="r18-status-ring" cx="'+(x+(left?-14:14))+'" cy="'+(y-13)+'" r="8"/>'+
   shape+name+hint+'</g>';
 }).join('');
 const os=Object.entries(layout.o).map(([name,position])=>{
  const [x,y]=position,left=x<mid;
  return '<g class="r18-os"><circle cx="'+x+'" cy="'+y+'" r="7"/>'+
   '<text x="'+(x+(left?-14:14))+'" y="'+(y+4)+'" text-anchor="'+(left?'end':'start')+'">'+E(name)+'</text></g>';
 }).join('');
 const power='<g class="r18-source-power"><path d="'+powerD+'"/>'+
  '<rect x="'+gx0+'" y="'+gy0+'" width="'+(gx1-gx0)+'" height="'+(gy1-gy0)+'"/>'+
  '<text transform="translate('+((gx0+gx1)/2)+' '+((gy0+gy1)/2)+') rotate(-90)" text-anchor="middle">Energetski orman</text>'+
  os+'</g>';
 const cable='<g class="r18-source-cables r18-hit '+state(trenchStatus)+'" data-r18="trench" role="button" tabindex="0">'+
  '<title>Rov i polaganje kablova · '+E(statusName[trenchStatus]||'Bez statusa')+'</title>'+
  '<path class="r18-source-lines" d="'+cableD+'"/>'+
  '<path class="r18-source-line-hits" d="'+cableD+'"/>'+
  '</g>';
 const boxes='<rect class="r18-source-bk" x="'+bx0+'" y="'+by0+'" width="'+(bx1-bx0)+'" height="'+(by1-by0)+'"/>'+
 '<text class="r18-central-km" x="'+mid+'" y="'+(by0+38)+'" text-anchor="middle">'+E(site.km)+'</text>'+
 '<text class="r18-central-label" transform="translate('+mid+' '+((by0+by1)/2)+') rotate(-90)" text-anchor="middle">BK '+E(site.tag)+'</text>';
 return '<svg class="il-svg r18-svg r18-source-svg" xmlns="http://www.w3.org/2000/svg" viewBox="255 176 1120 692" role="img" aria-label="Linijska šema '+E(site.code)+'; uređaji i grane kablova na pozicijama iz projektnog PDF-a">'+
  '<rect x="255" y="176" width="1120" height="692" fill="#fff"/>'+
  boxes+cable+power+markers+
  '<text class="r18-map-footer" x="272" y="848">POLOŽAJI OPREME I GRANANJE KABLOVA PREMA ORIGINALNOM PROJEKTNOM CRTEŽU · PDF KOORDINATE</text>'+
  '<text class="r18-map-footer" x="1360" y="848" text-anchor="end">'+E(site.code)+'</text></svg>';
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