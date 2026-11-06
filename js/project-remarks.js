/* Project remarks for every project; global review for admins and leaders.
 * Authenticated authors can submit; authors see their own. Reviewers see every remark.
 * Identity and allowed status changes are enforced by Supabase RLS and triggers.
 */
(function(){
'use strict';
const R=window.PP32Remarks={};
const e=value=>esc(value==null?'':String(value));
const q=value=>encodeURIComponent(String(value));
const active=()=>!!profile?.active&&!!session?.user?.id;
const manager=()=>isAdmin();
const statusNames={open:'Novo',in_progress:'U obradi',resolved:'Rešeno'};
const areas=['Radovi na terenu','Projektna dokumentacija','Linijska situacija','Oprema i materijal','Bezbednost','Rokovi i organizacija','Ostalo'];
const fmtDate=value=>{try{return new Intl.DateTimeFormat('sr-RS',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch(_){return '—'}};
R.open=async function(projectId=null){
 if(!active())return alert('Prijavi se da bi pristupio primedbama.');
 const isGlobal=!projectId;
 if(isGlobal&&!manager())return alert('Samo administrator i lider mogu pregledati sve primedbe.');
 try{
  const project=isGlobal?null:(currentProject?.id===projectId?currentProject:(await api('/rest/v1/projects?id=eq.'+q(projectId)+'&select=id,name,code'))[0]);
  if(!isGlobal&&!project)return alert('Projekat nije pronađen ili nemaš pristup.');
  const path='/rest/v1/project_remarks?select=*,projects(name,code)'+(project?'&project_id=eq.'+q(project.id):'')+'&order=created_at.desc&limit=500';
  const entries=await api(path);
  const open=entries.filter(x=>x.status==='open').length;
  const working=entries.filter(x=>x.status==='in_progress').length;
  const done=entries.filter(x=>x.status==='resolved').length;
  const title=isGlobal?'Primedbe · svi projekti':'Primedbe · '+project.name;
  let html='<main class="wrap pr-page"><button type="button" class="back" id="prBack">← '+(isGlobal?'Početna':e(project.name))+'</button>'+
   '<header class="pr-hero"><div><span class="pr-kicker">EVIDENCIJA ZAPAŽANJA / TEHNIČKE PRIMEDBE</span><h1>'+e(title)+'</h1>'+
   '<p>'+(manager()?'Pregledaj autora, projekat, predmet i status svake objavljene primedbe.':'Pošalji primedbu vezanu za projekat i prati svoje objave.')+'</p></div>'+
   '<div class="pr-stats"><span><b>'+entries.length+'</b> ukupno</span><span><b>'+open+'</b> novih</span><span><b>'+working+'</b> u obradi</span><span><b>'+done+'</b> rešenih</span></div></header>';
  if(project){
   html+='<section class="pr-compose"><div class="pr-section-head"><div><b>Nova primedba</b><p>Primedba se beleži uz tvoj nalog, datum i izabrani projekat.</p></div></div>'+
    '<form id="prForm" class="pr-form"><div class="pr-fields">'+
     '<label>Projekat<input value="'+e(project.name)+'" disabled></label>'+
     '<label>Ime podnosioca<input value="'+e((profile?.full_name||'').trim()||profile?.email||'')+'" disabled></label>'+
     '<label>Oblast<select id="prArea">'+areas.map(x=>'<option>'+e(x)+'</option>').join('')+'</select></label>'+
     '<label>RLC / stacionaža / oznaka (opciono)<input id="prRef" maxlength="160" placeholder="npr. RLC 3 · km 67+690"></label>'+
     '<label class="pr-full">Na šta se primedba odnosi?<input id="prSubject" minlength="3" maxlength="180" required placeholder="npr. Nije obeležena pozicija senzora"></label>'+
     '<label class="pr-full">Opis primedbe<textarea id="prDetails" rows="4" minlength="5" maxlength="10000" required placeholder="Opiši uočeni problem ili predlog što preciznije…"></textarea></label>'+
    '</div><div class="pr-form-foot"><span id="prMessage" role="status"></span><button class="btn" id="prSubmit" type="submit">Objavi primedbu</button></div></form></section>';
  }
  html+='<section class="pr-feed"><div class="pr-section-head"><div><b>'+(manager()?'Objavljene primedbe':'Moje objavljene primedbe')+'</b>'+
   '<p>'+(isGlobal?'Sve primedbe iz dostupnih projekata.':e(project.name))+'</p></div>'+
   '<label class="pr-filter-label">Status<select id="prFilter"><option value="all">Svi statusi</option><option value="open">Nove</option><option value="in_progress">U obradi</option><option value="resolved">Rešene</option></select></label></div>'+
   '<div id="prEntries" class="pr-entries">'+(entries.length?entries.map(x=>card(x)).join(''):'<div class="pr-empty">Još nema objavljenih primedbi.</div>')+'</div></section></main>';
  shell(html);
  document.getElementById('prBack').onclick=()=>isGlobal?home():window.project(project.id);
  const filter=document.getElementById('prFilter');
  filter.onchange=()=>document.querySelectorAll('.pr-entry').forEach(el=>{el.hidden=filter.value!=='all'&&el.dataset.status!==filter.value});
  document.querySelectorAll('[data-pr-status]').forEach(select=>select.onchange=async()=>{
   if(!manager())return;
   const previous=select.dataset.original,next=select.value;
   select.disabled=true;
   try{
    const saved=await api('/rest/v1/project_remarks?id=eq.'+q(select.dataset.prStatus),{
     method:'PATCH',headers:{Prefer:'return=representation'},
     body:JSON.stringify({status:next})
    });
    if(!saved?.length)throw Error('Promena statusa nije potvrđena.');
    select.dataset.original=next;
    const item=select.closest('.pr-entry');
    item.dataset.status=next;
    const badge=item.querySelector('.pr-status');
    badge.className='pr-status pr-status-'+next;badge.textContent=statusNames[next];
    if(filter.value!=='all'&&filter.value!==next)item.hidden=true;
   }catch(error){select.value=previous;alert('Status nije sačuvan: '+(error?.message||String(error)))}
   finally{select.disabled=false}
  });
  const form=document.getElementById('prForm');
  if(form)form.onsubmit=async event=>{
   event.preventDefault();
   const subject=document.getElementById('prSubject').value.trim(),details=document.getElementById('prDetails').value.trim(),
    area=document.getElementById('prArea').value,reference=document.getElementById('prRef').value.trim();
   const msg=document.getElementById('prMessage'),btn=document.getElementById('prSubmit');
   if(subject.length<3||details.length<5){msg.textContent='Unesi predmet i opis primedbe.';return}
   btn.disabled=true;msg.textContent='Objavljivanje…';
   try{
    await api('/rest/v1/project_remarks',{method:'POST',headers:{Prefer:'return=minimal'},
     body:JSON.stringify({project_id:project.id,author_id:session.user.id,
      author_name:(profile.full_name||'').trim()||profile.email,author_email:profile.email||null,
      area,reference:reference||null,subject,details})
    });
    await R.open(project.id);
    const flash=document.getElementById('prMessage');
    if(flash)flash.textContent='Primedba je objavljena i sačuvana u evidenciji.';
   }catch(error){msg.textContent='Neuspešno objavljivanje: '+(error?.message||String(error));btn.disabled=false}
  };
 }catch(error){alert('Primedbe nije moguće učitati: '+(error?.message||String(error)))}
};
function card(x){
 const status=statusNames[x.status]||statusNames.open;
 const owner=x.author_name||x.author_email||'Nepoznat autor';
 const refer=x.reference?'<span>⌖ '+e(x.reference)+'</span>':'';
 const project=x.projects?.name||'Projekat';
 return '<article class="pr-entry" data-status="'+e(x.status)+'">'+
  '<div class="pr-entry-top"><div><span class="pr-project">'+e(project)+'</span><span class="pr-area">'+e(x.area)+'</span></div>'+
  '<span class="pr-status pr-status-'+e(x.status)+'">'+status+'</span></div>'+
  '<h3>'+e(x.subject)+'</h3><p class="pr-details">'+e(x.details)+'</p>'+
  '<div class="pr-meta"><span>👤 '+e(owner)+'</span>'+(manager()&&x.author_email?'<span>✉ '+e(x.author_email)+'</span>':'')+
  '<span>◷ '+e(fmtDate(x.created_at))+'</span>'+refer+'</div>'+
  (manager()?'<label class="pr-review">Status <select data-pr-status="'+e(x.id)+'" data-original="'+e(x.status)+'">'+
   Object.entries(statusNames).map(([key,name])=>'<option value="'+key+'" '+(x.status===key?'selected':'')+'>'+name+'</option>').join('')+'</select></label>':'')+'</article>';
}
function addProjectLink(id){
 if(!currentProject||currentProject.id!==id||!active())return;
 const target=document.querySelector('.rlcgrid'),work=document.querySelector('.pw-grid'),modules=document.querySelector('.tiles [data-cmod]');
 if(target){
  if(document.getElementById('prProjectLink'))return;
  const btn=document.createElement('button');btn.type='button';btn.id='prProjectLink';btn.className='pr-project-link';
  btn.innerHTML='<span class="pr-link-icon">✎</span><span><b>Primedbe</b><small>Objavi zapažanje ili pregledaj primedbe ovog projekta</small></span><strong>Otvori ↗</strong>';
  target.parentElement.insertBefore(btn,target);btn.onclick=()=>R.open(id);return;
 }
 if(work){
  if(document.getElementById('prProjectLink'))return;
  const btn=document.createElement('button');btn.type='button';btn.id='prProjectLink';btn.className='pw-module pr-pw-module';
  btn.innerHTML='<span class="pw-symbol">✎</span><span class="pw-module-label"><b>Primedbe</b><small>Zapažanja i prijave vezane za projekat</small></span><b class="pw-arrow">↗</b>';
  work.append(btn);btn.onclick=()=>R.open(id);return;
 }
 if(modules){
  if(document.getElementById('prProjectLink'))return;
  const btn=document.createElement('button');btn.type='button';btn.id='prProjectLink';btn.className='tile pr-corridor-tile';
  btn.innerHTML='<span class="pr-link-icon">✎</span><b>Primedbe</b><span class="sub">Objavi primedbu · Pregled</span>';
  modules.parentElement.append(btn);btn.onclick=()=>R.open(id);return;
 }
 // Other project pages: add a clearly visible shortcut to the project header.
 const wrap=document.querySelector('.wrap');
 if(wrap&&!document.getElementById('prProjectLink')){
  const btn=document.createElement('button');btn.type='button';btn.id='prProjectLink';btn.className='pr-project-link';
  btn.innerHTML='<span class="pr-link-icon">✎</span><b>Primedbe projekta</b><strong>Otvori ↗</strong>';
  wrap.append(btn);btn.onclick=()=>R.open(id);
 }
}
const previousProject=window.project;
if(typeof previousProject==='function')window.project=async function(id){
 await previousProject(id);
 addProjectLink(id);
};
const previousHome=window.home;
if(typeof previousHome==='function')window.home=async function(){
 await previousHome();
 if(!manager())return;
 const parent=document.querySelector('.home-admin-actions,.adminbar .btnrow');
 if(parent&&!document.getElementById('prAllRemarks')){
  const btn=document.createElement('button');btn.type='button';btn.id='prAllRemarks';btn.className='btn sec small pr-all-button';
  btn.textContent='✎ Primedbe · svi projekti';parent.append(btn);
  btn.onclick=()=>R.open();
 }
};
})();