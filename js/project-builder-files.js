/* Independent linijska situacija and document archive for new projects. */
(function(){
'use strict';
const P=window.PP32Workspace;if(!P)return;
const {pages,rest,write,enc,btn,field,panel,empty,screen,sectionTitle,msg,fail,lock}=P;
pages.line=async()=>{
 await P.reload();
 let content=empty('Linijska situacija nije dodata','Administrator može da otpremi PDF ili sliku kao osnovu projekta.');
 if(currentProject.line_storage_path){
  try{
   const link=await P.signed(currentProject.line_storage_path);
   const isPdf=/\.pdf$/i.test(currentProject.line_storage_path);
   content='<div class="pw-file-preview">'+(isPdf?'<object type="application/pdf" data="'+esc(link)+'"><a href="'+esc(link)+'" target="_blank" rel="noopener">Otvori PDF</a></object>':
    '<img src="'+esc(link)+'" alt="Linijska situacija projekta">')+'</div><a class="pw-doc-link" href="'+esc(link)+'" target="_blank" rel="noopener">Otvori originalni fajl ↗</a>';
  }catch(e){content=empty('Ne mogu da učitam fajl',e.message);}
 }
 if(isAdmin())content+=panel('<h2>'+(currentProject.line_storage_path?'Zameni':'Dodaj')+' linijsku situaciju</h2>'+
 '<label class="pw-field"><span>PDF ili slika (maksimalno 50 MB)</span><input id="pwLineFile" type="file" accept=".pdf,image/png,image/jpeg,image/webp"></label>'+
 btn('pwLineUpload','Sačuvaj linijsku situaciju')+msg);
 screen('Linijska situacija','TEHNIČKA DOKUMENTACIJA',content,P.home);
 if(!isAdmin())return;
 document.getElementById('pwLineUpload').onclick=async()=>{
  const file=document.getElementById('pwLineFile').files[0];
  if(!file)return fail(Error('Izaberi fajl.'));
  if(!(file.type==='application/pdf'||file.type.startsWith('image/')))return fail(Error('Podržani su PDF i slike.'));
  lock('pwLineUpload');
  let path=null;
  try{
   path=await P.upload(file,'project-lines');
   await write('projects',{line_storage_path:path},'PATCH','?id=eq.'+enc(currentProject.id));
   await P.reload();pages.line();
  }catch(e){fail(e);document.getElementById('pwLineUpload').disabled=false;}
 };
};
pages.documents=async()=>{
 const docs=await rest('project_documents','?project_id=eq.'+enc(currentProject.id)+'&select=*&order=uploaded_at.desc');
 const list=docs.length?'<div class="pw-doc-list">'+docs.map(d=>
  '<div class="pw-doc-row"><span class="pw-symbol">▤</span><div><strong>'+esc(d.file_name)+'</strong><small>'+esc(d.category)+' · verzija '+Number(d.version)+'</small></div>'+
  '<button type="button" class="pw-btn secondary" data-pwfile="'+esc(d.storage_path)+'">Otvori ↗</button></div>').join('')+'</div>':
  empty('Nema dokumenata','Možeš dodati projektne zadatke, nacrte, zapisnike i drugu dokumentaciju.');
 const upload=isAdmin()?panel('<h2>Dodaj dokument</h2>'+field('pwDocCategory','Kategorija','Ostalo')+
 '<label class="pw-field"><span>Izaberi fajl (do 50 MB)</span><input id="pwDocFile" type="file"></label>'+
 btn('pwDocSave','Sačuvaj dokument')+msg):'';
 screen('Dokumentacija','DOKUMENTI I VERZIJE',sectionTitle(docs.length+' dokumenata')+list+upload,P.home);
 document.querySelectorAll('[data-pwfile]').forEach(b=>b.onclick=async()=>{
  const w=window.open('about:blank','_blank');
  try{
   const link=await P.signed(b.dataset.pwfile);
   if(w){w.opener=null;w.location.href=link;}else{window.location.assign(link);}
  }catch(e){if(w)w.close();alert(e.message);}
 });
 if(!isAdmin())return;
 document.getElementById('pwDocSave').onclick=async()=>{
  const file=document.getElementById('pwDocFile').files[0];
  const category=document.getElementById('pwDocCategory').value.trim()||'Ostalo';
  if(!file)return fail(Error('Izaberi fajl.'));
  lock('pwDocSave');
  try{
   const path=await P.upload(file,'project-documents');
   const v=docs.filter(x=>x.category===category).reduce((m,x)=>Math.max(m,Number(x.version)||0),0)+1;
   await write('project_documents',{project_id:currentProject.id,category,file_name:file.name,storage_path:path,version:v,is_current:true,uploaded_by:session.user.id});
   pages.documents();
  }catch(e){fail(e);document.getElementById('pwDocSave').disabled=false;}
 };
};
})();