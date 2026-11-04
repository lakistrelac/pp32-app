/* PP32 – cable specifications, editable per RLC and live combined bill of quantities.
 * Free-plan only: browser UI + existing Supabase/PostgREST tables.
 */
(function(){
'use strict';
const C=window.PP32Cables={};
const E=s=>typeof esc==='function'?esc(s):String(s??'');
const q=s=>encodeURIComponent(String(s));
const fmt=n=>new Intl.NumberFormat('sr-RS',{maximumFractionDigits:2}).format(Number(n)||0);
const total=(a,key)=>a.reduce((sum,x)=>sum+Number(x[key]||0),0);
const sortRlc=(a,b)=>(Number(String(a.code).replace(/\D/g,''))||0)-(Number(String(b.code).replace(/\D/g,''))||0);
const note='<span class="cw-info-mark">i</span> Kolona <b>L (m)</b> preuzeta je iz projektne specifikacije. Zbir dužina i zbir kolone <b>br.</b> prikazuju se odvojeno; L se ne množi sa br.';
const caption='<span class="cw-overline">PP32 / KABLOVSKA EVIDENCIJA</span>';
function screen(html){shell('<main class="wrap cw-page">'+html+'</main>');}
function info(){return '<p class="cw-info">'+note+'</p>';}
function reportError(error){alert('Kablovi: '+(error?.message||String(error)));}
function actionsBack(fn){const b=document.getElementById('cwBack');if(b)b.onclick=fn;}
C.load=async()=>{
 const projects=await api('/rest/v1/projects?code=eq.pp32&select=id,name');
 const p=projects[0];if(!p)throw Error('PP32 projekat nije pronađen.');
 const rlcs=await api('/rest/v1/rlcs?project_id=eq.'+q(p.id)+'&select=*&order=code.asc');
 rlcs.sort(sortRlc);
 let items=[];
 if(rlcs.length)items=await api('/rest/v1/rlc_cable_items?rlc_id=in.('+rlcs.map(r=>r.id).join(',')+')&select=*&order=sort_order.asc,created_at.asc&limit=2000');
 const byId=new Map(rlcs.map(r=>[r.id,r]));
 return {p,rlcs,items:items.map(x=>({...x,rlc:byId.get(x.rlc_id)}))};
};
function group(rows){
 const map=new Map();
 rows.forEach(x=>{
  const key=[x.cable_type,x.construction,x.material].join('\u241f');
  if(!map.has(key))map.set(key,{cable_type:x.cable_type,construction:x.construction,material:x.material,length_m:0,cable_count:0,rlcs:new Set()});
  const g=map.get(key);g.length_m+=Number(x.length_m);g.cable_count+=Number(x.cable_count);g.rlcs.add(x.rlc_id);
 });
 return [...map.values()].sort((a,b)=>a.cable_type.localeCompare(b.cable_type,'sr')||a.construction.localeCompare(b.construction,'sr',{numeric:true}));
}
C.group=group;
C.csv=function(rows){
 const csvSafe=v=>{
  let t=String(v??'');
  if(/^[\s]*[=+\-@]/.test(t))t="'"+t;
  return '"'+t.replace(/"/g,'""')+'"';
 };
 const header=['Tip kabla','Konstrukcija','Materijal','Zbir L (m)','Zbir br.','Broj RLC-ova'];
 const output=[header,...group(rows).map(g=>[g.cable_type,g.construction,g.material,g.length_m,g.cable_count,g.rlcs.size])];
 const csv='\ufeff'+output.map(r=>r.map(csvSafe).join(';')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const url=window.URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='PP32_kablovi_rekapitulacija.csv';
 document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>window.URL.revokeObjectURL(url),500);
};
function metric(label,num,unit=''){return '<div class="cw-metric"><span>'+label+'</span><strong>'+fmt(num)+(unit?'<small> '+unit+'</small>':'')+'</strong></div>';}
C.overview=async function(){
 const d=await C.load();
 const header='<button type="button" class="cw-back" id="cwBack">← Projekat PP32</button>'+
 '<section class="cw-hero">'+
 '<div class="cw-hero-copy">'+caption+'<h1>Kablovska <em>rekapitulacija.</em></h1>'+
 '<p>Jedinstven pregled projektovanih kablova po RLC-ovima. Izmene na pojedinačnim prelazima automatski se prikazuju u ukupnim količinama.</p>'+
 '<div class="cw-hero-chip"><span class="cw-active-dot"></span> Povezano sa PP32 bazom · '+d.rlcs.length+' RLC-ova</div></div>'+
 '<div class="cw-hero-art" aria-hidden="true"><div class="cw-art-h"><span>SPECIFIKACIJA / SVI PRELAZI</span><b>RLC</b></div>'+
 '<svg viewBox="0 0 360 155" width="100%" height="155" aria-hidden="true"><g fill="none" stroke="#8bdae3" stroke-width="2">'+
 '<path d="M15 52h80l34 36h98l42-36h74"/><path d="M15 107h92l28-24h89l45 24h74" opacity=".5"/>'+
 '<path d="M15 64h74l31 36h117l32-36h74" opacity=".35"/></g>'+
 '<g fill="#153c52" stroke="#a3eddf" stroke-width="2"><circle cx="95" cy="52" r="7"/><circle cx="129" cy="88" r="7"/><circle cx="227" cy="88" r="7"/><circle cx="269" cy="52" r="7"/><circle cx="269" cy="107" r="7"/></g>'+
 '<g fill="#b4e7e7" font-size="9" font-family="Arial"><text x="60" y="32">RLC</text><text x="196" y="130">KABLOVI / CU</text></g></svg>'+
 '<div class="cw-art-foot"><span>SS SISTEM</span><span>PROJEKTNE KOLIČINE</span></div></div></section>'+
 '<section class="cw-overview-content">'+
 '<div class="cw-heading"><div><span class="cw-eyebrow">SVE NA JEDNOM MESTU</span><h2>Ukupne potrebe</h2></div>'+
 (isAdmin()?'<button class="cw-btn cw-btn-outline" type="button" id="cwAddRlc">＋ Dodaj RLC</button>':'')+'</div>'+
 '<div class="cw-metrics" id="cwMetrics"></div>'+
 '<div class="cw-toolbar"><label class="cw-search"><span aria-hidden="true">⌕</span><input type="search" id="cwSearch" placeholder="Pretraga tipa i konstrukcije kabla…" aria-label="Pretraži specifikacije"></label>'+
 '<select id="cwSelect" aria-label="Filter po RLC-u"><option value="">Svi RLC-ovi</option>'+
 d.rlcs.map(r=>'<option value="'+E(r.id)+'">'+E(r.code)+' · '+E(r.design_name||'')+'</option>').join('')+'</select>'+
 '<button type="button" class="cw-btn cw-btn-outline" id="cwCsv">↓ CSV</button></div>'+
 '<div class="cw-table-card"><div class="cw-table-head"><div><h3>Objedinjena specifikacija</h3><p>Grupisano po tipu i konstrukciji kabla</p></div><span id="cwRowsCount"></span></div>'+
 '<div class="cw-table-scroll"><table><thead><tr><th>TIP KABLA</th><th>KONSTRUKCIJA</th><th>MATERIJAL</th><th>ZBIR L (m)</th><th>ZBIR br.</th><th>RLC</th></tr></thead><tbody id="cwSummaryRows"></tbody></table></div></div>'+info()+
 '<div class="cw-heading cw-subhead"><div><span class="cw-eyebrow">POJEDINAČNI PREGLED</span><h2>Putni prelazi</h2></div><span id="cwRlcCount"></span></div>'+
 '<div class="cw-rlc-grid" id="cwRlcCards"></div></section>';
 screen(header);
 actionsBack(()=>project(d.p.id));
 const input=document.getElementById('cwSearch'),select=document.getElementById('cwSelect');
 let filtered=[];
 function render(){
  const filterId=select.value,query=input.value.toLocaleLowerCase('sr').trim();
  filtered=d.items.filter(x=>(!filterId||x.rlc_id===filterId)&&
   (!query||[x.cable_type,x.construction,x.material,x.rlc?.code,x.rlc?.design_name].join(' ').toLocaleLowerCase('sr').includes(query)));
  const groups=group(filtered);
  document.getElementById('cwMetrics').innerHTML=
   metric('Evidentirano dužina',total(filtered,'length_m'),'m')+
   metric('Zbir kolone br.',total(filtered,'cable_count'))+
   metric('Različitih specifikacija',groups.length)+
   metric('RLC-ova sa stavkama',new Set(filtered.map(x=>x.rlc_id)).size);
  document.getElementById('cwRowsCount').textContent=groups.length+' specifikacija';
  document.getElementById('cwSummaryRows').innerHTML=groups.length?groups.map(g=>
   '<tr><td><span class="cw-type-marker"></span><b>'+E(g.cable_type)+'</b></td>'+
   '<td>'+E(g.construction)+'</td><td>'+E(g.material||'—')+'</td>'+
   '<td class="cw-num">'+fmt(g.length_m)+'</td><td class="cw-num">'+fmt(g.cable_count)+'</td>'+
   '<td><span class="cw-soft-badge">'+g.rlcs.size+'</span></td></tr>').join(''):
   '<tr><td colspan="6" class="cw-table-empty">Nema kablova za zadatu pretragu.</td></tr>';
  const listing=d.rlcs.filter(r=>!filterId||r.id===filterId);
  document.getElementById('cwRlcCount').textContent=listing.length+' RLC-ova';
  document.getElementById('cwRlcCards').innerHTML=listing.map((r,i)=>{
   const items=d.items.filter(x=>x.rlc_id===r.id);
   const matching=filtered.filter(x=>x.rlc_id===r.id);
   return '<button type="button" class="cw-rlc-card" data-openrlc="'+E(r.id)+'">'+
    '<span class="cw-rlc-card-head"><span class="cw-rlc-code">'+E(r.code)+'</span><span class="cw-card-status '+(items.length?'':'cw-card-blank')+'">'+(items.length?'SPECIFIKOVANO':'ČEKA UNOS')+'</span></span>'+
    '<strong>'+E(r.design_name||'Putni prelaz')+'</strong><small>'+E(r.chainage||'Stacionaža nije uneta')+'</small>'+
    '<span class="cw-rlc-card-stat"><span><b>'+fmt(total(items,'length_m'))+'</b> m L</span><span><b>'+fmt(total(items,'cable_count'))+'</b> br.</span></span>'+
    '<span class="cw-rlc-card-foot">'+(matching.length===items.length?'Otvori specifikaciju':'Otvori · '+matching.length+' od '+items.length+' stavki')+' <b>↗</b></span></button>';
  }).join('');
  document.querySelectorAll('[data-openrlc]').forEach(b=>b.onclick=()=>C.perRlc(b.dataset.openrlc));
 }
 input.addEventListener('input',render);
 select.addEventListener('change',render);
 document.getElementById('cwCsv').onclick=()=>C.csv(filtered);
 if(isAdmin())document.getElementById('cwAddRlc').onclick=()=>C.addRlc();
 render();
};
C.perRlc=async function(id){
 const d=await C.load();
 const r=d.rlcs.find(x=>x.id===id);if(!r)throw Error('RLC nije pronađen.');
 const items=d.items.filter(x=>x.rlc_id===id);
 const body='<button class="cw-back" id="cwBack" type="button">← Nazad na RLC</button>'+
 '<section class="cw-detail-hero">'+
 '<div>'+caption+'<h1>'+E(r.code)+' <span>· '+E(r.design_name||'Putni prelaz')+'</span></h1>'+
 '<p>'+E(r.chainage||'')+' · Projektna specifikacija kablova</p></div>'+
 '<div class="cw-detail-symbol" aria-hidden="true">Cu<span> / L</span></div></section>'+
 '<div class="cw-metrics cw-detail-metrics">'+metric('Tipova i konstrukcija',items.length)+
 metric('Zbir dužina L',total(items,'length_m'),'m')+metric('Zbir kolone br.',total(items,'cable_count'))+'</div>'+
 '<div class="cw-heading"><div><span class="cw-eyebrow">SPISAK KABLOVA</span><h2>Specifikacija</h2></div>'+
 (isAdmin()?'<button type="button" class="cw-btn" id="cwNewRow">＋ Dodaj kabl</button>':'')+'</div>'+
 '<div class="cw-table-card"><div class="cw-table-scroll"><table><thead><tr><th>TIP KABLA</th><th>KONSTRUKCIJA</th><th>MATERIJAL</th><th>L (m)</th><th>br.</th>'+
 (isAdmin()?'<th>AKCIJE</th>':'')+'</tr></thead><tbody>'+
 (items.length?items.map(x=>'<tr><td><span class="cw-type-marker"></span><b>'+E(x.cable_type)+'</b></td>'+
 '<td>'+E(x.construction)+'</td><td>'+E(x.material||'—')+'</td>'+
 '<td class="cw-num">'+fmt(x.length_m)+'</td><td class="cw-num">'+fmt(x.cable_count)+'</td>'+
 (isAdmin()?'<td class="cw-row-actions"><button type="button" data-cwedit="'+E(x.id)+'">Izmeni</button><button type="button" class="cw-row-danger" data-cwdelete="'+E(x.id)+'">Obriši</button></td>':'')+'</tr>').join(''):
 '<tr><td colspan="'+(isAdmin()?6:5)+'" class="cw-table-empty">Nema unetih kablova za ovaj RLC.</td></tr>')+
 '</tbody></table></div></div>'+info()+
 '<div class="cw-bottom-actions"><button type="button" class="cw-btn cw-btn-outline" id="cwTotals">← Ukupna rekapitulacija</button></div>';
 screen(body);
 actionsBack(()=>rlc(id));
 document.getElementById('cwTotals').onclick=()=>C.overview();
 if(isAdmin()){
  document.getElementById('cwNewRow').onclick=()=>C.editor(id,null);
  document.querySelectorAll('[data-cwedit]').forEach(b=>b.onclick=()=>C.editor(id,b.dataset.cwedit));
  document.querySelectorAll('[data-cwdelete]').forEach(b=>b.onclick=async()=>{
   const rec=items.find(x=>x.id===b.dataset.cwdelete);if(!rec)return;
   if(!confirm('Obrisati stavku '+rec.cable_type+' / '+rec.construction+' za '+r.code+'?'))return;
   if(!confirm('Poslednja potvrda: trajno uklanjanje ove stavke iz specifikacije?'))return;
   b.disabled=true;
   try{
    const deleted=await api('/rest/v1/rlc_cable_items?id=eq.'+q(rec.id),{method:'DELETE',headers:{Prefer:'return=representation'}});
    if(!deleted?.length)throw Error('Brisanje nije izvršeno. Proveri administratorska prava.');
    await C.perRlc(id);
   }catch(e){reportError(e);b.disabled=false;}
  });
 }
};
C.editor=async function(rlcId,itemId){
 if(!isAdmin())return;
 const d=await C.load();const r=d.rlcs.find(x=>x.id===rlcId);
 if(!r)return reportError(Error('RLC nije pronađen.'));
 const rec=itemId?d.items.find(x=>x.id===itemId&&x.rlc_id===rlcId):null;
 if(itemId&&!rec)return reportError(Error('Stavka ne postoji.'));
 const mode=rec?'Izmena kabla':'Novi kabl';
 const f=(id,label,value,type='text')=>'<label class="cw-field"><span>'+E(label)+'</span><input id="'+id+'" type="'+type+'" value="'+E(value??'')+'" required></label>';
 const form='<button class="cw-back" id="cwBack" type="button">← '+E(r.code)+' · Kablovi</button>'+
 '<section class="cw-detail-hero"><div>'+caption+'<h1>'+mode+'</h1><p>'+E(r.code)+' · '+E(r.design_name||'')+'</p></div><div class="cw-detail-symbol">＋</div></section>'+
 '<form class="cw-edit-form" id="cwForm"><div class="cw-edit-intro"><h2>Podaci o kablu</h2><p>Izmene se čuvaju u bazi i automatski ulaze u zajednički obračun.</p></div>'+
 '<div class="cw-form-grid">'+f('cwType','Tip kabla',rec?.cable_type||'A-2Y(L)2YB2Y')+
 f('cwConstruction','Konstrukcija',rec?.construction||'')+
 f('cwMaterial','Materijal',rec?.material||'Cu')+
 f('cwLength','L (m)',rec?.length_m??'','text')+
 f('cwCount','br.',rec?.cable_count??'','number')+'</div>'+
 '<label class="cw-field"><span>Napomena (opciono)</span><textarea id="cwNote" rows="3">'+E(rec?.note||'')+'</textarea></label>'+
 '<p id="cwFormMsg" class="cw-form-message" role="status"></p>'+
 '<div class="cw-form-actions"><button type="button" class="cw-btn cw-btn-outline" id="cwCancel">Odustani</button>'+
 '<button type="submit" class="cw-btn" id="cwSave">Sačuvaj '+(rec?'izmenu':'kabl')+'</button></div></form>';
 screen(form);
 actionsBack(()=>C.perRlc(rlcId));
 document.getElementById('cwCancel').onclick=()=>C.perRlc(rlcId);
 document.getElementById('cwForm').onsubmit=async e=>{
  e.preventDefault();
  const type=document.getElementById('cwType').value.trim();
  const construction=document.getElementById('cwConstruction').value.trim();
  const material=document.getElementById('cwMaterial').value.trim();
  const length=Number(document.getElementById('cwLength').value.trim().replace(',','.'));
  const count=Number(document.getElementById('cwCount').value);
  const notice=document.getElementById('cwFormMsg');
  if(type.length<2||!construction||!material||!Number.isFinite(length)||length<0||!Number.isInteger(count)||count<0){
   notice.textContent='Unesi tip, konstrukciju, materijal, nenegativnu dužinu i ceo broj u koloni br.';return;
  }
  const payload={cable_type:type,construction,material,length_m:length,cable_count:count,note:document.getElementById('cwNote').value.trim()||null,updated_at:new Date().toISOString()};
  const btn=document.getElementById('cwSave');btn.disabled=true;notice.textContent='Čuvanje...';
  try{
   if(rec){const saved=await api('/rest/v1/rlc_cable_items?id=eq.'+q(rec.id),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});if(!saved?.length)throw Error('Izmena nije izvršena.');}
   else{
    payload.rlc_id=rlcId;payload.sort_order=d.items.filter(x=>x.rlc_id===rlcId).reduce((m,x)=>Math.max(m,x.sort_order),0)+1;
    payload.source_name='Ručni unos';
    const saved=await api('/rest/v1/rlc_cable_items',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});
    if(!saved?.length)throw Error('Stavka nije sačuvana.');
   }
   await C.perRlc(rlcId);
  }catch(error){notice.textContent=error?.message||String(error);btn.disabled=false;}
 };
};
C.addRlc=async function(){
 if(!isAdmin())return;
 const d=await C.load();
 screen('<button class="cw-back" id="cwBack" type="button">← Ukupna rekapitulacija</button>'+
 '<section class="cw-detail-hero"><div>'+caption+'<h1>Dodaj putni prelaz</h1><p>Novi RLC će odmah biti dostupan u PP32 projektu i zajedničkom pregledu kablova.</p></div><div class="cw-detail-symbol">＋</div></section>'+
 '<form class="cw-edit-form" id="cwRlcForm"><div class="cw-form-grid">'+
 '<label class="cw-field"><span>RLC broj</span><input id="cwRlcNumber" type="number" min="1" max="999" required placeholder="npr. 10"></label>'+
 '<label class="cw-field"><span>Naziv / oznaka prelaza</span><input id="cwRlcName" type="text" placeholder="npr. Putni prelaz ..." required></label>'+
 '<label class="cw-field"><span>Stacionaža (opciono)</span><input id="cwRlcKm" type="text" placeholder="km 0+000"></label></div>'+
 '<p id="cwFormMsg" class="cw-form-message" role="status"></p><div class="cw-form-actions">'+
 '<button type="button" class="cw-btn cw-btn-outline" id="cwCancel">Odustani</button>'+
 '<button type="submit" class="cw-btn" id="cwSave">Kreiraj RLC</button></div></form>');
 actionsBack(()=>C.overview());document.getElementById('cwCancel').onclick=()=>C.overview();
 document.getElementById('cwRlcForm').onsubmit=async e=>{
  e.preventDefault();
  const n=Number(document.getElementById('cwRlcNumber').value),name=document.getElementById('cwRlcName').value.trim();
  const msg=document.getElementById('cwFormMsg');
  if(!Number.isInteger(n)||n<1||n>999||!name){msg.textContent='Unesi ispravan RLC broj i naziv.';return;}
  const code='RLC'+n;
  if(d.rlcs.some(x=>x.code.toUpperCase()===code)){msg.textContent='RLC sa ovim brojem već postoji.';return;}
  const b=document.getElementById('cwSave');b.disabled=true;
  try{
   const ps=await api('/rest/v1/rlcs',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({project_id:d.p.id,code,design_name:name,chainage:document.getElementById('cwRlcKm').value.trim()||null,configured:false})});
   if(!ps?.[0]?.id)throw Error('RLC nije sačuvan.');
   await C.perRlc(ps[0].id);
  }catch(error){msg.textContent=error?.message||String(error);b.disabled=false;}
 };
};
const oldProject=window.project;
if(typeof oldProject==='function'){
 window.project=async function(id){
  await oldProject(id);
  if(currentProject?.code!=='pp32')return;
  const grid=document.querySelector('.rlcgrid');
  if(!grid||document.querySelector('.cw-project-cta'))return;
  // New RLCs retain natural numeric order (RLC9 before RLC10).
  [...grid.querySelectorAll('[data-r]')].sort((a,b)=>{
   const num=node=>Number((node.querySelector('h3')?.textContent||'').replace(/\D/g,''))||0;
   return num(a)-num(b);
  }).forEach(node=>grid.appendChild(node));
  grid.insertAdjacentHTML('beforebegin','<button class="cw-project-cta" type="button" id="cwProjectCta">'+
   '<span class="cw-cta-icon">⌁</span><span class="cw-cta-copy"><small>PP32 / MATERIJALNA SPECIFIKACIJA</small>'+
   '<strong>Kablovi · Ukupna rekapitulacija</strong><span>Pregled dužina i količina svih putnih prelaza, sa mogućnošću izmene.</span></span>'+
   '<span class="cw-cta-arrow">↗</span></button>');
  document.getElementById('cwProjectCta').onclick=()=>C.overview().catch(reportError);
 };
}
const oldRlc=window.rlc;
if(typeof oldRlc==='function'){
 window.rlc=async function(id){
  await oldRlc(id);
  if(currentProject?.code!=='pp32')return;
  const tiles=document.querySelector('.tiles');
  if(!tiles||document.querySelector('.cw-rlc-tile'))return;
  tiles.insertAdjacentHTML('beforeend','<button type="button" class="tile cw-rlc-tile">'+
   '<div class="ico">⌁</div><b>Kablovi</b><span class="sub">Tipovi, dužine i količine</span></button>');
  tiles.querySelector('.cw-rlc-tile').onclick=()=>C.perRlc(id).catch(reportError);
 };
}
})();