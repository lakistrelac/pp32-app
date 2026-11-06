/* Stable PP32 navigation: Home -> Project -> RLC -> active module.
 * Detect screens from rendered structure, never from a stale RLC substring.
 * Navigate with the latest window handlers, including PRINT and interactive lines.
 */
(function(){
'use strict';
const previous=window.shell;
if(typeof previous!=='function')return;
const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const has=(html,text)=>html.includes(text);
function heading(html){
 const h=html.match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i);
 if(!h)return '';
 const holder=document.createElement('div');holder.innerHTML=h[1];
 return (holder.textContent||'').replace(/\s+/g,' ').trim();
}
function pathway(html){
 if(!profile?.active||currentProject?.code!=='pp32'||!currentProject?.id)return null;
 if(has(html,'home-page')||has(html,'home-project-grid')||has(html,'id="usersBtn"')||has(html,'id="guideBtn"'))return null;
 const projectId=currentProject.id;
 const steps=[
  {name:'Početna',icon:'⌂',navigate:()=>window.home()},
  {name:'32 putna prelaza',icon:'▤',navigate:()=>window.project(projectId)}
 ];
 const list=has(html,'class="rlcgrid')||has(html,'class="rlcgrid ')||has(html,'data-r=');
 if(list)return steps;
 const remarks=has(html,'class="wrap pr-page"')&&has(html,'id="prForm"');
 if(remarks){steps.push({name:'Primedbe',icon:'✎'});return steps}
 const rlc=currentRlc;
 if(!rlc?.id||rlc.project_id!==projectId)return null;
 const isLanding=has(html,'data-mod=')&&has(html,'class="tiles');
 const isInteractive=has(html,'id="ilBack"')||has(html,'id="ilmBack"')||has(html,'id="r18Back"');
 const isPrint=has(html,'class="wrap rp-page"')||has(html,'id="rpReport"');
 const isRlcModule=isInteractive||isPrint||has(html,'class="wrap cw-page"')||
  (has(html,'id="br"')&&has(html,'class="wrap"'))||
  (has(html,rlc.code)&&has(html,'class="wrap"'));
 if(!isLanding&&!isRlcModule)return null;
 const rlcId=rlc.id;
 steps.push({name:rlc.code,icon:'↔',navigate:()=>window.rlc(rlcId)});
 if(isLanding)return steps;
 let name=heading(html);
 if(isPrint)name='PRINT';
 else if(isInteractive)name='Linijska situacija';
 else if(has(html,'class="wrap cw-page"'))name='Kablovi';
 else name=name.replace(new RegExp('\\s*[·–-]\\s*'+rlc.code+'\\s*$','i'),'').trim()||'Modul';
 steps.push({name,icon:'◉'});
 return steps;
}
function crumb(step,current){
 const button=document.createElement('button');
 button.type='button';button.className='pp32-nav-path-item';
 button.innerHTML='<span class="pp32-path-icon" aria-hidden="true">'+step.icon+'</span>'+
  '<span class="pp32-path-text">'+escape(step.name)+'</span>';
 if(current){button.disabled=true;button.setAttribute('aria-current','page');return button}
 button.onclick=async()=>{
  if(button.disabled)return;
  button.disabled=true;
  try{await step.navigate();}
  catch(error){button.disabled=false;alert('Povratak nije uspeo: '+(error?.message||String(error)))}
  finally{if(button.isConnected)button.disabled=false}
 };
 return button;
}
window.shell=function(content){
 previous(content);
 APP.classList.remove('pp32-with-rail');
 const steps=pathway(content);
 if(!steps)return;
 const nav=document.createElement('nav');nav.className='pp32-nav-path';
 nav.setAttribute('aria-label','Putanja navigacije');
 nav.innerHTML='<div class="pp32-nav-path-title">PUTANJA KRETANJA</div>';
 const list=document.createElement('div');list.className='pp32-nav-path-list';
 steps.forEach((item,index)=>list.append(crumb(item,index===steps.length-1)));
 nav.append(list);
 const hint=document.createElement('p');hint.className='pp32-nav-path-hint';
 hint.textContent='Klikni na prethodni korak za povratak u projekat ili RLC.';
 nav.append(hint);
 const main=APP.querySelector('.wrap');
 if(main)APP.insertBefore(nav,main);else APP.append(nav);
 APP.classList.add('pp32-with-rail');
};
})();