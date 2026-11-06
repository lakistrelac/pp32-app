/* PP32 path navigation: Home → 32 PP → RLC → module.
   Links use original app navigation functions, preserving permissions and state.
   No database writes, route mutations, or browser history assumptions.
*/
(function(){
'use strict';
const previous=window.shell;
if(typeof previous!=='function')return;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function heading(html){
 const temp=document.createElement('div');temp.innerHTML=html;
 return (temp.querySelector('.wrap h1, main.wrap h1')?.textContent||'').replace(/\s+/g,' ').trim();
}
function route(html){
 if(!profile?.active||currentProject?.code!=='pp32'||!currentProject?.id)return null;
 // Project selector and user-management pages are not PP32 project descendants.
 if(/class=["'][^"']*\bhome-page\b/.test(html)||html.includes('class="home-project-grid"')||
    html.includes('id="usersBtn"')||html.includes('id="guideBtn"'))return null;
 const isProjectList=/class=["'][^"']*\brlcgrid\b/.test(html);
 const isOverview=html.includes('Kablovska rekapitulacija')||html.includes('Kablovska <em>rekapitulacija');
 const isProjectCable=html.includes('cw-page')&&isOverview;
 const rlc=currentRlc?.id&&currentRlc?.code&&
  (html.includes('data-mod=')||html.includes('id="ilBack"')||html.includes('id="ilmBack"')||
   html.includes('class="wrap il-page"')||html.includes('class="wrap rp-page"')||
   (html.includes(currentRlc.code)&&!isProjectCable&&!isProjectList));
 if(!isProjectList&&!isProjectCable&&!rlc)return null;
 const steps=[
  {name:'Početna',icon:'⌂',go:()=>home()},
  {name:'32 putna prelaza',icon:'▤',go:()=>project(currentProject.id)}
 ];
 if(isProjectList)return steps;
 if(isProjectCable){steps.push({name:'Kablovska rekapitulacija',icon:'▣'});return steps}
 const id=currentRlc.id;
 const landing=html.includes('data-mod=')&&!html.includes('class="wrap rp-page"');
 steps.push({name:currentRlc.code,icon:'↔',go:()=>rlc(id)});
 if(!landing){
  let name=heading(html).replace(/\s*·\s*RLC\s*\d+.*$/i,'').trim();
  if(html.includes('class="wrap il-page"'))name='Linijska situacija';
  else if(html.includes('class="wrap rp-page"'))name='PRINT';
  else if(html.includes('class="wrap cw-page"'))name='Kablovi';
  steps.push({name:name||'Modul',icon:'◉'});
 }
 return steps;
}
function item(step,active){
 const b=document.createElement('button');b.type='button';b.className='pp32-nav-path-item';
 b.innerHTML='<span class="pp32-path-icon" aria-hidden="true">'+step.icon+'</span>'+
  '<span class="pp32-path-text">'+E(step.name)+'</span>';
 if(active){b.disabled=true;b.setAttribute('aria-current','page')}
 else b.onclick=()=>{b.disabled=true;Promise.resolve().then(step.go).catch(e=>{b.disabled=false;alert(e?.message||String(e))})};
 return b;
}
window.shell=function(body){
 previous(body);
 APP.classList.remove('pp32-with-rail'); // Clear stale sidebar layout on Home, Uputstvo, auth and other projects.
 const steps=route(body);
 if(!steps)return;
 const nav=document.createElement('nav');
 nav.className='pp32-nav-path';nav.setAttribute('aria-label','Putanja navigacije');
 nav.innerHTML='<div class="pp32-nav-path-title">GDE SE NALAZIŠ</div>';
 const list=document.createElement('div');list.className='pp32-nav-path-list';
 steps.forEach((step,i)=>list.append(item(step,i===steps.length-1)));
 nav.append(list);
 const hint=document.createElement('p');hint.className='pp32-nav-path-hint';
 hint.textContent='Izaberi prethodni korak za direktan povratak.';
 nav.append(hint);
 const main=APP.querySelector('.wrap');
 if(main)APP.insertBefore(nav,main);
 else APP.append(nav);
 APP.classList.add('pp32-with-rail');
};
})();