(function(){
const FOUNDATION_TYPES={
 S11:{blocks:1,height:600,label:'S11'},
 S21:{blocks:2,height:1050,label:'S21'},
 S31:{blocks:3,height:1500,label:'S31'},
 S41:{blocks:4,height:1950,label:'S41'}
};
let selectedFoundation='S41';
function fmt(n){return Number.isFinite(n)?Math.round(n).toLocaleString('sr-RS'):'—'}
function foundationIcon(type){
 const f=FOUNDATION_TYPES[type], w=86, baseY=110, blockH=24, bodyW=46, x=20;
 let blocks='';
 for(let i=0;i<f.blocks;i++){
   const y=baseY-14-(i+1)*blockH;
   blocks+='<rect x="'+x+'" y="'+y+'" width="'+bodyW+'" height="'+blockH+'" rx="2" fill="#ffffff" stroke="#334155" stroke-width="2"/>';
   blocks+='<path d="M'+(x+bodyW/2-5)+' '+(y+blockH)+' v-8 q5-6 10 0 v8" fill="none" stroke="#64748b" stroke-width="1.6"/>';
 }
 return '<svg viewBox="0 0 86 120" aria-hidden="true"><rect x="7" y="96" width="72" height="14" rx="2" fill="#dbe4ec" stroke="#334155" stroke-width="2"/>'+blocks+'<line x1="43" y1="'+(baseY-14-f.blocks*blockH-8)+'" x2="43" y2="'+(baseY-14-f.blocks*blockH)+'" stroke="#334155" stroke-width="2"/><circle cx="43" cy="'+(baseY-14-f.blocks*blockH-10)+'" r="3" fill="#334155"/></svg>';
}
function recalc(){
 const f=FOUNDATION_TYPES[selectedFoundation];
 const gis=parseFloat((document.getElementById('fdGIS')?.value||'').replace(',','.'));
 const gip=Number.isFinite(gis)?gis-150:NaN;
 const dig=Number.isFinite(gip)?f.height-gip:NaN;
 const gisEl=document.getElementById('fdGISVal'),gipEl=document.getElementById('fdGIPVal'),hEl=document.getElementById('fdHeightVal'),digEl=document.getElementById('fdDigVal'),status=document.getElementById('fdStatus'),formula=document.getElementById('fdFormula');
 if(gisEl)gisEl.textContent=fmt(gis)+' mm';
 if(gipEl)gipEl.textContent=fmt(gip)+' mm';
 if(hEl)hEl.textContent=fmt(f.height)+' mm';
 if(digEl)digEl.textContent=fmt(Math.max(0,dig))+' mm';
 if(formula)formula.textContent=Number.isFinite(dig)?f.height+' − ('+gis+' − 150) = '+Math.round(dig)+' mm':'Unesi kotu GIS da bi se izračunala dubina.';
 if(status){
   if(!Number.isFinite(dig)){status.className='fd-status';status.textContent='Čeka unos kote GIS';}
   else if(dig>0){status.className='fd-status fd-ok';status.textContent='Dno temelja: '+fmt(dig)+' mm ispod postojećeg terena';}
   else {status.className='fd-status fd-warn';status.textContent='Vrh/dno temelja ne zahteva iskop po ovom unosu — proveri kotu.';}
 }
}
function selectType(type){
 selectedFoundation=type;
 document.querySelectorAll('.fd-type').forEach(el=>el.classList.toggle('active',el.dataset.ft===type));
 const f=FOUNDATION_TYPES[type];
 const name=document.getElementById('fdSelectedName'),desc=document.getElementById('fdSelectedDesc');
 if(name)name.textContent=type;
 if(desc)desc.textContent=f.blocks+' '+(f.blocks===1?'betonski blok':'betonska bloka')+' × 450 mm + temeljna ploča 150 mm';
 recalc();
}
window.foundationCalculator=function(){
 let cards='';
 Object.keys(FOUNDATION_TYPES).forEach(type=>{const f=FOUNDATION_TYPES[type];cards+='<button class="fd-type '+(type===selectedFoundation?'active':'')+'" data-ft="'+type+'"><div class="fd-icon">'+foundationIcon(type)+'</div><strong>'+type+'</strong><span>'+fmt(f.height)+' mm</span></button>'});
 const h='<div class="wrap"><button class="back" id="fdBack">← Uputstvo</button>'+ 
 '<div class="hero fd-hero"><div><div class="pill">PRORAČUN ISKOPA</div><h1>Temelji</h1><p class="sub">Izaberi tip temelja i unesi kotu GIS koju dobiješ od geometra.</p></div><div class="fd-hero-icon">▦</div></div>'+ 
 '<div class="panel fd-rule"><div><b>Pravilo postavljanja</b><span>Vrh temelja se postavlja u GIP-u, koji je 150 mm niže od GIS-a.</span></div><div class="fd-equation">GIP = GIS − 150 mm</div></div>'+ 
 '<div class="fd-types">'+cards+'</div>'+ 
 '<div class="fd-layout"><div class="panel fd-input-panel"><div class="fd-selected"><div><span>IZABRANI TEMELJ</span><strong id="fdSelectedName">'+selectedFoundation+'</strong></div><small id="fdSelectedDesc"></small></div>'+ 
 '<div class="field"><label>Kota GIS od geometra (mm)</label><input id="fdGIS" inputmode="decimal" type="number" step="1" value="800" placeholder="npr. 800"></div>'+ 
 '<div class="fd-help">Unosi se visina GIS-a u odnosu na postojeći teren. Aplikacija automatski spušta vrh temelja za 150 mm na GIP.</div>'+ 
 '<div class="fd-formula-card"><span>Dubina iskopa</span><b>Visina temelja − GIP</b><small id="fdFormula"></small></div></div>'+ 
 '<div class="fd-results"><div class="fd-result"><span>GIS</span><strong id="fdGISVal">—</strong><small>ulazna kota</small></div>'+ 
 '<div class="fd-result"><span>GIP</span><strong id="fdGIPVal">—</strong><small>GIS − 150 mm</small></div>'+ 
 '<div class="fd-result"><span>Visina temelja</span><strong id="fdHeightVal">—</strong><small>ukupna visina</small></div>'+ 
 '<div class="fd-result fd-primary"><span>POTREBNA DUBINA ISKOPA</span><strong id="fdDigVal">—</strong><small>od postojećeg terena do dna temelja</small></div>'+ 
 '<div id="fdStatus" class="fd-status"></div></div></div>'+ 
 '<div class="notice" style="margin-top:14px"><b>Primer:</b> S41 = 1950 mm, GIS = 800 mm → GIP = 650 mm → potrebna dubina iskopa = <b>1300 mm</b>.</div>'+ 
 '<div class="fd-source-note">Dimenzioni modul korišćen u kalkulatoru: blok 450 mm, temeljna ploča 150 mm. S11=600 mm, S21=1050 mm, S31=1500 mm, S41=1950 mm.</div></div>';
 shell(h);
 document.getElementById('fdBack').onclick=guideHome;
 document.querySelectorAll('.fd-type').forEach(el=>el.onclick=()=>selectType(el.dataset.ft));
 document.getElementById('fdGIS').oninput=recalc;
 selectType(selectedFoundation);
};
const previousGuideHome=window.guideHome;
window.guideHome=async function(){
 const sections=await api('/rest/v1/guide_sections?select=*&order=sort_order.asc');
 let h='<div class="wrap"><button class="back" id="bh">← Projekti</button><div class="hero"><div><h1>Uputstvo</h1><p class="sub">Interna tehnička biblioteka i proračunski alati</p></div><div class="big">📘</div></div><div class="grid" style="margin-top:14px">';
 sections.forEach(s=>{
   const v=s.slug==='pad-napona',i=s.slug==='ukljucne-tacke',st=s.slug==='opremanje-stanice',fd=s.slug==='temelji';
   h+='<div class="card guide-section '+(v?'vd-guide-card ':'')+(i?'ip-guide-card ':'')+(st?'ss-guide-card ':'')+(fd?'fd-guide-card':'')+'" data-gs="'+s.id+'" data-gslug="'+esc(s.slug||'')+'">'+(v?'<div class="vd-mini-icon">⚡</div>':'')+(i?'<div class="ip-mini-icon">↔</div>':'')+(st?'<div class="ss-mini-icon">🚦</div>':'')+(fd?'<div class="fd-mini-icon">▦</div>':'')+'<h2>'+esc(s.title)+'</h2><p class="sub">'+esc(s.description||'')+'</p><b style="color:var(--blue)">'+((v||i||st||fd)?'Otvori alat →':'Otvori →')+'</b></div>';
 });
 h+='</div></div>';shell(h);bh.onclick=home;
 document.querySelectorAll('[data-gs]').forEach(el=>el.onclick=()=>{if(el.dataset.gslug==='pad-napona')return voltageDropCalculator();if(el.dataset.gslug==='ukljucne-tacke')return inclusionPointCalculator();if(el.dataset.gslug==='opremanje-stanice')return stationSSGuide();if(el.dataset.gslug==='temelji')return foundationCalculator();guideSection(el.dataset.gs)});
};
})();
