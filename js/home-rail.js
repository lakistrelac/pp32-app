/* Homepage railway motion layer; uses existing project/navigation functions. */
(function(){
'use strict';
const previousHome=window.home;
if(typeof previousHome!=='function')return;
const railScene="<div class=\"hr-visual-head\"><span>01 / ŽELEZNIČKA INFRASTRUKTURA</span><span class=\"hr-visual-badge\"><i></i> ANIMIRANA VIZUELIZACIJA</span></div>\n<svg class=\"hr-scene\" viewBox=\"0 0 720 320\" role=\"img\" aria-label=\"Diskretno animiran elektromotorni voz na pruzi\" xmlns=\"http://www.w3.org/2000/svg\">\n<defs><linearGradient id=\"hrB\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop stop-color=\"#f9fdff\"/><stop offset=\".55\" stop-color=\"#e2f3f7\"/><stop offset=\"1\" stop-color=\"#7fa6b8\"/></linearGradient><linearGradient id=\"hrW\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#265670\"/><stop offset=\"1\" stop-color=\"#092d42\"/></linearGradient><linearGradient id=\"hrF\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#87baca\"/></linearGradient><filter id=\"hrBlur\"><feGaussianBlur stdDeviation=\"5\"/></filter></defs>\n<g stroke=\"#40667a\" stroke-width=\".8\" opacity=\".36\"><path d=\"M0 55H720M0 110H720M0 165H720M0 220H720M0 275H720M90 0V320M180 0V320M270 0V320M360 0V320M450 0V320M540 0V320M630 0V320\"/></g>\n<g stroke=\"#528b9c\" stroke-width=\"1.5\" fill=\"none\" opacity=\".72\"><path d=\"M100 65V248M350 65V248M610 65V248\" stroke-width=\"2.4\"/><path d=\"M84 65H684M100 80L131 65M350 80L378 65M610 80L641 65\"/><path d=\"M0 91Q180 97 350 91T720 91\" opacity=\".56\"/></g>\n<g class=\"hr-track-ties\" stroke=\"#6eacba\" stroke-width=\"3\" opacity=\".64\"><path d=\"M20 250l-12 39M63 250l-12 39M106 250l-12 39M149 250l-12 39M192 250l-12 39M235 250l-12 39M278 250l-12 39M321 250l-12 39M364 250l-12 39M407 250l-12 39M450 250l-12 39M493 250l-12 39M536 250l-12 39M579 250l-12 39M622 250l-12 39M665 250l-12 39M708 250l-12 39\"/></g>\n<path d=\"M0 255H720M0 273H720\" stroke=\"#a7dae5\" stroke-width=\"3\" opacity=\".8\"/>\n<g class=\"hr-train\">\n <ellipse cx=\"377\" cy=\"250\" rx=\"301\" ry=\"11\" fill=\"#001a2d\" opacity=\".5\"/>\n <path d=\"M62 172Q62 151 85 151H570Q620 150 651 178L681 202Q694 214 684 237H68Q59 233 59 220Z\" fill=\"url(#hrB)\" stroke=\"#a6d1d9\" stroke-width=\"1.8\"/>\n <path d=\"M65 200H684L688 216H64Z\" fill=\"#38758b\"/><path d=\"M62 218H686L683 227H66Z\" fill=\"#4ac9c6\"/><path d=\"M74 232H677\" stroke=\"#1f455c\" stroke-width=\"7\"/>\n <g stroke=\"#a1d1d9\" stroke-width=\"1.5\" fill=\"url(#hrW)\">\n  <rect x=\"90\" y=\"169\" width=\"56\" height=\"26\" rx=\"5\"/><rect x=\"163\" y=\"169\" width=\"56\" height=\"26\" rx=\"5\"/><rect x=\"237\" y=\"169\" width=\"55\" height=\"26\" rx=\"5\"/>\n  <rect x=\"314\" y=\"169\" width=\"56\" height=\"26\" rx=\"5\"/><rect x=\"390\" y=\"169\" width=\"56\" height=\"26\" rx=\"5\"/><rect x=\"464\" y=\"169\" width=\"54\" height=\"26\" rx=\"5\"/>\n </g>\n <path d=\"M571 156Q617 152 651 181L671 197H558V158Z\" fill=\"url(#hrW)\" stroke=\"#d3eef4\" stroke-width=\"1.7\"/>\n <path d=\"M578 205H682L688 216H578Z\" fill=\"url(#hrF)\" opacity=\".78\"/>\n <path d=\"M304 158V234M379 158V234M541 158V234\" stroke=\"#70a5b8\" stroke-width=\"2.2\"/>\n <g fill=\"#102e43\" stroke=\"#709caf\" stroke-width=\"3\"><circle cx=\"114\" cy=\"236\" r=\"11\"/><circle cx=\"214\" cy=\"236\" r=\"11\"/><circle cx=\"360\" cy=\"236\" r=\"11\"/><circle cx=\"468\" cy=\"236\" r=\"11\"/><circle cx=\"591\" cy=\"236\" r=\"11\"/><circle cx=\"648\" cy=\"236\" r=\"11\"/></g>\n <g fill=\"#8ebdcb\"><circle cx=\"114\" cy=\"236\" r=\"3.5\"/><circle cx=\"214\" cy=\"236\" r=\"3.5\"/><circle cx=\"360\" cy=\"236\" r=\"3.5\"/><circle cx=\"468\" cy=\"236\" r=\"3.5\"/><circle cx=\"591\" cy=\"236\" r=\"3.5\"/><circle cx=\"648\" cy=\"236\" r=\"3.5\"/></g>\n <ellipse class=\"hr-headlight\" cx=\"685\" cy=\"215\" rx=\"19\" ry=\"11\" fill=\"#ffdaa0\" filter=\"url(#hrBlur)\" opacity=\".7\"/><rect x=\"678\" y=\"210\" width=\"10\" height=\"7\" rx=\"3\" fill=\"#fff2c7\"/>\n <path d=\"M254 150l24-26h25l18 26\" fill=\"none\" stroke=\"#a4d0da\" stroke-width=\"2\"/><path d=\"M264 137l43-15M280 123v-17\" stroke=\"#a4d0da\" stroke-width=\"1.8\"/>\n</g>\n<g><rect x=\"29\" y=\"146\" width=\"6\" height=\"100\" rx=\"3\" fill=\"#6e9eae\"/><rect x=\"16\" y=\"135\" width=\"32\" height=\"70\" rx=\"10\" fill=\"#0a293e\" stroke=\"#5595aa\" stroke-width=\"2\"/><circle cx=\"32\" cy=\"152\" r=\"6.3\" fill=\"#456777\"/><circle cx=\"32\" cy=\"172\" r=\"6.3\" fill=\"#456777\"/><circle class=\"hr-green-signal\" cx=\"32\" cy=\"192\" r=\"6.3\" fill=\"#76ebaf\"/></g>\n<g fill=\"#99c3cf\" font-size=\"9\" font-family=\"Arial,sans-serif\" font-weight=\"700\" letter-spacing=\"2\"><text x=\"23\" y=\"311\">SIGNAL · TRASA</text><text x=\"590\" y=\"311\">SS / RAIL</text></g>\n</svg><div class=\"hr-visual-footer\"><span><i class=\"hr-indicator\"></i> SIGNALNI SISTEMI</span><span>PRUGA • KABLOVI • EVIDENCIJA</span></div>";
window.home=async function(){
 await previousHome();
 const hero=document.querySelector('.home-masthead');
 const copy=hero?.querySelector('.home-masthead-copy');
 if(!hero||!copy)return;
 hero.classList.add('hr-enhanced');
 const heading=copy.querySelector('h1');
 if(heading)heading.innerHTML='Radovi na pruzi.<span class="hr-headline-accent"> Sve na jednom mestu.</span>';
 const desc=copy.querySelector('p');
 if(desc)desc.textContent='Centralni pregled projekata, SS elemenata, kablovskih trasa, građevinskih dnevnika i tehničke dokumentacije.';
 const kicker=copy.querySelector('.home-kicker');
 if(kicker)kicker.innerHTML='<i class="hr-kicker-light" aria-hidden="true"></i> DIGITALNI RADNI PROSTOR / ŽELEZNICA';
 const metrics=copy.querySelector('.home-metrics');
 const label=metrics?.children[1]?.querySelector('span');
 if(label)label.textContent='Tehnička biblioteka';
 const actions=document.createElement('div');
 actions.className='hr-hero-actions';
 actions.innerHTML='<button class="hr-primary-cta" type="button" id="hrOpenProjects">Otvori projekte <span aria-hidden="true">↗</span></button><button class="hr-ghost-cta" type="button" id="hrOpenGuide">Tehnička uputstva <span aria-hidden="true">→</span></button>';
 if(metrics)copy.insertBefore(actions,metrics);else copy.appendChild(actions);
 const art=document.createElement('div');
 art.className='hr-visual';art.innerHTML=railScene;
 copy.insertAdjacentElement('afterend',art);
 const system=hero.querySelector('.home-system');
 if(system){
   const name=system.querySelector('.home-system-name');if(name)name.textContent='CENTRALNA PLATFORMA';
   const status=system.querySelector('.home-system-head b');if(status)status.textContent='Radni prostor spreman';
 }
 const header=document.querySelector('.home-section-head');
 const cvCard=[...document.querySelectorAll('.home-project-card[data-p]')].find(el=>el.querySelector('.home-project-code')?.textContent?.trim()==='CVETOJEVAC-SOBOVICA');
 const shortcuts=document.createElement('section');
 shortcuts.className='hr-shortcuts';
 shortcuts.setAttribute('aria-label','Brzi pristup modulima');
 shortcuts.innerHTML='<button type="button" class="hr-shortcut" id="hrShortcutProjects"><span class="hr-shortcut-icon hr-shortcut-blue" aria-hidden="true">▦</span><span><b>Aktivni projekti</b><small>Pregled radova i napretka</small></span><strong aria-hidden="true">↗</strong></button>'+
 (cvCard?'<button type="button" class="hr-shortcut" id="hrShortcutCable"><span class="hr-shortcut-icon hr-shortcut-teal" aria-hidden="true">◈</span><span><b>Plan kablova</b><small>Rovovi, kablovi i stacionaže</small></span><strong aria-hidden="true">↗</strong></button>':'')+
 '<button type="button" class="hr-shortcut" id="hrShortcutGuide"><span class="hr-shortcut-icon hr-shortcut-amber" aria-hidden="true">▤</span><span><b>Tehnička biblioteka</b><small>Pravilnici i uputstva</small></span><strong aria-hidden="true">↗</strong></button>';
 if(header)header.insertAdjacentElement('beforebegin',shortcuts);
 const scrollProjects=()=>document.querySelector('.home-section-head')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 document.getElementById('hrOpenProjects')?.addEventListener('click',scrollProjects);
 document.getElementById('hrOpenGuide')?.addEventListener('click',guideHome);
 document.getElementById('hrShortcutProjects')?.addEventListener('click',scrollProjects);
 document.getElementById('hrShortcutGuide')?.addEventListener('click',guideHome);
 if(cvCard)document.getElementById('hrShortcutCable')?.addEventListener('click',async()=>{
  try{
    await project(cvCard.dataset.p);
    if(typeof window.corridorCablePlan==='function')await window.corridorCablePlan();
  }catch(err){alert('Plan kablova nije mogao da se otvori: '+err.message)}
 });
};
})();