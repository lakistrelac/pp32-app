/* PP32 - RLC cards v2 and editable railway/RLC metadata. Preserves legacy navigation. */
(function(){
'use strict';
const previousProject=window.project;
if(typeof previousProject!=='function')return;
const e=s=>esc(s),q=s=>encodeURIComponent(String(s));
const digits=s=>Number(String(s||'').replace(/\D/g,''))||0;
const lineName=s=>s||'Pruga nije određena';
const displayCode=s=>String(s||'').replace(/^RLC\s*/i,'RLC ');
const backToProject=()=>project(currentProject.id);
window.project=async function(id){
 await previousProject(id);
 if(currentProject?.code!=='pp32')return;
 const grid=document.querySelector('.rlcgrid');if(!grid)return;
 const rows=await api('/rest/v1/rlcs?project_id=eq.'+q(currentProject.id)+'&select=*&order=code.asc');
 const byId=new Map(rows.map(r=>[r.id,r]));
 const nodes=[...grid.querySelectorAll('[data-r]')].sort((a,b)=>digits(byId.get(a.dataset.r)?.code)-digits(byId.get(b.dataset.r)?.code));
 if(!nodes.length)return;
 grid.classList.add('rg-grid');
 const lines=[...new Set(rows.map(r=>r.railway_line).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'sr'));
 nodes.forEach((node,idx)=>{
  grid.appendChild(node);
  const r=byId.get(node.dataset.r);if(!r)return;
  const oldProgress=node.querySelector('.progress i');
  const pc=Math.min(100,Math.max(0,Math.round(Number((node.querySelector('.progress')?.nextElementSibling?.textContent||'0').replace(/[^\d.]/g,''))||0)));
  const isConfigured=!!r.design_name;
  node.classList.add('rg-card');
  node.setAttribute('role','button');node.setAttribute('tabindex','0');node.setAttribute('aria-label','Otvori '+r.code+', '+(r.design_name||'naziv nije unet'));
  node.dataset.line=r.railway_line||'';
  node.dataset.query=[r.code,r.design_name,r.chainage,r.railway_line].join(' ').toLocaleLowerCase('sr');
  node.innerHTML='<div class="rg-card-top"><div class="rg-code">'+e(displayCode(r.code))+'</div>'+
   '<span class="rg-number">'+String(idx+1).padStart(2,'0')+' / '+String(nodes.length).padStart(2,'0')+'</span></div>'+
   '<div class="rg-route"><span class="rg-track-dot"></span>'+e(lineName(r.railway_line))+'</div>'+
   '<div class="rg-name">'+e(r.design_name||'Naziv prelaza nije unet')+'</div>'+
   '<div class="rg-km"><span aria-hidden="true">⌖</span> '+e(r.chainage||'Stacionaža nije uneta')+'</div>'+
   '<div class="rg-progress-caption"><span>Realizacija radova</span><b>'+pc+'%</b></div>'+
   '<div class="rg-progress"><i style="width:'+pc+'%"></i></div>'+
   '<div class="rg-card-bottom"><span>Otvori putni prelaz <b aria-hidden="true">↗</b></span>'+
    (isAdmin()?'<button class="rg-edit" type="button" data-rgedit="'+e(r.id)+'" aria-label="Uredi podatke za '+e(r.code)+'">Uredi</button>':'')+
   '</div>';
  node.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target===node){ev.preventDefault();node.click();}});
  const edit=node.querySelector('[data-rgedit]');
  if(edit)edit.addEventListener('click',ev=>{ev.stopPropagation();ev.preventDefault();editRlc(r.id,lines);});
 });
 const title=document.createElement('div');
 title.className='rg-heading';
 title.innerHTML='<div><span class="rg-label">PP32 / REGISTAR PUTNIH PRELAZA</span>'+
 '<h2>Putni prelazi <em>na jednom mestu.</em></h2><p>Pregled radova, stacionaža i pripadajućih pruga — svaki RLC vodi do detaljne evidencije.</p></div>'+
 '<span class="rg-count">'+nodes.length+' RLC-ova</span>';
 grid.before(title);
 const toolbar=document.createElement('div');toolbar.className='rg-toolbar';
 toolbar.innerHTML='<label class="rg-search"><span aria-hidden="true">⌕</span><input id="rgSearch" type="search" aria-label="Pretraži RLC-ove" placeholder="Pretraži RLC, naziv, stacionažu…"></label>'+
 '<select id="rgLine" aria-label="Filtriraj RLC-ove po pruzi"><option value="all">Sve pruge</option>'+
 lines.map(x=>'<option value="'+e(x)+'">'+e(x)+'</option>').join('')+
 '<option value="unknown">Pruga nije određena</option></select><span class="rg-visible" id="rgVisible"></span>';
 grid.before(toolbar);
 const search=toolbar.querySelector('#rgSearch'),select=toolbar.querySelector('#rgLine'),visible=toolbar.querySelector('#rgVisible');
 function draw(){
  const term=search.value.trim().toLocaleLowerCase('sr'),selected=select.value;
  let count=0;
  nodes.forEach(node=>{
   const matchesText=!term||node.dataset.query.includes(term);
   const matchesLine=selected==='all'||(selected==='unknown'&&!node.dataset.line)||node.dataset.line===selected;
   const show=matchesText&&matchesLine;node.hidden=!show;if(show)count++;
  });
  visible.textContent=count+' od '+nodes.length;
 }
 search.oninput=draw;select.onchange=draw;draw();
 const hero=document.querySelector('.wrap > .hero');
 if(hero){hero.classList.add('rg-project-hero');const sub=hero.querySelector('.sub');if(sub)sub.textContent='Centralna evidencija radova · Registar putnih prelaza';}
};
async function editRlc(id,lines){
 if(!isAdmin())return;
 const data=await api('/rest/v1/rlcs?id=eq.'+q(id)+'&select=*'),r=data[0];
 if(!r)return alert('RLC nije pronađen.');
 const title='Uredi '+displayCode(r.code);
 shell('<main class="wrap rg-editor">'+
 '<button type="button" class="rg-editor-back" id="rgBack">← Svi RLC-ovi</button>'+
 '<header class="rg-editor-hero"><span>PP32 / PODACI PUTNOG PRELAZA</span><h1>'+e(title)+'</h1><p>Naziv, stacionaža i pruga mogu se promeniti bez izmene koda.</p></header>'+
 '<form class="rg-editor-form" id="rgForm">'+
 '<label><span>Oznaka</span><input value="'+e(r.code)+'" disabled></label>'+
 '<label><span>Naziv prelaza</span><input id="rgName" value="'+e(r.design_name||'')+'" placeholder="npr. PBA-1" autocomplete="off"></label>'+
 '<label><span>Stacionaža</span><input id="rgKm" value="'+e(r.chainage||'')+'" placeholder="npr. km 10+280"></label>'+
 '<label><span>Pruga</span><input list="rgLineOptions" id="rgNewLine" value="'+e(r.railway_line||'')+'" placeholder="Unesi naziv pruge"></label>'+
 '<datalist id="rgLineOptions">'+lines.map(x=>'<option value="'+e(x)+'"></option>').join('')+'</datalist>'+
 '<p class="rg-editor-tip">Ako pruga još nije poznata, ostavi polje prazno. Oznaka RLC-a se ne menja jer je vezana za postojeću evidenciju.</p>'+
 '<p id="rgMessage" role="status"></p>'+
 '<div class="rg-editor-actions"><button type="button" id="rgCancel">Odustani</button><button type="submit" id="rgSave">Sačuvaj podatke</button></div></form></main>');
 document.getElementById('rgBack').onclick=backToProject;
 document.getElementById('rgCancel').onclick=backToProject;
 document.getElementById('rgForm').onsubmit=async event=>{
  event.preventDefault();
  const payload={design_name:document.getElementById('rgName').value.trim()||null,chainage:document.getElementById('rgKm').value.trim()||null,railway_line:document.getElementById('rgNewLine').value.trim()||null,updated_at:new Date().toISOString()};
  const btn=document.getElementById('rgSave'),m=document.getElementById('rgMessage');btn.disabled=true;m.textContent='Čuvanje...';
  try{
   const saved=await api('/rest/v1/rlcs?id=eq.'+q(r.id),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});
   if(!saved?.length)throw Error('Nema potvrde upisa u bazu. Proveri prava administratora.');
   await backToProject();
  }catch(err){m.textContent=err?.message||String(err);btn.disabled=false;}
 };
}
})();