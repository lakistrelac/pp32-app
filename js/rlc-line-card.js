/* PP32 · consolidated interactive line module tile
   Loaded after existing RLC navigation wrappers, no effect on other modules. */
(function(){
'use strict';
const eligible=new Set(['RLC2','RLC3','RLC4','RLC5','RLC6','RLC7','RLC8','RLC9','RLC18','RLC19','RLC20','RLC21','RLC22','RLC23','RLC24','RLC25','RLC31','RLC32','RLC33','RLC34','RLC35','RLC36']);
const escHtml=s=>esc(s??'');
const previous=window.rlc;
if(typeof previous!=='function')return;
window.rlc=async function(id){
 await previous(id);
 if(currentProject?.code!=='pp32'||!eligible.has(currentRlc?.code))return;
 const tile=document.querySelector('.tiles [data-mod="line"]');
 if(!tile)return;
 tile.classList.add('im-line-card');
 const n=currentRlc.code;
 const registered=n==='RLC2'?window.PP32InteractiveLine:(Number(n.slice(3))>=18?window.PP32NewLines:window.PP32LinesMore);
 if(!registered||typeof registered.open!=='function')return;
 tile.setAttribute('role','button');
 tile.setAttribute('tabindex','0');
 tile.setAttribute('aria-label','Otvori interaktivnu linijsku situaciju za '+n);
 tile.innerHTML=
  '<div class="im-top">'+
   '<span class="im-tile-icon" aria-hidden="true">'+
    '<svg viewBox="0 0 64 64" width="43" height="43" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg">'+
     '<path d="M5 28H59M5 37H59" stroke="#8ddedb" stroke-width="2.5" stroke-linecap="round"/>'+
     '<path d="M10 22V43M19 22V43M28 22V43M37 22V43M46 22V43M55 22V43" stroke="#5093aa" stroke-width="2" stroke-linecap="round"/>'+
     '<path d="M14 12L30 22L45 12" fill="none" stroke="#7dd9bc" stroke-width="2.4" stroke-linecap="round"/>'+
     '<circle cx="14" cy="12" r="5" fill="#7cdec7"/><circle cx="45" cy="12" r="5" fill="#7cdec7"/>'+
     '<path d="M31 31V50" stroke="#9be5e1" stroke-width="2.6"/><circle cx="31" cy="50" r="4.5" fill="#8bd5e5"/>'+
    '</svg>'+
   '</span>'+
   '<span class="im-active"><i></i> INTERAKTIVNO</span>'+
  '</div>'+
  '<span class="im-card-kicker">VIZUELNA EVIDENCIJA RADOVA</span>'+
  '<strong class="im-card-title">Linijska situacija</strong>'+
  '<span class="im-card-copy">Interaktivna šema sa uređajima, kablovima i statusima 0 / 50 / 100%.</span>'+
  '<div class="im-tags"><span>60% trasa</span><span>40% elementi</span></div>'+
  '<div class="im-card-bottom"><span>Otvori šemu · '+escHtml(n)+'</span><span class="im-arrow" aria-hidden="true">↗</span></div>';
 const open=()=>registered.open(id).catch(e=>alert('Linijska situacija: '+(e?.message||String(e))));
 tile.onclick=open;
 tile.onkeydown=event=>{if(event.target===tile&&(event.key==='Enter'||event.key===' ')){event.preventDefault();open()}};
};
})();