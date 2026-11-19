(function(){
'use strict';
const books=['Sveska 0','Sveska 5','Sveska 8'], MAX=25*1024*1024;
const T=window.PP32Sveske={};
const e=s=>esc(String(s??'')),q=s=>encodeURIComponent(String(s));
const admin=()=>!!isAdmin();
const valid=f=>!!f&&/\.pdf$/i.test(f.name)&&(!f.type||f.type==='application/pdf')&&f.size>0&&f.size<=MAX;
function check(r){if(!r?.id||currentRlc?.id!==r.id||currentProject?.code!=='pp32')throw Error('Izaberi RLC iz projekta PP32.')}
async function docs(r){return api('/rest/v1/documents?rlc_id=eq.'+q(r.id)+'&select=id,category,file_name,storage_path,uploaded_at&order=uploaded_at.desc&limit=300')}
function head(r,label){return '<main class="wrap sw-wrap"><button class="back" type="button" id="swBack">← '+e(label)+'</button><div class="sw-hero"><span>PP32 / PROJEKTNA DOKUMENTACIJA</span><h1>Dokumentacija · '+e(r.code)+'</h1><p>'+e(r.design_name||'Putni prelaz')+' · '+e(r.chainage||'')+'</p></div>'}
function back(action){const x=document.getElementById('swBack');if(x)x.onclick=action}
function fail(err){alert('Dokumentacija: '+(err?.message||String(err)))}
function current(r){return currentRlc?.id===r.id&&currentProject?.code==='pp32'}
T.open=async r=>{
 check(r);
 const all=await docs(r);if(!current(r))return;
 let html=head(r,r.code)+'<h2 class="sw-section-title">Projektne sveske</h2><p class="sw-lead">Izaberi svesku za pregled PDF dokumenata ovog prelaza.</p><div class="sw-grid">';
 for(const book of books){
  const n=all.filter(x=>x.category===book).length;
  html+='<button type="button" class="sw-folder" data-sw-book="'+book.slice(-1)+'"><span class="sw-folder-symbol">▤</span><span class="sw-count">'+n+' PDF</span><strong>'+book+'</strong><small>Projektna dokumentacija</small><span class="sw-link">Otvori svesku →</span></button>';
 }
 html+='</div></main>';shell(html);
 back(()=>window.rlc(r.id));
 document.querySelectorAll('[data-sw-book]').forEach(b=>{b.onclick=()=>T.openBook(r,'Sveska '+b.dataset.swBook).catch(fail)});
};
async function upload(r,book,f){
 if(!admin())throw Error('Samo ovlašćeni korisnik može dodavati dokumenta.');
 if(!valid(f))throw Error('Dozvoljen je PDF do 25 MB: '+f.name);
 const name=String(f.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]/g,'_').slice(-90)||'dokument.pdf';
 const path='documents/'+r.id+'/'+book.toLowerCase().replace(' ','-')+'/'+Date.now()+'_'+Math.random().toString(36).slice(2,9)+'_'+name;
 const url='/storage/v1/object/pp32-documents/'+path;
 await api(url,{method:'POST',headers:{'Content-Type':'application/pdf','x-upsert':'false'},body:f});
 try{
  await api('/rest/v1/documents',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({rlc_id:r.id,category:book,file_name:f.name,storage_path:path,version:1,is_current:true,uploaded_by:session.user.id})});
 }catch(err){try{await api(url,{method:'DELETE'})}catch(_){}throw err}
}
/* Brisanje se radi samo po potvrdi i samo za dokument unutar iste sveske/RLC-a.
   Najpre uklanjamo PDF iz privatnog skladista, zatim njegov DB zapis.
   Ako skladiste odbije zahtev, zapis ostaje netaknut. */
