/* PP32 original PDF project sheets · RLC 2–9, 18–29 and 31–36.
 * Uses the existing private Supabase storage bucket and RLC file field.
 * Uploads are admin-only, viewing respects signed storage access.
 * Does not change interactive SVG, progress or task statuses.
 */
(function(){
'use strict';
const P=window.PP32OriginalPDF={};
const safe=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isPdf=file=>!!file && /\.pdf$/i.test(file.name)&&(!file.type||file.type==='application/pdf');
const MAX_SIZE=25*1024*1024;
function filePath(rlc){
 return 'lines/'+rlc.id+'/'+Date.now()+'_'+String(rlc.code||'RLC').replace(/[^a-zA-Z0-9_-]/g,'')+'_original.pdf';
}
async function upload(file,rlc){
 if(!isPdf(file))throw Error('Izaberi originalni PDF dokument.');
 if(file.size>MAX_SIZE)throw Error('Fajl je veći od dozvoljenih 25 MB.');
 if(!isAdmin())throw Error('Samo administrator može dodati projektni PDF.');
 const path=filePath(rlc);
 await api('/storage/v1/object/pp32-documents/'+path,{
  method:'POST',
  headers:{'Content-Type':'application/pdf','x-upsert':'false'},
  body:file
 });
 await api('/rest/v1/rlcs?id=eq.'+encodeURIComponent(rlc.id),{
  method:'PATCH',headers:{Prefer:'return=minimal'},
  body:JSON.stringify({line_storage_path:path,updated_at:new Date().toISOString()})
 });
 rlc.line_storage_path=path;
 return path;
}
P.controls=function(rlc){
 const exists=!!rlc?.line_storage_path;
 return '<div class="pp32-pdf-controls">'+
 '<button id="pp32OriginalPdf" type="button" class="pp32-pdf-open" '+(exists?'':'disabled aria-disabled="true"')+
 ' title="'+(exists?'Otvori originalnu linijsku situaciju':'Originalni PDF još nije dodat')+'">'+
 '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
 '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v6h5M9 14h7M9 17h7"/>'+
 '</svg><span>Originalni PDF</span></button>'+
 (isAdmin()?'<label class="pp32-pdf-upload"><span>＋ '+(exists?'Zameni PDF':'Dodaj PDF')+'</span>'+
 '<input type="file" id="pp32PdfUpload" accept=".pdf,application/pdf" hidden></label>':'')+
 '<span class="pp32-pdf-file-state">'+(exists?'PDF dostupan':'PDF nije povezan')+'</span>'+
 '</div>';
};
P.attach=function(rlc,reload){
 const button=document.getElementById('pp32OriginalPdf');
 if(button&&!button.disabled)button.onclick=async()=>{
  // Browser popup blockers require opening a new tab directly on the click.
  const tab=window.open('about:blank','_blank');
  if(tab){try{tab.document.title='Originalna linijska situacija';tab.document.body.textContent='Učitavanje projektnog PDF-a…'}catch(_){}}
  button.disabled=true;
  try{
   const url=await signed(rlc.line_storage_path);
   if(tab)tab.location.replace(url);
   else window.location.assign(url);
  }catch(error){
   if(tab)tab.close();
   alert('Originalni PDF nije moguće otvoriti: '+(error?.message||String(error)));
  }finally{if(button.isConnected)button.disabled=false}
 };
 const input=document.getElementById('pp32PdfUpload');
 if(input)input.onchange=async()=>{
  const file=input.files?.[0];if(!file)return;
  const span=input.parentElement.querySelector('span'),original=span.textContent;
  input.disabled=true;span.textContent='Otpremanje PDF-a…';
  try{
   await upload(file,rlc);
   await reload();
  }catch(error){alert('Dodavanje PDF-a nije uspelo: '+(error?.message||String(error)))}
  finally{if(input.isConnected){input.disabled=false;input.value='';span.textContent=original}}
 };
};
/* PDF upload and original drawing access stay visible on the RLC overview,
 * even before the interactive diagram has been opened.
 */
const previousRlc=window.rlc;
if(typeof previousRlc==='function')window.rlc=async function(rlcId){
 await previousRlc(rlcId);
 if(currentProject?.code!=='pp32'||!currentRlc?.id||String(currentRlc.id)!==String(rlcId))return;
 const tiles=document.querySelector('.tiles');
 if(!tiles||document.getElementById('pp32PdfUpload'))return;
 const section=document.createElement('section');
 section.className='pp32-pdf-strip pp32-pdf-rlc-entry';
 section.innerHTML='<div class="pp32-pdf-strip-copy"><b>Originalni projektni PDF · '+safe(currentRlc.code)+'</b>'+
 '<span>Dodaj svoju izvornu linijsku situaciju. PDF ostaje odvojen od interaktivne šeme.</span></div>'+
 P.controls(currentRlc);
 tiles.parentElement.insertBefore(section,tiles);
 P.attach(currentRlc,()=>window.rlc(rlcId));
};
const previousProject=window.project;
if(typeof previousProject==='function')window.project=async function(projectId){
 await previousProject(projectId);
 if(currentProject?.code!=='pp32'||!isAdmin())return;
 const grid=document.querySelector('.rlcgrid');
 if(!grid||document.getElementById('pp32PdfBatchInput'))return;
 const section=document.createElement('section');
 section.className='pp32-pdf-batch';
 section.innerHTML='<div class="pp32-pdf-batch-copy"><b>Originalni PDF-ovi · pojedinačno ili grupno</b>'+
 '<span>Poveži sve linijske situacije odjednom. Naziv može sadržati RLC broj (npr. RLC23.pdf). Tri originalna fajla bez broja prepoznaju se po nazivu: osnovni → RLC18, (1) → RLC19, (2) → RLC20. Za novi set, nazivi 3(2).pdf označavaju RLC35, a 3(3).pdf RLC28. Takođe možeš da dodaš bilo koji PDF direktno unutar svog RLC-a.</span></div>'+
 '<label class="pp32-pdf-batch-button"><span>＋ Dodaj više PDF-ova</span>'+
 '<input id="pp32PdfBatchInput" type="file" multiple accept=".pdf,application/pdf" hidden></label>'+
 '<div class="pp32-pdf-batch-results" id="pp32PdfBatchResults" role="status" aria-live="polite"></div>';
 grid.parentElement.insertBefore(section,grid);
 const input=section.querySelector('#pp32PdfBatchInput'),result=section.querySelector('#pp32PdfBatchResults');
 input.onchange=async()=>{
  const files=[...input.files||[]];if(!files.length)return;
  input.disabled=true;const label=section.querySelector('.pp32-pdf-batch-button span');label.textContent='Otpremanje…';
  const seen=new Set(),valid=[],errors=[];
  for(const file of files){
   const found=file.name.match(/\bRLC\s*0*(\d+)\b/i);
   let code=found?'RLC'+Number(found[1]):null;
   const legacy=file.name.match(/^3\s*-\s*Linijska situacija sa planom kablova putnog prelaza(?:\(([12])\))?\.pdf$/i);
   if(!code&&legacy)code='RLC'+(legacy[1]?18+Number(legacy[1]):18);
   if(!code&&/^3\(2\)\.pdf$/i.test(file.name))code='RLC35';
   if(!code&&/^3\(3\)\.pdf$/i.test(file.name))code='RLC28'; // exact supplied file for Lajkovac PBJ-1
   if(!isPdf(file)||!code||!(Number(code.slice(3))>=2&&Number(code.slice(3))<=9||(Number(code.slice(3))>=18&&Number(code.slice(3))<=29||Number(code.slice(3))>=31&&Number(code.slice(3))<=36))){
    errors.push(safe(file.name)+': RLC broj nije prepoznat (podržani 2–9, 18–29 i 31–36)');continue
   }
   if(seen.has(code)){errors.push(code+': izabran je više puta');continue}
   seen.add(code);valid.push({code,file});
  }
  try{
   const rs=await api('/rest/v1/rlcs?project_id=eq.'+encodeURIComponent(currentProject.id)+'&select=id,code,line_storage_path');
   const byCode=new Map(rs.map(row=>[row.code,row]));let count=0;
   for(const {code,file} of valid){
    const rlc=byCode.get(code);
    if(!rlc){errors.push(code+': prelaz nije pronađen');continue}
    try{await upload(file,rlc);count++;result.textContent='Sačuvano '+count+' / '+valid.length+' PDF-ova…';}
    catch(e){errors.push(code+': '+(e?.message||String(e)))}
   }
   result.innerHTML='<strong>Uspešno povezano: '+count+' od '+valid.length+'.</strong>'+
    (errors.length?'<ul>'+errors.map(x=>'<li>'+safe(x)+'</li>').join('')+'</ul>':
    '<span> PDF-ovi su sada dostupni u odgovarajućim interaktivnim linijskim situacijama.</span>');
  }catch(e){result.textContent='Greška: '+(e?.message||String(e))}
  finally{input.value='';input.disabled=false;label.textContent='＋ Dodaj više PDF-ova'}
 };
};
})();