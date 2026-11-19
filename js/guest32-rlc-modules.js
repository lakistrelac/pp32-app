/* Gost32: isolated read-only PP32 crossing view.
   IMPORTANT: Guest navigation never executes work, line, print, or equipment
   rendering wrappers, so there are no "missing line" prompts or progress data.
   Other roles follow the original complete PP32 route unchanged. */
(function(){
'use strict';
const isGuest32=()=>profile?.active===true&&profile?.role==='guest_pp32';
const q=value=>encodeURIComponent(String(value));
const html=s=>esc(s==null?'':s);
const previousRlc=window.rlc;
const previousProject=window.project;
const previousGuideHome=window.guideHome;

function guestHeader(rlc,label){
 return '<div class="wrap pp32-guest-workspace">'+
  '<button class="back" type="button" id="guestRlcBack">← '+html(label)+'</button>'+
  '<div class="hero"><div><h1>'+html(rlc.code)+' · '+html(rlc.design_name||'Putni prelaz')+'</h1>'+
  '<p class="sub">'+html(rlc.chainage||'')+'</p></div></div>';
}
function attachBack(rlc,action){
 const back=document.getElementById('guestRlcBack');
 if(back)back.onclick=action||(()=>window.rlc(rlc.id));
}

/* The guest project index is read-only; unlike the normal project screen it
   does not query work components, diaries, line drawings or progress. */
async function showGuestProject(id){
 const projects=await api('/rest/v1/projects?id=eq.'+q(id)+'&select=id,code,name,description');
 const project=projects?.[0];
 if(project?.code!=='pp32')throw new Error('Gost može da otvori samo projekat 32 putna prelaza.');
 const rows=await api('/rest/v1/rlcs?project_id=eq.'+q(project.id)+
  '&select=id,code,design_name,chainage,railway_line&order=code.asc&limit=100');
 const ordered=[...rows].sort((a,b)=>(Number(a.code.match(/\d+/)?.[0]||0)-Number(b.code.match(/\d+/)?.[0]||0)));
 currentProject=project;
 currentRlc=null;
 let body='<main class="wrap pp32-guest-project">'+
  '<button type="button" class="back" id="guestProjectBack">← Početna</button>'+
  '<div class="hero"><div><h1>'+html(project.name)+'</h1>'+
  '<p class="sub">Izaberi putni prelaz za dokumentaciju ili proračun uključnih tačaka.</p></div></div>'+
  '<div class="rg-heading"><div><span class="rg-label">PP32 / PUTNI PRELAZI</span>'+
  '<h2>Izaberi <em>RLC.</em></h2><p>Dokumentacija i proračun posebno za svaki prelaz.</p></div>'+
  '<span class="rg-count">'+ordered.length+' RLC-ova</span></div>'+
  '<div class="rlcgrid rg-grid pp32-guest-rlcgrid">';
 ordered.forEach((r,i)=>{
  body+='<button type="button" class="tile rg-card gc-rlc-card gc-variant-'+(i%4)+'" data-guest-rlc="'+html(r.id)+'" data-r="'+html(r.id)+'"'+
   ' aria-label="Otvori '+html(r.code)+' · '+html(r.design_name||'Putni prelaz')+'">'+
   '<div class="gc-card-head"><span class="gc-code">'+html(r.code)+'</span>'+
   '<span class="gc-index">'+String(i+1).padStart(2,'0')+' / '+String(ordered.length).padStart(2,'0')+'</span></div>'+
   '<strong class="gc-name">'+html(r.design_name||'Putni prelaz')+'</strong>'+
   '<div class="gc-route" title="'+html(r.railway_line||'Putni prelaz')+'"><span class="gc-track" aria-hidden="true"></span>'+html(r.railway_line||'Putni prelaz')+'</div>'+
   '<div class="gc-card-foot"><span class="gc-chainage">'+(r.chainage?'km '+html(r.chainage):'Lokacija na mapi')+'</span>'+
   '<span class="gc-go" aria-hidden="true">↗</span></div></button>';
 });
 body+='</div></main>';
 shell(body);
 const back=document.getElementById('guestProjectBack');
 if(back)back.onclick=()=>window.home();
 document.querySelectorAll('[data-guest-rlc]').forEach(card=>{
  card.onclick=()=>window.rlc(card.dataset.guestRlc).catch(err=>alert('Putni prelaz: '+err.message));
 });
}

async function showGuestRlc(id){
 const rlcs=await api('/rest/v1/rlcs?id=eq.'+q(id)+'&select=id,code,design_name,chainage,project_id');
 const rlc=rlcs?.[0];
 if(!rlc)throw new Error('Putni prelaz nije dostupan.');
 const projects=await api('/rest/v1/projects?id=eq.'+q(rlc.project_id)+'&select=id,code,name');
 const project=projects?.[0];
 if(project?.code!=='pp32')throw new Error('Pristup je ograničen na projekat 32 putna prelaza.');
 currentProject=project;
 currentRlc=rlc;
 shell(guestHeader(rlc,'32 putna prelaza')+
  '<div class="tiles pp32-module-grid pp32-guest-tiles">'+
   '<button type="button" class="tile pp32-module-card" id="guestDocs" data-pp32-module="docs">'+
    '<span class="pp32-mod-top"><span class="pp32-mod-icon" aria-hidden="true">📁</span></span>'+
    '<span class="pp32-mod-kicker">DOKUMENTI PRELAZA</span>'+
    '<strong class="pp32-mod-title">Dokumentacija</strong>'+
    '<span class="pp32-mod-description">Otvori dokumenta pridružena prelazu '+html(rlc.code)+'.</span>'+
    '<span class="pp32-mod-footer">Otvori dokumentaciju <span aria-hidden="true">↗</span></span></button>'+
   '<button type="button" class="tile pp32-module-card ic-module-card" id="guestCalculation" data-pp32-module="inclusionCalc">'+
    '<span class="ic-tile-top"><span aria-hidden="true" style="font-size:30px">∑</span><b>PRORAČUN</b></span>'+
    '<span class="ic-tile-eyebrow">ZA OVAJ PUTNI PRELAZ</span>'+
    '<strong>Proračun uključnih tačaka</strong>'+
    '<span class="ic-tile-description">Proračun uključnih tačaka posebno za '+html(rlc.code)+'.</span>'+
    '<span class="ic-tile-bottom">Otvori proračun <b aria-hidden="true">↗</b></span></button>'+
  '</div></div>');
 attachBack(rlc,()=>window.project(rlc.project_id));
 document.getElementById('guestDocs').onclick=()=>{
  if(!window.PP32Sveske?.open)return alert('Dokumentacija nije učitana. Osveži aplikaciju.');
  window.PP32Sveske.open(rlc).catch(err=>alert('Dokumentacija: '+err.message));
 };
 document.getElementById('guestCalculation').onclick=()=>{
  if(!window.PP32InclusionRlc?.open){alert('Proračun nije moguće otvoriti. Osveži aplikaciju.');return;}
  window.PP32InclusionRlc.open(rlc.id).catch(err=>alert('Proračun uključnih tačaka: '+err.message));
 };
}
if(typeof previousProject==='function'){
 window.project=function(id){
  if(isGuest32())return showGuestProject(id);
  return previousProject(id);
 };
}
if(typeof previousRlc==='function'){
 window.rlc=function(id){
  if(isGuest32())return showGuestRlc(id);
  return previousRlc(id);
 };
}
if(typeof previousGuideHome==='function'){
 window.guideHome=async function(...args){
  await previousGuideHome.apply(this,args);
  if(!isGuest32())return;
  document.querySelectorAll('[data-gslug]').forEach(card=>{
   if(card.dataset.gslug!=='pad-napona')card.remove();
  });
 };
}
})();