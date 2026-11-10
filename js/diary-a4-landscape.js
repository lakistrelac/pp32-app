/* PP32 A4 landscape construction diary for BOTH projects.
   Keeps existing diary_entries/project_diary_entries and old records.
   No external PDF service: browser print dialog -> Save as PDF. */
(function(){
'use strict';
const C='gd2',escText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const keys=['contractor','site','location','investor','day','month','year','shift1from','shift1to','shift1total','shift2from','shift2to','shift2total','shift3from','shift3to','shift3total','w1','w2','w3','w4','w5','w6','w7','w8','w9','w10','w11','w12','w13','w14','w15','m1','m2','m3','t1from','t1to','t1temp','t2from','t2to','t2temp','t3from','t3to','t3temp','rain','wind','otherWeather','description','notes','diaryKeeper','contractorManager','supervisor'];
const workerLabels=['Građ. radn.','Zanatl.','Teh. osob.','Ostali','Ukupno'];
const formState={};let scope=null,entries=[],selected=null,dirty=false,locked=false;
function empty(){return Object.fromEntries(keys.map(k=>[k,'']));}
function field(k,cls='',multi=false){return multi?
 '<textarea class="gd2-input '+cls+'" data-gd2="'+k+'" spellcheck="true" aria-label="'+escText(k)+'"></textarea>':
 '<input class="gd2-input '+cls+'" data-gd2="'+k+'" type="text" autocomplete="off" aria-label="'+escText(k)+'">';}
function line(label,k){return '<label class="gd2-line"><span>'+label+'</span>'+field(k)+'</label>';}
function small(label,k){return '<label class="gd2-small"><span>'+label+'</span>'+field(k)+'</label>';}
function shift(i){return '<div class="gd2-shift"><b>'+['I','II','III'][i-1]+' смена од</b>'+field('shift'+i+'from')+'<span>до</span>'+field('shift'+i+'to')+'<span>укупно</span>'+field('shift'+i+'total')+'<span>часова</span></div>';}
function weather(i){return '<div class="gd2-weather-row"><span>У</span>'+field('t'+i+'from')+'<span>час</span>'+field('t'+i+'to')+'<span>°C</span>'+field('t'+i+'temp')+'</div>';}
function sheet(){
 const shifts=[1,2,3].map(shift).join('');
 const heads=['Смена',...workerLabels,'Механизација'];
 const workerRows=[1,2,3].map(i=>'<tr><th>'+['I','II','III'][i-1]+'</th>'+[1,2,3,4,5].map(j=>'<td>'+field('w'+(i===1?j:((i-1)*5+j)))+'</td>').join('')+'<td>'+field('m'+i)+'</td></tr>').join('');
 // All 15 worker counts are editable; retain all in form_data.
 return '<article class="gd2-sheet" id="gd2-sheet">'+
 '<div class="gd2-top">'+
 '<section class="gd2-head-left">'+line('ИЗВОЂАЧ РАДОВА', 'contractor')+line('ОБЈЕКАТ','site')+line('МЕСТО','location')+'</section>'+
 '<section class="gd2-head-middle">'+line('ИНВЕСТИТОР','investor')+'</section>'+
 '<section class="gd2-head-right"><h1>ГРАЂЕВИНСКИ ДНЕВНИК</h1><div class="gd2-date"><span>ДАН</span>'+field('day')+'<span>ДАТУМ</span>'+field('month')+'<span> / </span>'+field('year')+'</div></section>'+
 '</div>'+
 '<div class="gd2-mid">'+
 '<section class="gd2-shifts"><h2>РАДНО ВРЕМЕ</h2>'+shifts+'</section>'+
 '<section class="gd2-workers"><table><thead><tr>'+heads.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+workerRows+'</tbody></table></section>'+
 '<section class="gd2-temps"><h2>Температура</h2>'+[1,2,3].map(weather).join('')+'<div class="gd2-weather-legend"><span>Време</span><span>(сунчано, облачно, киша)</span></div>'+
 '<div class="gd2-weather-inputs">'+small('Време', 'rain')+small('Ветар','wind')+small('Остало','otherWeather')+'</div></section>'+
 '</div>'+
 '<div class="gd2-body">'+
 '<section class="gd2-work"><h2>О П И С &nbsp; Р А Д А</h2>'+field('description','gd2-lined gd2-workarea',true)+'</section>'+
 '<section class="gd2-notes"><h2>П Р И М Е Д Б Е</h2>'+field('notes','gd2-lined gd2-notesarea',true)+'</section>'+
 '</div>'+
 '<div class="gd2-signatures">'+line('ВОДЕ ДНЕВНИК','diaryKeeper')+line('ИЗВОЂАЧ–РУКОВОДИЛАЦ РАДОВА','contractorManager')+line('НАДЗОРНИ ОРГАН','supervisor')+'</div>'+
 '</article>';
}
function extract(){
 const values={};document.querySelectorAll('[data-gd2]').forEach(n=>values[n.dataset.gd2]=n.value);
 return values;
}
function apply(data){document.querySelectorAll('[data-gd2]').forEach(n=>n.value=String(data[n.dataset.gd2]??''));dirty=false;}
function unpack(d){
 if(!d)return empty();
 const a={...empty(),...(d.form_data&&typeof d.form_data==='object'?d.form_data:{})};
 if(!d.form_data){
  const date=String(d.entry_date||'').split('-');
  a.day=date[2]||'';a.month=date[1]||'';a.year=date[0]||'';
  a.contractor=d.team||'';a.diaryKeeper=d.responsible_person||'';
  a.description=d.work_done||'';a.notes=[d.issues,d.next_plan].filter(Boolean).join('\n');
  a.rain=d.weather||'';
 }
 return a;
}
function asDate(a){
 const d=String(a.day||'').trim(),m=String(a.month||'').trim(),y=String(a.year||'').trim();
 if(!d&&!m&&!y)return null;
 if(!/^\d{1,2}$/.test(d)||!/^\d{1,2}$/.test(m)||!/^\d{4}$/.test(y))return null;
 const date=new Date(Date.UTC(+y,+m-1,+d));
 if(date.getUTCFullYear()!==+y||date.getUTCMonth()!==+m-1||date.getUTCDate()!==+d)return null;
 return y+'-'+m.padStart(2,'0')+'-'+d.padStart(2,'0');
}
function label(d){const a=unpack(d);return [d.entry_date||'Без датума',a.site||a.location||'',d.entry_no||''].filter(Boolean).join(' · ');}
function hasContent(a){return Object.values(a).some(v=>String(v??'').trim());}
function toast(t){const n=document.getElementById('gd2-status');if(n)n.textContent=t;}
function render(){
 const readOnly=!canEdit();
 const title=scope.kind==='rlc'?'Грађевински дневник · '+scope.name:'Грађевински дневник · '+scope.name;
 const back=scope.back;
 const buttons='<div class="gd2-toolbar">'+
 '<button type="button" id="gd2-back">← Назад</button>'+
 (readOnly?'':'<button type="button" id="gd2-new">＋ Нови празан лист</button><button type="button" id="gd2-save">Сачувај запис</button>')+
 '<button type="button" id="gd2-print">🖨 Штампај / PDF · A4 положено</button>'+
 '<span id="gd2-status" role="status"></span></div>';
 const list='<div class="gd2-history"><label>Сачувани дневници <select id="gd2-select"><option value="">Нови празан лист</option>'+
 entries.map((d,i)=>'<option value="'+i+'" '+(selected===d.id?'selected':'')+'>'+escText(label(d))+'</option>').join('')+
 '</select></label></div>';
 shell('<main class="gd2-page"><header class="gd2-title"><h2>'+escText(title)+'</h2><p>Слободно попуњавање свих поља · A4 хоризонтално</p></header>'+buttons+list+
 '<div class="gd2-scroll">'+sheet()+'</div></main>');
 document.querySelectorAll('[data-gd2]').forEach(n=>{
  n.readOnly=readOnly;
  n.addEventListener('input',()=>{dirty=true;toast('Несачуване измене');});
 });
 apply(selected?unpack(entries.find(d=>d.id===selected)):empty());
 document.getElementById('gd2-back').onclick=()=>{if(!confirmLeave())return;back();};
 document.getElementById('gd2-select').onchange=e=>{
  if(!confirmLeave()){e.target.value=selected?String(entries.findIndex(d=>d.id===selected)):'';return;}
  const d=entries[Number(e.target.value)];
  selected=e.target.value===''?null:d?.id||null;
  apply(selected?unpack(d):empty());
 };
 document.getElementById('gd2-print').onclick=()=>{
  document.body.classList.add('gd2-printing');
  window.print();
  document.body.classList.remove('gd2-printing');
 };
 if(!readOnly){
  document.getElementById('gd2-new').onclick=()=>{if(!confirmLeave())return;selected=null;apply(empty());document.getElementById('gd2-select').value='';};
  document.getElementById('gd2-save').onclick=save;
 }
}
function confirmLeave(){return !dirty||window.confirm('Имате несачуване измене. Наставити без чувања?');}
async function save(){
 if(locked)return;
 const a=extract();
 if(!hasContent(a)){toast('Празан лист можете одштампати без чувања.');return;}
 // DB requires date and work_done. Use date only for record indexing; sheet stays blank if omitted.
 const date=asDate(a);
 if((a.day||a.month||a.year)&&!date){toast('Датум није исправан. Попуните дан, месец и годину или оставите сва три празна.');return;}
 const storedDate=date||new Date().toISOString().slice(0,10);
 const payload={entry_date:storedDate,entry_no:null,team:a.contractor||null,responsible_person:a.diaryKeeper||null,
 weather:a.rain||null,work_done:a.description||' ',issues:a.notes||null,form_data:a};
 if(!selected){
  if(scope.kind==='rlc')payload.rlc_id=scope.id;
  else payload.project_id=scope.id;
  payload.created_by=session.user.id;
 }
 locked=true;const button=document.getElementById('gd2-save');button.disabled=true;toast('Чување…');
 try{
  const table=scope.kind==='rlc'?'diary_entries':'project_diary_entries';
  const path='/rest/v1/'+table+(selected?'?id=eq.'+encodeURIComponent(selected):'');
  const result=await api(path,{method:selected?'PATCH':'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});
  if(result?.[0]?.id)selected=result[0].id;
  entries=await loadRows();
  dirty=false;render();toast('Запис је сачуван.');
 }catch(e){toast('Грешка при чувању: '+(e.message||e));button.disabled=false;}
 finally{locked=false;}
}
async function loadRows(){
 const table=scope.kind==='rlc'?'diary_entries':'project_diary_entries';
 const col=scope.kind==='rlc'?'rlc_id':'project_id';
 return await api('/rest/v1/'+table+'?'+col+'=eq.'+encodeURIComponent(scope.id)+'&select=*&order=entry_date.desc,created_at.desc');
}
async function open(kind){
 const target=kind==='rlc'?currentRlc:currentProject;
 if(!target){alert('Пројекат није изабран.');return;}
 scope={kind,id:target.id,name:target.code||target.name||'Пројекат',back:kind==='rlc'?()=>rlc(target.id):()=>corridorHome()};
 selected=null;dirty=false;
 try{entries=await loadRows();render();}
 catch(e){alert('Није могуће учитати дневник: '+(e.message||e));}
}
window.diary=()=>open('rlc');
window.corridorDiary=()=>open('project');

})();