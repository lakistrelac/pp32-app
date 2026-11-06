/* PP32 PRINT: one-RLC quantities in an A4 print/PDF report and a native .xlsx workbook.
   No paid services, external libraries or server functions. Only authenticated REST reads. */
(function(){
'use strict';
const R=window.PP32Print={};
const q=x=>encodeURIComponent(String(x));
const escText=v=>esc(v==null?'':String(v));
const fmt=v=>v===null||v===undefined?'—':new Intl.NumberFormat('sr-RS',{maximumFractionDigits:2}).format(Number(v));
const number=v=>Number(v||0);
const total=(rows,key)=>rows.reduce((sum,x)=>sum+number(x[key]),0);
const nowDate=()=>new Date().toLocaleString('sr-RS',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
const isMissing=x=>x.length_m===null||x.cable_count===null;
function pct(tasks){return tasks.length?Math.round(100*tasks.filter(t=>t.is_complete).length/tasks.length):0}
function completed(tasks){return tasks.length>0&&tasks.every(t=>t.is_complete)}
function notify(e){alert('PRINT: '+(e?.message||String(e)))}
R.load=async id=>{
 const r=(await api('/rest/v1/rlcs?id=eq.'+q(id)+'&select=*'))[0];
 if(!r)throw Error('Putni prelaz nije pronađen.');
 const [projects,components,manual,cables]=await Promise.all([
  api('/rest/v1/projects?id=eq.'+q(r.project_id)+'&select=id,name,code'),
  api('/rest/v1/components?rlc_id=eq.'+q(id)+'&select=id,code,name,chainage,work_status,component_type_id,component_types(name,unit)&order=name.asc'),
  api('/rest/v1/equipment_items?rlc_id=eq.'+q(id)+'&select=id,name,unit,planned,installed,note&order=name.asc'),
  api('/rest/v1/rlc_cable_items?rlc_id=eq.'+q(id)+'&select=id,cable_type,construction,material,length_m,cable_count,note,sort_order&order=sort_order.asc,created_at.asc&limit=500')
 ]);
 const p=projects[0];if(!p||p.code!=='pp32')throw Error('PRINT je trenutno namenjen PP32 putnim prelazima.');
 const ids=components.map(x=>x.id);
 const tasks=ids.length?await api('/rest/v1/component_tasks?component_id=in.('+ids.join(',')+')&select=id,component_id,title,is_complete,sort_order&order=component_id.asc,sort_order.asc&limit=2000'):[];
 const taskGroups=new Map(ids.map(id=>[id,[]]));
 for(const t of tasks){if(taskGroups.has(t.component_id))taskGroups.get(t.component_id).push(t)}
 const byType=new Map();
 const componentRows=components.map((c,i)=>{
  const type=c.component_types?.name||'Ostalo',unit=c.component_types?.unit||'kom',steps=taskGroups.get(c.id)||[];
  const done=c.work_status==='done',key=type+'\u001f'+unit;
  if(!byType.has(key))byType.set(key,{name:type,unit,planned:0,installed:0,source:'Automatski iz komponenata'});
  const agg=byType.get(key);agg.planned+=1;if(done)agg.installed+=1;
  return {index:i+1,code:c.code||'',name:c.name,type,unit,chainage:c.chainage||'',planned:1,installed:done?1:0,progress:workPercent(c.work_status),status:c.work_status,taskCount:steps.length,steps};
 });
 const automatic=[...byType.values()].map(x=>({...x,remaining:Math.max(0,x.planned-x.installed)}));
 const manualRows=manual.map(x=>({name:x.name,unit:x.unit,planned:number(x.planned),installed:number(x.installed),remaining:Math.max(0,number(x.planned)-number(x.installed)),source:'Ručni unos',note:x.note||''}));
 const equipmentDetails=automatic.concat(manualRows);
 const equipmentGroup=new Map();
 equipmentDetails.forEach(x=>{
  const key=x.name+'\u001f'+x.unit;
  if(!equipmentGroup.has(key))equipmentGroup.set(key,{name:x.name,unit:x.unit,planned:0,installed:0,remaining:0});
  const row=equipmentGroup.get(key);row.planned+=x.planned;row.installed+=x.installed;row.remaining=Math.max(0,row.planned-row.installed);
 });
 const equipment=[...equipmentGroup.values()].sort((a,b)=>a.name.localeCompare(b.name,'sr'));
 const missing=cables.filter(isMissing).length;
 return {p,r,cables,componentRows,tasks,equipment,equipmentDetails,missing,
  totals:{length:total(cables,'length_m'),count:total(cables,'cable_count'),
   complete:components.filter(c=>c.work_status==='done').length,progress:workAverage(components)}};
};
function table(headers,rows,colClass=''){
 const body=rows.length?rows.map(row=>'<tr>'+row.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join(''):
 '<tr class="rp-empty"><td colspan="'+headers.length+'">Nema unetih stavki u evidenciji.</td></tr>';
 return '<div class="rp-table-wrap '+colClass+'"><table><thead><tr>'+headers.map(h=>'<th>'+escText(h)+'</th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table></div>';
}
function cell(v){return '<span class="rp-cell">'+escText(v??'—')+'</span>';}
function numeric(v){return '<strong class="rp-number">'+fmt(v)+'</strong>';}
function statusCell(v){return v?'<span class="rp-status rp-done">Završeno</span>':'<span class="rp-status">U toku</span>';}
function missingCell(v){return v===null?'<span class="rp-unknown">Na proveru</span>':numeric(v);}
function meta(k,v){return '<div class="rp-meta-item"><span>'+escText(k)+'</span><strong>'+escText(v||'Nije uneto')+'</strong></div>';}
function stat(k,v,unit=''){return '<div class="rp-stat"><span>'+escText(k)+'</span><strong>'+fmt(v)+(unit?'<small> '+escText(unit)+'</small>':'')+'</strong></div>';}
R.open=async id=>{
 let snapshot;
 try{snapshot=await R.load(id)}catch(e){notify(e);return;}
 R.current=snapshot;
 const d=snapshot,r=d.r;
 const date=nowDate();
 const cableRows=d.cables.map((x,i)=>[
  cell(i+1),cell(x.cable_type),cell(x.construction),cell(x.material||'Cu'),
  missingCell(x.length_m),missingCell(x.cable_count),cell(x.note||'—')
 ]);
 const equipRows=d.equipment.map((x,i)=>[cell(i+1),cell(x.name),cell(x.unit),numeric(x.planned),numeric(x.installed),numeric(x.remaining)]);
 const componentRows=d.componentRows.map(x=>[
  cell(x.index),cell(x.code||'—'),cell(x.name),cell(x.type),cell(x.chainage||'—'),
  numeric(x.planned),numeric(x.installed),cell(x.progress+'%')
 ]);
 const taskRows=d.componentRows.map(c=>[cell(c.name),cell(c.status==='done'?'Urađen':c.status==='prepared'?'Pripremljen':'Bez statusa'),cell(c.progress+'%')]);
 const missingText=d.missing?'NEPOTPUNA SPECIFIKACIJA · '+d.missing+' stavke na proveru':'Sve unete stavke kablova imaju vrednosti L i br.';
 const html='<main class="wrap rp-page" id="rpReport">'+
 '<div class="rp-toolbar"><button class="rp-back" type="button" id="rpBack">← '+escText(r.code)+'</button>'+
 '<div class="rp-actions"><button class="rp-action rp-excel" id="rpExcel" type="button">↓ Preuzmi Excel (.xlsx)</button>'+
 '<button class="rp-action rp-pdf" id="rpPrint" type="button">▤ PDF / Štampaj</button></div></div>'+
 '<section class="rp-report-header">'+
 '<div class="rp-label"><span class="rp-pin"></span> PP32 · EVIDENCIJA PUTNIH PRELAZA <span>TEHNIČKA SPECIFIKACIJA</span></div>'+
 '<div class="rp-title"><div><span>SPECIFIKACIJA KOLIČINA</span><h1>'+escText(r.code)+' <small>· '+escText(r.design_name||'Naziv prelaza nije unet')+'</small></h1>'+
 '<p>Projektne količine, oprema i radovi — stavka po stavka</p></div><div class="rp-logo">SS<span>32</span></div></div>'+
 '<div class="rp-meta">'+meta('Pruga',r.railway_line||'Pruga nije određena')+meta('Stacionaža',r.chainage||'Nije uneta')+
 meta('Projekat',d.p.name)+meta('Stanje na dan',date)+'</div></section>'+
 '<div class="rp-stats">'+stat('Zbir poznatih L',d.totals.length,'m')+stat('Zbir poznatih br.',d.totals.count)+
 stat('Komponente',d.componentRows.length)+stat('Urađene komponente',d.totals.complete)+'</div>'+
 (d.missing?'<div class="rp-alert"><b>VAŽNO: '+escText(missingText)+'</b><p>Nepoznate dužine i brojevi nisu uračunati kao nula. Ukupne vrednosti predstavljaju samo poznate količine.</p></div>':'')+
 '<section class="rp-section"><div class="rp-section-heading"><div><span>01 / PROJEKTNE KOLIČINE</span><h2>Specifikacija kablova</h2></div><strong>'+d.cables.length+' stavki</strong></div>'+
 table(['#','Tip kabla','Konstrukcija','Materijal','L (m)','br.','Napomena'],cableRows,'rp-cables-table')+
 '<div class="rp-table-total"><span>UKUPNO — POZNATE VREDNOSTI</span><span>L: <b>'+fmt(d.totals.length)+' m</b></span><span>br.: <b>'+fmt(d.totals.count)+'</b></span></div>'+
 '<p class="rp-table-note">Izvor: specifikacije kablova. Kolone L (m) i br. sabiraju se odvojeno; L se ne množi sa br.'+(d.missing?' Nepotpune stavke su označene „Na proveru“.':'')+'</p></section>'+
 '<section class="rp-section"><div class="rp-section-heading"><div><span>02 / MATERIJALNA EVIDENCIJA</span><h2>Oprema i količine</h2></div><strong>'+d.equipment.length+' vrsta</strong></div>'+
 table(['#','Oprema / vrsta','Jedinica','Planirano','Ugrađeno','Preostalo'],equipRows,'rp-equipment-table')+
 '<p class="rp-table-note">Automatske količine iz komponenata i ručno dodate stavke objedinjene su po nazivu i jedinici mere. Ne sabiraju se različite jedinice.</p></section>'+
 '<section class="rp-section"><div class="rp-section-heading"><div><span>03 / IZVEDENI RADOVI</span><h2>Komponente – pojedinačno</h2></div><strong>'+d.componentRows.length+' elemenata</strong></div>'+
 table(['#','Oznaka','Komponenta','Vrsta','Stacionaža','Plan.','Završ.','Napredak'],componentRows,'rp-components-table')+
 '<p class="rp-table-note">Pripremljeno = 50% napretka, urađeno = 100%; ostali statusi ne donose procenat.</p></section>'+
 '<section class="rp-section rp-tasks-section"><div class="rp-section-heading"><div><span>04 / KONTROLA REALIZACIJE</span><h2>Statusi komponenti</h2></div><strong>'+d.componentRows.length+' elemenata</strong></div>'+
 table(['Komponenta','Status','Napredak'],taskRows,'rp-tasks-table')+'</section>'+
 '<footer class="rp-footer"><span>PP32 · Automatski generisan izveštaj iz evidencije</span>'+
 '<span>'+escText(r.code)+' · '+escText(date)+'</span></footer>'+
 '<p class="rp-bottom-tip">Za PDF izaberi „PDF / Štampaj“, pa u prozoru štampanja odaberi „Sačuvaj kao PDF“. Excel se preuzima direktno kao .xlsx.</p></main>';
 shell(html);
 document.getElementById('rpBack').onclick=()=>rlc(id);
 document.getElementById('rpPrint').onclick=()=>window.print();
 document.getElementById('rpExcel').onclick=()=>{try{R.excel(snapshot)}catch(e){notify(e)}};
};
function xml(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');}
function refCol(n){let name='';for(n++;n;n=Math.floor((n-1)/26))name=String.fromCharCode(65+(n-1)%26)+name;return name}
function xCell(v,r,c,style=0){
 const ref=refCol(c)+r;
 if(typeof v==='number'&&Number.isFinite(v))return '<c r="'+ref+'" s="'+style+'"><v>'+v+'</v></c>';
 return '<c r="'+ref+'" s="'+style+'" t="inlineStr"><is><t xml:space="preserve">'+xml(v)+'</t></is></c>';
}
function sheetXml(rows,hasHeaders){
 const maxCols=Math.max(1,...rows.map(x=>x.length));
 const cols='<cols>'+Array.from({length:maxCols},(_,c)=>{
  const lengths=rows.slice(0,200).map(row=>String(row[c]??'').length);
  const longest=Math.max(...lengths,9);
  const width=Math.min(47,Math.max(c===0?14:17,longest+3));
  return '<col min="'+(c+1)+'" max="'+(c+1)+'" width="'+width+'" customWidth="1"/>';
 }).join('')+'</cols>';
 let table='';
 rows.forEach((data,i)=>{
  if(!data||!data.length)return;
  const row=i+1,style=i===0?1:(hasHeaders&&i===2?2:0);
  table+='<row r="'+row+'"'+(hasHeaders&&i===2?' ht="25" customHeight="1"':'')+'>'+data.map((v,j)=>xCell(v,row,j,style)).join('')+'</row>';
 });
 const views=hasHeaders?'<sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>':'<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
 views+'<sheetFormatPr defaultRowHeight="18"/>'+
 cols+'<sheetData>'+table+'</sheetData>'+
 '<pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>';
}
const u16=n=>[n&255,(n>>>8)&255];
const u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
const enc=new TextEncoder();
const crcTable=new Uint32Array(256);
for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);crcTable[i]=c>>>0}
function crc32(a){let c=0xFFFFFFFF;for(const b of a)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function zip(files){
 const parts=[],central=[];let offset=0;
 for(const [name,source] of Object.entries(files)){
  const path=enc.encode(name),data=enc.encode(source),crc=crc32(data);
  const local=new Uint8Array([80,75,3,4,...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(path.length),...u16(0)]);
  parts.push(local,path,data);
  const header=new Uint8Array([80,75,1,2,...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(path.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]);
  central.push(header,path);offset+=local.length+path.length+data.length;
 }
 const centralLen=central.reduce((sum,x)=>sum+x.length,0),count=Object.keys(files).length;
 const ending=new Uint8Array([80,75,5,6,...u16(0),...u16(0),...u16(count),...u16(count),...u32(centralLen),...u32(offset),...u16(0)]);
 return new Blob([...parts,...central,ending],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
R.makeWorkbook=d=>{
 const date=nowDate(),missing=d.missing;
 const headline=['SPECIFIKACIJA KOLIČINA · '+d.r.code],blank=[];
 const sheets=[
 {name:'Pregled',rows:[headline,blank,['Projekat',d.p.name],['Oznaka RLC',d.r.code],
 ['Naziv prelaza',d.r.design_name||'Nije unet'],['Pruga',d.r.railway_line||'Nije određena'],
 ['Stacionaža',d.r.chainage||'Nije uneta'],['Datum izveštaja',date],blank,
 ['POZNATE KOLIČINE KABLOVA'],['Zbir L (m)',d.totals.length],['Zbir br.',d.totals.count],
 ['Nepotpune stavke',missing],['Status specifikacije',missing?'NEPOTPUNO — NA PROVERU':'SVE VREDNOSTI UNETE'],blank,
 ['OPREMA I RADOVI'],['Vrste opreme',d.equipment.length],['Komponente',d.componentRows.length],
 ['Zadaci',d.tasks.length],['Urađene komponente',d.totals.complete],['Napredak (%)',d.totals.progress],blank,
 ['NAPOMENA','Zbir kolone L i zbir kolone br. su nezavisni i ne množe se.'],['NAPOMENA','Nepoznate vrednosti nisu uračunate kao nula.']]},
 {name:'Kablovi',rows:[
 ['KABLOVI · '+d.r.code],['Pruga',d.r.railway_line||'Nije određena'],
 ['R.br.','Tip kabla','Konstrukcija','Materijal','L (m)','br.','Napomena'],
 ...d.cables.map((x,i)=>[i+1,x.cable_type,x.construction,x.material||'Cu',x.length_m===null?'NA PROVERU':number(x.length_m),x.cable_count===null?'NA PROVERU':number(x.cable_count),x.note||'']),
 [],['UKUPNO poznato', '', '', '',d.totals.length,d.totals.count,missing?'Postoje nepotpune stavke: '+missing:''],
 ['NAPOMENA','Ne množiti L (m) sa br.']
 ]},
 {name:'Oprema zbirno',rows:[['OPREMA I KOLIČINE · '+d.r.code],blank,['R.br.','Naziv / vrsta opreme','Jedinica','Planirano','Ugrađeno','Preostalo'],
 ...d.equipment.map((x,i)=>[i+1,x.name,x.unit,x.planned,x.installed,x.remaining])]},
 {name:'Oprema stavke',rows:[['OPREMA — IZVORNE STAVKE · '+d.r.code],blank,['R.br.','Oprema','Jedinica','Planirano','Ugrađeno','Preostalo','Izvor','Napomena'],
 ...d.equipmentDetails.map((x,i)=>[i+1,x.name,x.unit,x.planned,x.installed,x.remaining,x.source,x.note||''])]},
 {name:'Komponente',rows:[['KOMPONENTE · '+d.r.code],blank,['R.br.','Oznaka','Komponenta','Vrsta','Stacionaža','Jedinica','Planirano','Završeno','Napredak (%)','Broj zadataka'],
 ...d.componentRows.map(x=>[x.index,x.code,x.name,x.type,x.chainage,x.unit,x.planned,x.installed,x.progress,x.taskCount])]},
 {name:'Statusi',rows:[['STATUSI · '+d.r.code],blank,['Komponenta','Status','Napredak (%)'],
 ...d.componentRows.map(c=>[c.name,c.status==='done'?'Urađen':c.status==='prepared'?'Pripremljen':'Bez statusa',c.progress])]}
 ];
 const ct=['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
 '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
 '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
 '<Default Extension="xml" ContentType="application/xml"/>',
 '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
 '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
 ...sheets.map((_,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'),
 '</Types>'].join('');
 const rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
 const book='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+
 sheets.map((s,i)=>'<sheet name="'+xml(s.name)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join('')+'</sheets></workbook>';
 const bookRels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
 sheets.map((_,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join('')+
 '<Relationship Id="rId'+(sheets.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
 const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
 '<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="14"/><color rgb="FF123C52"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>'+
 '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF194C63"/><bgColor indexed="64"/></patternFill></fill></fills>'+
 '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'+
 '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
 '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs></styleSheet>';
 const files={'[Content_Types].xml':ct,'_rels/.rels':rels,'xl/workbook.xml':book,'xl/_rels/workbook.xml.rels':bookRels,'xl/styles.xml':styles};
 sheets.forEach((s,i)=>files['xl/worksheets/sheet'+(i+1)+'.xml']=sheetXml(s.rows,i>0));
 return zip(files);
};
R.excel=d=>{
 const blob=R.makeWorkbook(d);
 const href=window.URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download='PP32_'+d.r.code+'_specifikacija_kolicina.xlsx';
 document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>window.URL.revokeObjectURL(href),1000);
};
const previousRlc=window.rlc;
if(typeof previousRlc==='function'){
 window.rlc=async function(id){
  await previousRlc(id);
  if(currentProject?.code!=='pp32')return;
  const tiles=document.querySelector('.tiles');if(!tiles||tiles.querySelector('.rp-print-tile'))return;
  const button=document.createElement('button');button.type='button';button.className='tile rp-print-tile';
  button.innerHTML='<span class="rp-print-icon" aria-hidden="true">▤</span><b>PRINT</b><span class="sub">Excel · PDF · sve količine</span><span class="rp-print-arrow">↗</span>';
  tiles.appendChild(button);
  button.onclick=()=>R.open(id).catch(notify);
 };
}
const oldReport=window.report;
if(typeof oldReport==='function'){
 window.report=async function(){
  await oldReport();
  if(currentProject?.code!=='pp32'||!currentRlc)return;
  const rows=document.querySelector('.rows');
  if(rows){const b=document.createElement('button');b.className='rp-report-cta';b.type='button';
   b.innerHTML='<b>▤ PRINT · Kompletna specifikacija</b><small>Pregled, Excel i PDF svih stavki za '+escText(currentRlc.code)+'</small><span>Otvori ↗</span>';
   rows.before(b);b.onclick=()=>R.open(currentRlc.id).catch(notify);}
 };
}
})();