async function deletePdf(r,book,f){
 if(!admin())throw Error('Samo ovlašćeni administrator može obrisati PDF.');
 check(r);
 if(!books.includes(book)||!f?.id||!f.storage_path)throw Error('Nepoznat dokument.');
 const prefix='documents/'+r.id+'/'+book.toLowerCase().replace(' ','-')+'/';
 if(!String(f.storage_path).startsWith(prefix))throw Error('Putanja dokumenta ne odgovara izabranom RLC-u i svesci.');
 const rows=await api('/rest/v1/documents?id=eq.'+q(f.id)+'&rlc_id=eq.'+q(r.id)+
  '&select=id,category,storage_path&limit=1');
 if(rows?.length!==1||rows[0].category!==book||rows[0].storage_path!==f.storage_path)
  throw Error('Dokument je u međuvremenu promenjen ili uklonjen. Osveži svesku.');
 // Brisanje iz Storage-a radi preko postojece admin RLS dozvole.
 await api('/storage/v1/object/pp32-documents/'+f.storage_path,{method:'DELETE'});
 const removed=await api('/rest/v1/documents?id=eq.'+q(f.id)+'&rlc_id=eq.'+q(r.id)+
  '&category=eq.'+q(book),{method:'DELETE',headers:{Prefer:'return=representation'}});
 if(!Array.isArray(removed)||!removed.some(row=>row.id===f.id))
  throw Error('PDF je uklonjen iz skladišta, ali zapis nije potvrđeno uklonjen iz evidencije. Osveži svesku i proveri stanje.');
}
function openPdf(f,b){
 const tab=window.open('about:blank','_blank');
 if(tab){try{tab.document.title=f.file_name;tab.document.body.textContent='Učitavanje PDF-a…'}catch(_){}}
 b.disabled=true;
 signed(f.storage_path).then(url=>{if(tab)tab.location.replace(url);else window.location.assign(url)}).catch(err=>{if(tab)tab.close();fail(err)}).finally(()=>{if(b.isConnected)b.disabled=false});
}
T.openBook=async(r,book)=>{
 check(r);if(!books.includes(book))throw Error('Nepoznata sveska.');
 const all=await docs(r);if(!current(r))return;
 const files=all.filter(x=>x.category===book);
 let html=head(r,'Sve sveske')+'<div class="sw-heading"><div><h2>'+book+'</h2><p>PDF dokumenti za '+e(r.code)+'</p></div><span>'+files.length+' dokumenata</span></div>';
 if(admin())html+='<div class="sw-upload"><b>Dodaj PDF u '+book+'</b><p>Samostalno izaberi jedan ili više PDF fajlova.</p><input id="swFiles" type="file" multiple accept=".pdf,application/pdf"><button class="btn" type="button" id="swAdd" disabled>Dodaj PDF</button><small>Najviše 25 MB po dokumentu.</small><p id="swStatus" role="status" aria-live="polite"></p></div>';
 html+='<div class="sw-documents">';
 if(!files.length)html+='<div class="sw-empty">Sveska je spremna za dodavanje PDF dokumenata.</div>';
 files.forEach((f,i)=>{html+='<div class="sw-document"><span class="sw-pdf">PDF</span><div class="sw-document-name"><b>'+e(f.file_name)+'</b><small>'+e(book)+(f.uploaded_at?' · '+e(new Date(f.uploaded_at).toLocaleDateString('sr-RS')):'')+'</small></div><div class="sw-document-actions"><button class="btn sec small" type="button" data-sw-open="'+i+'">Otvori PDF</button>'+(admin()?'<button class="btn sec small sw-delete-button" type="button" data-sw-delete="'+i+'" aria-label="Obriši PDF '+e(f.file_name)+'">Obriši</button>':'')+'</div></div>'});
 html+='</div></main>';shell(html);back(()=>T.open(r).catch(fail));
 document.querySelectorAll('[data-sw-open]').forEach(b=>{b.onclick=()=>openPdf(files[Number(b.dataset.swOpen)],b)});
 if(!admin())return;
 document.querySelectorAll('[data-sw-delete]').forEach(button=>{
  button.onclick=async()=>{
   const file=files[Number(button.dataset.swDelete)];
   if(!file||!current(r))return;
   if(!confirm('Trajno obrisati PDF „'+file.file_name+'“ iz '+book+' za '+r.code+'?\n\nNakon brisanja dokument više neće biti dostupan gostima.'))return;
   button.disabled=true;
   const status=document.getElementById('swStatus');
   if(status)status.textContent='Brisanje PDF-a: '+file.file_name+'…';
   try{
    await deletePdf(r,book,file);
    await T.openBook(r,book);
    const msg=document.getElementById('swStatus');
    if(msg)msg.textContent='PDF „'+file.file_name+'“ je obrisan. Možeš dodati novu verziju dokumenta.';
   }catch(err){
    const reason=err?.message||String(err);
    if(status?.isConnected)status.textContent='Brisanje nije završeno: '+reason;
    alert('PDF nije obrisan. '+reason);
    if(button.isConnected)button.disabled=false;
   }
  };
 });
 const input=document.getElementById('swFiles'),button=document.getElementById('swAdd'),status=document.getElementById('swStatus');
 input.onchange=()=>{button.disabled=!input.files?.length;status.textContent=''};
 button.onclick=async()=>{
  const chosen=Array.from(input.files||[]);if(!chosen.length)return;
  if(chosen.some(f=>!valid(f))){status.textContent='Izaberi neprazne PDF fajlove do 25 MB.';return}
  input.disabled=button.disabled=true;let ok=0;const errors=[];
  for(const f of chosen){status.textContent='Otpremanje '+(ok+errors.length+1)+' / '+chosen.length+'…';try{await upload(r,book,f);ok++}catch(err){errors.push(f.name+': '+err.message)}}
  if(ok){
   try{await T.openBook(r,book)}catch(err){fail(err);return}
   const msg=document.getElementById('swStatus');if(msg)msg.textContent='Dodato '+ok+' PDF dokumenta.'+(errors.length?' Greške: '+errors.join('; '):'');
  }else{status.textContent=errors.join('; ');input.disabled=false;button.disabled=false}
 };
};
})();