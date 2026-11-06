/* PP32: reusable project workspace and administrator controls. */
(function(){
'use strict';
const P=window.PP32Workspace={pages:{}};
const originalHome=window.home, originalProject=window.project;
const enc=s=>encodeURIComponent(String(s));
const rest=(table,query='')=>api('/rest/v1/'+table+query);
const write=(table,data,method='POST',query='')=>api('/rest/v1/'+table+query,{method,headers:{Prefer:'return=representation'},body:JSON.stringify(data)});
const remove=(table,query)=>api('/rest/v1/'+table+query,{method:'DELETE',headers:{Prefer:'return=minimal'}});
P.enc=enc;P.rest=rest;P.write=write;P.remove=remove;
P.field=(id,title,value='',type='text')=>'<label class="pw-field"><span>'+esc(title)+'</span><input id="'+id+'" type="'+type+'" value="'+esc(value)+'"></label>';
P.area=(id,title,value='')=>'<label class="pw-field"><span>'+esc(title)+'</span><textarea id="'+id+'" rows="4">'+esc(value)+'</textarea></label>';
P.btn=(id,title,cls='')=>'<button id="'+id+'" type="button" class="pw-btn '+cls+'">'+title+'</button>';
P.panel=body=>'<section class="pw-panel">'+body+'</section>';
P.empty=(title,description)=>'<div class="pw-empty"><strong>'+esc(title)+'</strong><p>'+esc(description)+'</p></div>';
P.msg='<p class="pw-message" id="pwMessage" role="status"></p>';
P.fail=e=>{const el=document.getElementById('pwMessage');if(el)el.textContent=e?.message||String(e);else alert(e?.message||String(e));};
P.lock=(id)=>{const el=document.getElementById(id);if(el)el.disabled=true;};
P.screen=(title,kicker,body,back)=>{
 shell('<main class="wrap pw-workspace"><button class="pw-back" id="pwBack">← Nazad</button><header class="pw-section-hero"><span>'+esc(kicker)+'</span><h1>'+esc(title)+'</h1></header>'+body+'</main>');
 document.getElementById('pwBack').onclick=back||P.home;
};
P.reload=async()=>{
 const a=await rest('projects','?id=eq.'+enc(currentProject.id)+'&select=*');
 if(!a.length){home();throw Error('Projekat više ne postoji.');}
 currentProject=a[0];return currentProject;
};
P.data=async()=>{
 const segments=await rest('project_segments','?project_id=eq.'+enc(currentProject.id)+'&select=*&order=sort_order.asc');
 const elements=segments.length?await rest('project_elements','?segment_id=in.('+segments.map(x=>x.id).join(',')+')&select=*&order=sort_order.asc'):[];
 const tasks=elements.length?await rest('project_element_tasks','?element_id=in.('+elements.map(x=>x.id).join(',')+')&select=*'):[];
 return {segments,elements,tasks};
};
P.percent=elements=>workAverage(elements);
P.sectionTitle=(name,action='')=>'<div class="pw-section-title"><h2>'+esc(name)+'</h2>'+action+'</div>';
P.signed=async(path)=>{
 const d=await api('/storage/v1/object/sign/pp32-documents/'+enc(path).replace(/%2F/gi,'/'),{method:'POST',body:JSON.stringify({expiresIn:3600})});
 return URL+'/storage/v1'+(d.signedURL||d.signedUrl);
};
P.upload=async(file,group)=>{
 if(!file)throw Error('Izaberi fajl.');
 if(file.size>50*1024*1024)throw Error('Fajl je veći od dozvoljenih 50 MB na besplatnom planu.');
 const safe=file.name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9._-]/g,'_').slice(0,100)||'fajl';
 const path=group+'/'+currentProject.id+'/'+Date.now()+'_'+safe;
 await api('/storage/v1/object/pp32-documents/'+enc(path).replace(/%2F/gi,'/'),{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream'},body:file});
 return path;
};
P.home=async()=>{
 await P.reload();
 const d=await P.data(),pct=P.percent(d.elements);
 const cards=[
 ['segments','▦','Faze i komponente',d.segments.length+' faza · '+d.elements.length+' elemenata'],
 ['line','⌁','Linijska situacija',currentProject.line_storage_path?'Dokument dodat':'Dodaj PDF ili sliku'],
 ['documents','▤','Dokumentacija','Projektni dokumenti i verzije'],
 ['diary','▣','Građevinski dnevnik','Dnevni zapisi o radovima'],
 ['equipment','▥','Oprema i količine','Planirano i ugrađeno']
 ];
 const body='<main class="wrap pw-workspace"><button class="pw-back" id="pwBack">← Svi projekti</button>'+
 '<section class="pw-main-hero"><div><span>CENTRALNA EVIDENCIJA / PROJEKAT</span><h1>'+esc(currentProject.name)+'</h1><p>'+esc(currentProject.description||'Upravljanje radovima')+'</p>'+
 '<div class="pw-stats"><span>'+d.segments.length+' faza</span><span>'+d.elements.length+' elemenata</span><span>'+d.elements.filter(e=>e.work_status==='prepared').length+' pripremljeno</span></div></div>'+
 '<div class="pw-progress-panel"><small>REALIZACIJA</small><strong>'+pct+'%</strong><div class="pw-progress"><i style="width:'+pct+'%"></i></div></div></section>'+
 P.sectionTitle('Moduli projekta',isAdmin()?P.btn('pwSettings','⚙ Podešavanja','secondary'):'')+
 '<div class="pw-grid">'+cards.map(x=>'<button type="button" class="pw-module" data-pw="'+x[0]+'"><span class="pw-symbol">'+x[1]+'</span><span class="pw-module-label"><b>'+x[2]+'</b><small>'+esc(x[3])+'</small></span><b class="pw-arrow">↗</b></button>').join('')+'</div>'+
 (!d.segments.length&&isAdmin()?'<div class="pw-quickstart">Novi projekat je spreman. '+P.btn('pwFirst','＋ Kreiraj prvu fazu')+'</div>':'')+'</main>';
 shell(body);
 document.getElementById('pwBack').onclick=home;
 document.querySelectorAll('[data-pw]').forEach(b=>b.onclick=()=>P.pages[b.dataset.pw]());
 if(isAdmin()){
  document.getElementById('pwSettings').onclick=P.settings;
  if(document.getElementById('pwFirst'))document.getElementById('pwFirst').onclick=()=>P.pages.addSegment();
 }
};
window.project=async function(id){
 const ps=await rest('projects','?id=eq.'+enc(id)+'&select=*');
 if(!ps[0])return home();
 if(['pp32','cvetojevac-sobovica'].includes(ps[0].code))return originalProject(id);
 currentProject=ps[0];return P.home();
};
window.home=async function(){
 await originalHome();
 if(!isAdmin())return;
 document.querySelectorAll('.home-project-card[data-p]').forEach(card=>{
  if(card.querySelector('.pw-delete-project'))return;
  const b=document.createElement('button');
  b.type='button';b.className='pw-delete-project';b.textContent='Obriši projekat';
  b.onclick=e=>{e.preventDefault();e.stopPropagation();P.confirmDelete(card.dataset.p);};
  card.appendChild(b);
 });
};
P.settings=()=>{
 if(!isAdmin())return P.home();
 P.screen('Podešavanja projekta','ADMINISTRACIJA',P.panel('<h2>Osnovni podaci</h2>'+
 P.field('pwName','Naziv',currentProject.name)+P.area('pwDesc','Opis',currentProject.description||'')+
 '<p class="pw-muted">Kod projekta: '+esc(currentProject.code)+'</p>'+P.btn('pwSave','Sačuvaj')+P.msg)+
 '<section class="pw-danger"><div><b>Trajno brisanje projekta</b><p>Za brisanje su neophodne tri potvrde.</p></div>'+P.btn('pwDelete','Obriši projekat','danger')+'</section>',P.home);
 document.getElementById('pwSave').onclick=async()=>{
  const name=document.getElementById('pwName').value.trim();if(!name)return P.fail(Error('Unesi naziv.'));
  P.lock('pwSave');
  try{await write('projects',{name,description:document.getElementById('pwDesc').value.trim()||null},'PATCH','?id=eq.'+enc(currentProject.id));P.home();}
  catch(e){P.fail(e);document.getElementById('pwSave').disabled=false;}
 };
 document.getElementById('pwDelete').onclick=()=>P.confirmDelete(currentProject.id);
};
P.confirmDelete=async id=>{
 if(!isAdmin())return;
 try{
  const project=(await rest('projects','?id=eq.'+enc(id)+'&select=*'))[0];
  if(!project)return home();
  const typed=prompt('BRISANJE — KORAK 1 OD 3\n\nUnesi TAČAN naziv projekta:\n'+project.name);
  if(typed===null)return;
  if(typed!==project.name){alert('Naziv nije identičan. Brisanje je otkazano.');return;}
  if(!confirm('KORAK 2 OD 3\n\nObrisati projekat „'+project.name+'“ i sve njegove podatke i zadatke?'))return;
  if(!confirm('KORAK 3 OD 3\n\nPOSLEDNJA POTVRDA: Brisanje je nepovratno. Da li si potpuno siguran?'))return;
  const [docs,rlcs,cables]=await Promise.all([
   rest('project_documents','?project_id=eq.'+enc(id)+'&select=storage_path'),
   rest('rlcs','?project_id=eq.'+enc(id)+'&select=line_storage_path'),
   rest('project_cable_plans','?project_id=eq.'+enc(id)+'&select=project_id')
  ]);
  if(cables.length)throw Error('Ovaj projekat sadrži zaštićen plan kablova. Brisanje nije dozvoljeno pre izvoza plana.');
  const files=[project.line_storage_path,...docs.map(x=>x.storage_path),...rlcs.map(x=>x.line_storage_path)].filter(Boolean);
  await remove('projects','?id=eq.'+enc(id));
  const stillThere=await rest('projects','?id=eq.'+enc(id)+'&select=id');
  if(stillThere.length)throw Error('Brisanje nije potvrđeno. Podaci ostaju u bazi.');
  let warning='';
  if(files.length)try{
   await api('/storage/v1/object/pp32-documents',{method:'DELETE',body:JSON.stringify({prefixes:[...new Set(files)]})});
  }catch(e){warning=' Deo fajlova je ostao u skladištu.';}
  currentProject=null;alert('Projekat „'+project.name+'“ je obrisan.'+warning);home();
 }catch(e){alert('Brisanje nije završeno: '+(e.message||e));}
};
})();