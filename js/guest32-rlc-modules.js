/* Guest PP32: hide restricted RLC modules and block their navigation.
   Other roles and projects remain unchanged. */
(function(){
'use strict';
const blocked=new Set(['docs','diary','report','print']);
function isGuest32(){return profile?.active===true&&profile?.role==='guest_pp32'&&currentProject?.code==='pp32';}
function removeModules(){
 if(!isGuest32())return;
 const grid=document.querySelector('.pp32-module-grid, .tiles');
 if(!grid)return;
 grid.querySelectorAll('[data-mod],[data-pp32-module],.rp-print-tile').forEach(node=>{
  const key=node.dataset.pp32Module||node.dataset.mod||(node.classList.contains('rp-print-tile')?'print':'');
  if(blocked.has(key))node.remove();
 });
 const count=document.querySelector('.pp32-module-count');
 if(count)count.textContent=grid.querySelectorAll('.pp32-module-card,.cw-rlc-tile,.rp-print-tile,[data-mod]').length+' modula';
}
const previousRlc=window.rlc;
if(typeof previousRlc==='function')window.rlc=async function(id){
 await previousRlc(id);
 removeModules();
};
for(const key of ['docs','diary','report']){
 const original=window[key];
 if(typeof original!=='function')continue;
 window[key]=function(...args){
  if(isGuest32())return;
  return original.apply(this,args);
 };
}
if(window.PP32Print?.open){
 const oldOpen=window.PP32Print.open;
 window.PP32Print.open=function(...args){
  if(isGuest32())return;
  return oldOpen.apply(this,args);
 };
}
})();