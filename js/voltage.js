(function(){
  function n(id, fallback){
    const el=document.getElementById(id);
    const v=el?Number(String(el.value).replace(',','.')):NaN;
    return Number.isFinite(v)?v:fallback;
  }
  function fmt(v,d=2){return Number.isFinite(v)?v.toLocaleString('sr-RS',{minimumFractionDigits:d,maximumFractionDigits:d}):'—'}
  function calcVoltageDrop(){
    const L=n('vdL',0), S=n('vdS',6), P=n('vdP',2000), U=n('vdU',230), gamma=n('vdGamma',56), allowed=n('vdAllowed',7);
    const valid=L>=0&&S>0&&P>=0&&U>0&&gamma>0&&allowed>=0;
    const pct=valid?(2*L*P)/(gamma*S*Math.pow(U,2))*100:NaN;
    const volts=valid?U*pct/100:NaN;
    const ok=valid&&pct<=allowed;
    const pctEl=document.getElementById('vdPct'), voltEl=document.getElementById('vdVolt'), statusEl=document.getElementById('vdStatus'), statusCard=document.getElementById('vdStatusCard');
    if(pctEl)pctEl.textContent=fmt(pct)+' %';
    if(voltEl)voltEl.textContent=fmt(volts)+' V';
    if(statusEl)statusEl.textContent=valid?(ok?'OK':'NIJE OK'):'—';
    if(statusCard){statusCard.classList.remove('vd-ok','vd-bad','vd-neutral');statusCard.classList.add(valid?(ok?'vd-ok':'vd-bad'):'vd-neutral')}
    const bar=document.getElementById('vdBar');
    if(bar){const ratio=valid&&allowed>0?Math.min(100,(pct/allowed)*100):0;bar.style.width=ratio+'%';bar.className='vd-bar-fill '+(valid?(ok?'vd-bar-ok':'vd-bar-bad'):'')}
    const compare=document.getElementById('vdCompare');
    if(compare)compare.textContent=valid?'Dozvoljeno: '+fmt(allowed)+' % · Iskorišćeno: '+fmt(allowed>0?pct/allowed*100:0,0)+' % granice':'Unesi ispravne vrednosti.';
  }
  function setVoltage(v){const el=document.getElementById('vdU');if(el){el.value=v;calcVoltageDrop()}}
  function setSection(v){const el=document.getElementById('vdS');if(el){el.value=v;calcVoltageDrop()}}
  window.voltageDropCalculator=function(){
    const h='<div class="wrap">'+
      '<button class="back" id="vdBack">← Uputstvo</button>'+
      '<div class="hero vd-hero"><div><div class="pill">ELEKTRO PRORAČUN</div><h1>Proračun pada napona</h1><p class="sub">Kalkulator prema dostavljenoj Excel tabeli za putne prelaze.</p></div><div class="vd-formula-badge">ΔU%</div></div>'+
      '<div class="vd-layout">'+
        '<div class="vd-main">'+
          '<div class="panel vd-panel"><h2>Ulazni podaci</h2><p class="sub">Promena bilo kog polja odmah preračunava rezultat.</p>'+
            '<div class="vd-input-grid">'+
              '<div class="field"><label>Dužina kabla L (m)</label><input id="vdL" type="number" min="0" step="1" value="350"></div>'+
              '<div class="field"><label>Presek kabla S (mm²)</label><input id="vdS" type="number" min="0.1" step="0.1" value="6"><div class="vd-chips"><button type="button" data-vd-s="6">6 mm²</button><button type="button" data-vd-s="12">12 mm²</button></div></div>'+
              '<div class="field"><label>Snaga uređaja P (W)</label><input id="vdP" type="number" min="0" step="10" value="2000"></div>'+
              '<div class="field"><label>Napon U (V)</label><input id="vdU" type="number" min="1" step="1" value="230"><div class="vd-chips"><button type="button" data-vd-u="230">230 V</button><button type="button" data-vd-u="750">750 V</button></div></div>'+
              '<div class="field"><label>Materijal kabla</label><input value="Bakar" disabled></div>'+
              '<div class="field"><label>Provodnost γ</label><input id="vdGamma" type="number" min="0.1" step="0.1" value="56"></div>'+
              '<div class="field full"><label>Dozvoljeni pad napona (%)</label><input id="vdAllowed" type="number" min="0" step="0.1" value="7"></div>'+
            '</div>'+ 
          '</div>'+ 
          '<div class="panel vd-panel vd-formula"><h2>Formula iz tabele</h2><div class="vd-eq">ΔU% = (2 × L × P) / (γ × S × U²) × 100</div><p class="sub">Za monofazni vod koristi se 2 × L.</p></div>'+ 
        '</div>'+ 
        '<div class="vd-results">'+
          '<div class="vd-result"><span>Pad napona</span><strong id="vdPct">—</strong><small>ΔU (%)</small></div>'+ 
          '<div class="vd-result"><span>Pad napona</span><strong id="vdVolt">—</strong><small>ΔU (V)</small></div>'+ 
          '<div class="vd-result vd-neutral" id="vdStatusCard"><span>Status</span><strong id="vdStatus">—</strong><small>u odnosu na dozvoljeni pad</small></div>'+ 
          '<div class="panel vd-meter"><div class="vd-meter-head"><b>Granica</b><span id="vdCompare"></span></div><div class="vd-bar"><i id="vdBar" class="vd-bar-fill"></i></div></div>'+ 
        '</div>'+ 
      '</div>'+ 
    '</div>';
    shell(h);
    document.getElementById('vdBack').onclick=guideHome;
    ['vdL','vdS','vdP','vdU','vdGamma','vdAllowed'].forEach(id=>document.getElementById(id).addEventListener('input',calcVoltageDrop));
    document.querySelectorAll('[data-vd-u]').forEach(b=>b.onclick=()=>setVoltage(b.dataset.vdU));
    document.querySelectorAll('[data-vd-s]').forEach(b=>b.onclick=()=>setSection(b.dataset.vdS));
    calcVoltageDrop();
  };
  window.guideHome=async function(){
    const sections=await api('/rest/v1/guide_sections?select=*&order=sort_order.asc');
    let h='<div class="wrap"><button class="back" id="bh">← Projekti</button><div class="hero"><div><h1>Uputstvo</h1><p class="sub">Interna tehnička biblioteka i proračunski alati</p></div><div class="big">📘</div></div><div class="grid" style="margin-top:14px">';
    sections.forEach(s=>{
      const calc=s.slug==='pad-napona';
      h+='<div class="card guide-section '+(calc?'vd-guide-card':'')+'" data-gs="'+s.id+'" data-gslug="'+esc(s.slug||'')+'">'+(calc?'<div class="vd-mini-icon">⚡</div>':'')+'<h2>'+esc(s.title)+'</h2><p class="sub">'+esc(s.description||'')+'</p><b style="color:var(--blue)">'+(calc?'Pokreni kalkulator →':'Otvori →')+'</b></div>';
    });
    h+='</div></div>';
    shell(h);
    document.getElementById('bh').onclick=home;
    document.querySelectorAll('[data-gs]').forEach(el=>el.onclick=()=>el.dataset.gslug==='pad-napona'?window.voltageDropCalculator():guideSection(el.dataset.gs));
  };
})();
