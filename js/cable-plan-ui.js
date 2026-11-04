(function(){
'use strict';
let data=null;
const state={sheet:0,selected:0,query:'',filter:'all',tab:'rov',near:false};
const original=window.corridorHome;
const E=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isPipe=s=>/^\s*\d+\s*x\s*Ø\s*\d+/i.test(s);
const entries=pt=>pt[2].map(([row,id,group])=>({row,text:data.types[id],group,pipe:isPipe(data.types[id])}));
const station=raw=>{
 const m=String(raw).match(/^\s*((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)/);
 if(!m)return String(raw);
 const n=Number(m[1].replace(/,/g,''));
 if(!Number.isFinite(n))return String(raw);
 const k=Math.floor(n/1000),v=n-k*1000,ds=(Math.round(v*100)/100).toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
 const p=ds.split('.');
 return k+'+'+p[0].padStart(3,'0')+(p[1]?'.'+p[1]:'');
};
const stationNumber=raw=>{
 const m=String(raw).match(/^\s*((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)/);
 return m?Number(m[1].replace(/,/g,'')):NaN;
};
const category=t=>t.startsWith('ITU-T')?'optic':t.startsWith('TCEK')?'signal':t.startsWith('PP41')?'power':t.startsWith('AJ-')?'multi':t.startsWith('A-')?'control':'other';
const caption=(num,single,plural)=>num+' '+(num===1?single:plural);
const key=()=>state.sheet+'_'+state.selected;
function readCheck(){try{return JSON.parse(localStorage.getItem('pp32_cable_check_'+key())||'null')}catch(e){return null}}
function getStats(pt){
 const all=entries(pt),cables=all.filter(x=>!x.pipe),pipes=all.filter(x=>x.pipe);
 const groups=[...new Set(all.map(x=>x.group).filter(Boolean))];
 const families=new Set(cables.map(x=>x.text));
 return {all,cables,pipes,groups,families};
}
async function getData(){
 if(data)return data;
 if(!currentProject?.id)throw Error('Projekat nije izabran.');
 const rows=await api('/rest/v1/project_cable_plans?project_id=eq.'+encodeURIComponent(currentProject.id)+'&select=plan_json');
 if(!rows?.length)throw Error('Plan kablova nije dostupan ovom nalogu ili još nije unet.');
 data=rows[0].plan_json;
 if(!data?.sheets?.length)throw Error('Podaci plana nisu ispravno učitani.');
 state.selected=Math.max(0,data.sheets[0][1].reduce((o,p,i,a)=>Math.abs(stationNumber(p[1])-6500)<Math.abs(stationNumber(a[o][1])-6500)?i:o,0));
 return data;
}
window.corridorCablePlan=async function(){
 try{await getData();render()}catch(e){
  shell('<div class="wrap"><button class="back" id="cabBack">← Cvetojevac–Sobovica</button><div class="notice">'+E(e.message)+'</div></div>');
  document.getElementById('cabBack').onclick=corridorHome;
 }
};
window.corridorHome=async function(){
 await original();
 const holder=document.querySelector('.tiles');
 if(!holder||document.getElementById('cableModule'))return;
 const b=document.createElement('div');
 b.className='tile cable-entry-tile';b.id='cableModule';
 b.innerHTML='<div class="ico">◈</div><b>Plan kablova</b><span class="sub">Interaktivni rovovi, kablovi i cevi</span><span class="cable-entry-tag">NOVO · 3 DEONICE</span>';
 holder.appendChild(b);b.onclick=window.corridorCablePlan;
};
function searchItems(){
 const q=state.query.trim().toLowerCase();
 const sources=q?data.sheets.map((_,i)=>i):[state.sheet];
 let matches=[];
 sources.forEach(sheet=>{
  data.sheets[sheet][1].forEach((point,index)=>{
   const st=getStats(point);
   if(state.filter==='pipes'&&!st.pipes.length)return;
   if(state.filter==='marked'&&!st.groups.length)return;
   const name=String(point[0]||'');
   const tokens=name.toLowerCase().match(/[a-z0-9čćžšđ-]+/gi)||[];
   const exact=!!q&&tokens.includes(q);
   const content=(name+' '+point[1]+' '+station(point[1])+' '+st.all.map(x=>x.text).join(' ')).toLowerCase();
   if(!q||exact||content.includes(q))matches.push({sheet,index,exact});
  });
 });
 state.near=false;
 if(q&&matches.some(m=>m.exact))matches=matches.filter(m=>m.exact);
 if(!matches.length&&q&&/^\d+(?:\+\d+(?:[.,]\d+)?)?$/.test(q)){
  const n=q.includes('+')?Number(q.split('+')[0])*1000+Number(q.split('+')[1].replace(',','.')):Number(q);
  data.sheets.forEach((sh,sheet)=>sh[1].forEach((point,index)=>{
   const st=getStats(point);
   if(state.filter==='pipes'&&!st.pipes.length)return;
   if(state.filter==='marked'&&!st.groups.length)return;
   if(Number.isFinite(stationNumber(point[1])))matches.push({sheet,index,exact:false});
  }));
  matches.sort((a,b)=>Math.abs(stationNumber(data.sheets[a.sheet][1][a.index][1])-n)-Math.abs(stationNumber(data.sheets[b.sheet][1][b.index][1])-n));
  matches=matches.slice(0,8);
  state.near=true;
 }
 if(state.filter==='many')matches.sort((a,b)=>getStats(data.sheets[b.sheet][1][b.index]).cables.length-getStats(data.sheets[a.sheet][1][a.index]).cables.length);
 return matches;
}
function pointItems(matches){
 return matches.map(m=>{
  const p=data.sheets[m.sheet][1][m.index],st=getStats(p);
  const active=m.sheet===state.sheet&&m.index===state.selected;
  const done=(()=>{try{return JSON.parse(localStorage.getItem('pp32_cable_check_'+m.sheet+'_'+m.index)||'null')}catch(e){return null}})();
  return '<button class="cb-location '+(active?'is-active':'')+'" data-cb-sheet-ref="'+m.sheet+'" data-cb-point="'+m.index+'">'+
   '<span class="cb-location-top"><strong>'+E(station(p[1]))+'</strong><span class="cb-location-n">'+(done?'● ':'')+st.cables.length+' kabl.</span></span>'+
   '<span class="cb-location-name">'+E(p[0]||'Neimenovana tačka')+'</span>'+
   (state.query.trim()?'<span class="cb-location-segment">'+E(data.sheets[m.sheet][0])+(m.exact?' · Tačno poklapanje':'')+'</span>':'')+
   '<span class="cb-location-footer">'+(st.pipes.length?'<span>◈ '+st.pipes.length+' cev. ozn.</span>':'<span>· Bez lokalne oznake cevi</span>')+(st.groups.length?'<i>CRVENE GRUPE</i>':'')+'</span>'+
   '</button>';
 }).join('');
}
function summary(st){
 return '<div class="cb-overview">' +
 '<div class="cb-summary-item"><span>Kablova u ovom preseku</span><strong>'+st.cables.length+'</strong><small>Svaki popunjeni red = jedna stavka</small></div>'+
 '<div class="cb-summary-item"><span>Različitih tipova</span><strong>'+st.families.size+'</strong><small>Prema oznakama u planu</small></div>'+
 '<div class="cb-summary-item"><span>Cevnih specifikacija</span><strong>'+st.pipes.length+'</strong><small>Upisanih u ovoj koloni</small></div>'+
 '<div class="cb-summary-item"><span>Crvenih grupa</span><strong>'+st.groups.length+'</strong><small>Prepoznatih iz okvira</small></div>'+
 '</div>';
}
function miniCable(c){
 return '<div class="cb-wire cb-'+category(c.text)+'"><span class="cb-wire-dot"></span><span>'+E(c.text)+'</span><small>r.'+(c.row+1)+'</small></div>';
}
function blockHTML(list,label,marked){
 const cables=list.filter(x=>!x.pipe),pipes=list.filter(x=>x.pipe);
 return '<section class="cb-block '+(marked?'cb-block-marked':'cb-block-plain')+'">'+
 '<div class="cb-block-head"><div class="cb-block-heading">'+(marked?'<span class="cb-flag-red">OZNAČENA CEVNA GRUPA</span>':'<span class="cb-flag-muted">OSTATAK ROVA</span>')+
 '<h3>'+E(label)+'</h3></div><span class="cb-block-count">'+cables.length+' kabl. · '+pipes.length+' cev. ozn.</span></div>'+
 (pipes.length?'<div class="cb-pipes">'+pipes.map(p=>'<span class="cb-pipe">◯ '+E(p.text)+'</span>').join('')+'</div>':'')+
 (cables.length?'<div class="cb-wires">'+cables.map(miniCable).join('')+'</div>':'<p class="cb-muted">Ovaj okvir ne sadrži pojedinačno upisan kabl na ovoj stacionaži.</p>')+
 '</section>';
}
function trenchView(st){
 const groups=st.groups.map(n=>({id:n,list:st.all.filter(x=>x.group===n)}));
 const ungrouped=st.all.filter(x=>!x.group);
 return '<div class="cb-legend"><span><i class="cb-legend-red"></i> Crveni isprekidani okvir = grupisani kablovi / cevni paket</span><span><i class="cb-legend-dot"></i> Jedan red = jedan kabl</span></div>'+
 '<div class="cb-trench">'+
  '<div class="cb-earth-line"></div>'+
  '<div class="cb-trench-label"><strong>ROV · SHEMATSKI PRIKAZ</strong><span>Grupisano iz izvorne tabele</span></div>'+
  '<div class="cb-trench-body">'+
  (groups.map((g,i)=>blockHTML(g.list,'Cevna grupa '+(i+1),true)).join(''))+
  (ungrouped.length?blockHTML(ungrouped,'Stavke van izdvojenih okvira',false):'')+
  (!st.all.length?'<div class="cb-empty">Nema upisanih kablova za ovu tačku.</div>':'')+
  '</div></div>'+
 '<p class="cb-data-warning"><b>Važno:</b> Ovo je vizuelno grupisanje po originalnim crvenim okvirima, ne geometrija rova u razmeri. Oznaka npr. 4×Ø110 predstavlja paket od četiri cevi, a ne četiri kabla. Tabela ne raspoređuje nužno svaki pojedinačni kabl po svakoj od četiri cevi.</p>';
}
function typesView(st){
 const counts=new Map();
 st.cables.forEach(c=>{let v=counts.get(c.text);if(!v){v={text:c.text,total:0,rows:[],groups:[]};counts.set(c.text,v)}v.total++;v.rows.push(c.row+1);v.groups.push(c.group)});
 return '<section class="cb-table-card"><div class="cb-table-intro"><h3>Specifikacija kablova</h3><p>Jedan evidentirani red u izvornoj koloni računa se kao jedna stavka kabla.</p></div>'+
 '<div class="cb-table-scroll"><table><thead><tr><th>Tip kabla</th><th>Broj</th><th>Izvorni redovi</th><th>Oznaka grupe</th></tr></thead><tbody>'+
 [...counts.values()].map(v=>'<tr><td><span class="cb-type-dot cb-'+category(v.text)+'"></span><b>'+E(v.text)+'</b></td><td><strong>'+v.total+'</strong></td><td class="cb-rows">'+E(v.rows.join(', '))+'</td><td>'+E([...new Set(v.groups.map(n=>n?'Crvena '+n:'Rov'))].join(' · '))+'</td></tr>').join('')+
 '</tbody></table></div></section>'+
 '<section class="cb-pipe-card"><h3>Cevi upisane na stacionaži</h3>'+(st.pipes.length?st.pipes.map(c=>'<div class="cb-pipe-row"><span>◯ '+E(c.text)+'</span><small>Red '+(c.row+1)+'</small></div>').join(''):'<p class="cb-muted">Nema posebno upisane cevne specifikacije u ovoj koloni. To ne dokazuje da nema cevi u rovu.</p>')+'</section>';
}
function fieldView(st){
 const v=readCheck()||{};
 const confirmed=v.count!==''&&v.count!=null&&Number.isFinite(+v.count);
 const diff=confirmed?Number(v.count)-st.cables.length:null;
 return '<section class="cb-field-head"><div><span>PROBNA TERENSKA PROVERA</span><h3>Uporedi plan i stanje u rovu</h3><p>Ovaj prikaz služi za pregled dizajna. Sačuvana provera ostaje samo na ovom uređaju — još nije zajednički zapis u bazi.</p></div></section>'+
 '<div class="cb-field-layout">'+
 '<div class="cb-field-number cb-field-plan"><small>PLANIRANO PO TABELI</small><strong>'+st.cables.length+'</strong><span>kablova na preseku</span></div>'+
 '<div class="cb-field-number '+(diff===0?'cb-field-match':confirmed?'cb-field-diff':'')+'"><small>ZATEČENO NA TERENU</small><strong>'+(confirmed?E(v.count):'—')+'</strong><span>'+(diff===0?'Poklapa se sa planom':confirmed?(diff>0?'Višak '+diff+' kabl.':'Nedostaje '+Math.abs(diff)+' kabl.'):'Unesi prebrojano')+'</span></div>'+
 '</div>'+
 '<div class="cb-field-form"><label for="cbActual">Broj prebrojanih kablova</label><input id="cbActual" type="number" min="0" step="1" inputmode="numeric" placeholder="npr. '+st.cables.length+'" value="'+E(v.count==null?'':v.count)+'">'+
 '<label for="cbNotes">Napomena sa terena</label><textarea id="cbNotes" rows="3" placeholder="Kablovi, cevi, odstupanje, fotografije za kasniju integraciju...">'+E(v.notes||'')+'</textarea>'+
 '<div class="cb-field-actions"><button class="btn" id="cbSave">Sačuvaj probnu proveru</button><button class="btn sec" id="cbClear">Obriši probni zapis</button></div>'+
 '<small class="cb-muted">Nema izmene izvornog plana, nema slanja u Supabase i nema uticaja na postojeće evidencije.</small></div>';
}
function detail(){
 const pts=data.sheets[state.sheet][1],p=pts[state.selected],st=getStats(p);
 const back=state.selected>0,forward=state.selected<pts.length-1;
 return '<div class="cb-detail">'+
 '<div class="cb-detail-top"><div class="cb-detail-id"><span>REFERENTNI PRESEK · '+String(state.selected+1).padStart(3,'0')+'</span><h2>km '+E(station(p[1]))+'</h2><p>'+E(p[0]||'Bez naziva elementa')+'</p><small>Originalna stacionaža: '+E(p[1])+' · izvor: '+E(data.sheets[state.sheet][0])+'</small></div>'+
 '<div class="cb-stepper"><button data-cb-step="-1" '+(!back?'disabled':'')+' aria-label="Prethodna tačka">←</button><button data-cb-step="1" '+(!forward?'disabled':'')+' aria-label="Sledeća tačka">→</button></div></div>'+
 summary(st)+
 '<div class="cb-view-tabs"><button data-cb-tab="rov" class="'+(state.tab==='rov'?'on':'')+'">◈ Prikaz rova</button><button data-cb-tab="tipovi" class="'+(state.tab==='tipovi'?'on':'')+'">▤ Tipovi kablova</button><button data-cb-tab="provera" class="'+(state.tab==='provera'?'on':'')+'">✓ Terenska provera</button></div>'+
 '<div class="cb-view-content">'+(state.tab==='rov'?trenchView(st):state.tab==='tipovi'?typesView(st):fieldView(st))+'</div>'+
 '</div>';
}
function render(){
 const total=data.sheets.reduce((s,x)=>s+x[1].length,0);
 const cableRows=data.sheets.reduce((s,x)=>s+x[1].reduce((y,p)=>y+getStats(p).cables.length,0),0);
 const tubeSpecs=data.sheets.reduce((s,x)=>s+x[1].reduce((y,p)=>y+getStats(p).pipes.length,0),0);
 const list=searchItems();
 let h='<div class="wrap cb-app"><button class="back cb-back" id="cbBack">← Cvetojevac–Sobovica</button>'+
 '<header class="cb-hero"><div class="cb-hero-main"><div class="cb-eyebrow"><i></i> KABLOVSKA EVIDENCIJA / PILOT VERZIJA</div><h1>Plan kablova<span>.</span></h1><p>Od projektne šeme do kontrole na terenu. Jedan pogled na svaki rov, kabl i označenu cevnu grupu.</p><div class="cb-hero-tags"><span>◈ 3 deonice</span><span>↔ Izvorna Excel tabela</span><span>▧ Čitljivo na telefonu</span></div></div><div class="cb-hero-art"><div class="cb-art-title">KABLOVSKI PRESEK</div><div class="cb-art-line one"></div><div class="cb-art-line two"></div><div class="cb-art-line three"></div><div class="cb-art-node a"></div><div class="cb-art-node b"></div><div class="cb-art-node c"></div><span>R · C · S</span></div></header>'+
 '<div class="cb-overall"><div><strong>'+total+'</strong><span>Referentnih tačaka</span></div><div><strong>'+cableRows.toLocaleString('sr-RS')+'</strong><span>Kablovskih stavki po tačkama</span></div><div><strong>'+tubeSpecs+'</strong><span>Upisanih cevnih oznaka</span></div></div>'+
 '<div class="cb-segment-head"><div><small>01 / ODABERITE DEONICU</small><h2>Kablovski koridori</h2></div><span>Preuzeto iz sva tri lista izvorne tabele</span></div>'+
 '<div class="cb-segment-tabs">'+data.sheets.map((s,i)=>'<button data-cb-sheet="'+i+'" class="'+(i===state.sheet?'active':'')+'"><span>0'+(i+1)+'</span><strong>'+E(s[0])+'</strong><small>'+s[1].length+' referentnih tačaka</small></button>').join('')+'</div>'+
 '<div class="cb-explore-head"><div><small>02 / ISTRAŽITE PLAN</small><h2>Pregled po stacionažama</h2></div></div>'+
 '<div class="cb-toolbar"><div class="cb-search-wrap"><span>⌕</span><input id="cbQuery" autocomplete="off" placeholder="Traži element ST2, KO-101, km 6+500 ili tip kabla..." value="'+E(state.query)+'"></div><select id="cbFilter"><option value="all" '+(state.filter==='all'?'selected':'')+'>Sve tačke</option><option value="pipes" '+(state.filter==='pipes'?'selected':'')+'>Sa cevnim oznakama</option><option value="marked" '+(state.filter==='marked'?'selected':'')+'>Sa crvenim grupama</option><option value="many" '+(state.filter==='many'?'selected':'')+'>Najviše kablova prvo</option></select></div>'+
 '<div class="cb-workspace"><aside class="cb-sidebar"><div class="cb-sidebar-title"><b id="cbListTitle">'+(state.query.trim()?'REZULTATI · SVE DEONICE':'STACIONAŽE')+'</b><span id="cbCounter">'+list.length+' / '+(state.query.trim()?total:data.sheets[state.sheet][1].length)+'</span></div><div id="cbLocationList" class="cb-list">'+(state.near?'<div class="cb-nearest">Nema tačnog pogotka — najbliže stacionaže</div>':'')+pointItems(list)+'</div></aside>'+
 detail()+'</div><footer class="cb-footer"><b>PLAN KABLOVA / RADNA VERZIJA</b><span>Podaci su očitani iz priložene Excel tabele. Crvene grupe su rekonstrukcija isprekidanih okvira; fizičko stanje mora se proveriti na terenu. Izvorni podaci nisu menjani.</span></footer></div>';
 shell(h);
 document.getElementById('cbBack').onclick=corridorHome;
 document.querySelectorAll('[data-cb-sheet]').forEach(b=>b.onclick=()=>{state.sheet=+b.dataset.cbSheet;state.selected=0;state.query='';state.tab='rov';render()});
 document.getElementById('cbQuery').oninput=e=>{state.query=e.target.value;updateList()};
 document.getElementById('cbFilter').onchange=e=>{state.filter=e.target.value;updateList()};
 bindDetail();
 bindPoints();
 const active=document.querySelector('.cb-location.is-active');if(active)active.scrollIntoView({block:'nearest'});
}
function updateList(){
 const list=searchItems(),el=document.getElementById('cbLocationList');
 el.innerHTML=(state.near?'<div class="cb-nearest">Nema tačnog pogotka — najbliže stacionaže</div>':'')+(list.length?pointItems(list):'<div class="cb-no-results">Nema rezultata. Pokušaj naziv elementa, tip kabla ili stacionažu.</div>');
 document.getElementById('cbCounter').textContent=list.length+' / '+(state.query.trim()?data.sheets.reduce((n,s)=>n+s[1].length,0):data.sheets[state.sheet][1].length);
 document.getElementById('cbListTitle').textContent=state.query.trim()?'REZULTATI · SVE DEONICE':'STACIONAŽE';
 bindPoints();
}
function bindPoints(){
 document.querySelectorAll('[data-cb-point]').forEach(b=>b.onclick=()=>{state.sheet=+b.dataset.cbSheetRef;state.selected=+b.dataset.cbPoint;state.tab='rov';render()});
}
function bindDetail(){
 document.querySelectorAll('[data-cb-step]').forEach(b=>b.onclick=()=>{state.selected=Math.max(0,Math.min(data.sheets[state.sheet][1].length-1,state.selected+Number(b.dataset.cbStep)));render()});
 document.querySelectorAll('[data-cb-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.cbTab;render()});
 const save=document.getElementById('cbSave');
 if(save)save.onclick=()=>{
  const val=document.getElementById('cbActual').value.trim();
  if(!/^\d+$/.test(val))return alert('Unesi ceo broj prebrojanih kablova.');
  try{localStorage.setItem('pp32_cable_check_'+key(),JSON.stringify({count:Number(val),notes:document.getElementById('cbNotes').value,at:new Date().toISOString()}));render()}catch(e){alert('Nije moguće lokalno sačuvati: '+e.message)}
 };
 const clear=document.getElementById('cbClear');
 if(clear)clear.onclick=()=>{localStorage.removeItem('pp32_cable_check_'+key());render()};
}
})();