(function(){
'use strict';
const previous=window.home;
if(typeof previous!=='function')return;
window.home=async function(){
 await previous();
 const grid=document.querySelector('.home-project-grid');
 if(!grid)return;
 const cards=[...grid.querySelectorAll('.home-project-card[data-p]')];
 if(!cards.length)return;
 grid.classList.add(cards.length===2?'hp-deck-pair':'hp-deck-many');
 cards.forEach((card,i)=>{
  card.classList.add('hp-deck-card');
  card.tabIndex=0;
  card.setAttribute('role','button');
  card.setAttribute('aria-label','Otvori projekat: '+(card.querySelector('h3')?.textContent||''));
  const top=card.querySelector('.home-project-top');
  if(top)top.insertAdjacentHTML('afterend','<div class="hp-deck-mark" aria-hidden="true"><span></span><i></i><i></i><i></i></div>');
  const index=card.querySelector('.home-project-index');
  if(index)index.textContent='PROJEKAT / '+String(i+1).padStart(2,'0');
  const title=card.querySelector('h3');
  if(title)title.insertAdjacentHTML('beforebegin','<div class="hp-deck-eyebrow">ŽELEZNIČKI INFRASTRUKTURNI SISTEM</div>');
  const foot=card.querySelector('.home-project-footer span');
  if(foot)foot.textContent='Otvori radni prostor';
  const open=card.onclick;
  if(typeof open==='function'){
   card.onclick=null;
   let started=false;
   card.addEventListener('click',e=>{
    if(started)return;
    started=true;
    grid.querySelectorAll('.hp-deck-card').forEach(x=>x.classList.remove('hp-deck-selected'));
    card.classList.add('hp-deck-selected','hp-deck-opening');
    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(()=>open.call(card,e),reduced?0:170);
   });
   card.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click()}
   });
  }
 });
};
})();