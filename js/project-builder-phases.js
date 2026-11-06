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
  const pc=P.percent(els);
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
  const pc=workPercent(e.work_status);
  return '<button type="button" class="pw-list-item" data-pwel="'+e.id+'"><span class="pw-number">'+String(i+1).padStart(2,'0')+'</span>'+
  '<span class="pw-list-copy"><strong>'+esc(e.name)+'</strong><small>'+esc(e.category||'Komponenta')+(e.chainage?' · '+esc(e.chainage):'')+' · '+(e.work_status==='done'?'Urađen':e.work_status==='prepared'?'Pripremljen':'Bez statusa')+' · '+pc+'%</small>'+
  '<span class="pw-mini-progress"><i style="width:'+pc+'%"></i></span></span><span class="pw-row-arrow">↗</span></button>';
 }).join('');
 const content=sectionTitle(elements.length+' komponenata',isAdmin()?btn('pwAddEl','＋ Dodaj komponentu'):'')+
 (list?'<div class="pw-list">'+list+'</div>':empty('Nema komponenata','Dodaj prvi element za praćenje pripreme i završetka.'))+
 (isAdmin()?'<div class="pw-muted pw-safety">Brisanje faze i komponenata ćemo omogućiti kroz posebnu bezbednu administraciju.</div>':'');
 screen(s.name,'KOMPONENTE FAZE',content,pages.segments);
 document.querySelectorAll('[data-pwel]').forEach(b=>b.onclick=()=>pages.element(b.dataset.pwel,id));
 if(isAdmin())document.getElementById('pwAddEl').onclick=()=>pages.addElement(id);
};
pages.addElement=segId=>{
 if(!isAdmin())return pages.segment(segId);

 screen('Nova komponenta','UNOS ELEMENTA',panel('<h2>Podaci o elementu</h2><div class="pw-two">'+
 field('pwElName','Naziv')+field('pwElCode','Oznaka')+field('pwElCat','Vrsta elementa')+field('pwElKm','Stacionaža')+
 '</div>'+
 '<p class="pw-muted">Element se prati kroz dva koraka: pripremljen (50%) i urađen (100%).</p>'+btn('pwElSave','Sačuvaj komponentu')+msg),()=>pages.segment(segId));
 document.getElementById('pwElSave').onclick=async()=>{
  const name=document.getElementById('pwElName').value.trim();if(!name)return fail(Error('Unesi naziv elementa.'));

  lock('pwElSave');
  try{
   const prev=await rest('project_elements','?segment_id=eq.'+enc(segId)+'&select=sort_order&order=sort_order.desc&limit=1');
   const created=await write('project_elements',{segment_id:segId,name,sort_order:(prev[0]?.sort_order||0)+1,
    code:document.getElementById('pwElCode').value.trim()||null,
    category:document.getElementById('pwElCat').value.trim()||null,
    chainage:document.getElementById('pwElKm').value.trim()||null});

   pages.segment(segId);
  }catch(e){fail(e);document.getElementById('pwElSave').disabled=false;}
 };
};
pages.element=async(id,segId)=>{
 const el=(await rest('project_elements','?id=eq.'+enc(id)+'&select=*'))[0];
 if(!el)return pages.segment(segId);
 const percent=workPercent(el.work_status);
 const options=[['not_started','Bez statusa','0%'],['prepared','Pripremljen','50%'],['done','Urađen','100%']];
 screen(el.name,'STATUS KOMPONENTE',panel(
  '<h2>Realizacija: '+percent+'%</h2><p class="pw-muted">Pripremljen element vredi 50%, a urađen 100% ukupne vrednosti elementa.</p>'+
  '<div class="work-status-picks">'+options.map(([state,label,pct])=>
   '<button type="button" data-work="'+state+'" '+(!canEdit()?'disabled ':'')+
   (el.work_status===state?'class="work-current"':'')+'>'+label+' · '+pct+'</button>').join('')+'</div>'+
  '<p id="pwWorkMessage" class="pw-message" role="status"></p>'),()=>pages.segment(segId));
 document.querySelectorAll('[data-work]').forEach(button=>button.onclick=async()=>{
  if(!canEdit())return;
  button.disabled=true;
  const message=document.getElementById('pwWorkMessage');message.textContent='Čuvanje…';
  try{
   await api('/rest/v1/rpc/set_work_status',{method:'POST',body:JSON.stringify({
    p_scope:'project_element',p_target:id,p_status:button.dataset.work})});
   await pages.element(id,segId);
  }catch(error){message.textContent=error.message;button.disabled=false}
 });
};
})();
