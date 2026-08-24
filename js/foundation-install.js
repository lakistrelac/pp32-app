(function(){
const FOUNDATION_INSTALL_ITEM_ID='9851c875-e773-4ae6-bbc8-0b1cb24fe2ce';

function stepSvg(type){
 if(type===1)return '<svg viewBox="0 0 320 190" aria-hidden="true"><rect width="320" height="190" fill="#eef2e8"/><path d="M0 120 C70 98 130 108 190 96 C235 88 280 102 320 92 V190 H0Z" fill="#c9b08b"/><g stroke="#9a6b3e" stroke-width="6"><line x1="48" y1="72" x2="48" y2="148"/><line x1="272" y1="60" x2="272" y2="145"/><line x1="64" y1="150" x2="64" y2="82"/><line x1="256" y1="145" x2="256" y2="74"/></g><g stroke="#f8fafc" stroke-width="3"><line x1="48" y1="82" x2="272" y2="70"/><line x1="64" y1="140" x2="256" y2="135"/></g><line x1="160" y1="40" x2="160" y2="168" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 8"/><text x="172" y="108" fill="#b91c1c" font-size="20" font-weight="900">OSA</text></svg>';
 if(type===2)return '<svg viewBox="0 0 320 190" aria-hidden="true"><rect width="320" height="190" fill="#eef2e8"/><rect y="85" width="320" height="105" fill="#c9b08b"/><line x1="160" y1="26" x2="160" y2="172" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 8"/><g stroke="#2563eb" stroke-width="3" stroke-dasharray="8 6"><line x1="54" y1="72" x2="150" y2="72"/><line x1="266" y1="72" x2="170" y2="72"/><line x1="54" y1="132" x2="150" y2="132"/><line x1="266" y1="132" x2="170" y2="132"/></g><g fill="#60a5fa" stroke="#1e3a8a" stroke-width="2"><rect x="44" y="54" width="12" height="42"/><rect x="264" y="54" width="12" height="42"/><rect x="44" y="116" width="12" height="42"/><rect x="264" y="116" width="12" height="42"/></g></svg>';
 if(type===3)return '<svg viewBox="0 0 320 190" aria-hidden="true"><rect width="320" height="190" fill="#e9efe5"/><path d="M0 54 H52 L82 154 H238 L268 54 H320 V190 H0Z" fill="#b78c5e"/><rect x="84" y="82" width="152" height="72" fill="#d6c2a7"/><line x1="160" y1="34" x2="160" y2="168" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 8"/><g transform="translate(142 112)"><rect width="36" height="28" rx="5" fill="#f4b942" stroke="#5c4630" stroke-width="3"/><rect x="8" y="27" width="20" height="23" rx="5" fill="#475569"/><path d="M5 50 Q18 58 31 50" fill="none" stroke="#64748b" stroke-width="3"/></g></svg>';
 if(type===4)return '<svg viewBox="0 0 320 190" aria-hidden="true"><rect width="320" height="190" fill="#f8fafc"/><rect x="74" y="154" width="172" height="24" fill="#d8dee5" stroke="#475569" stroke-width="3"/><g fill="#f1f5f9" stroke="#475569" stroke-width="3"><rect x="112" y="116" width="96" height="38"/><rect x="112" y="76" width="96" height="38"/><rect x="112" y="36" width="96" height="38"/></g><g fill="none" stroke="#dc2626" stroke-width="5"><path d="M225 45 v22"/><path d="M225 85 v22"/></g><g fill="#dc2626"><path d="M217 61 l8 10 8-10z"/><path d="M217 101 l8 10 8-10z"/></g></svg>';
 if(type===5)return '<svg viewBox="0 0 320 190" aria-hidden="true"><rect width="320" height="190" fill="#eef3f6"/><path d="M0 78 H58 L84 178 H236 L262 78 H320 V190 H0Z" fill="#b78c5e"/><rect x="92" y="150" width="136" height="18" fill="#d8dee5" stroke="#475569" stroke-width="3"/><g fill="#f1f5f9" stroke="#475569" stroke-width="3"><rect x="126" y="116" width="68" height="34"/><rect x="126" y="82" width="68" height="34"/><rect x="126" y="48" width="68" height="34"/></g><line x1="160" y1="20" x2="160" y2="173" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 8"/><path d="M124 30 L145 47 M196 30 L175 47" stroke="#475569" stroke-width="3"/><path d="M160 18 v24" stroke="#f59e0b" stroke-width="6"/></svg>';
 return '<svg viewBox="0 0 320 190" aria-hidden="true"><rect width="320" height="190" fill="#e7eee4"/><path d="M0 92 H65 L92 173 H228 L255 92 H320 V190 H0Z" fill="#b78c5e"/><rect x="92" y="151" width="136" height="18" fill="#d8dee5" stroke="#475569" stroke-width="3"/><g fill="#f1f5f9" stroke="#475569" stroke-width="3"><rect x="126" y="117" width="68" height="34"/><rect x="126" y="83" width="68" height="34"/><rect x="126" y="49" width="68" height="34"/></g><path d="M70 112 L112 145 M250 112 L208 145" stroke="#8b5e34" stroke-width="10"/><path d="M54 128 L104 157 M266 128 L216 157" stroke="#9b7049" stroke-width="10"/></svg>';
}

const STEPS=[
 {n:1,title:'Obeležavanje ose temelja',text:'Geometrijski obeležiti osu i centar položaja temelja pre početka iskopa.'},
 {n:2,title:'Referentne tačke sa strana',text:'Postaviti bočne referentne tačke koje ostaju sačuvane tokom iskopa radi ponovnog određivanja ose.'},
 {n:3,title:'Iskop i priprema dna',text:'Iskop se izvodi do projektovane dubine. Po dostizanju kote dno se priprema i sabija prema projektu.'},
 {n:4,title:'Spajanje elemenata temelja',text:'Tipski elementi se sastavljaju u kompletnu celinu pre postavljanja u iskop, uz proveru orijentacije.'},
 {n:5,title:'Postavljanje temelja',text:'Kompletan temelj se pozicionira u iskop i proverava u odnosu na osu i projektovanu visinu.'},
 {n:6,title:'Zatrpavanje',text:'Nakon provere položaja i nivelacije izvodi se zatrpavanje oko postavljenog temelja prema projektu.'}
];

window.foundationInstallGuide=function(){
 let cards='';
 STEPS.forEach(s=>{cards+='<article class="fig-step"><div class="fig-step-head"><span>'+s.n+'</span><h3>'+s.title+'</h3></div><div class="fig-art">'+stepSvg(s.n)+'</div><p>'+s.text+'</p></article>'});
 const h='<div class="wrap"><button class="back" id="figBack">← Ugradnja elemenata</button><div class="hero fig-hero"><div><div class="pill">SLIKOVNO UPUTSTVO</div><h1>Temelji signala</h1><p class="sub">Vizuelni pregled redosleda ugradnje tipskih temelja signala.</p></div><div class="fig-hero-icon">▦</div></div><div class="fig-safety"><b>Napomena za izvođenje</b><span>Geodetsko obeležavanje, iskop, manipulaciju i postavljanje teških elemenata izvodi stručno osoblje prema projektu, planu dizanja i pravilima bezbednosti.</span></div><div class="fig-grid">'+cards+'</div><div class="notice fig-note"><b>Važno:</b> referentne tačke sa strane treba sačuvati tokom iskopa kako bi se osa temelja mogla ponovo proveriti pre konačnog postavljanja.</div></div>';
 shell(h);
 document.getElementById('figBack').onclick=async()=>{
   const s=(await api('/rest/v1/guide_sections?slug=eq.ugradnja-elemenata&select=id'))[0];
   if(s)guideSection(s.id); else guideHome();
 };
};

const originalGuideItem=window.guideItem;
window.guideItem=async function(id){
 if(id===FOUNDATION_INSTALL_ITEM_ID)return foundationInstallGuide();
 return originalGuideItem(id);
};
})();
