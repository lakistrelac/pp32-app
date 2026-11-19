/* Guest PP32: limit guests to technical documents and the two calculators.
   Database policies provide the matching server-side data boundary. */
(function(){
'use strict';
const allowedModules=new Set(['line','docs']);
const allowedCalculations=new Set(['ukljucne-tacke','pad-napona']);
function isGuest32(){
 return profile?.active===true&&profile?.role==='guest_pp32';
}
function removeRestrictedModules(){
 if(!isGuest32())return;
 const grid=document.querySelector('.pp32-module-grid, .tiles');
 if(!grid)return;
 grid.querySelectorAll('[data-mod],[data-pp32-module],.rp-print-tile,.cw-rlc-tile').forEach(node=>{
  const key=node.dataset.pp32Module||node.dataset.mod||
   (node.classList.contains('rp-print-tile')?'print':'');
  if(!allowedModules.has(key))node.remove();
 });
 const count=document.querySelector('.pp32-module-count');
 if(count)count.textContent='Dokumentacija';
}
const previousRlc=window.rlc;
if(typeof previousRlc==='function')window.rlc=async function(id){
 await previousRlc(id);
 removeRestrictedModules();
};
const previousGuideHome=window.guideHome;
if(typeof previousGuideHome==='function')window.guideHome=async function(...args){
 await previousGuideHome.apply(this,args);
 if(!isGuest32())return;
 document.querySelectorAll('[data-gslug]').forEach(card=>{
  if(!allowedCalculations.has(card.dataset.gslug))card.remove();
 });
 const title=document.querySelector('.wrap .hero h1');
 if(title)title.textContent='Proračuni';
 const subtitle=document.querySelector('.wrap .hero .sub');
 if(subtitle)subtitle.textContent='Dostupni kalkulatori';
};
for(const key of ['line','components','diary','equipment','report']){
 const original=window[key];
 if(typeof original!=='function')continue;
 window[key]=function(...args){
  if(isGuest32()&&!allowedModules.has(key))return;
  return original.apply(this,args);
 };
}
if(window.PP32Cables){
 for(const key of ['overview','forRlc']){
  const original=window.PP32Cables[key];
  if(typeof original==='function')window.PP32Cables[key]=function(...args){
   if(isGuest32())return;
   return original.apply(this,args);
  };
 }
}
if(window.PP32Print?.open){
 const original=window.PP32Print.open;
 window.PP32Print.open=function(...args){
  if(isGuest32())return;
  return original.apply(this,args);
 };
}
})();
