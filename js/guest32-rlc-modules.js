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
 document.getElementById('guestDocs').onclick=()=>showGuestDocs(rlc).catch(err=>alert('Dokumentacija: '+err.message));
 document.getElementById('guestCalculation').onclick=()=>{
  if(!window.PP32InclusionRlc?.open){alert('Proračun nije moguće otvoriti. Osveži aplikaciju.');return;}
  window.PP32InclusionRlc.open(rlc.id).catch(err=>alert('Proračun uključnih tačaka: '+err.message));
 };
}
async function showGuestDocs(rlc){
 if(!isGuest32())return;
 const documents=await api('/rest/v1/documents?rlc_id=eq.'+q(rlc.id)+
   '&select=category,file_name,storage_path,version,uploaded_at&order=uploaded_at.desc');
 if(currentRlc?.id!==rlc.id)return;
 let body=guestHeader(rlc,rlc.code)+
  '<h2 class="sectionTitle">Dokumentacija</h2>'+
  '<div class="docs">';
 if(documents?.length){
  body+=documents.map((doc,i)=>'<div class="doc"><b>'+html(doc.category||'Dokument')+'</b>'+
   '<p class="sub">'+html(doc.file_name||'Dokument')+
   (doc.version?' · v'+html(doc.version):'')+'</p>'+
   '<button type="button" class="btn sec small" data-guest-doc="'+i+'">Otvori dokument</button></div>').join('');
 }
 body+='</div></div>';
 shell(body);
 attachBack(rlc);
 document.querySelectorAll('[data-guest-doc]').forEach(button=>{
  button.onclick=async()=>{
   const doc=documents[Number(button.dataset.guestDoc)];
   if(!doc?.storage_path)return;
   try{
    const url=await signed(doc.storage_path);
    window.open(url,'_blank','noopener,noreferrer');
   }catch(err){alert('Dokument ne može da se otvori: '+err.message)}
  };
 });
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