/* PP32 | Proracun ukljucnih tacaka po RLC.
 * Ulazi: 'Proračuni(1).xlsx' / Proracun (32 reda).
 * Metod: 'Word proracuni ss.docx', delovi A, B i C.
 * KS postoje samo ako su oznaceni na interaktivnoj linijskoj u bazi.
 * Ovo je RADNI proracun, ne potvrda projektnog/normativnog resenja.
 */
(function () {
'use strict';

const INPUTS=[
 [2,10.5,80,3285],[3,8,80,67660],[4,10,80,29048],[5,44,80,62425],
 [6,15,80,50317],[7,26,80,52471],[8,11.5,80,52714],[9,8.5,80,27774],
 [10,9,80,null],[11,20,100,49577],[12,9.3,80,19836],[13,16,100,58060],
 [14,8.5,100,127680],[15,12,100,128340],[16,9.5,100,128854],
 [18,18.5,80,155449],[19,15,80,33242],[20,10,80,30043],
 [21,41,80,40967],[22,8.5,80,41715],[23,9.5,100,74044],
 [24,11,80,29700],[25,16.5,80,68336],[26,17,80,39605],
 [28,22,100,null],[29,13,100,null],
 [31,20,120,null],[32,8.5,120,null],[33,10.5,120,null],
 [34,10,120,null],[35,8.4,120,null],[36,8.5,120,null]
];
const BY_CODE=new Map(INPUTS.map(function(a){return ['RLC'+a[0],{d:a[1],v:a[2],excelKm:a[3]}]}));
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
 const point=origin==null?null:origin+signed*s.required;
 const ksPoint=s.ks&&origin!=null?origin+signed*rule.stop:null;
 const pointName=outer?outer.label:'Uključna tačka nije označena u planu';
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
  (!outer?'<p class="ic-smallwarn">Na raspoloživoj linijskoj nije potvrđena spoljna uključna tačka ovog smera. Izračunata stacionaža nije predlog lokacije ugradnje.</p>':'')+
 '</section>';
}
function sectionA(c){
 return '<section class="ic-section"><h2>A. Vreme napuštanja zone ukrštanja</h2>'+
  '<p>Dužina zone prelaza obuhvata zaustavni put drumskog vozila (3 m), maksimalnu dužinu vozila (25 m) i dužinu ukrštanja d iz Excel tabele.</p>'+
  '<div class="ic-equation">Lz = Lzp + Lpv + d = 3 + 25 + '+fmt(c.d,1)+' = <strong>'+fmt(c.lz,1)+' m</strong></div>'+
  '<div class="ic-equation">Tz = Lz / Vpv,min = '+fmt(c.lz,1)+' / 1,94 = <strong>'+fmt(c.tz)+' s</strong></div>'+
  '<p class="ic-footnote">Izvor: Word, deo A; Vpv,min = 7 km/h, za račun korišćena vrednost 1,94 m/s, kao u dostavljenoj tabeli.</p></section>';
}
function sectionB(c,sign){
 const withKs=sign.ks1||sign.ks2;
 return '<section class="ic-section"><h2>B. Minimalno tehničko vreme i udaljenost</h2>'+
  '<div class="ic-equation">Tteh = tb + ts + tr = 15 + 12 + 5 = <strong>32 s</strong></div>'+
  '<div class="ic-equation">T = max(Tz, Tteh) = max('+fmt(c.tz)+', 32) = <strong>'+fmt(c.t)+' s</strong></div>'+
  '<div class="ic-equation">SU = T × Vž,max / 3,6 = '+fmt(c.t)+' × '+fmt(c.v,0)+' / 3,6 = <strong>'+fmt(c.su)+' m</strong></div>'+
  (withKs?'<p>Za prilaz sa kontrolnim signalom dodatno se proverava uslov zaustavnog puta i uočavanja signala, prema vrednostima iz Excel tabele.</p>'+
   '<div class="ic-equation">SKS = Szp + Ss = '+whole(c.rule.stop)+' + '+whole(c.rule.switching)+' = <strong>'+whole(c.rule.stop+c.rule.switching)+' m</strong></div>':
   '<p>Pošto kontrolni signali KS1 i KS2 nisu evidentirani na linijskoj, za oba prilaza primenjuje se vremenski uslov SU, bez automatskog preuzimanja KS minimuma iz Excela.</p>')+
  '<p class="ic-footnote">Excel koristi KS vrednosti 700 + 250 (80 km/h), 700 + 300 (100 km/h) i 1.000 + 350 m (120 km/h). To su usvojene projektne vrednosti iz dostavljene tabele, ne nezavisno potvrđeni uslovi propisa.</p></section>';
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
 const outer={
  l:items.find(function(i){return i.item_type==='sensor'&&/^K1\/11/i.test(i.label)}),
  r:items.find(function(i){return i.item_type==='sensor'&&/^K2[/-]12/i.test(i.label)})
 };
 const calculated=calculate(input,sig);
 const planKm=fromKm(rlc.chainage);
 const excelKm=input.excelKm;
 const origin=Number.isFinite(excelKm)?excelKm:planKm;
 const originType=Number.isFinite(excelKm)?'Excel — kolona O':'Plan projekta — Excel nema stacionažu';
 const alerts=[];
 if(!Number.isFinite(excelKm))alerts.push('Excel ne sadrži stacionažu prelaza. Teorijske stacionaže su izvedene iz stacionaže prikazane u aplikaciji, a ne iz Excel-a.');
 if(Number.isFinite(excelKm)&&Number.isFinite(planKm)&&excelKm!==planKm)
  alerts.push('Nepodudarnost stacionaže: Excel km '+km(excelKm)+', plan u aplikaciji km '+km(planKm)+' (razlika '+Math.abs(excelKm-planKm)+' m). Pozicije zahtevaju projektantsku proveru.');
 if(!sig.ks1||!sig.ks2)
  alerts.push('Excel koristi jedinstven KS minimum u oba smera; ovde je uslov KS primenjen samo na strani sa eksplicitno označenim KS1/KS2. Položaji iz Excel-a za drugu stranu nisu automatski prihvaćeni.');
 if(!outer.l||!outer.r)
  alerts.push('Na linijskoj situaciji nedostaje oznaka K1/11 i/ili K2/12. Teorijski položaj ne znači da je projektovana fizička uključna tačka.');
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
 '<p>Projektna stacionaža: '+e(rlc.chainage||'nije uneta')+' · Referentna stacionaža: km '+km(origin)+' ('+e(originType)+')</p>'+
 '<div class="ic-source-note">Proračun prema dostavljenom Word primeru i Excel tabeli. <strong>Nije verifikovan za izvođenje ili podešavanje SS uređaja.</strong></div></header>'+
 '<div class="ic-metrics">'+card('Dužina ukrštanja d',fmt(input.d,1),'metara · Excel')+
 card('Vž,max',fmt(input.v,0),'km/h · Excel')+
 card('T za proračun',fmt(calculated.t),'sekundi')+
 card('Vremenski minimum SU',fmt(calculated.su),'metara')+'</div>'+
 '<section class="ic-section"><h2>Projektna situacija i izvori</h2><div class="ic-pairs">'+
 pair('Kontrolni signal s leve strane',sig.ks1?'KS1 — postoji':'KS1 — nije evidentiran')+
 pair('Kontrolni signal s desne strane',sig.ks2?'KS2 — postoji':'KS2 — nije evidentiran')+
 pair('Pomoćni kontrolni signali',ksNames.filter(function(x){return /^PKS/i.test(x)}).join(', ')||'Nisu evidentirani')+
 pair('Stacionaža iz Excel-a',km(excelKm))+
 pair('Stacionaža sa linijske u aplikaciji',km(planKm))+
 pair('Izvor promenljive d i brzine','Proračuni(1).xlsx · list Proracun')+
 '</div></section>'+
 sectionA(calculated)+sectionB(calculated,sig)+
 '<section class="ic-section"><h2>Minimalne udaljenosti po smerovima</h2>'+
 '<p>Udaljenosti se računaju zasebno, zavisno od prisustva KS1 odnosno KS2 na odgovarajućoj strani. Za prikaz minimalnih metara rezultat je zaokružen <strong>naviše</strong>. Stacionaže su teorijske, a ne potvrđene montažne pozicije.</p>'+
 '<div class="ic-directions">'+formatSide(calculated.sides[0],'KS1',outer.l,origin,calculated.rule)+
 formatSide(calculated.sides[1],'KS2',outer.r,origin,calculated.rule)+'</div></section>'+
 sectionC(calculated)+
 '<section class="ic-section"><h2>Odnos prema dostavljenoj Excel tabeli</h2>'+
 '<table class="ic-table"><thead><tr><th>Podatak</th><th>Excel</th><th>Ovaj proračun</th></tr></thead><tbody>'+
 row('Zbirni KS minimum (Excel, kolona N)',whole((calculated.rule.stop+calculated.rule.switching))+' m','Prema KS pravilima za '+input.v+' km/h')+
 row('Leva uključna tačka','S = '+whole(calculated.rule.stop+calculated.rule.switching)+' m',whole(calculated.sides[0].required)+' m'+(sig.ks1?' · sa KS':' · bez KS'))+
 row('Desna uključna tačka','S = '+whole(calculated.rule.stop+calculated.rule.switching)+' m',whole(calculated.sides[1].required)+' m'+(sig.ks2?' · sa KS':' · bez KS'))+
 '</tbody></table>'+
 '<p class="ic-footnote">Excel sadrži jedinstven minimum i unapred popunjene KS kolone i za prelaze bez odgovarajućih signala. Ova stranica namerno ne prepisuje takve stacionaže kao potvrđeno stanje.</p></section>'+
 (alerts.length?'<section class="ic-section ic-cautions"><h2>Stavke za obaveznu proveru</h2><ul>'+alerts.map(sourceAlert).join('')+'</ul></section>':'')+
 '<footer class="ic-footer">Izvori: Word proracuni ss.docx; Proračuni(1).xlsx; PP32 interaktivne linijske situacije. Proračun je radni prilog i zahteva kontrolu odgovornog projektanta.</footer>'+
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
 if(!input)throw new Error('Za '+currentRlc.code+' nema reda u dostavljenoj Excel tabeli.');
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