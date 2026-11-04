/* Project diary and equipment management; uses existing RLS-protected tables. */
(function(){
'use strict';
const P=window.PP32Workspace;if(!P)return;
const {pages,rest,write,enc,btn,field,area,panel,empty,screen,sectionTitle,msg,fail,lock}=P;
pages.diary=async()=>{
 const entries=await rest('project_diary_entries','?project_id=eq.'+enc(currentProject.id)+'&select=*&order=entry_date.desc');
 const add=canEdit()?panel('<h2>Novi dnevnički zapis</h2><div class="pw-two">'+
 field('pwDate','Datum',new Date().toLocaleDateString('en-CA'),'date')+
 field('pwDiaryNo','Broj zapisa')+field('pwTeam','Izvođač / ekipa')+
 field('pwResponsible','Odgovorno lice')+'</div>'+area('pwWork','Izvedeni radovi')+
 area('pwIssues','Problemi i zastoji')+area('pwNext','Plan za naredni dan')+
 btn('pwSaveDiary','Sačuvaj zapis')+msg):'';
 const list=entries.length?'<div class="pw-diary-list">'+entries.map(d=>'<article class="pw-diary-entry">'+
 '<div><b>'+esc(d.entry_date)+'</b><small>'+esc(d.entry_no||'Dnevni zapis')+'</small></div>'+
 '<p>'+esc(d.work_done)+'</p>'+(d.team?'<small>Ekipa: '+esc(d.team)+'</small>':'')+
 (d.issues?'<small>Problemi: '+esc(d.issues)+'</small>':'')+'</article>').join('')+'</div>':
 empty('Još nema zapisa','Dodaj prvi dnevnički zapis za ovaj projekat.');
 screen('Građevinski dnevnik','TERENSKI RADOVI',add+sectionTitle(entries.length+' zapisa')+list,P.home);
 if(!canEdit())return;
 document.getElementById('pwSaveDiary').onclick=async()=>{
  const work=document.getElementById('pwWork').value.trim();
  const date=document.getElementById('pwDate').value;
  if(!work||!date)return fail(Error('Datum i izvedeni radovi su obavezni.'));
  lock('pwSaveDiary');
  try{
   await write('project_diary_entries',{project_id:currentProject.id,entry_date:date,
    entry_no:document.getElementById('pwDiaryNo').value.trim()||null,
    team:document.getElementById('pwTeam').value.trim()||null,
    responsible_person:document.getElementById('pwResponsible').value.trim()||null,
    work_done:work,issues:document.getElementById('pwIssues').value.trim()||null,
    next_plan:document.getElementById('pwNext').value.trim()||null,
    created_by:session.user.id});
   pages.diary();
  }catch(e){fail(e);document.getElementById('pwSaveDiary').disabled=false;}
 };
};
pages.equipment=async()=>{
 const rows=await rest('project_equipment_items','?project_id=eq.'+enc(currentProject.id)+'&select=*&order=name.asc');
 const table=rows.length?'<div class="pw-table-wrap"><table><thead><tr><th>Oprema</th><th>Planirano</th><th>Ugrađeno</th><th>Preostalo</th>'+
 (isAdmin()?'<th>Izmena</th>':'')+'</tr></thead><tbody>'+rows.map(r=>
  '<tr><td><b>'+esc(r.name)+'</b><small>'+esc(r.unit)+'</small></td><td>'+Number(r.planned)+'</td>'+
  '<td>'+Number(r.installed)+'</td><td>'+Math.max(0,Number(r.planned)-Number(r.installed))+'</td>'+
  (isAdmin()?'<td><button class="pw-small-btn" type="button" data-pwequip="'+r.id+'">Izmeni</button></td>':'')+'</tr>'
 ).join('')+'</tbody></table></div>':
 empty('Nema stavki opreme','Dodaj planirane količine i prati ugrađene elemente.');
 const add=isAdmin()?panel('<h2>Dodaj opremu</h2><div class="pw-two">'+
 field('pwEqName','Naziv opreme')+field('pwEqUnit','Jedinica mere','kom')+
 field('pwEqPlanned','Planirano','0','number')+field('pwEqInstalled','Ugrađeno','0','number')+'</div>'+
 btn('pwSaveEquip','Dodaj opremu')+msg):'';
 screen('Oprema i količine','PLAN I REALIZACIJA',sectionTitle(rows.length+' stavki')+table+add,P.home);
 if(!isAdmin())return;
 document.querySelectorAll('[data-pwequip]').forEach(b=>b.onclick=async()=>{
  const item=rows.find(r=>r.id===b.dataset.pwequip);
  const entered=prompt('Nova ugrađena količina za „'+item.name+'“',String(item.installed));
  if(entered===null)return;
  const value=Number(entered.replace(',','.'));
  if(!Number.isFinite(value)||value<0)return alert('Unesi ispravnu količinu.');
  try{await write('project_equipment_items',{installed:value,updated_at:new Date().toISOString()},'PATCH','?id=eq.'+enc(item.id));pages.equipment();}
  catch(e){alert(e.message);}
 });
 document.getElementById('pwSaveEquip').onclick=async()=>{
  const name=document.getElementById('pwEqName').value.trim();
  const planned=Number(document.getElementById('pwEqPlanned').value);
  const installed=Number(document.getElementById('pwEqInstalled').value);
  if(!name||!Number.isFinite(planned)||planned<0||!Number.isFinite(installed)||installed<0)return fail(Error('Unesi naziv i ispravne količine.'));
  lock('pwSaveEquip');
  try{
   await write('project_equipment_items',{project_id:currentProject.id,name,unit:document.getElementById('pwEqUnit').value.trim()||'kom',planned,installed});
   pages.equipment();
  }catch(e){fail(e);document.getElementById('pwSaveEquip').disabled=false;}
 };
};
})();