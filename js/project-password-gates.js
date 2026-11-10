/* PP32: project-specific password gates, verified by server-side RLS/RPC.
 * Unlock tokens exist only in this tab's JS memory: F5 and a new login require password again.
 * Keep loaded last (before boot.js), after every other window.project/home wrapper.
 */
(function(){
 'use strict';
 const oldApi=window.api, oldProject=window.project, oldHome=window.home, oldSaveSession=window.saveSession;
 let unlocked=null; // {id, token} -- one project at a time, never persisted in browser storage.
 const enc=encodeURIComponent;
 const specificCodes=new Set(['pp32','cvetojevac-sobovica']);
 const isSuper=()=>typeof isSuperAdmin==='function' && isSuperAdmin();
 const errorText=e=>e?.message||String(e);
 const rpc=(name,payload)=>window.api('/rest/v1/rpc/'+name,{method:'POST',body:JSON.stringify(payload)});
 const eligible=project=>project && specificCodes.has(project.code);

 window.api=function(path,opt={}){
   if(!unlocked || !(/^\/(rest|storage)\/v1\//.test(path)))return oldApi(path,opt);
   const headers={...(opt.headers||{}),'x-client-info':JSON.stringify({[unlocked.id]:unlocked.token})};
   return oldApi(path,{...opt,headers});
 };
 window.saveSession=function(next){
   // Ignore an in-place access-token refresh; a real sign-in/logout clears the project unlock.
   if(!next || !session?.user?.id || session.user.id!==next?.user?.id || !session?.access_token)
     unlocked=null;
   return oldSaveSession(next);
 };
 const el=(tag,attrs={},text)=>{
   const node=document.createElement(tag);
   Object.entries(attrs).forEach(([key,value])=>{if(key==='class')node.className=value;else node.setAttribute(key,value)});
   if(text!=null)node.textContent=text;
   return node;
 };
 function modal(title,help,submitTitle,onSubmit){
   return new Promise(resolve=>{
     const backdrop=el('div',{class:'pg-backdrop'});
     const dialog=el('section',{class:'pg-dialog',role:'dialog','aria-modal':'true','aria-label':title});
     const h=el('h2',{},title),p=el('p',{},help);
     const form=el('form');
     const passLabel=el('label',{},'Šifra projekta');
     const pass=el('input',{type:'password',autocomplete:'off',minlength:'12',maxlength:'128',required:'',placeholder:'Unesi šifru projekta'});
     const confirmLabel=submitTitle==='Sačuvaj šifru'?el('label',{},'Ponovi novu šifru'):null;
     const confirm=confirmLabel?el('input',{type:'password',autocomplete:'off',minlength:'12',maxlength:'128',required:'',placeholder:'Ponovi šifru'}):null;
     const msg=el('p',{class:'pg-error',role:'alert'}),actions=el('div',{class:'pg-actions'});
     const cancel=el('button',{type:'button',class:'pg-cancel'},'Odustani');
     const submit=el('button',{type:'submit',class:'pg-submit'},submitTitle);
     function close(value){document.removeEventListener('keydown',escapeKey);backdrop.remove();resolve(value);}
     function escapeKey(e){if(e.key==='Escape')close(false);}
     cancel.onclick=()=>close(false);
     backdrop.addEventListener('click',e=>{if(e.target===backdrop)close(false)});
     document.addEventListener('keydown',escapeKey);
     actions.append(cancel,submit);passLabel.append(pass);form.append(passLabel);
     if(confirmLabel){confirmLabel.append(confirm);form.append(confirmLabel);}
     form.append(msg,actions);dialog.append(h,p,form);backdrop.append(dialog);document.body.append(backdrop);
     pass.focus();
     form.onsubmit=async e=>{
       e.preventDefault();
       if(confirm&&pass.value!==confirm.value){msg.textContent='Unete šifre se ne poklapaju.';return;}
       if(pass.value.length<12){msg.textContent='Šifra mora imati bar 12 znakova.';return;}
       submit.disabled=true;cancel.disabled=true;msg.textContent='';
       try{
         const result=await onSubmit(pass.value);
         if(result?.ok)close(true);
         else {msg.textContent=result?.error||'Provera nije uspela.';submit.disabled=false;cancel.disabled=false;}
       }catch(err){msg.textContent=errorText(err);submit.disabled=false;cancel.disabled=false;}
     };
   });
 }
 async function status(projectId){
   const response=await rpc('project_password_status',{p_project:projectId});
   return !!response?.enabled;
 }
 async function enter(projectId){
   const matches=await window.api('/rest/v1/projects?id=eq.'+enc(projectId)+'&select=id,code,name');
   const p=matches?.[0];if(!p){alert('Projekat nije dostupan.');return;}
   if(!eligible(p) || isSuper()) return oldProject(projectId);
   let required;
   try{required=await status(p.id)}catch(e){alert('Nije moguće proveriti zaštitu projekta: '+errorText(e));return;}
   if(!required)return oldProject(projectId);
   if(unlocked?.id===p.id)return oldProject(projectId);
   unlocked=null;
   const passed=await modal('Pristup projektu: '+p.name,
     'Za otvaranje projekta potrebna je posebna šifra. Novo prijavljivanje i osvežavanje stranice zahtevaju ponovni unos.',
     'Otvori projekat',async password=>{
       const result=await rpc('project_password_unlock',{p_project:p.id,p_password:password});
       if(result?.ok && typeof result.token==='string')unlocked={id:p.id,token:result.token};
       return result;
     });
   if(passed)return oldProject(projectId);
 }
 window.project=enter;
 async function settings(p){
   if(!isSuper())return;
   const enabled=await status(p.id);
   const passed=await modal('Podešavanje šifre: '+p.name,
     enabled?'Projekat je već zaštićen. Unos nove šifre odmah poništava prethodna otključavanja.':
       'Postavi zasebnu šifru ovom projektu. Odmah po čuvanju lideri i gosti moraju uneti šifru.',
     'Sačuvaj šifru',password=>rpc('project_password_set',{p_project:p.id,p_password:password}));
   if(passed){unlocked=null;alert('Šifra projekta je sačuvana. Ostali korisnici će morati da je unesu pri ulasku.');}
 }
 window.home=async function(){
   await oldHome();
   if(!isSuper())return;
   const cards=document.querySelectorAll('.home-project-card[data-p]');
   for(const card of cards){
     const id=card.dataset.p;
     if(card.querySelector('.pg-settings'))continue;
     const button=el('button',{type:'button',class:'pg-settings','aria-label':'Podesi šifru projekta'},'🔐 Šifra projekta');
     button.addEventListener('click',async e=>{
       e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
       button.disabled=true;
       try{
         const ps=await window.api('/rest/v1/projects?id=eq.'+enc(id)+'&select=id,code,name');
         if(ps?.[0]&&eligible(ps[0]))await settings(ps[0]);
       }catch(err){alert('Podešavanje nije uspelo: '+errorText(err))}
       finally{button.disabled=false;}
     });
     card.append(button);
   }
 };
})();