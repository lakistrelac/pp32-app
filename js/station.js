(function(){
const INFO={
 pred:{t:'Predsignal',r:'700–1500 m od ulaznog signala',d:'Postavlja se na prilazu stanici. Pravilo važi za oba smera ulaska u stanicu.'},
 in:{t:'Ulazni signal',r:'200–350 m od ulazne skretnice',d:'Ulazni signal ima pripadajući senzor 80 m pre i 50 m posle signala.'},
 s80:{t:'Senzor pre ulaznog signala',r:'80 m pre ulaznog signala',d:'Pripadajući senzor ulaznog signala, prikazan na oba prilaza stanici.'},
 s50:{t:'Senzor posle ulaznog signala',r:'50 m posle ulaznog signala',d:'Pripadajući senzor ulaznog signala, prikazan na oba prilaza stanici.'},
 s34:{t:'Senzor u zoni ulazne skretnice',r:'34 m od ulazne skretnice',d:'Senzor unutar stanice neposredno iza ulazne stanične glave.'},
 sw:{t:'Senzor unutar stanice',r:'6 m od međika / približno 1 m od vrha skretnice',d:'Senzori su prikazani na obe stanične glave i na svakom koloseku. Ne postavljaju se u sredinu između dve skretnice u ovoj šemi.'},
 out:{t:'Izlazni signal',r:'10 m od pripadajućeg senzora kod međika',d:'Na svakom koloseku je prikazan izlazni signal za oba smera izlaska iz stanice.'},
 man:{t:'Manevarski signal',r:'1 m od izlaznog signala',d:'Prikazan je uz izlazne signale. Dodatni manevarski signali postavljaju se i na drugim mestima gde pravilnik nalaže.'},
 station:{t:'Stanična zgrada',r:'Referentna strana za numeraciju koloseka',d:'Kolosek 1 je prvi kolosek uz staničnu zgradu, a ostali se numerišu redom naviše.'},
 track:{t:'Numeracija koloseka',r:'Od stanične zgrade naviše',d:'Prvi kolosek uz zgradu je Kolosek 1, zatim Kolosek 2, Kolosek 3 i Kolosek 4.'}
};
function info(k){
 const x=INFO[k];
 if(!x)return;
 document.getElementById('ssInfo').innerHTML='<div class="ss-info-title">'+x.t+'</div><div class="ss-info-rule">'+x.r+'</div><p>'+x.d+'</p>';
 document.querySelectorAll('[data-ss]').forEach(n=>n.classList.toggle('active',n.dataset.ss===k));
}
function toggle(cls,on){document.querySelectorAll('.'+cls).forEach(n=>n.style.display=on?'':'none')}
function sensor(x,y,k='sw'){return '<g class="ss-sensor" data-ss="'+k+'"><rect x="'+(x-8)+'" y="'+(y-14)+'" width="16" height="28" fill="#ec4899" stroke="#831843" stroke-width="2"/></g>'}
function outSignal(x,y,label,dir){
 const mastX=x, lampX=dir==='left'?x-18:x+18, textX=dir==='left'?x-62:x+28;
 return '<g class="ss-signal" data-ss="out"><line x1="'+mastX+'" y1="'+(y-34)+'" x2="'+mastX+'" y2="'+(y+18)+'" stroke="#111827" stroke-width="4"/><circle cx="'+lampX+'" cy="'+(y-34)+'" r="12" fill="#22c55e" stroke="#111827" stroke-width="3"/><text x="'+textX+'" y="'+(y-52)+'">'+label+'</text></g>';
}
function manSignal(x,y){return '<g class="ss-signal" data-ss="man"><rect x="'+(x-9)+'" y="'+(y-9)+'" width="18" height="18" fill="#60a5fa" stroke="#1e3a8a" stroke-width="2"/></g>'}
window.stationSSGuide=function(){
 const ys=[420,340,260,180];
 let rails='',equipment='';
 ys.forEach((y,idx)=>{
   const n=idx+1;
   rails+='<line x1="680" y1="'+y+'" x2="1120" y2="'+y+'" class="ss-track"/>';
   equipment+='<g data-ss="track" class="ss-track-label"><text x="875" y="'+(y-12)+'">Kolosek '+n+'</text></g>';
   equipment+=sensor(720,y)+sensor(1080,y);
   equipment+=outSignal(770,y,'IZ '+n,'left')+outSignal(1030,y,'IZ '+n,'right');
   equipment+=manSignal(795,y+20)+manSignal(1005,y+20);
 });
 const h='<div class="wrap">'+
 '<button class="back" id="ssBack">← Uputstvo</button>'+
 '<div class="hero"><div><div class="pill">ILUSTRATIVNI PRIMER</div><h1>Opremanje stanice SS elementima</h1><p class="sub">Interaktivna šema rasporeda SS elemenata. Šema nije u razmeri.</p></div><div class="ss-hero-icon">🚦</div></div>'+
 '<div class="ss-toolbar panel"><label><input id="ssSig" type="checkbox" checked> Signali</label><label><input id="ssSen" type="checkbox" checked> Senzori</label><label><input id="ssDim" type="checkbox" checked> Rastojanja</label></div>'+
 '<div class="ss-layout"><div class="panel ss-map"><div class="ss-scroll">'+
 '<svg viewBox="0 0 1800 760" xmlns="http://www.w3.org/2000/svg" aria-label="Šematski prikaz stanice">'+
 '<rect width="1800" height="760" fill="#f8fafc"/>'+
 '<g class="ss-rail" stroke="#374151" stroke-width="6" fill="none" stroke-linecap="square" stroke-linejoin="miter">'+
 '<line x1="40" y1="340" x2="500" y2="340"/><line x1="1300" y1="340" x2="1760" y2="340"/>'+
 '<polyline points="500,340 560,340 680,180"/><polyline points="500,340 590,340 680,260"/><line x1="500" y1="340" x2="680" y2="340"/><polyline points="500,340 590,340 680,420"/>'+
 '<polyline points="1120,180 1240,340 1300,340"/><polyline points="1120,260 1210,340 1300,340"/><line x1="1120" y1="340" x2="1300" y2="340"/><polyline points="1120,420 1210,340 1300,340"/>'+
 '</g><g class="ss-rail" stroke="#374151" stroke-width="6">'+rails+'</g>'+equipment+
 '<g class="ss-building" data-ss="station"><rect x="790" y="505" width="220" height="92" fill="#e2e8f0" stroke="#334155" stroke-width="4"/><rect x="875" y="548" width="50" height="49" fill="#cbd5e1" stroke="#334155" stroke-width="3"/><text x="835" y="535">STANICA</text></g>'+
 '<g class="ss-mejik" fill="#64748b" stroke="#475569" stroke-width="3"><path d="M690 166 l14 14 -14 14 -14 -14z"/><path d="M690 246 l14 14 -14 14 -14 -14z"/><path d="M690 326 l14 14 -14 14 -14 -14z"/><path d="M690 406 l14 14 -14 14 -14 -14z"/><path d="M1110 166 l14 14 -14 14 -14 -14z"/><path d="M1110 246 l14 14 -14 14 -14 -14z"/><path d="M1110 326 l14 14 -14 14 -14 -14z"/><path d="M1110 406 l14 14 -14 14 -14 -14z"/></g>'+
 '<g class="ss-signal" data-ss="pred"><line x1="145" y1="260" x2="145" y2="330" stroke="#111827" stroke-width="4"/><circle cx="145" cy="260" r="16" fill="#facc15" stroke="#111827" stroke-width="3"/><text x="92" y="225">Predsignal</text><line x1="1655" y1="260" x2="1655" y2="330" stroke="#111827" stroke-width="4"/><circle cx="1655" cy="260" r="16" fill="#facc15" stroke="#111827" stroke-width="3"/><text x="1590" y="225">Predsignal</text></g>'+
 '<g class="ss-signal" data-ss="in"><line x1="365" y1="260" x2="365" y2="330" stroke="#111827" stroke-width="4"/><circle cx="365" cy="260" r="16" fill="#ef4444" stroke="#111827" stroke-width="3"/><text x="320" y="225">Ulazni</text><line x1="1435" y1="260" x2="1435" y2="330" stroke="#111827" stroke-width="4"/><circle cx="1435" cy="260" r="16" fill="#ef4444" stroke="#111827" stroke-width="3"/><text x="1395" y="225">Ulazni</text></g>'+
 sensor(280,340,'s80')+sensor(1520,340,'s80')+sensor(420,340,'s50')+sensor(1380,340,'s50')+sensor(535,340,'s34')+sensor(1265,340,'s34')+
 '<g class="ss-dim" stroke="#2563eb" stroke-width="2" fill="none"><line x1="145" y1="95" x2="365" y2="95"/><line x1="145" y1="80" x2="145" y2="110"/><line x1="365" y1="80" x2="365" y2="110"/><line x1="365" y1="140" x2="500" y2="140"/><line x1="365" y1="125" x2="365" y2="155"/><line x1="500" y1="125" x2="500" y2="155"/><line x1="1435" y1="95" x2="1655" y2="95"/><line x1="1435" y1="80" x2="1435" y2="110"/><line x1="1655" y1="80" x2="1655" y2="110"/><line x1="1300" y1="140" x2="1435" y2="140"/><line x1="1300" y1="125" x2="1300" y2="155"/><line x1="1435" y1="125" x2="1435" y2="155"/></g>'+
 '<g class="ss-dim" fill="#1d4ed8" font-size="18" font-weight="800"><text x="185" y="78">700–1500 m</text><text x="385" y="123">200–350 m</text><text x="1475" y="78">700–1500 m</text><text x="1308" y="123">200–350 m</text><text x="610" y="625">Senzori uz stanične glave: 6 m od međika</text><text x="610" y="653">Izlazni signal: 10 m od senzora · Manevarski: 1 m od izlaznog</text></g>'+
 '<g class="ss-dim" fill="#1d4ed8" font-size="15" font-weight="800"><text x="240" y="375">80 m pre</text><text x="394" y="375">50 m posle</text><text x="505" y="375">34 m</text><text x="1480" y="375">80 m pre</text><text x="1335" y="375">50 m posle</text><text x="1235" y="375">34 m</text></g>'+
 '</svg></div><div class="ss-legend"><span><i class="sig-red"></i> Ulazni signal</span><span><i class="sig-yellow"></i> Predsignal</span><span><i class="sig-green"></i> Izlazni signal</span><span><i class="sig-pink"></i> Senzor</span><span><i class="sig-blue"></i> Manevarski signal</span><span><i class="sig-gray"></i> Međik</span></div></div>'+
 '<div class="panel ss-info" id="ssInfo"><div class="ss-info-title">Klikni element na šemi</div><div class="ss-info-rule">Prikazaće se pravilo postavljanja.</div><p>Šema je namerno pojednostavljena i nije u realnoj razmeri.</p></div></div>'+
 '<div class="notice" style="margin-top:14px">Kolosek 1 je prvi uz staničnu zgradu, a numeracija ide naviše. Senzori unutar stanice prikazani su na obe stanične glave po pravilu 6 m od međika.</div></div>';
 shell(h);
 document.getElementById('ssBack').onclick=guideHome;
 document.querySelectorAll('[data-ss]').forEach(n=>{n.style.cursor='pointer';n.onclick=()=>info(n.dataset.ss)});
 ssSig.onchange=()=>toggle('ss-signal',ssSig.checked);
 ssSen.onchange=()=>toggle('ss-sensor',ssSen.checked);
 ssDim.onchange=()=>toggle('ss-dim',ssDim.checked);
};
window.guideHome=async function(){
 const sections=await api('/rest/v1/guide_sections?select=*&order=sort_order.asc');
 let h='<div class="wrap"><button class="back" id="bh">← Projekti</button><div class="hero"><div><h1>Uputstvo</h1><p class="sub">Interna tehnička biblioteka i proračunski alati</p></div><div class="big">📘</div></div><div class="grid" style="margin-top:14px">';
 sections.forEach(s=>{
   const v=s.slug==='pad-napona',i=s.slug==='ukljucne-tacke',st=s.slug==='opremanje-stanice';
   h+='<div class="card guide-section '+(v?'vd-guide-card ':'')+(i?'ip-guide-card ':'')+(st?'ss-guide-card':'')+'" data-gs="'+s.id+'" data-gslug="'+esc(s.slug||'')+'">'+(v?'<div class="vd-mini-icon">⚡</div>':'')+(i?'<div class="ip-mini-icon">↔</div>':'')+(st?'<div class="ss-mini-icon">🚦</div>':'')+'<h2>'+esc(s.title)+'</h2><p class="sub">'+esc(s.description||'')+'</p><b style="color:var(--blue)">'+((v||i||st)?'Otvori alat →':'Otvori →')+'</b></div>';
 });
 h+='</div></div>';shell(h);bh.onclick=home;
 document.querySelectorAll('[data-gs]').forEach(el=>el.onclick=()=>{if(el.dataset.gslug==='pad-napona')return voltageDropCalculator();if(el.dataset.gslug==='ukljucne-tacke')return inclusionPointCalculator();if(el.dataset.gslug==='opremanje-stanice')return stationSSGuide();guideSection(el.dataset.gs)});
};
})();
