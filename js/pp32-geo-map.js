/* PP32 geographic map – linked to live RLC records and their line-item progress. */
(function(){
'use strict';
const PROJECT_CODE='pp32';
const escHtml=s=>esc(s==null?'':s);
const fmt=n=>new Intl.NumberFormat('sr-RS',{maximumFractionDigits:1}).format(n);
const isLocated=r=>Number.isFinite(Number(r.map_lat))&&Number.isFinite(Number(r.map_lng))&&r.map_lat!==null&&r.map_lng!==null;
const weight=s=>s==='done'?1:s==='prepared'?.5:0;
function progress(rows){
 if(!rows.length)return null;
 const trench=rows.find(x=>x.item_key==='trench');
 const others=rows.filter(x=>x.item_key!=='trench');
 const value=trench?60*weight(trench.status)+(others.length?40*others.reduce((n,x)=>n+weight(x.status),0)/others.length:0):100*rows.reduce((n,x)=>n+weight(x.status),0)/rows.length;
 return Math.round(value*10)/10;
}
function tone(r){return r.progress===null?'unknown':r.progress===100?'done':r.progress>0?'active':'idle'}
function statusLabel(r){return r.progress===null?'Nema podataka':r.progress===100?'Završeno':r.progress>0?'U toku':'Nije započeto'}
function pct(r){return r.progress===null?'—':fmt(r.progress)+'%'}
function validCoords(lat,lng){return Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180}
function parseLocation(text){
 let s=String(text||'').trim();
 try{s=decodeURIComponent(s)}catch(e){}
 const patterns=[
  /\/place\/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
  /\/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
  /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
  /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i,
  /^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/
 ];
 for(const p of patterns){const m=s.match(p);if(m){const lat=Number(m[1]),lng=Number(m[2]);if(validCoords(lat,lng))return {lat,lng}}}
 return null;
}
async function load(){
 const projects=await api('/rest/v1/projects?code=eq.'+PROJECT_CODE+'&select=id,name,code');
 if(!projects.length)throw Error('Projekat PP32 nije pronađen ili nemate pristup.');
 const project=projects[0];
 const records=await api('/rest/v1/rlcs?project_id=eq.'+encodeURIComponent(project.id)+'&select=id,project_id,code,design_name,chainage,map_lat,map_lng&order=code.asc&limit=100');
 const ids=records.map(r=>r.id);
 let lineItems=[];
 if(ids.length){
  lineItems=await api('/rest/v1/rlc_line_items?rlc_id=in.('+ids.map(encodeURIComponent).join(',')+')&select=rlc_id,item_key,status&limit=2000');
 }
 const grouped=new Map();
 lineItems.forEach(x=>{if(!grouped.has(x.rlc_id))grouped.set(x.rlc_id,[]);grouped.get(x.rlc_id).push(x)});
 const rows=records.map(r=>Object.assign({},r,{progress:progress(grouped.get(r.id)||[])}))
  .sort((a,b)=>(Number(a.code.match(/\d+/)?.[0]||0)-Number(b.code.match(/\d+/)?.[0]||0)));
 return {project,rows};
}
function goToRlc(ctx,r){
 currentProject=ctx.project;
 window.rlc(r.id).catch(e=>alert('Nije moguće otvoriti prelaz: '+e.message));
}
function popupHtml(r,editor){
 return '<div class="ppmap-popup"><strong>'+escHtml(r.code)+'</strong><span>'+escHtml(r.design_name||'Putni prelaz')+'</span>'+
  '<small>'+escHtml(r.chainage||'')+'</small><div class="ppmap-popup-status"><i class="ppmap-dot ppmap-dot-'+tone(r)+'"></i>'+escHtml(statusLabel(r))+' · <b>'+pct(r)+'</b></div>'+
  '<div class="ppmap-popup-actions"><button type="button" data-open-rlc="'+escHtml(r.id)+'">Otvori prelaz ↗</button>'+
  (editor?'<button type="button" data-edit-rlc="'+escHtml(r.id)+'">Izmeni pin</button>':'')+'</div></div>';
}
function pinIcon(r){
 return L.divIcon({className:'ppmap-marker',html:'<div class="ppmap-pin ppmap-pin-'+tone(r)+'"><b>'+escHtml(r.code)+'</b><small>'+pct(r)+'</small></div>',iconSize:[66,38],iconAnchor:[33,19]});
}
function addMap(element,ctx,options){
 if(!window.L){
  element.innerHTML='<div class="ppmap-fallback">Mapa nije mogla da se učita. Proveri internet vezu i osveži stranicu.</div>';
  return null;
 }
 const map=L.map(element,{scrollWheelZoom:false,zoomControl:false});
 L.control.zoom({position:'topright'}).addTo(map);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
 }).addTo(map);
 const layer=L.layerGroup().addTo(map);
 let markers=new Map();
 const controller={map,layer,markers,ctx,options,edit:null,temp:null};
 controller.refresh=function(fit){
  layer.clearLayers();markers=new Map();controller.markers=markers;
  const visible=ctx.rows.filter(r=>isLocated(r)&&(!options.filter||options.filter(r)));
  visible.forEach(r=>{
   const marker=L.marker([Number(r.map_lat),Number(r.map_lng)],{icon:pinIcon(r)}).addTo(layer);
   marker.bindPopup(popupHtml(r,!!options.editable));
   markers.set(r.id,marker);
  });
  if(fit){
   if(visible.length>1)map.fitBounds(L.latLngBounds(visible.map(r=>[Number(r.map_lat),Number(r.map_lng)])),{padding:[32,32],maxZoom:12});
   else if(visible.length===1)map.setView([Number(visible[0].map_lat),Number(visible[0].map_lng)],12);
   else map.setView([44.5,19.4],8);
  }
 };
 controller.refresh(true);
 element.addEventListener('click',e=>{
  const open=e.target.closest('[data-open-rlc]');
  if(open){const r=ctx.rows.find(x=>x.id===open.dataset.openRlc);if(r)goToRlc(ctx,r);return}
  const edit=e.target.closest('[data-edit-rlc]');
  if(edit&&options.onEdit){const r=ctx.rows.find(x=>x.id===edit.dataset.editRlc);if(r)options.onEdit(r)}
 });
 setTimeout(()=>{if(element.isConnected)map.invalidateSize()},60);
 return controller;
}
function legend(){
 return '<div class="ppmap-legend"><span><i class="ppmap-dot ppmap-dot-idle"></i>Nije započeto</span>'+
 '<span><i class="ppmap-dot ppmap-dot-active"></i>U toku</span><span><i class="ppmap-dot ppmap-dot-done"></i>Završeno</span></div>';
}
function countText(ctx){
 const located=ctx.rows.filter(isLocated).length;
 return located+' / '+ctx.rows.length+' lokacija';
}
function homeSection(){
 return '<section class="ppmap-home" aria-label="Mapa putnih prelaza">'+
  '<div class="ppmap-head"><div><span class="ppmap-eyebrow">TERENSKI PREGLED / PP32</span><h2>Geografska mapa prelaza</h2><p>Lokacije, stacionaže i napredak radova na jednom mestu.</p></div>'+
  '<button type="button" class="ppmap-main-button" data-full-map>Otvori celu mapu <span>↗</span></button></div>'+
  '<div class="ppmap-home-grid"><div class="ppmap-home-canvas" data-map-preview><div class="ppmap-fallback">Učitavanje lokacija…</div></div>'+
  '<div class="ppmap-home-aside"><div class="ppmap-home-stat"><strong data-map-count>—</strong><span>Unetih lokacija</span></div>'+
  '<p>Pinovi su povezani sa postojećim prelazima. Njihova boja prati procenat realizacije.</p>'+
  '<div class="ppmap-home-list" data-map-quick></div><button class="ppmap-secondary" data-full-map>Svi prelazi i uređivanje lokacija →</button></div></div>'+legend()+'</section>';
}
const beforeHome=window.home;
window.home=async function(){
 await beforeHome();
 const page=document.querySelector('.home-page');
 if(!page)return;
 const target=page.querySelector('.home-masthead');
 if(!target)return;
 target.insertAdjacentHTML('afterend',homeSection());
 const section=page.querySelector('.ppmap-home');
 section.querySelectorAll('[data-full-map]').forEach(b=>b.onclick=openFull);
 try{
  const ctx=await load();if(!section.isConnected)return;
  section.querySelector('[data-map-count]').textContent=countText(ctx);
  const located=ctx.rows.filter(isLocated);
  const quick=section.querySelector('[data-map-quick]');
  quick.innerHTML=located.slice(0,5).map(r=>'<button type="button" data-quick="'+escHtml(r.id)+'"><span><i class="ppmap-dot ppmap-dot-'+tone(r)+'"></i>'+escHtml(r.code)+'</span><b>'+pct(r)+'</b></button>').join('')||
   '<span class="ppmap-muted">Još nema unetih lokacija.</span>';
  const preview=addMap(section.querySelector('[data-map-preview]'),ctx,{editable:false});
  quick.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{
   const r=ctx.rows.find(x=>x.id===b.dataset.quick);
   if(!r||!preview)return;preview.map.setView([Number(r.map_lat),Number(r.map_lng)],13);preview.markers.get(r.id)?.openPopup();
  });
 }catch(e){if(section.isConnected)section.querySelector('[data-map-preview]').innerHTML='<div class="ppmap-fallback">'+escHtml(e.message)+'</div>'}
};
function openFull(){
 shell('<div class="wrap ppmap-page"><div class="ppmap-page-top"><button class="back" id="ppmapBack">← Početna</button>'+
  '<div><span class="ppmap-eyebrow">PP32 / LOKACIJE</span><h1>Mapa putnih prelaza</h1><p>Pregled realizacije i geografski položaj RLC-ova.</p></div></div>'+
  '<div class="ppmap-layout"><section class="ppmap-stage"><div class="ppmap-stage-header"><strong data-map-total>Učitavanje...</strong>'+
  legend()+'</div><div class="ppmap-full-canvas" id="ppmapFullCanvas"><div class="ppmap-fallback">Učitavanje mape…</div></div></section>'+
  '<aside class="ppmap-side"><div class="ppmap-side-title"><b>Svi prelazi</b><span data-map-side-count></span></div>'+
  '<div class="ppmap-filters"><input id="ppmapSearch" type="search" placeholder="Pretraži RLC, naziv ili km…" aria-label="Pretraži prelaze">'+
  '<select id="ppmapFilter" aria-label="Filtriraj po napretku"><option value="all">Svi statusi</option><option value="idle">Nije započeto</option>'+
  '<option value="active">U toku</option><option value="done">Završeno</option><option value="missing">Bez lokacije</option></select></div>'+
  '<div id="ppmapEditor" class="ppmap-editor-slot"></div><div class="ppmap-items" id="ppmapItems">Učitavanje…</div></aside></div></div>');
 document.getElementById('ppmapBack').onclick=home;
 initFull().catch(e=>{
  const el=document.getElementById('ppmapFullCanvas');if(el)el.innerHTML='<div class="ppmap-fallback">'+escHtml(e.message)+'</div>';
 });
}
async function initFull(){
 const parent=document.querySelector('.ppmap-page');if(!parent)return;
 const ctx=await load();if(!parent.isConnected)return;
 const editAllowed=isAdmin();
 parent.querySelector('[data-map-total]').textContent=countText(ctx);
 const search=parent.querySelector('#ppmapSearch'),filter=parent.querySelector('#ppmapFilter');
 const list=parent.querySelector('#ppmapItems'),slot=parent.querySelector('#ppmapEditor');
 let controller=null,editing=null;
 function filtered(r){
  const q=search.value.trim().toLowerCase();
  const matches=!q||[r.code,r.design_name,r.chainage].some(x=>String(x||'').toLowerCase().includes(q));
  const f=filter.value;
  return matches&&(f==='all'||(f==='missing'?!isLocated(r):tone(r)===f));
 }
 function refreshList(){
  const rows=ctx.rows.filter(filtered);
  parent.querySelector('[data-map-side-count]').textContent=rows.length+' prikazano';
  list.innerHTML=rows.length?rows.map(r=>
   '<div class="ppmap-item"><button type="button" class="ppmap-item-open" data-select="'+escHtml(r.id)+'">'+
   '<span class="ppmap-item-top"><b>'+escHtml(r.code)+'</b><span class="ppmap-percent"><i class="ppmap-dot ppmap-dot-'+tone(r)+'"></i>'+pct(r)+'</span></span>'+
   '<span class="ppmap-item-name">'+escHtml(r.design_name||'Putni prelaz')+'</span>'+
   '<small>'+escHtml(r.chainage||'Bez stacionaže')+' · '+(isLocated(r)?'Lokacija uneta':'Bez lokacije')+'</small></button>'+
   (editAllowed?'<button class="ppmap-edit-link" data-edit-rlc="'+escHtml(r.id)+'">'+(isLocated(r)?'Izmeni pin':'＋ Postavi lokaciju')+'</button>':'')+
   '</div>').join(''):'<p class="ppmap-muted">Nema prelaza za izabrani filter.</p>';
  if(controller){controller.options.filter=filtered;controller.refresh(false)}
 }
 function moveCandidate(lat,lng){
  if(!editing||!controller)return;
  const latField=slot.querySelector('#ppmapLat'),lngField=slot.querySelector('#ppmapLng');
  if(!latField||!lngField)return;
  latField.value=lat.toFixed(7);lngField.value=lng.toFixed(7);
  if(controller.temp){controller.temp.setLatLng([lat,lng])}
  else {
   controller.temp=L.marker([lat,lng],{draggable:true}).addTo(controller.map);
   controller.temp.on('dragend',()=>{const p=controller.temp.getLatLng();moveCandidate(p.lat,p.lng)});
  }
 }
 function finishEdit(){
  editing=null;slot.innerHTML='';
  if(controller?.temp){controller.map.removeLayer(controller.temp);controller.temp=null}
 }
 function startEdit(r){
  if(!editAllowed)return;
  finishEdit();editing=r;
  slot.innerHTML='<section class="ppmap-editor"><div class="ppmap-editor-title"><b>Lokacija · '+escHtml(r.code)+'</b><button type="button" id="ppmapCancel">✕</button></div>'+
   '<p>Nalepi Google Maps link ili klikni na tačku na mapi. Pin možeš i da prevučeš.</p>'+
   '<label>Google Maps link ili koordinate</label><textarea id="ppmapLink" rows="2" placeholder="https://www.google.com/maps/place/44.44,19.15"></textarea>'+
   '<button type="button" class="ppmap-small-action" id="ppmapReadLink">Preuzmi koordinate iz linka</button>'+
   '<div class="ppmap-coordinate-inputs"><label>Širina (lat)<input type="number" step="any" id="ppmapLat" placeholder="44.440000"></label>'+
   '<label>Dužina (lng)<input type="number" step="any" id="ppmapLng" placeholder="19.153334"></label></div>'+
   '<p class="ppmap-editor-message" id="ppmapMessage">Za precizno postavljanje klikni na mapu.</p>'+
   '<div class="ppmap-editor-actions"><button class="ppmap-save" id="ppmapSave" type="button">Sačuvaj lokaciju</button>'+
   (isLocated(r)?'<button class="ppmap-remove" id="ppmapRemove" type="button">Ukloni pin</button>':'')+'</div></section>';
  slot.querySelector('#ppmapCancel').onclick=finishEdit;
  const msg=slot.querySelector('#ppmapMessage');
  if(isLocated(r)){moveCandidate(Number(r.map_lat),Number(r.map_lng));controller?.map.flyTo([Number(r.map_lat),Number(r.map_lng)],14)}
  const read=()=>{
   const p=parseLocation(slot.querySelector('#ppmapLink').value);
   if(!p){msg.textContent='Link ne sadrži čitljive koordinate. Za skraćeni Google link otvori originalnu lokaciju ili klikni na mapu.';return}
   msg.textContent='Koordinate preuzete. Možeš pomeriti pin ili sačuvati.';
   moveCandidate(p.lat,p.lng);
   controller?.map.flyTo([p.lat,p.lng],15);
  };
  slot.querySelector('#ppmapReadLink').onclick=read;
  slot.querySelector('#ppmapLink').addEventListener('paste',()=>setTimeout(read,40));
  slot.querySelector('#ppmapSave').onclick=async()=>{
   const lat=Number(slot.querySelector('#ppmapLat').value),lng=Number(slot.querySelector('#ppmapLng').value);
   if(!slot.querySelector('#ppmapLat').value||!slot.querySelector('#ppmapLng').value||!validCoords(lat,lng)){
    msg.textContent='Unesi ispravnu geografsku širinu i dužinu.';return
   }
   const save=slot.querySelector('#ppmapSave');save.disabled=true;msg.textContent='Čuvanje…';
   try{
    await api('/rest/v1/rpc/set_rlc_map_location',{method:'POST',body:JSON.stringify({p_rlc_id:r.id,p_lat:lat,p_lng:lng})});
    r.map_lat=lat;r.map_lng=lng;finishEdit();refreshList();controller?.refresh(false);
    controller?.map.flyTo([lat,lng],14);
    controller?.markers.get(r.id)?.openPopup();
    parent.querySelector('[data-map-total]').textContent=countText(ctx);
   }catch(e){msg.textContent='Greška pri čuvanju: '+e.message;save.disabled=false}
  };
  const remove=slot.querySelector('#ppmapRemove');
  if(remove)remove.onclick=async()=>{
   if(!confirm('Ukloniti geografski pin za '+r.code+'? Statusi i podaci prelaza ostaju sačuvani.'))return;
   remove.disabled=true;msg.textContent='Uklanjanje…';
   try{
    await api('/rest/v1/rpc/set_rlc_map_location',{method:'POST',body:JSON.stringify({p_rlc_id:r.id,p_lat:null,p_lng:null})});
    r.map_lat=null;r.map_lng=null;finishEdit();refreshList();controller?.refresh(false);
    parent.querySelector('[data-map-total]').textContent=countText(ctx);
   }catch(e){msg.textContent='Greška: '+e.message;remove.disabled=false}
  };
 }
 const area=parent.querySelector('#ppmapFullCanvas');
 controller=addMap(area,ctx,{editable:editAllowed,filter:filtered,onEdit:startEdit});
 controller?.map.on('click',e=>{if(editing)moveCandidate(e.latlng.lat,e.latlng.lng)});
 search.addEventListener('input',refreshList);filter.addEventListener('change',refreshList);
 list.addEventListener('click',e=>{
  const edit=e.target.closest('[data-edit-rlc]');
  if(edit){const r=ctx.rows.find(x=>x.id===edit.dataset.editRlc);if(r)startEdit(r);return}
  const selected=e.target.closest('[data-select]');
  if(!selected)return;
  const r=ctx.rows.find(x=>x.id===selected.dataset.select);
  if(!r)return;
  if(!isLocated(r)){if(editAllowed)startEdit(r);return}
  controller?.map.flyTo([Number(r.map_lat),Number(r.map_lng)],14);
  controller?.markers.get(r.id)?.openPopup();
 });
 refreshList();
}
window.PP32GeoMap={open:openFull,parseLocation};
})();