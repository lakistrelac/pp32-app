(function(){
function fmtDate(v){
  if(!v)return '';
  const p=String(v).split('-');
  return p.length===3?p[2]+'.'+p[1]+'.'+p[0]+'.':String(v);
}
function add(lines,label,value){
  if(value!==null&&value!==undefined&&String(value).trim()!=='') lines.push(label+': '+String(value).trim());
}
function buildMail(d){
  const date=fmtDate(d.entry_date);
  const ctx=d._rlc||d._project||'Građevinski dnevnik';
  const subject='Građevinski dnevnik – '+ctx+' – '+date;
  const lines=['GRAĐEVINSKI DNEVNIK',''];
  add(lines,'Projekat',d._project);
  add(lines,'RLC',d._rlc);
  add(lines,'Podfaza',d._segment);
  add(lines,'Datum',date);
  add(lines,'Broj zapisa',d.entry_no||'Dnevni zapis');
  add(lines,'Ekipa / izvođač',d.team);
  add(lines,'Odgovorno lice',d.responsible_person);
  add(lines,'Vreme',d.weather);
  add(lines,'Broj radnika',d.worker_count);
  lines.push('');
  add(lines,'Izvedeni radovi',d.work_done);
  if(d.issues){lines.push('');add(lines,'Problemi / zastoji',d.issues);}
  if(d.next_plan){lines.push('');add(lines,'Plan za naredni dan',d.next_plan);}
  const body=lines.join('\n');
  return {body,url:'mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)};
}
async function copyText(text){
  try{
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}
    else{
      const t=document.createElement('textarea');
      t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();
    }
    alert('Sadržaj dnevnika je kopiran.');
  }catch(e){alert('Kopiranje nije uspelo.');}
}
function enhanceMailButtons(){
  document.querySelectorAll('[data-dmail]').forEach(b=>{
    if(b.dataset.mailFixed==='1')return;
    const idx=Number(b.dataset.dmail);
    const d=window.__pp32DiaryMailRows?.[idx];
    if(!d)return;
    const m=buildMail(d);
    const box=document.createElement('span');
    box.style.display='inline-flex';box.style.gap='7px';box.style.flexWrap='wrap';
    const a=document.createElement('a');
    a.className=b.className;a.textContent='✉ Pošalji mejlom';a.href=m.url;a.style.textDecoration='none';
    a.onclick=e=>e.stopPropagation();
    const c=document.createElement('button');
    c.type='button';c.className='btn sec small';c.textContent='⧉ Kopiraj sadržaj';
    c.onclick=e=>{e.preventDefault();e.stopPropagation();copyText(m.body);};
    box.append(a,c);
    b.replaceWith(box);
  });
}
const oldDiary=window.diary;
if(typeof oldDiary==='function')window.diary=async function(){await oldDiary.apply(this,arguments);enhanceMailButtons();};
const oldCorridorDiary=window.corridorDiary;
if(typeof oldCorridorDiary==='function')window.corridorDiary=async function(){await oldCorridorDiary.apply(this,arguments);enhanceMailButtons();};
})();
