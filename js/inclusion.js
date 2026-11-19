(function(){
  let ipWithSignals=true;
  function num(id,fallback){
    const el=document.getElementById(id);
    if(!el)return fallback;
    const v=Number(String(el.value).replace(',','.'));
    return Number.isFinite(v)?v:fallback;
  }
  function fmt(v,d=2){return Number.isFinite(v)?v.toLocaleString('sr-RS',{minimumFractionDigits:d,maximumFractionDigits:d}):'—'}
  function ksRules(speed){
    if(speed===80)return {base:700,switching:250,min:950};
    if(speed===100)return {base:700,switching:300,min:1000};
    if(speed===120)return {base:1000,switching:350,min:1350};
    return null;
  }
  function setText(id,v){const el=document.getElementById(id);if(el)el.textContent=v}
  function setMode(withSignals){
    ipWithSignals=!!withSignals;
    const yes=document.getElementById('ipModeYes'),no=document.getElementById('ipModeNo');
    if(yes)yes.className='ip-mode-btn'+(ipWithSignals?' active':'');
    if(no)no.className='ip-mode-btn'+(!ipWithSignals?' active':'');
    const ks=document.getElementById('ipKsBlock');
    if(ks)ks.classList.toggle('hidden',!ipWithSignals);
    calc();
  }
  function calc(){
    const d=num('ipD',0),speed=num('ipSpeed',80),pre=num('ipPre',15),lower=num('ipLower',12),reserve=num('ipReserve',5);
    const valid=d>=0&&speed>0&&pre>=0&&lower>=0&&reserve>=0;
    const ttex=valid?pre+lower+reserve:NaN;
    const tz=valid?(3+25+d)/1.94:NaN;
    const t=valid?Math.max(ttex,tz):NaN;
    const su=valid?(speed/3.6)*t:NaN;
    const rules=ksRules(speed);
    let finalMin=su,source='SU';
    let ruleValid=true;
    if(ipWithSignals){
      if(!rules){ruleValid=false;finalMin=NaN;source='Nema KS pravila';}
      else if(valid){finalMin=Math.max(su,rules.min);source=su>=rules.min?'SU':'KS minimum';}
    }
    setText('ipTtex',fmt(ttex)+' s');
    setText('ipTz',fmt(tz)+' s');
    setText('ipT',fmt(t)+' s');
    setText('ipSu',fmt(su)+' m');
    setText('ipFinal',fmt(finalMin)+' m');
    setText('ipSource',valid&&ruleValid?'Presudno: '+source:'—');
    const f=document.getElementById('ipFinalCard');
    if(f){f.classList.toggle('ip-invalid',!valid||!ruleValid)}
    if(ipWithSignals){
      setText('ipKsBase',rules?fmt(rules.base,0)+' m':'—');
      setText('ipSwitch',rules?fmt(rules.switching,0)+' m':'—');
      setText('ipKsMin',rules?fmt(rules.min,0)+' m':'—');
      const warn=document.getElementById('ipRuleWarn');
      if(warn){warn.classList.toggle('hidden',!!rules);warn.textContent=rules?'':'Za kontrolne signale Excel tabela definiše pravila samo za 80, 100 i 120 km/h.'}
    }
    const reason=document.getElementById('ipReason');
    if(reason){
      if(!valid)reason.textContent='Unesi ispravne vrednosti.';
      else if(ipWithSignals&&!ruleValid)reason.textContent='Nije moguće odrediti konačnu minimalnu udaljenost bez KS pravila za izabranu brzinu.';
      else if(ipWithSignals)reason.textContent='Konačna minimalna udaljenost = veća vrednost između SU ('+fmt(su)+' m) i KS minimuma ('+fmt(rules.min,0)+' m).';
      else reason.textContent='Bez kontrolnih signala konačna minimalna udaljenost jednaka je vrednosti SU.';
    }
  }
  function speed(v){const el=document.getElementById('ipSpeed');if(el){el.value=v;calc()}}
  window.inclusionPointCalculator=function(){
    const h='<div class="wrap">'+
      '<button class="back" id="ipBack">← Uputstvo</button>'+
      '<div class="hero ip-hero"><div><div class="pill">PUTNI PRELAZ</div><h1>Proračun uključnih tačaka</h1><p class="sub">Proračun minimalne potrebne udaljenosti uključne tačke. Stacionaže su namerno izostavljene.</p></div><div class="ip-hero-icon">↔</div></div>'+
      '<div class="ip-mode panel"><div><b>Kontrolni signali</b><small>Izaberi tip situacije pre proračuna.</small></div><div class="ip-mode-actions"><button id="ipModeYes" class="ip-mode-btn active">Sa kontrolnim signalima</button><button id="ipModeNo" class="ip-mode-btn">Bez kontrolnih signala</button></div></div>'+
      '<div class="ip-layout">'+
        '<div class="ip-left">'+
          '<div class="panel ip-panel"><h2>Ulazni podaci</h2><div class="ip-input-grid">'+
            '<div class="field"><label>d (m)</label><input id="ipD" type="number" min="0" step="0.1" value="10.5"></div>'+
            '<div class="field"><label>Brzina voza (km/h)</label><input id="ipSpeed" type="number" min="1" step="1" value="80"><div class="ip-chips"><button type="button" data-ip-speed="80">80</button><button type="button" data-ip-speed="100">100</button><button type="button" data-ip-speed="120">120</button></div></div>'+
            '<div class="field"><label>Predzvonjenje (s)</label><input id="ipPre" type="number" min="0" step="0.1" value="15"></div>'+
            '<div class="field"><label>Spuštanje motke (s)</label><input id="ipLower" type="number" min="0" step="0.1" value="12"></div>'+
            '<div class="field full"><label>Rezerva (s)</label><input id="ipReserve" type="number" min="0" step="0.1" value="5"></div>'+
          '</div></div>'+
          '<div class="panel ip-panel ip-formulas"><h2>Tok proračuna</h2><div class="ip-step"><span>1</span><div><b>Ttex</b><small>Predzvonjenje + spuštanje motke + rezerva</small></div><strong id="ipTtex">—</strong></div><div class="ip-step"><span>2</span><div><b>Tz</b><small>(3 + 25 + d) / 1,94</small></div><strong id="ipTz">—</strong></div><div class="ip-step"><span>3</span><div><b>Veće vreme T</b><small>MAX(Ttex, Tz)</small></div><strong id="ipT">—</strong></div><div class="ip-step"><span>4</span><div><b>SU</b><small>(brzina / 3,6) × T</small></div><strong id="ipSu">—</strong></div></div>'+
        '</div>'+
        '<div class="ip-right">'+
          '<div class="ip-final" id="ipFinalCard"><span>MINIMALNA UDALJENOST</span><strong id="ipFinal">—</strong><small id="ipSource">—</small></div>'+
          '<div class="panel ip-ks" id="ipKsBlock"><h2>Kontrolni signali</h2><div id="ipRuleWarn" class="notice hidden"></div><div class="ip-kpi-row"><div><span>KS baza</span><b id="ipKsBase">—</b></div><div><span>Prekopčavanje</span><b id="ipSwitch">—</b></div><div><span>KS minimum</span><b id="ipKsMin">—</b></div></div><div class="ip-rule-table"><div><b>80 km/h</b><span>700 + 250 = 950 m</span></div><div><b>100 km/h</b><span>700 + 300 = 1000 m</span></div><div><b>120 km/h</b><span>1000 + 350 = 1350 m</span></div></div></div>'+
          '<div class="panel ip-explain"><b>Kako se čita rezultat?</b><p id="ipReason" class="sub"></p><div class="ip-min-note">Sve prikazane udaljenosti su <strong>minimalne</strong>. Stvarna uključna tačka može biti postavljena dalje, ali ne bliže od dobijene minimalne vrednosti.</div></div>'+
        '</div>'+
      '</div>'+ 
    '</div>';
    shell(h);
    document.getElementById('ipBack').onclick=guideHome;
    document.getElementById('ipModeYes').onclick=()=>setMode(true);
    document.getElementById('ipModeNo').onclick=()=>setMode(false);
    ['ipD','ipSpeed','ipPre','ipLower','ipReserve'].forEach(id=>document.getElementById(id).addEventListener('input',calc));
    document.querySelectorAll('[data-ip-speed]').forEach(b=>b.onclick=()=>speed(Number(b.dataset.ipSpeed)));
    setMode(true);
  };
  window.guideHome=async function(){
    const sections=await api('/rest/v1/guide_sections?select=*&order=sort_order.asc');
    let h='<div class="wrap"><button class="back" id="bh">← Projekti</button><div class="hero"><div><h1>Uputstvo</h1><p class="sub">Interna tehnička biblioteka i proračunski alati</p></div><div class="big">📘</div></div><div class="grid" style="margin-top:14px">';
    sections.forEach(s=>{
      const voltage=s.slug==='pad-napona', inclusion=s.slug==='ukljucne-tacke';
      h+='<div class="card guide-section '+(voltage?'vd-guide-card ':'')+(inclusion?'ip-guide-card':'')+'" data-gs="'+s.id+'" data-gslug="'+esc(s.slug||'')+'">'+(voltage?'<div class="vd-mini-icon">⚡</div>':'')+(inclusion?'<div class="ip-mini-icon">↔</div>':'')+'<h2>'+esc(s.title)+'</h2><p class="sub">'+esc(s.description||'')+'</p><b style="color:var(--blue)">'+((voltage||inclusion)?'Pokreni kalkulator →':'Otvori →')+'</b></div>';
    });
    h+='</div></div>';
    shell(h);
    document.getElementById('bh').onclick=home;
    document.querySelectorAll('[data-gs]').forEach(el=>el.onclick=()=>{
      if(el.dataset.gslug==='pad-napona')return window.voltageDropCalculator();
      if(el.dataset.gslug==='ukljucne-tacke')return window.inclusionPointCalculator();
      guideSection(el.dataset.gs);
    });
  };
})();
