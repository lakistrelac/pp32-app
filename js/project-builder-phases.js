/* Editable work phases and component tasks for any user-created project. */
(function(){
'use strict';
const P=window.PP32Workspace;if(!P)return;
const {pages,rest,write,enc,btn,field,area,panel,empty,screen,sectionTitle,msg,fail,lock}=P;
pages.segments=async()=>{
 const d=await P.data();
 const list=d.segments.map((s,i)=>{
  const els=d.elements.filter(e=>e.segment_id===s.id);
  const ids=new Set(els.map(e=>e.id));
  const tasks=d.tasks.filter(t=>ids.has(t.element_id)),pc=P.percent(tasks);
  return '<button type="button" class="pw-list-item" data-pwsegment="'+s.id+'"><span class="pw-number">'+String(i+1).padStart(2,'0')+'</span>'+
  '<span class="pw-list-copy"><strong>'+esc(s.name)+'</strong><small>'+els.length+' elemenata · '+pc+'% završeno</small>'+
  '<span class="pw-mini-progress"><i style="width:'+pc+'%"></i></span></span><span class="pw-row-arrow">↗</span></button>';
 }).join('');
 screen('Faze i komponente','PLAN RADOVA',sectionTitle(d.segments.length+' radnih faza',isAdmin()?btn('pwAddSeg','＋ Nova faza'):'')+
 (list?'<div class="pw-list">'+list+'</div>':empty('Nema unetih faza','Dodaj prvu fazu, a zatim u nju unesi komponente i zadatke.')),P.home);
 document.querySelectorAll('[data-pwsegment]').forEach(b=>b.onclick=()=>pages.segment(b.dataset.pwsegment));
 if(isAdmin())document.getElementById('pwAddSeg').onclick=pages.addSegment;
};
pages.addSegment=()=>{
 if(!isAdmin())return pages.segments();
 screen('Dodaj radnu fazu','NOVI SADRŽAJ',panel('<h2>Osnovni podaci</h2>'+
 field('pwSegName','Naziv faze')+btn('pwSegSave','Sačuvaj fazu')+msg),pages.segments);
 document.getElementById('pwSegSave').onclick=async()=>{
  const name=document.getElementById('pwSegName').value.trim();
  if(!name)return fail(Error('Naziv faze je obavezan.'));
  lock('pwSegSave');
  try{
   const prev=await rest('project_segments','?project_id=eq.'+enc(currentProject.id)+'&select=sort_order&order=sort_order.desc&limit=1');
   await write('project_segments',{project_id:currentProject.id,name,sort_order:(prev[0]?.sort_order||0)+1});
   pages.segments();
  }catch(e){fail(e);document.getElementById('pwSegSave').disabled=false;}
 };
};
pages.segment=async id=>{
 const s=(await rest('project_segments','?id=eq.'+enc(id)+'&select=*'))[0];if(!s)return pages.segments();
 const elements=await rest('project_elements','?segment_id=eq.'+enc(id)+'&select=*&order=sort_order.asc');
 const tasks=elements.length?await rest('project_element_tasks','?element_id=in.('+elements.map(e=>e.id).join(',')+')&select=*'):[];
 const list=elements.map((e,i)=>{
  const ts=tasks.filter(t=>t.element_id===e.id),pc=P.percent(ts);
  return '<button type="button" class="pw-list-item" data-pwel="'+e.id+'"><span class="pw-number">'+String(i+1).padStart(2,'0')+'</span>'+
  '<span class="pw-list-copy"><strong>'+esc(e.name)+'</strong><small>'+esc(e.category||'Komponenta')+(e.chainage?' · '+esc(e.chainage):'')+' · '+pc+'%</small>'+
  '<span class="pw-mini-progress"><i style="width:'+pc+'%"></i></span></span><span class="pw-row-arrow">↗</span></button>';
 }).join('');
 const content=sectionTitle(elements.length+' komponenata',isAdmin()?btn('pwAddEl','＋ Dodaj komponentu'):'')+
 (list?'<div class="pw-list">'+list+'</div>':empty('Nema komponenata','Dodaj prvi element i njegove zadatke.'))+
 (isAdmin()?'<div class="pw-muted pw-safety">Brisanje faze i komponenata ćemo omogućiti kroz posebnu bezbednu administraciju.</div>':'');
 screen(s.name,'KOMPONENTE FAZE',content,pages.segments);
 document.querySelectorAll('[data-pwel]').forEach(b=>b.onclick=()=>pages.element(b.dataset.pwel,id));
 if(isAdmin())document.getElementById('pwAddEl').onclick=()=>pages.addElement(id);
};
pages.addElement=segId=>{
 if(!isAdmin())return pages.segment(segId);
 const defaults=['Priprema radova','Polaganje cevi i kablova','Montaža opreme','Provera i ispitivanje','Puštanje u rad'].join('\n');
 screen('Nova komponenta','UNOS ELEMENTA',panel('<h2>Podaci o elementu</h2><div class="pw-two">'+
 field('pwElName','Naziv')+field('pwElCode','Oznaka')+field('pwElCat','Vrsta elementa')+field('pwElKm','Stacionaža')+
 '</div><label class="pw-field"><span>Zadaci (po jedan u svakom redu)</span><textarea id="pwElTasks" rows="7">'+defaults+'</textarea></label>'+
 '<p class="pw-muted">Predložene zadatke možeš izmeniti ili ukloniti.</p>'+btn('pwElSave','Sačuvaj komponentu')+msg),()=>pages.segment(segId));
 document.getElementById('pwElSave').onclick=async()=>{
  const name=document.getElementById('pwElName').value.trim();if(!name)return fail(Error('Unesi naziv elementa.'));
  const titles=[...new Set(document.getElementById('pwElTasks').value.split('\n').map(s=>s.trim()).filter(Boolean))];
  lock('pwElSave');
  try{
   const prev=await rest('project_elements','?segment_id=eq.'+enc(segId)+'&select=sort_order&order=sort_order.desc&limit=1');
   const created=await write('project_elements',{segment_id:segId,name,sort_order:(prev[0]?.sort_order||0)+1,
    code:document.getElementById('pwElCode').value.trim()||null,
    category:document.getElementById('pwElCat').value.trim()||null,
    chainage:document.getElementById('pwElKm').value.trim()||null});
   if(titles.length)await write('project_element_tasks',titles.map((title,i)=>({element_id:created[0].id,title,sort_order:i+1})));
   pages.segment(segId);
  }catch(e){fail(e);document.getElementById('pwElSave').disabled=false;}
 };
};
pages.element=async(id,segId)=>{
 const el=(await rest('project_elements','?id=eq.'+enc(id)+'&select=*'))[0];if(!el)return pages.segment(segId);
 const tasks=await rest('project_element_tasks','?element_id=eq.'+enc(id)+'&select=*&order=sort_order.asc');
 const items=tasks.map(t=>'<label class="pw-task"><input type="checkbox" data-pwtask="'+t.id+'"'+(t.is_complete?' checked':'')+(!canEdit()?' disabled':'')+'>'+
 '<span>'+esc(t.title)+'</span><small>'+(t.is_complete?'Urađeno':'U toku')+'</small></label>').join('');
 const add=isAdmin()?panel('<h2>Dodaj zadatak</h2>'+field('pwTaskName','Naziv zadatka')+btn('pwTaskSave','＋ Dodaj zadatak')+msg):'';
 screen(el.name,'PREGLED KOMPONENTE',(items?'<div class="pw-task-list">'+items+'</div>':empty('Nema zadataka','Dodaj prvi zadatak kako bi se pratio napredak.'))+add,()=>pages.segment(segId));
 document.querySelectorAll('[data-pwtask]').forEach(ch=>ch.onchange=async()=>{
  ch.disabled=true;
  try{await write('project_element_tasks',{is_complete:ch.checked,completed_at:ch.checked?new Date().toISOString():null,
   completed_by:ch.checked?session.user.id:null,updated_at:new Date().toISOString()},'PATCH','?id=eq.'+enc(ch.dataset.pwtask));}
  catch(e){alert(e.message);}
  pages.element(id,segId);
 });
 if(isAdmin())document.getElementById('pwTaskSave').onclick=async()=>{
  const title=document.getElementById('pwTaskName').value.trim();if(!title)return fail(Error('Unesi naziv zadatka.'));
  lock('pwTaskSave');
  try{await write('project_element_tasks',{element_id:id,title,sort_order:tasks.length+1});pages.element(id,segId);}
  catch(e){fail(e);document.getElementById('pwTaskSave').disabled=false;}
 };
};
})();