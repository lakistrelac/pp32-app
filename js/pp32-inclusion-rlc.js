/* PP32 | Proracun ukljucnih tacaka po RLC.
 * Merodavne stacionaze, KS i raspored: projektne linijske situacije.
 * Pomocni parametri d i V: 'Proračuni(1).xlsx', 32 prelaza.
 * Metod proracuna: Word primer, delovi A, B i C.
 * Ovo je RADNI proracun, ne potvrda projektnog/normativnog resenja.
 */
(function () {
'use strict';

const INPUTS=[
 [2,10.5,80],[3,8,80],[4,10,80],[5,44,80],
 [6,15,80],[7,26,80],[8,11.5,80],[9,8.5,80],
 [10,9,80],[11,20,100],[12,9.3,80],[13,16,100],
 [14,8.5,100],[15,12,100],[16,9.5,100],
 [18,18.5,80],[19,15,80],[20,10,80],
 [21,41,80],[22,8.5,80],[23,9.5,100],
 [24,11,80],[25,16.5,80],[26,17,80],
 [28,22,100],[29,13,100],
 [31,20,120],[32,8.5,120],[33,10.5,120],
 [34,10,120],[35,8.4,120],[36,8.5,120]
];
const BY_CODE=new Map(INPUTS.map(function(a){return ['RLC'+a[0],{d:a[1],v:a[2],source:'pomoćni proračunski podaci'}]}));
const KS_RULES={80:{stop:700,switching:250},100:{stop:700,switching:300},120:{stop:1000,switching:350}};
const ESC={ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };
const e=function(v){return String(v===undefined||v===null?'':v).replace(/[&<>"']/g,function(c){return ESC[c]})};
const fmt=function(v,p){return Number.isFinite(v)?Number(v).toLocaleString('sr-RS',{minimumFractionDigits:p===undefined?2:p,maximumFractionDigits:p===undefined?2:p}):'—'};
const whole=function(v){return fmt(v,0)};
const km=function(m){
 if(!Number.isFinite(m)||m<0)return '—';
 const rounded=Math.round(m);
 return Math.floor(rounded/1000)+'+'+String(rounded%1000).padStart(3,'0');
};
const fromKm=function(input){
 const m=String(input||'').match(/(?:km\s*)?(\d+)\s*\+\s*(\d{1,3})/i);
 return m?Number(m[1])*1000+Number(m[2]):null;
};
const integer=function(x){return Math.ceil(x-1e-9)};
function calculate(input,signals){
 const d=input.d,v=input.v;
 const z=3+25+d;
 const tz=z/1.94;  // U Word primeru i Excelu upotrebljeno 1,94 m/s.
 const ttech=15+12+5;
 const t=Math.max(tz,ttech);
 const su=t*v/3.6;
 const rule=KS_RULES[v]||null;
 const out=[!!signals.ks1,!!signals.ks2].map(function(hasKs,index){
  if(hasKs&&!rule)throw new Error('Za brzinu '+v+' km/h ne postoje uneta KS pravila.');
  const ksMinimum=rule?rule.stop+rule.switching:null;
  const precise=hasKs?Math.max(su,ksMinimum):su;
  const required=integer(precise);
  const tSlow=required/(20/3.6);
  const tOptimal=1.2*tSlow;
  return {side:index,ks:hasKs,exact:precise,required:required,tSlow:tSlow,tOptimal:tOptimal,
          setting:Math.max(300,integer(tOptimal)),basis:hasKs?'KS minimum / vreme približavanja':'Vreme približavanja'};
 });
 return {d:d,v:v,lz:z,tz:tz,ttech:ttech,t:t,su:su,rule:rule,sides:out};
}
function tag(text,cls){return '<span class="ic-pill '+(cls||'')+'">'+e(text)+'</span>'}
function card(label,number,unit){return '<div class="ic-metric"><span>'+e(label)+'</span><strong>'+e(number)+'</strong><small>'+e(unit||'')+'</small></div>'}
function pair(label,value){return '<div class="ic-pair"><span>'+e(label)+'</span><b>'+e(value)+'</b></div>'}
function row(k,v,note){return '<tr><th scope="row">'+e(k)+'</th><td>'+e(v)+'</td><td>'+e(note||'')+'</td></tr>'}
function sourceAlert(message){return '<li>'+e(message)+'</li>'}
function formatSide(s,signame,outer,origin,rule){
 const sideName=s.side===0?'Prilaz 1 · leva strana (K1/11)':'Prilaz 2 · desna strana (K2/12)';
 const signed=s.side===0?-1:1;
 const point=outer&&origin!=null?origin+signed*s.required:null;
 const ksPoint=s.ks&&outer&&origin!=null?origin+signed*rule.stop:null;
 const pointName=outer?outer.label:'Nije izdvojena jedna uključna tačka za ovaj smer';
 return '<section class="ic-direction">'+
  '<div class="ic-direction-head"><h3>'+e(sideName)+'</h3>'+
    tag(s.ks?'Sa '+signame:'Bez '+signame,s.ks?'ic-signal':'ic-nosignal')+'</div>'+
  pair('Metod',s.ks?'S = max(SU, zaustavni put + put uočavanja)':'S = SU = T × V / 3,6')+
  (s.ks?pair('KS minimum',whole(rule.stop)+' + '+whole(rule.switching)+' = '+whole(rule.stop+rule.switching)+' m'):'')+
  pair('Proračunata udaljenost',fmt(s.exact)+' m')+
  '<div class="ic-required">'+tag('Minimalno (zaokruženo naviše)')+'<strong>'+whole(s.required)+' m</strong></div>'+
  pair('Oznaka u projektnom planu',pointName)+
  pair('Teorijska stacionaža uključne tačke',km(point))+
  (s.ks?pair('Teorijska stacionaža '+signame,km(ksPoint)):'')+
  (!outer?'<p class="ic-smallwarn">Na linijskoj situaciji za ovaj smer nije izdvojena jedna uključna tačka; prikazano je samo minimalno rastojanje.</p>':origin==null?'<p class="ic-smallwarn">Nema stacionaže prelaza u podacima sa linijske situacije.</p>':'')+
 '</section>';
}
function sectionA(c){
 return '<section class="ic-section"><h2>A. Vreme napuštanja zone ukrštanja</h2>'+
  '<p>Dužina zone prelaza obuhvata zaustavni put drumskog vozila (3 m), maksimalnu dužinu vozila (25 m) i dužinu ukrštanja d iz pomoćnih proračunskih podataka.</p>'+
  '<div class="ic-equation">Lz = Lzp + Lpv + d = 3 + 25 + '+fmt(c.d,1)+' = <strong>'+fmt(c.lz,1)+' m</strong></div>'+
  '<div class="ic-equation">Tz = Lz / Vpv,min = '+fmt(c.lz,1)+' / 1,94 = <strong>'+fmt(c.tz)+' s</strong></div>'+
  '<p class="ic-footnote">Prema Word obrascu, deo A: Vpv,min = 7 km/h (u računu 1,94 m/s).</p></section>';
}
function sectionB(c,sign){
 const withKs=sign.ks1||sign.ks2;
 return '<section class="ic-section"><h2>B. Minimalno tehničko vreme i udaljenost</h2>'+
  '<div class="ic-equation">Tteh = tb + ts + tr = 15 + 12 + 5 = <strong>32 s</strong></div>'+
  '<div class="ic-equation">T = max(Tz, Tteh) = max('+fmt(c.tz)+', 32) = <strong>'+fmt(c.t)+' s</strong></div>'+
  '<div class="ic-equation">SU = T × Vž,max / 3,6 = '+fmt(c.t)+' × '+fmt(c.v,0)+' / 3,6 = <strong>'+fmt(c.su)+' m</strong></div>'+
  (withKs?'<p>Za prilaz sa kontrolnim signalom dodatno se proverava uslov zaustavnog puta i uočavanja signala, prema proračunskim parametrima za zadatu brzinu.</p>'+
   '<div class="ic-equation">SKS = Szp + Ss = '+whole(c.rule.stop)+' + '+whole(c.rule.switching)+' = <strong>'+whole(c.rule.stop+c.rule.switching)+' m</strong></div>':
   '<p>Pošto kontrolni signali KS1 i KS2 nisu evidentirani na linijskoj, za oba prilaza primenjuje se vremenski uslov SU, bez uslova predviđenog za kontrolni signal.</p>')+
  '<p class="ic-footnote">Proračunski parametri Szp + Ss: 700 + 250 m (80 km/h), 700 + 300 m (100 km/h), odnosno 1.000 + 350 m (120 km/h).</p></section>';
}
function sectionC(c){
 return '<section class="ic-section"><h2>C. Vreme vraćanja u osnovni položaj</h2>'+
 '<p>Prema Word primeru, za najmanju brzinu železničkog vozila od 20 km/h proverava se vreme približavanja najsporijeg voza, potom se uvećava za najmanje 20%. U dokumentu se navodi podešavanje na minimum 5 minuta.</p>'+
 '<table class="ic-table"><thead><tr><th>Prilaz</th><th>Tpr,max = S / 5,56 (s)</th><th>Top = 1,2 × Tpr,max (s)</th><th>Prikazani donji prag</th></tr></thead><tbody>'+
 c.sides.map(function(s){return '<tr><td>'+(s.side===0?'Levi':'Desni')+'</td><td>'+fmt(s.tSlow)+'</td><td>'+fmt(s.tOptimal)+'</td><td>'+whole(s.setting)+' s</td></tr>'}).join('')+
 '</tbody></table><p class="ic-footnote">Prikazani prag je računski minimum prema obrascu iz Word dokumenta (najmanje 300 s), ne potvrda parametara za podešavanje stvarnog uređaja.</p></section>';
}
function render(rlc,input,items){
 if(!items.length)throw Error('Nema dostupnih linijskih pozicija. Proveri pristup projektu i projektnu šifru.');
 const signalRows=items.filter(function(i){return i.item_type==='signal'}).map(function(i){return i.label});
 const sig={ks1:signalRows.some(function(x){return /^KS1(?:\b|[-_])/i.test(x)}),
            ks2:signalRows.some(function(x){return /^KS2(?:\b|[-_])/i.test(x)})};
 const outerMatches={
  l:items.filter(function(i){return i.item_type==='sensor'&&/^K1\/11/i.test(i.label)}),
  r:items.filter(function(i){return i.item_type==='sensor'&&/^K2[/-]12/i.test(i.label)})
 };
 const outer={l:outerMatches.l.length===1?outerMatches.l[0]:null,
              r:outerMatches.r.length===1?outerMatches.r[0]:null};
 const calculated=calculate(input,sig);
 const planKm=fromKm(rlc.chainage);
 // Merodavna stacionaza je ona iz linijske situacije, a ne stariji Excel.
 const stationOrigin=planKm;
 const alerts=[];
 if(!outer.l||!outer.r)
  alerts.push('U prikazu nije izdvojena po jedna oznaka K1/11 i/ili K2/12. Za takav smer ostaje prikaz minimalnog rastojanja, bez automatske kilometraže.');
 if(outerMatches.l.length>1||outerMatches.r.length>1)
  alerts.push('Linijska situacija prikazuje više uključnih tačaka: K1/11: '+outerMatches.l.length+', K2/12: '+outerMatches.r.length+'. Za svaki kolosek i smer važi raspored iz projektne linijske.');
 if(signalRows.some(function(x){return /^PKS/i.test(x)}))
  alerts.push('Na situaciji postoji pomoćni kontrolni signal (PKS). Njegov uticaj na pojedine smerove mora proveriti odgovorni projektant.');
 if(rlc.code==='RLC28')alerts.push('RLC 28 nalazi se u višekolosečnom staničnom području; jedinstven proračun minimuma ne zamenjuje analizu po svakom koloseku i smeru.');
 if(rlc.code==='RLC26')alerts.push('RLC 26 uključuje industrijski kolosek; proveriti uključne tačke i zavisnosti za sve relevantne prilaze.');
 const ksNames=signalRows.filter(function(s){return /^(?:KS|PKS)/i.test(s)});
 const html=
 '<main class="wrap ic-report" id="icPrintReport">'+
 '<div class="ic-actions"><button type="button" class="back" id="icBack">← '+e(rlc.code)+'</button>'+
 (profile?.role!=='guest_pp32'?'<button type="button" class="btn sec" id="icPrint">Štampaj / Sačuvaj kao PDF</button>':'')+'</div>'+
 '<header class="ic-report-head"><span>PP32 / NUMERIČKA DOKUMENTACIJA / RADNI PRORAČUN</span>'+
 '<h1>Proračun uključnih tačaka</h1><h2>'+e(rlc.code)+' · '+e(rlc.design_name||'Putni prelaz')+'</h2>'+
 '<p>Stacionaža prema merodavnoj linijskoj situaciji: '+e(rlc.chainage||'nije uneta')+'</p>'+
 '<div class="ic-source-note">Merodavna osnova za stacionažu, raspored uređaja i kontrolne signale jeste linijska situacija. Obrazac je iz Word primera; d i V su preuzeti iz pomoćnih proračunskih podataka. Teorijski izračunate tačke ne zamenjuju pozicije sa projektne linijske.</div></header>'+
 '<div class="ic-metrics">'+card('Dužina ukrštanja d',fmt(input.d,1),'metara · proračunski ulaz')+
 card('Vž,max',fmt(input.v,0),'km/h · proračunski ulaz')+
 card('T za proračun',fmt(calculated.t),'sekundi')+
 card('Vremenski minimum SU',fmt(calculated.su),'metara')+'</div>'+
 '<section class="ic-section"><h2>Projektna situacija i izvori</h2><div class="ic-pairs">'+
 pair('Kontrolni signal s leve strane',sig.ks1?'KS1 — postoji':'KS1 — nije evidentiran')+
 pair('Kontrolni signal s desne strane',sig.ks2?'KS2 — postoji':'KS2 — nije evidentiran')+
 pair('Pomoćni kontrolni signali',ksNames.filter(function(x){return /^PKS/i.test(x)}).join(', ')||'Nisu evidentirani')+
 pair('Merodavna stacionaža sa linijske situacije',km(planKm))+
 pair('Parametri d i V','Pomoćni proračunski podaci')+
 '</div></section>'+
 sectionA(calculated)+sectionB(calculated,sig)+
 '<section class="ic-section"><h2>Minimalne udaljenosti po smerovima</h2>'+
 '<p>Udaljenosti se računaju zasebno, zavisno od prisustva KS1 odnosno KS2 na odgovarajućoj strani. Za prikaz minimalnih metara rezultat je zaokružen <strong>naviše</strong>. Stacionaže su teorijske, a ne potvrđene montažne pozicije.</p>'+
 '<div class="ic-directions">'+formatSide(calculated.sides[0],'KS1',outer.l,stationOrigin,calculated.rule)+
 formatSide(calculated.sides[1],'KS2',outer.r,stationOrigin,calculated.rule)+'</div></section>'+
 sectionC(calculated)+
 (alerts.length?'<section class="ic-section ic-cautions"><h2>Stavke za obaveznu proveru</h2><ul>'+alerts.map(sourceAlert).join('')+'</ul></section>':'')+
 '<footer class="ic-footer">Merodavni projektni podaci: linijska situacija. Metod: Word proračun. Pomoćni ulazi: d i V. Pozicije uključnih tačaka iz projektne linijske imaju prednost nad teorijski izračunatim stacionažama.</footer>'+
 '</main>';
 shell(html);
 const back=document.getElementById('icBack');
 if(back)back.onclick=function(){window.rlc(rlc.id)};
 const print=document.getElementById('icPrint');
 if(print)print.onclick=function(){window.print()};
 return {calc:calculated,signals:sig,alertCount:alerts.length};
}
async function open(id){
 if(!currentProject||currentProject.code!=='pp32')throw new Error('Proračun je namenjen projektu 32 putna prelaza.');
 if(!currentRlc||String(currentRlc.id)!==String(id))throw new Error('Otvori odgovarajući RLC pre proračuna.');
 const input=BY_CODE.get(currentRlc.code);
 if(!input)throw new Error('Za '+currentRlc.code+' nedostaju ulazni proračunski parametri.');
 const q=encodeURIComponent(String(id));
 const rows=await api('/rest/v1/rlc_line_items?rlc_id=eq.'+q+'&select=item_key,item_type,label&order=sort_order.asc&limit=250');
 return render(currentRlc,input,rows);
}
window.PP32InclusionRlc={open:open,calculate:calculate,inputCount:INPUTS.length};
const previousRlc=window.rlc;
if(typeof previousRlc==='function')window.rlc=async function(id){
 await previousRlc(id);
 if(currentProject?.code!=='pp32'||!currentRlc||String(id)!==String(currentRlc.id))return;
 const source=BY_CODE.get(currentRlc.code);
 if(!source)return;
 const grid=document.querySelector('.tiles');
 if(!grid||grid.querySelector('[data-pp32-module="inclusionCalc"]'))return;
 const tile=document.createElement('button');
 tile.type='button';tile.className='tile pp32-module-card ic-module-card';
 tile.dataset.pp32Module='inclusionCalc';
 tile.innerHTML='<span class="ic-tile-top"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 4h16v16H4zM8 9h8M8 13h4M8 17h8"/></svg><b>PRORAČUN</b></span>'+
 '<span class="ic-tile-eyebrow">PRORAČUNSKA DOKUMENTACIJA</span>'+
 '<strong>Proračun uključnih tačaka</strong>'+
 '<span class="ic-tile-description">Vreme približavanja, kontrolni signali, udaljenosti i stacionaže po smerovima.</span>'+
 '<span class="ic-tile-tags"><em>d = '+e(fmt(source.d,1))+' m</em><em>'+e(whole(source.v))+' km/h</em></span>'+
 '<span class="ic-tile-bottom">Otvori proračun <b aria-hidden="true">↗</b></span>';
 tile.onclick=function(){open(id).catch(function(err){alert('Proračun uključnih tačaka: '+(err?.message||String(err)))})};
 grid.appendChild(tile);
 const count=document.querySelector('.pp32-module-count');
 if(count)count.textContent=grid.querySelectorAll('.pp32-module-card,.cw-rlc-tile,.rp-print-tile,[data-mod]').length+' modula';
};
})();