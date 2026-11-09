/* Legacy RLC2–9 visual grammar for RLC18–25.
 * Explicit left/right source order; no false scale or extra cable glyphs.
 * The same row keys and status events are used by the existing interface.
 */
(function(){
'use strict';
const C=window.PP32ClassicMap={};
const e=v=>esc(v==null?'':String(v));
const name=r=>r.item_type==='sensor'?r.label.split('-').slice(0,2).join('-').replace(/-/g,'/'):r.label;
const status=s=>'il-'+(s==='done'?'done':s==='prepared'?'prepared':'unmarked');
function coords(site,rows){
 const order=window.PP32RlcClassicOrder?.[site.code];
 if(!order)throw Error('Nedostaje projektni redosled opreme za '+site.code);
 const out={};
 const short=r=>r.item_type==='sensor'?r.label.replace(/-PB[A-Z]-\d+$/i,''):r.label;
 for(const bank of ['left','right']){
  const list=order[bank]||[],n=list.length;
  list.forEach((key,i)=>{
   const r=rows.find(row=>row.item_type==='sensor'&&short(row)===key);
   if(!r)return;
   const x=bank==='left'?(n===1?460:175+i*285/(n-1)):(n===1?785:765+i*305/(n-1));
   out[r.item_key]=[x,146,'below'];
  });
 }
 const unplaced=rows.filter(r=>r.item_type==='sensor'&&!out[r.item_key]);
 unplaced.forEach((r,i)=>out[r.item_key]=[130+i*100,203,'below']);
 for(const row of rows.filter(r=>r.item_type==='signal'&&/^KS|^PKS/.test(r.label))){
  const right=/2$/.test(row.label)||/^PKS/.test(row.label);
  const siblings=rows.filter(r=>r.item_type==='signal'&&(/^KS|^PKS/.test(r.label))&&((/2$/.test(r.label)||/^PKS/.test(r.label))===right));
  const i=siblings.findIndex(r=>r.id===row.id);
  out[row.item_key]=[right?855+i*138:280+i*138,230,'below'];
 }
 for(const row of rows.filter(r=>r.item_type==='signal'&&/^PS/.test(r.label))){
  const num=Number(row.label.replace(/\D/g,''))||1,left=num%2===1;
  out[row.item_key]=[left?398:848,num<=2?347:276,'above'];
 }
 for(const row of rows.filter(r=>r.item_type==='barrier')){
  const num=Number(row.label.replace(/\D/g,''))||1,left=num%2===1;
  out[row.item_key]=[left?401:850,num<=2?448:523,left?'left':'right'];
 }
 for(const row of rows.filter(r=>r.item_type==='cabinet')){
  if(row.item_key==='cabinet-bk')out[row.item_key]=[620,419,'right'];
  else if(row.item_key==='cabinet-energetski-orman')out[row.item_key]=[620,561,'right'];
  else out[row.item_key]=[order.lob==='left'?312:936,602,order.lob];
 }
 // Exact source-side placement overrides for exceptional drawings (e.g. RLC34 PS2/PS3).
 const custom=order.positions||{};
 for(const [key,position] of Object.entries(custom)){
  if(rows.some(r=>r.item_key===key))out[key]=position;
 }
 return out;
}
function shape(row,point,site){
 const [x,y,where]=point,kind=row.item_type;
 let fig='';
 if(kind==='sensor')fig='<path class="il-symbol" d="M'+x+' '+(y-13)+'L'+(x+12)+' '+y+'L'+x+' '+(y+13)+'L'+(x-12)+' '+y+'Z"/><circle class="il-symbol-dot" cx="'+x+'" cy="'+y+'" r="3"/>';
 else if(kind==='signal')fig='<path class="il-line-symbol" d="M'+x+' '+(y-18)+'v36"/><circle class="il-symbol" cx="'+x+'" cy="'+(y-7)+'" r="9"/><circle class="il-symbol-dot" cx="'+x+'" cy="'+(y-7)+'" r="3"/>';
 else if(kind==='barrier')fig='<rect class="il-symbol" x="'+(x-10)+'" y="'+(y-11)+'" width="20" height="22" rx="2"/><path class="il-line-symbol" d="M'+(x-4)+' '+(y-4)+'l36-21"/>';
 else fig='<rect class="il-symbol" x="'+(x-16)+'" y="'+(y-17)+'" width="32" height="34" rx="3"/><path class="il-line-symbol" d="M'+(x-8)+' '+(y-8)+'h16 M'+(x-8)+' '+y+'h16 M'+(x-8)+' '+(y+8)+'h16"/>';
 let label=row.label;
 if(kind==='sensor')label=row.label.replace(/-PB[A-Z]-\d+$/i,'');
 if(row.item_key==='cabinet-energetski-orman')label='Energ. orman';
 const [tx,ty,align]=where==='below'?[x,y+37,'middle']:where==='left'?[x-27,y+4,'end']:where==='right'?[x+27,y+4,'start']:[x,y-27,'middle'];
 return '<g class="il-spot '+status(row.status)+'" data-r18="'+e(row.item_key)+'" tabindex="0" role="button" aria-label="'+e(row.label)+'">'+
 '<circle class="il-hotspot" cx="'+x+'" cy="'+y+'" r="29"/>'+fig+
 '<text class="il-spot-label" x="'+tx+'" y="'+ty+'" text-anchor="'+align+'">'+e(label)+'</text></g>';
}
C.draw=function(rows,site){
 const layout=window.PP32RlcClassicOrder?.[site.code];
 if(!layout)throw Error('Nema rasporeda za '+site.code);
 const positions=coords(site,rows);
 const sleepers=Array.from({length:42},(_,i)=>'<path d="M'+(54+i*28)+' 133v35" stroke="#93aab6" stroke-width="3"/>').join('');
 const devices=rows.filter(r=>r.item_key!=='trench').map(r=>{
  if(!positions[r.item_key])throw Error('Nema mesta za '+r.label);
  return shape(r,positions[r.item_key],site);
 }).join('');
 const trench=rows.find(r=>r.item_key==='trench'),st=trench?.status||'not_started';
 const route='<g class="il-trench '+status(st)+'" data-r18="trench" tabindex="0" role="button">'+
 '<rect class="ilm-route-band" x="42" y="668" width="1158" height="69" rx="14"/>'+
 '<path class="il-trench-line" d="M155 702H1082" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="16 7"/>'+
 '<path class="il-trench-hit" d="M155 702H1082" fill="none" stroke="transparent" stroke-width="47"/>'+
 '<circle class="ilm-end" cx="155" cy="702" r="10"/><circle class="ilm-end" cx="1082" cy="702" r="10"/>'+
 '<text class="ilm-route-start" x="155" y="685">TRASA KABLOVA</text>'+
 '<text class="ilm-route-end" x="1082" y="685" text-anchor="end">ROV + POLAGANJE</text>'+
 '<text class="ilm-route-title" x="625" y="707" text-anchor="middle">KOPANJE + POLAGANJE · 60%</text>'+
 '<text class="ilm-route-subtitle" x="625" y="727" text-anchor="middle">KLIKNI ZA STATUS KOMPLETNE TRASE</text></g>';
 const feedX=layout.lob==='right'?1010:40,feedLabel=feedX+97;
 return '<svg class="il-svg ilm-svg r18-svg r18-classic-svg" viewBox="0 0 1240 770" width="1240" height="770" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Šematska linijska situacija '+e(site.code)+' – redosled prema originalnom projektu">'+
 '<defs><pattern id="rlcClassicGrid" width="43" height="43" patternUnits="userSpaceOnUse"><path d="M43 0H0V43" fill="none" stroke="#d5e8ed" stroke-width="1"/></pattern></defs>'+
 '<rect width="1240" height="770" rx="15" fill="#f8fbfc"/><rect width="1240" height="770" fill="url(#rlcClassicGrid)" opacity=".52"/>'+
 '<text x="42" y="38" class="il-map-heading">'+e(site.tag)+' <tspan class="il-km-mark">/ KM '+e(site.km)+'</tspan></text>'+
 '<text x="1200" y="38" text-anchor="end" class="il-map-corner">INTERAKTIVNA ŠEMA · PROJEKTNI REDOSLED</text>'+
 '<path d="M42 147H1198" stroke="#405e71" stroke-width="6"/><path d="M42 131H1198M42 165H1198" stroke="#72909f" stroke-width="2.5"/>'+sleepers+
 '<rect x="587" y="72" width="66" height="572" rx="3" fill="#ebf1f2" stroke="#b9cbd0" stroke-width="1.8"/>'+
 '<path d="M620 81V637" stroke="#c6d1d4" stroke-width="3" stroke-dasharray="12 12"/>'+
 '<rect x="578" y="115" width="85" height="65" fill="#f8e3dd" stroke="#ce9188" stroke-width="1.4"/>'+
 '<path d="M569 121H673M569 170H673" stroke="#d06160" stroke-width="5.5"/>'+
 '<text x="620" y="104" text-anchor="middle" class="il-cross-label">PUTNI PRELAZ</text>'+
 '<rect x="548" y="283" width="144" height="45" rx="9" fill="#e6f4f2" stroke="#76b3b0"/>'+
 '<text x="620" y="303" text-anchor="middle" class="il-road-title">'+e(site.tag)+'</text>'+
 '<text x="620" y="320" text-anchor="middle" class="il-road-sub">KM '+e(site.km)+'</text>'+
 '<text x="45" y="91" class="il-side-label">LEVA STRANA · PROJEKAT</text>'+
 '<text x="1199" y="91" text-anchor="end" class="il-side-label">DESNA STRANA · PROJEKAT</text>'+
 '<path d="M395 350H559M681 350H850M405 437H580M663 437H850M350 550H578M668 550H925M350 625H578M668 625H925" fill="none" stroke="#88b3bf" stroke-width="1.8" opacity=".75"/>'+
 '<g class="ilm-feed"><rect x="'+feedX+'" y="600" width="195" height="42" rx="9"/>'+
 '<text x="'+feedLabel+'" y="618" text-anchor="middle">IZVOR NAPAJANJA</text>'+
 '<text x="'+feedLabel+'" y="634" text-anchor="middle" class="ilm-feed-name">PREMA PROJEKTU</text></g>'+
 devices+route+
 '<text x="43" y="758" class="il-map-note">PRAVILAN REDOSLED I STRANA OPREME · RAZMACI SU ŠEMATSKI, NE CAD RAZMERA</text>'+
 '<text x="1198" y="758" text-anchor="end" class="il-map-note">'+e(site.code)+' / PP32</text></svg>';
};
C.coords=coords;
})();
