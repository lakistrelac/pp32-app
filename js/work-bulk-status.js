/* PP32 shared mass status controls.
 * Applies only to one selected RLC or one selected project, after explicit confirmation.
 * "Pripremljeno" = 50%, "Urađeno" = 100% for every work element.
 */
(function(){
'use strict';
const previous=window.shell;
if(typeof previous!=='function')return;
const W=window.PP32WorkBulk={};
const names={not_started:'Bez statusa (0%)',prepared:'Pripremljeno (50%)',done:'Urađeno (100%)'};
function context(html){
 if(!canEdit()||!currentProject?.id)return null;
 if(html.includes('id="rpReport"')||html.includes('class="wrap rp-page"'))return null;
 // Project overview: RLC list, segmented project landing, or a generic project workspace.
 if(html.includes('class="rlcgrid')||html.includes('data-cmod=')||
    html.includes('class="pw-main-hero"')){
  return {scope:'project',target:currentProject.id,label:'celom projektu',refresh:async()=>window.project(currentProject.id)};
 }
 if(currentRlc?.id&&currentRlc.project_id===currentProject.id&&(
     html.includes('data-mod=')||html.includes('id="ilBack"')||
     html.includes('id="ilmBack"')||(html.includes('id="br"')&&html.includes(currentRlc.code))
 )){
  const id=currentRlc.id,code=currentRlc.code;
  return {scope:'rlc',target:id,label:'svim elementima '+code,refresh:async()=>{
   if(html.includes('id="ilBack"')&&window.PP32InteractiveLine?.open)return window.PP32InteractiveLine.open(id);
   if(html.includes('id="ilmBack"')&&window.PP32LinesMore?.open)return window.PP32LinesMore.open(id);
   if(html.includes('<h1>Komponente')&&typeof window.components==='function')return window.components();
   return window.rlc(id);
  }};
 }
 return null;
}
function render(info){
 const wrap=APP.querySelector('.wrap');if(!wrap||document.getElementById('pp32BulkBar'))return;
 const bar=document.createElement('section');bar.className='pp32-bulk-bar';bar.id='pp32BulkBar';
 bar.innerHTML='<div class="pp32-bulk-heading"><b>Masovna promena statusa</b>'+
 '<span>Jednim klikom postavi status svim elementima u '+(info.scope==='project'?'projektu':'ovom RLC-u')+'. Pripremljeno = 50%, urađeno = 100%.</span></div>'+
 '<div class="pp32-bulk-actions">'+
 '<button type="button" data-bulk-state="prepared" class="pp32-bulk-prepared">◷ Sve pripremljeno · 50%</button>'+
 '<button type="button" data-bulk-state="done" class="pp32-bulk-done">✓ Sve urađeno · 100%</button>'+
 '<button type="button" data-bulk-state="not_started" class="pp32-bulk-clear">Poništi sve</button></div>'+
 '<div class="pp32-bulk-message" role="status" aria-live="polite"></div>';
 const insertBefore=wrap.querySelector('.tiles,.rlcgrid,.pw-grid,.il-workbench,.rows');
 if(insertBefore)insertBefore.parentElement.insertBefore(bar,insertBefore);
 else wrap.append(bar);
 const buttons=[...bar.querySelectorAll('[data-bulk-state]')];
 buttons.forEach(button=>button.onclick=async()=>{
  if(!canEdit())return;
  const state=button.dataset.bulkState;
  if(!confirm('Postaviti status „'+names[state]+'“ za '+info.label+'?\n\nOva komanda će zameniti pojedinačne statuse svih pronađenih elemenata.'))return;
  const note=bar.querySelector('.pp32-bulk-message');
  buttons.forEach(b=>b.disabled=true);note.textContent='Čuvanje promena u bazi…';
  try{
   const result=await api('/rest/v1/rpc/set_work_status',{
    method:'POST',
    body:JSON.stringify({p_scope:info.scope,p_target:info.target,p_status:state})
   });
   const count=Number(result?.updated)||0;
   if(count<1)throw Error('Nijedna stavka nije ažurirana.');
   note.textContent='Sačuvano: '+count+' stavki. Osvežavam prikaz…';
   await info.refresh();
  }catch(error){
   note.textContent='Greška: '+(error?.message||String(error));
   buttons.forEach(b=>b.disabled=false);
  }
 });
}
window.shell=function(html){
 previous(html);
 const info=context(html);
 if(info)render(info);
};
})();