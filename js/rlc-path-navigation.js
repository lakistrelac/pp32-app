/* PP32 navigation trail: lightweight left-hand path on RLC screens.
 * Does not alter routing, permissions, database writes or existing back actions.
 */
(function(){
'use strict';
const previous=window.shell;
if(typeof previous!=='function')return;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=html=>{const holder=document.createElement('div');holder.innerHTML=html;
 const title=holder.querySelector('.wrap h1,main.wrap h1');
 return (title?.textContent||'').replace(/\s+/g,' ').trim();
};
const isRlcScreen=html=>{
 if(!currentRlc?.id||currentProject?.code!=='pp32')return false;
 // Project list and home must never inherit stale currentRlc state.
 if(/class=["'][^"']*\brlcgrid\b/.test(html)||/data-p=/.test(html))return false;
 return html.includes('id="bp"')||html.includes('id="ilBack"')||
  html.includes('id="ilmBack"')||
  html.includes('← '+currentRlc.code)||
  html.includes('· '+currentRlc.code)||
  html.includes('data-mod=')||
  /class=["'][^"']*\bil-page\b/.test(html);
};
function createItem(text,icon,active,action){
 const button=document.createElement('button');
 button.type='button';button.className='pp32-nav-path-item';
 button.innerHTML='<span class="pp32-path-icon" aria-hidden="true">'+icon+'</span>'+
 '<span class="pp32-path-text">'+E(text)+'</span>';
 if(active){button.disabled=true;button.setAttribute('aria-current','page')}
 else button.onclick=()=>{button.disabled=true;Promise.resolve().then(action).catch(e=>{button.disabled=false;alert(e?.message||String(e))})};
 return button;
}
window.shell=function(body){
 previous(body);
 if(!isRlcScreen(body))return;
 const rlcId=currentRlc.id,projectId=currentRlc.project_id||currentProject?.id;
 const name=label(body);
 const landing=body.includes('id="bp"')||body.includes('data-mod=');
 const title=landing?null:(name||'Modul');
 const rail=document.createElement('nav');
 rail.className='pp32-nav-path';rail.setAttribute('aria-label','Putanja navigacije');
 rail.innerHTML='<div class="pp32-nav-path-title">PUTANJA KRETANJA</div>';
 const list=document.createElement('div');list.className='pp32-nav-path-list';
 list.append(
  createItem('Početna','⌂',false,()=>home()),
  createItem('32 putna prelaza','▤',false,()=>project(projectId)),
  createItem(currentRlc.code,'↔',landing,()=>rlc(rlcId))
 );
 if(title)list.append(createItem(title,'◉',true,()=>{}));
 rail.append(list);
 const hint=document.createElement('div');hint.className='pp32-nav-path-hint';
 hint.textContent='Klikni na bilo koji prethodni korak da se odmah vratiš.';
 rail.append(hint);
 const main=APP.querySelector('.wrap');
 if(main)APP.insertBefore(rail,main);
 else APP.append(rail);
 APP.classList.add('pp32-with-rail');
};
})();
