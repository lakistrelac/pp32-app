/* PP32 appearance settings: default, light, and admin-only red. */
(function(){
'use strict';
const KEY='pp32_theme_v1';
const themes={default:'Standardna',light:'Svetla',adminred:'Admin · crvena'};
function allowed(t){return t==='adminred'&&!isAdmin()?'default':(themes[t]?t:'default')}
function stored(){try{return localStorage.getItem(KEY)||'default'}catch(_){return 'default'}}
function apply(value,save){
 const theme=allowed(value);
 document.documentElement.dataset.pp32Theme=theme;
 if(save)try{localStorage.setItem(KEY,theme)}catch(_){}
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.setAttribute('content',theme==='adminred'?'#451c27':theme==='light'?'#e6f0f5':'#102b46');
 document.querySelectorAll('.pp32-theme-choice').forEach(b=>{
  const active=b.dataset.theme===theme;b.setAttribute('aria-pressed',String(active));
  b.classList.toggle('is-selected',active);
 });
 const trigger=document.getElementById('pp32ThemeToggle');
 if(trigger)trigger.setAttribute('aria-label','Izgled sajta: '+themes[theme]+'. Promeni temu');
 return theme;
}
function close(){
 const menu=document.getElementById('pp32ThemeMenu'),toggle=document.getElementById('pp32ThemeToggle');
 if(menu)menu.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false');
}
function install(){
 const top=document.querySelector('.topright');if(!top||document.getElementById('pp32ThemeToggle'))return;
 const container=document.createElement('div');container.className='pp32-theme-control';
 const toggle=document.createElement('button');toggle.type='button';toggle.id='pp32ThemeToggle';
 toggle.className='pp32-theme-toggle';toggle.setAttribute('aria-haspopup','true');toggle.setAttribute('aria-expanded','false');
 toggle.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg><span>Tema</span>';
 const menu=document.createElement('div');menu.id='pp32ThemeMenu';menu.className='pp32-theme-menu';menu.hidden=true;
 const title=document.createElement('div');title.className='pp32-theme-menu-title';title.textContent='IZGLED APLIKACIJE';menu.append(title);
 for(const [key,name,swatch] of [['default','Standardna','standard'],['light','Svetla','light'],...(isAdmin()?[['adminred','Admin · crvena','red']]:[])]){
  const button=document.createElement('button');button.type='button';button.className='pp32-theme-choice';button.dataset.theme=key;
  button.innerHTML='<span class="pp32-theme-swatch pp32-swatch-'+swatch+'" aria-hidden="true"></span><span>'+name+'</span><span class="pp32-theme-check" aria-hidden="true">✓</span>';
  button.onclick=()=>{apply(key,true);close()};menu.append(button);
 }
 toggle.onclick=()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open))};
 container.append(toggle,menu);top.insertBefore(container,top.querySelector('.role'));
 apply(stored(),false);
}
const previous=window.shell;
if(typeof previous!=='function')return;
window.PP32ThemeAbort?.abort();
window.PP32ThemeAbort=new AbortController();
document.addEventListener('pointerdown',event=>{
 const control=document.querySelector('.pp32-theme-control');
 if(control&&!control.contains(event.target))close();
},{signal:window.PP32ThemeAbort.signal});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape')close();
},{signal:window.PP32ThemeAbort.signal});
window.shell=function(body){previous(body);install()};
apply(stored(),false);
})();